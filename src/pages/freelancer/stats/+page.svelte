<script lang="ts">
    import { Chart } from 'flowbite-svelte';
    import { goto }  from '$app/navigation';

    import ModalBase       from '$lib/shared/ui/modal/modal-base.svelte';
    import { BaseButton }  from '$lib/shared/ui/buttons';
    import { PagePagination } from '$lib/shared/ui/navigation';
    import type { JobEntity, FreelancerStatsDto } from 'flsurf-client';

    /* ── данные из load() ───────────────────────────── */
    export let data: {
        stats: FreelancerStatsDto | null;
        jobs:  JobEntity[];
        pagination: {
            page: number;
            pageSize: number;
            hasNext: boolean;
        }, 
        proposalDays: number; 
    };

    const stats = data.stats;
    const jobs  = data.jobs;

    $: proposalDays = data.proposalDays ?? 30;
    /* ── состояние модальных окон ───────────────────── */
    let jobsModal   = false;
    let helpModal   = false;

    /* при смене диапазона */
    function onProposalDaysChange(v:string) {
        proposalDays = parseInt(v,10);
        updateUrlParam('proposalDays', v);
    }

        /* helper для замены query-params */
    function updateUrlParam(key:string, value:string) {
        const params = new URLSearchParams(location.search);
        params.set(key, value);
        goto(`${location.pathname}?${params.toString()}`, { keepFocus: true });
    }

    /* ── графики ─────────────────────────────────────── */
    const jssOptions = {
        series: [stats?.jobSuccessScore ?? 0],
        chart:  { type: 'radialBar', height: 180, sparkline: { enabled: true } },
        plotOptions: {
            radialBar: {
                hollow: { size: '65%' },
                dataLabels: {
                    value: {
                        formatter: (v: any) => `${v}%`,
                        fontSize: '24px'
                    }
                }
            }
        },
        labels: ['JSS']
    };

    const viewsOptions = {
        series: stats
            ? [{ name: 'Просмотры',
                 data: stats.profileViews?.map(p => [
                     Date.parse(p.date || ''),
                     p.count
                 ]) }]
            : [],
        chart:  { type: 'line', height: 200, toolbar: { show: false } },
        stroke: { curve: 'smooth', width: 2 },
        xaxis:  { type: 'datetime' },
        yaxis:  { show: false }
    };

    /* ── график «Ставки» (тот же, но без interview) ── */
    const proposalsOptions = {
        series: data.stats
            ? [{
                name:'Proposals',
                data:[
                    data.stats.proposals?.sent   ?? 0,
                    data.stats.proposals?.viewed ?? 0,
                    data.stats.proposals?.hires  ?? 0
                ]
            }]
            : [{ data:[0,0,0] }],
        chart:{ type:'bar', height:160 },
        plotOptions:{ bar:{ horizontal:true, barHeight:'55%' } },
        dataLabels:{ enabled:true },
        xaxis:{ categories:['Отправлено','Просмотрено','Найм'] },
        yaxis:{ show:false }
    };

    const clientsDonut = {
        series: stats ? [stats.longTermClients??0, stats.shortTermClients??0] : [0,0],
        chart:  { type:'donut', height:180, sparkline:{ enabled:true } },
        labels: ['> 90 дн.','≤ 90 дн.'],
        legend: { show:false }
    };

    /* ── helpers ─────────────────────────────────────── */
    function gotoPage(p: number) {
        const params = new URLSearchParams(location.search);
        params.set('jobsPage', String(p));
        goto(`${location.pathname}?${params.toString()}`, { keepFocus: true });
    }
