import { error, redirect } from '@sveltejs/kit';
import { GlobalClient }     from '$lib/shared/api';
import {
    GetContractsListQuery,
    GetContractsListQueryStatus,
    UserEntityRole,
    type ContractEntity
} from 'flsurf-client';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { CurrentUser } from '$lib/entities/user/model/modal';

export const load: PageLoad = async ({ url, parent }) => {
    /* — проверяем роль — */
    const currentUser = get(CurrentUser);
    if (!currentUser || currentUser.role !== UserEntityRole.Admin) {
        throw redirect(302, '/');
    }

    /* — query-params — */
    const page   = parseInt(url.searchParams.get('page')   ?? '1', 10);
    const limit  = parseInt(url.searchParams.get('limit')  ?? '20', 10);
    const status = url.searchParams.get('status') as GetContractsListQueryStatus | null;
    const disputeOnly = url.searchParams.get('dispute') === '1';

    const q = new GetContractsListQuery({
        status:   status ?? undefined,
        inDispute: disputeOnly || undefined,
        start:   (page - 1) * limit,
        ends:     page * limit
    });

    let contracts: ContractEntity[] = [];
    try {
        contracts = await GlobalClient.getContractsList(q);
    } catch (e) {
        console.error(e);
        throw error(500, 'Не удалось загрузить контракты');
    }

    return { contracts, page, limit, status, disputeOnly, hasNext: contracts.length === limit };
};
