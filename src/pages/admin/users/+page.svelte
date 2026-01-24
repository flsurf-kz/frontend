<script lang="ts">
    import { goto }              from '$app/navigation';
    import { page }              from '$app/stores';
    import { writable }          from 'svelte/store';

    import { BaseButton }        from '$lib/shared/ui/buttons';
    import ModalBase             from '$lib/shared/ui/modal/modal-base.svelte';
    import { PagePagination }    from '$lib/shared/ui/navigation';

    import { GlobalClient }      from '$lib/shared/api';
    import {
        UserEntity,
        UserEntityType,
        UserEntityRole,
        HideFreelancerProfileCommand,
        SuspendClientProfileCommand,
        GetTransactionsListQuery,
        type WalletEntity,
        type TransactionEntity,

		BlockUserCommand

    } from 'flsurf-client';
	import { showNotification } from '$lib/shared/ui/errors/modal';

    /* данные, пришедшие из +page.ts */
    export let data:{
        users: UserEntity[];
        filters:{
            search: string;
            role:   string;
            page:   number;
            limit:  number;
            hasNext:boolean;
        }
    };

    /* состояния модальных окон */
    const profileModalVisible  = writable(false);
    const walletModalVisible   = writable(false);
    const selectedUser         = writable<UserEntity|null>(null);
    const walletData           = writable<WalletEntity|null>(null);
    const lastTransactions     = writable<TransactionEntity[]>([]);

    /* ------------------------------------------------------------ */
    function updateQueryParam(key:string, value:string) {
        const params = new URLSearchParams($page.url.searchParams);
        value ? params.set(key, value) : params.delete(key);
        goto(`${$page.url.pathname}?${params.toString()}`, { keepFocus:true });
    }

    async function toggleBlockUser(user: UserEntity) {
        try {
            if (user.blocked) {
                await GlobalClient.blockUser(new BlockUserCommand({userId: user.id, blocked: false}));
                showNotification('Пользователь разблокирован');
            } else {
                await GlobalClient.blockUser(new BlockUserCommand({userId: user.id, blocked: true}));
                showNotification('Пользователь заблокирован');
            }
            goto($page.url.href, { invalidateAll: true });
        } catch (exception: any) {
            showNotification('Ошибка: ' + exception.message, true);
        }
    }

    async function hideFreelancerProfile(userId: string) {
        await GlobalClient.hideFreelancerProfile(
            new HideFreelancerProfileCommand({ userId })
        );
        profileModalVisible.set(false);
        goto($page.url.href, { invalidateAll: true });
    }

    async function suspendClientOrders(userId: string) {
        await GlobalClient.suspendClientProfile(
            new SuspendClientProfileCommand({ clientId: userId })
        );
        showNotification('Клиенту запрещено публиковать заказы');
        profileModalVisible.set(false);
    }

    /* --------- кошелёк + транзакции ----------- */
    async function openWallet(user: UserEntity) {
        selectedUser.set(user);
        walletModalVisible.set(true);
        try {
            walletData.set(await GlobalClient.getWallet(user.id));
            const query = new GetTransactionsListQuery({
                userId: user.id, start: 0, ends: 10
            });
            lastTransactions.set(await GlobalClient.getTransactionsList(query));
        } catch (exc:any) {
            showNotification('Ошибка кошелька: ' + exc.message, true);
        }
    }
</script>

