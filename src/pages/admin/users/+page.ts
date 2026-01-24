import { error, redirect } from '@sveltejs/kit';
import { GlobalClient }     from '$lib/shared/api';
import {
    GetUsersListQuery,
    CreateNotificationCommandRole,
    UserEntityRole,
    type UserEntity,
    type WalletEntity,
    type TransactionEntity
} from 'flsurf-client';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { CurrentUser } from '$lib/entities/user/model/modal';

export const load: PageLoad = async ({ url, parent }) => {
    /* ── проверка прав ─────────────────────────────── */
    const currentUser = get(CurrentUser);
    if (!currentUser || currentUser.role !== UserEntityRole.Admin) {
        throw redirect(302, '/');
    }

    /* ── query-параметры ───────────────────────────── */
    const qSearch = url.searchParams.get('search') ?? '';
    const qRole   = url.searchParams.get('role')   ?? '';
    const page    = parseInt(url.searchParams.get('page')  ?? '1', 10);
    const limit   = parseInt(url.searchParams.get('limit') ?? '20', 10);

    const query = new GetUsersListQuery({
        searchTerm: qSearch || undefined,
        role:       qRole   as any || undefined,
        start:      (page - 1) * limit,
        ends:       page * limit
    });

    let users: UserEntity[] = [];
    try {
        users = await GlobalClient.searchUsers(query);
    } catch (e) {
        console.error(e);
        throw error(500, 'Не удалось загрузить список пользователей');
    }

    return {
        users,
        filters: { qSearch, qRole, page, limit, hasNext: users.length === limit }
    };
};