</script>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<section class="grid gap-6 p-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    <!-- Earnings -->
    <div class="card bg-base-100 shadow">
        <div class="card-body">
            <h2 class="card-title">Заработок за&nbsp;12&nbsp;мес.</h2>
            {#if !stats}
                <span class="skeleton h-8 w-24"/>
            {:else}
                <p class="text-3xl font-semibold">
                    {stats.earningsLast12Months?.toLocaleString()} ₸
                </p>
            {/if}
            <BaseButton className="btn-outline" onclick={() => {goto('/finances/transactions')}}>
                История транзакций
            </BaseButton>
        </div>
    </div>

    <!-- Job Success Score -->
    <div class="card bg-base-100 shadow">
        <div class="card-body items-center text-center">
            <h2 class="card-title">Успешные заказы</h2>
            {#if !stats}
                <span class="skeleton h-40 w-full"/>
            {:else}
                <Chart options={jssOptions} class="w-full"/>
            {/if}
            <BaseButton className="btn-outline btn-sm mt-2"
                        onclick={() => jobsModal = true}>
                Подробнее
            </BaseButton>
        </div>
    </div>

    <!-- Proposals -->
    <div class="card bg-base-100 shadow">
        <div class="card-body">
            <div class="flex justify-between items-center mb-2">
                <h2 class="card-title">Ставки</h2>

                <!-- новый select -->
                <select class="select select-bordered"
                        bind:value={proposalDays}
                        on:change={(e)=>onProposalDaysChange(e.currentTarget.value)}>
                    <option value="7">7 дней</option>
                    <option value="30">30 дней</option>
                    <option value="90">90 дней</option>
                </select>
            </div>

            {#if !data.stats}
                <span class="skeleton h-32 w-full"/>
            {:else}
                <Chart options={proposalsOptions} class="w-full"/>
            {/if}
        </div>
    </div>

    <!-- Profile views -->
    <div class="card bg-base-100 shadow md:col-span-2 lg:col-span-2">
        <div class="card-body">
            <h2 class="card-title">Просмотры профиля</h2>
            {#if !stats}
                <span class="skeleton h-40 w-full"/>
            {:else}
                <Chart options={viewsOptions} class="w-full"/>
            {/if}
        </div>
    </div>

    <!-- Client relationships (line) -->
    <div class="card bg-base-100 shadow">
        <div class="card-body items-center text-center">
            <h2 class="card-title">Рейтинг среди клиентов</h2>
            {#if !stats}
                <span class="skeleton h-40 w-full"/>
            {:else}
                <Chart options={clientsDonut} class="w-full"/>
            {/if}
            <BaseButton className="btn-outline mt-2" onclick={() => helpModal = true}>
                Как это работает?
            </BaseButton>
        </div>
    </div>
</section>

<!-- ── Модальное окно: подробный список заказов ───────────── -->
<ModalBase bind:open={jobsModal} title="Завершённые заказы">
    {#if jobs.length === 0}
        <p class="text-gray-500">Нет выполненных заказов.</p>
    {:else}
        <ul class="space-y-3 mb-4">
            {#each jobs as j}
                <li class="border p-3 rounded">
                    <p class="font-medium">{j.title}</p>
                    <p class="text-xs text-gray-500">
                        Завершено: {new Date(j.lastModifiedAt ?? j.createdAt).toLocaleDateString()}
                    </p>
                </li>
            {/each}
        </ul>

        <PagePagination
            currentPage={data.pagination.page}
            pageSize={data.pagination.pageSize}
            on:pageChange={(e) => gotoPage(e.detail)}
        />
    {/if}
</ModalBase>

<!-- ── Модальное окно: объяснение метрики клиентов ────────── -->
<ModalBase bind:open={helpModal} title="Как формируется рейтинг клиентов?">
    <p class="mb-2">
        На графике показано, как растёт число уникальных клиентов,
        с&nbsp;которыми вы&nbsp;сотрудничали.
    </p>
    <ul class="list-disc pl-6 space-y-1 text-sm">
        <li>Учитываются только завершённые контракты.</li>
        <li>Чем выше скорость ответа, тем выше шанс повторного заказа.</li>
        <li>Положительные отзывы увеличивают склонность клиентов возвращаться.</li>
    </ul>
</ModalBase>

<style>
    /* одна колонка на мобильных */
    @media (max-width: 640px) {
        section { grid-template-columns: 1fr; }
    }
</style>