<div class="container mx-auto px-4 py-8 space-y-6">
    <h1 class="text-2xl font-semibold">Пользователи</h1>

    <!-- ░░░  фильтры  ░░░ -->
    <div class="flex flex-wrap gap-4">
        <input
            class="input input-bordered w-56"
            placeholder="Поиск…"
            value={data.filters.search}
            on:change={(e)=>updateQueryParam('search',
                    (e.currentTarget as HTMLInputElement).value)} />

        <select
            class="select select-bordered"
            on:change={(e)=>updateQueryParam('role',
                    (e.currentTarget as HTMLSelectElement).value)}>
            <option value="">Любая роль</option>
            <option value="User"        selected={data.filters.role==='User'}>User</option>
            <option value="Moderator"   selected={data.filters.role==='Moderator'}>Moderator</option>
            <option value="Admin"       selected={data.filters.role==='Admin'}>Admin</option>
            <option value="Superadmin"  selected={data.filters.role==='Superadmin'}>Superadmin</option>
        </select>
    </div>

    <!-- ░░░  таблица  ░░░ -->
    <div class="overflow-x-auto border rounded">
        <table class="table w-full">
            <thead>
                <tr>
                    <th>ID</th><th>Имя</th><th>Роль</th>
                    <th>Тип</th><th>Статус</th><th>Действия</th>
                </tr>
            </thead>
            <tbody>
                {#each data.users as user (user.id)}
                    <tr class="hover">
                        <td class="whitespace-nowrap">{user.id.slice(0, 8)}…</td>
                        <td>{user.fullname}</td>
                        <td>{user.role}</td>
                        <td>{user.type}</td>
                        <td>{user.blocked ? '🚫' : '✅'}</td>
                        <td class="flex flex-wrap gap-1">
                            <BaseButton
                                className="btn-xs btn-outline"
                                onclick={() => { selectedUser.set(user); profileModalVisible.set(true); }}>
                                Профиль
                            </BaseButton>

                            <BaseButton
                                className="btn-xs btn-outline"
                                onclick={() => openWallet(user)}>
                                Кошелёк
                            </BaseButton>

                            <BaseButton
                                className="btn-xs"
                                onclick={() => toggleBlockUser(user)}>
                                {user.blocked ? 'Разблок.' : 'Блок.'}
                            </BaseButton>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <!-- ░░░  пагинация  ░░░ -->
    <PagePagination
        currentPage={data.filters.page}
        pageSize={data.filters.limit}
        on:pageChange={(e)=>updateQueryParam('page', String(e.detail))} />

    <!-- ░░░  Модалка профиля  ░░░ -->
    <ModalBase bind:open={$profileModalVisible} title="Профиль пользователя">
        {#if $selectedUser}
            <p class="font-medium mb-2">{$selectedUser.fullname}</p>
            <p>Email: {$selectedUser.email}</p>
            <p>Роль: {$selectedUser.role}</p>
            <p>Тип: {$selectedUser.type}</p>
            <p>Блок: {$selectedUser.blocked ? 'да' : 'нет'}</p>

            {#if $selectedUser.taxInfo}
                <div class="mt-4 p-2 border rounded bg-base-200">
                    <p class="font-medium">Налоги</p>
                    <p>Страна: {$selectedUser.taxInfo.countryIso}</p>
                    <p>ИНН: {$selectedUser.taxInfo.localIdNumber}</p>
                    <p>VAT: {$selectedUser.taxInfo.vatNumber ?? '—'}</p>
                </div>
            {/if}

            <div class="mt-4 flex flex-wrap gap-2">
                {#if $selectedUser.type === UserEntityType.Freelancer}
                    <BaseButton
                        className="btn-warning btn-sm"
                        onclick={() => hideFreelancerProfile($selectedUser.id)}>
                        Скрыть профиль
                    </BaseButton>
                {/if}

                {#if $selectedUser.type === UserEntityType.Client}
                    <BaseButton
                        className="btn-warning btn-sm"
                        onclick={() => suspendClientOrders($selectedUser.id)}>
                        Запретить заказы
                    </BaseButton>
                {/if}
            </div>
        {/if}
    </ModalBase>

    <!-- ░░░  Модалка кошелька  ░░░ -->
    <ModalBase bind:open={$walletModalVisible} title="Кошелёк пользователя">
        {#if $walletData}
            <p class="mb-2">Баланс:
                <span class="font-bold">
                    {$walletData.availableBalance.amount} {$walletData.currency}
                </span>
            </p>

            <h3 class="font-medium mb-1">Последние транзакции</h3>
            {#if $lastTransactions.length === 0}
                <p class="text-sm text-gray-500">Нет транзакций</p>
            {:else}
                <ul class="space-y-1 max-h-60 overflow-y-auto">
                    {#each $lastTransactions as transaction}
                        <li class="text-sm border-b py-1">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                            • {transaction.netAmount?.amount} {transaction.netAmount?.currency}
                            • {transaction.type}
                        </li>
                    {/each}
                </ul>
            {/if}
        {:else}
            <p class="text-sm text-gray-500">Загрузка…</p>
        {/if}
    </ModalBase>
</div>

<style>
    .btn-xs { padding: 0.25rem 0.6rem; font-size: 0.75rem; }
</style>
