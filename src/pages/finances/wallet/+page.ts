import { redirect }                                            from '@sveltejs/kit';
import { get }                                                  from 'svelte/store';
import { CurrentUser }                                          from '$lib/entities/user/model/modal';
import { GlobalClient }                                         from '$lib/shared/api';

import {
    GetContractsListQuery,
    GetContractsListQueryStatus,
    GetJobsListQuery,
    GetWorkSessionListQuery,
    ContractEntityStatus,
    UserEntityType
} from 'flsurf-client';

import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
    const currentUser = get(CurrentUser);

    /* ─── авторизация ───────────────────────────── */
    if (!currentUser)            throw redirect(302, '/');
    if (currentUser.type === UserEntityType.Client)
                                 throw redirect(302, '/finance/transactions');

    /* ─── параллельные запросы ──────────────────── */
    const [
        wallet,
        jobsResp,
        contractsResp,
        sessionsResp
    ] = await Promise.all([
        GlobalClient.getMyWallet(),
        GlobalClient.getJobsList(
            new GetJobsListQuery({ freelancerId: currentUser.id })
        ),
        GlobalClient.getContractsList(
            new GetContractsListQuery({
                userId : currentUser.id,
                status : GetContractsListQueryStatus.Active   // только «живые»
            })
        ),
        GlobalClient.getSessionList(
            new GetWorkSessionListQuery({ userId: currentUser.id, start: 0, ends: 50 })
        )
    ]);

    /* ─── баланс кошелька ───────────────────────── */
    const balance = {
        available      : wallet?.availableBalance?.amount  ?? 0,
        frozen         : wallet?.frozen?.amount            ?? 0,
        pendingReview  : wallet?.pendingIncome?.amount     ?? 0, // 5-дн. ревью
    };

    /* ─── данные для страницы ───────────────────── */
    return {
        user            : currentUser,
        balance,
        pendingJobs     : jobsResp        ?? [],
        activeContracts : (contractsResp  ?? [])
                            .filter(c => c.status === ContractEntityStatus.Active),
        workSessions    : sessionsResp    ?? []
    };
};
