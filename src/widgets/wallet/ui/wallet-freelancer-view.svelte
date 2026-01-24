<script lang="ts">
    /* ‒‒‒‒‒ imports ‒‒‒‒‒ */
    import { goto }                from '$app/navigation';
    import { differenceInHours }   from 'date-fns';
    import { format }              from 'date-fns';
    import { ru }                  from 'date-fns/locale';

    /* ‒‒‒‒‒ входящие параметры ‒‒‒‒‒ */
    import type {
        ContractEntity,
        JobEntity,
        WorkSessionEntity
    } from 'flsurf-client';

    export let available       = 0; // уже доступно
    export let frozen          = 0; // заморожено
    export let pendingReview   = 0; // 5-дневный review-период
    export let pendingRelease  = 0; // «In Process» / ожидает вывода

    export let pendingJobs     : JobEntity[]        = [];
    export let activeContracts : ContractEntity[]   = [];
    export let workSessions    : WorkSessionEntity[] = [];

    /* ‒‒‒‒‒ helpers ‒‒‒‒‒ */
    const KZT = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'KZT',
        maximumFractionDigits: 0
    });

    const fmtDate = (d?: Date) => d
        ? format(new Date(d), 'dd.MM.yyyy', { locale: ru })
        : '—';

    const hrs = (s: WorkSessionEntity) =>
        (s.startDate && s.endDate)
            ? differenceInHours(new Date(s.endDate), new Date(s.startDate))
            : 0;

    /* navigation stubs */
    const withdraw            = () => {/* TODO */};
    const openTransactions    = () => goto('/finances/transactions');
    const openContracts       = () => goto('/contracts');
    const openSessions        = () => goto('/work-sessions');
</script>

<!-- ╔════════════════════ Wallet ════════════════════╗ -->
<div class="max-w-6xl mx-auto px-4 py-10 space-y-12">

    <!-- Баланс -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg p-4 shadow bg-success/10 text-success-content">
            <p class="text-sm">Доступно</p>
            <p class="text-2xl font-bold mt-1">{KZT.format(available)}</p>
        </div>
        <div class="rounded-lg p-4 shadow bg-info/10 text-info-content">
            <p class="text-sm">В ревью</p>
            <p class="text-2xl font-bold mt-1">{KZT.format(pendingReview)}</p>
        </div>
        <div class="rounded-lg p-4 shadow bg-warning/10 text-warning-content">
            <p class="text-sm">Ожидает вывода</p>
            <p class="text-2xl font-bold mt-1">{KZT.format(pendingRelease)}</p>
        </div>
        <div class="rounded-lg p-4 shadow bg-base-200 text-base-content">
            <p class="text-sm">Заморожено</p>
            <p class="text-2xl font-bold mt-1">{KZT.format(frozen)}</p>
        </div>
    </section>

    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <button class="btn btn-primary" on:click={withdraw}>Вывести средства</button>
        <button class="link text-sm" on:click={openTransactions}>История транзакций →</button>
    </div>

    <!-- Ожидающие заказы -->
    <section>
        <h2 class="text-lg font-semibold mb-3">
            Ожидают подтверждения
            <span class="badge badge-outline ml-1 align-middle">{pendingJobs.length}</span>
        </h2>

        {#if pendingJobs.length}
            <div class="overflow-x-auto rounded-lg border border-base-300">
                <table class="table table-sm">
                    <tbody>
                        {#each pendingJobs.slice(0,5) as j}
                            <tr>
                                <td class="font-medium">{j.title}</td>
                                <td class="text-right">{j.payout?.amount ? KZT.format(j.payout.amount) : '—'}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {:else}
            <p class="text-base-content/60 italic">Нет ожидающих заказов</p>
        {/if}
    </section>

    <!-- Активные контракты -->
    <section>
        <h2 class="text-lg font-semibold mb-3">
            Активные контракты
            <span class="badge badge-outline ml-1 align-middle">{activeContracts.length}</span>
        </h2>

        {#if activeContracts.length}
            <div class="overflow-x-auto rounded-lg border border-base-300">
                <table class="table table-sm">
                    <tbody>
                        {#each activeContracts.slice(0,5) as c}
                            <tr class="hover cursor-pointer" on:click={() => goto(`/contracts/${c.id}`)}>
                                <td>
                                    <p class="font-medium">{c.job?.title ?? '—'}</p>
                                    <p class="text-xs opacity-70">
                                        {fmtDate(c.startDate)} – {c.endDate ? fmtDate(c.endDate) : '…'}
                                    </p>
                                </td>
                                <td class="text-right whitespace-nowrap">
                                    {c.costPerHour?.amount ? `${KZT.format(c.costPerHour.amount)}/ч` : '—'}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            {#if activeContracts.length > 5}
                <button class="link text-xs mt-2" on:click={openContracts}>Все контракты →</button>
            {/if}
        {:else}
            <p class="text-base-content/60 italic">Нет активных контрактов</p>
        {/if}
    </section>

    <!-- Недавние сессии -->
    <section>
        <h2 class="text-lg font-semibold mb-3">
            Недавние сессии
            <span class="badge badge-outline ml-1 align-middle">{workSessions.length}</span>
        </h2>

        {#if workSessions.length}
            <div class="overflow-x-auto rounded-lg border border-base-300">
                <table class="table table-sm">
                    <tbody>
                        {#each workSessions.slice(0,5) as s}
                            <tr>
                                <td>
                                    <p class="font-medium">#{s.id.slice(0,8)}</p>
                                    <p class="text-xs opacity-70">{fmtDate(s.startDate)}</p>
                                </td>
                                <td class="text-right">{hrs(s)} ч</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            {#if workSessions.length > 5}
                <button class="link text-xs mt-2" on:click={openSessions}>Все сессии →</button>
            {/if}
        {:else}
            <p class="text-base-content/60 italic">Сессий пока нет</p>
        {/if}
    </section>
</div>
