<script lang="ts">
    import { navigating, page } from '$app/stores'; // $navigating для индикатора загрузки
    import { goto, invalidateAll } from '$app/navigation';
    import { onMount } from 'svelte';
    // import { Bar } from 'svelte-chartjs'; // Если решите добавить график
    // import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
    // Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

    export let data;

    // Локальное состояние для <select>, инициализируется из data (которое отражает URL)
    let uiSelectedMonth: number;
    let uiSelectedYear: number;

    // Для отображения валюты
    let currencySymbol = '₸'; // По умолчанию, будет обновлено из data.summary.currency

    // Хелпер для форматирования даты
    function formatDate(dateInput?: Date | string, options?: Intl.DateTimeFormatOptions): string {
        if (!dateInput) return 'Не указано';
        try {
            const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
            if (isNaN(date.getTime())) return String(dateInput);
            return date.toLocaleDateString('ru-RU', options || { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            return String(dateInput);
        }
    }

    // Инициализация и синхронизация UI селекторов с данными из load
    $: {
        uiSelectedMonth = data.selectedMonth;
        uiSelectedYear = data.selectedYear;
        if (data.summary?.currency) {
            currencySymbol = data.summary.currency; // Обновляем символ валюты
        }
    }

    // Реакция на изменение месяца или года в UI
    $: if (uiSelectedMonth !== undefined && uiSelectedYear !== undefined) {
        if (uiSelectedMonth !== data.selectedMonth || uiSelectedYear !== data.selectedYear) {
            // Пользователь изменил значения в селекторах, обновляем URL
            const params = new URLSearchParams();
            params.set('month', uiSelectedMonth.toString());
            params.set('year', uiSelectedYear.toString());
            // Использование invalidateAll: true заставит SvelteKit перезапустить все load функции,
            // но так как мы меняем URL, load этой страницы и так перезапустится.
            // noScroll: true и keepFocus: true для лучшего UX.
            goto(`?${params.toString()}`, { invalidateAll: true, noScroll: true, keepFocus: true });
        }
    }

    // Placeholder для данных графика
    // let chartData = {};
    // let chartOptions = { responsive: true, maintainAspectRatio: false };
    // $: if (data.summary?.dailyBreakdown) {
    //   chartData = {
    //     labels: data.summary.dailyBreakdown.map(d => formatDate(d.date, { day: 'numeric', month: 'short' })),
    //     datasets: [{
    //       label: `Доход (${currencySymbol})`,
    //       data: data.summary.dailyBreakdown.map(d => d.amount),
    //       backgroundColor: 'hsla(var(--p)/0.6)', // Primary color from DaisyUI
    //       borderColor: 'hsla(var(--p))',
    //       borderWidth: 1
    //     }]
    //   };
    // }

</script>

<div class="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
    <header class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-6 border-b border-base-300">
        <h1 class="text-3xl font-bold text-base-content">Финансовая сводка</h1>
        <div class="flex gap-3">
            <select class="select select-bordered select-primary w-full sm:w-auto" bind:value={uiSelectedMonth} aria-label="Выберите месяц">
                {#each data.months as m}
                    <option value={m.value}>{m.label}</option>
                {/each}
            </select>
            <select class="select select-bordered select-primary w-full sm:w-auto" bind:value={uiSelectedYear} aria-label="Выберите год">
                {#each data.years as y}
                    <option value={y}>{y}</option>
                {/each}
            </select>
        </div>
    </header>

    {#if $navigating}
        <div class="flex flex-col items-center justify-center py-20">
            <span class="loading loading-lg loading-spinner text-primary mb-4"></span>
            <p class="text-base-content/70">Загрузка данных за {data.months.find((m: any) => m.value === uiSelectedMonth)?.label} {uiSelectedYear}...</p>
        </div>
    {:else if data.error}
        <div class="alert alert-error shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Ошибка: {data.error}</span>
        </div>
    {:else if data.summary}
        {@const summary = data.summary}
        <div class="text-xs text-base-content/60 mb-6">
            Отчет создан: {formatDate(summary.generatedAt, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>

        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="card bg-base-100 p-5 rounded-xl shadow-lg border border-base-300">
                <h2 class="font-semibold text-base-content/80 mb-2">Общий доход</h2>
                <p class="text-3xl font-bold text-primary">
                    {(summary.totalEarn.hourlyAmount + summary.totalEarn.fixedAmount).toFixed(2)} {currencySymbol}
                </p>
                <ul class="space-y-1 text-sm mt-2 text-base-content/70">
                    <li>Почасовая: {summary.totalEarn.hourlyAmount.toFixed(2)} {currencySymbol}</li>
                    <li class="pl-4 text-xs">Ручное время: {summary.totalEarn.manualAmount.toFixed(2)} {currencySymbol}</li>
                    <li>Фикс. + Прочее: {summary.totalEarn.fixedAmount.toFixed(2)} {currencySymbol}</li>
                </ul>
            </div>
            <div class="card bg-base-100 p-5 rounded-xl shadow-lg border border-base-300">
                <h2 class="font-semibold text-base-content/80 mb-2">Средняя ставка в час</h2>
                <p class="text-3xl font-bold text-secondary">{summary.avgHourlyRate > 0 ? summary.avgHourlyRate.toFixed(2) + ` ${currencySymbol}` : 'N/A'}</p>
            </div>
            <div class="card bg-base-100 p-5 rounded-xl shadow-lg border border-base-300">
                <h2 class="font-semibold text-base-content/80 mb-2">Дней с активностью</h2>
                <p class="text-3xl font-bold text-accent">{summary.daysWorked}</p>
            </div>
            <div class="card bg-base-100 p-5 rounded-xl shadow-lg border border-base-300">
                <h2 class="font-semibold text-base-content/80 mb-2">Лучший день</h2>
                {#if summary.bestDay && summary.bestDayAmount > 0}
                    <p class="text-xl font-semibold text-info">{formatDate(summary.bestDay)}</p>
                    <p class="text-lg font-bold text-info/80">{summary.bestDayAmount.toFixed(2)} {currencySymbol}</p>
                {:else}
                    <p class="text-base-content/60 text-sm italic mt-2">Нет данных</p>
                {/if}
            </div>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card bg-base-100 p-5 rounded-xl shadow-lg border border-base-300">
                <h2 class="text-lg font-semibold mb-3 text-base-content">Топ 5 контрактов</h2>
                {#if summary.topContracts.length}
                    <ol class="list-decimal list-inside space-y-1.5 text-sm">
                        {#each summary.topContracts as c (c.contractId)}
                            <li>
                                <span class="font-medium">{c.contractLabel}</span> — <span class="font-semibold">{c.amount.toFixed(2)} {currencySymbol}</span>
                            </li>
                        {/each}
                    </ol>
                {:else}
                    <p class="text-base-content/60 text-sm italic">Нет данных за выбранный месяц</p>
                {/if}
            </div>
            <div class="card bg-base-100 p-5 rounded-xl shadow-lg border border-base-300">
                <h2 class="text-lg font-semibold mb-3 text-base-content">Топ 5 активностей</h2>
                {#if summary.topActivities.length}
                    <ol class="list-decimal list-inside space-y-1.5 text-sm">
                        {#each summary.topActivities as a (a.activityId)}
                            <li>
                                <span class="font-medium">{a.description}</span> — <span class="font-semibold">{a.count} раз</span>
                            </li>
                        {/each}
                    </ol>
                {:else}
                    <p class="text-base-content/60 text-sm italic">Нет данных за выбранный месяц</p>
                {/if}
            </div>
        </section>
        
        <div class="space-y-10">
            <section>
                <h3 class="text-2xl font-semibold mb-4 pb-2 border-b border-base-300 text-base-content">Фиксированная оплата и прочее</h3>
                {#if summary.earnings.fixed.length}
                    <div class="overflow-x-auto">
                        <table class="table w-full table-zebra">
                            <thead>
                                <tr>
                                    <th>Контракт/Описание</th>
                                    <th class="text-right">Сумма ({currencySymbol})</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each summary.earnings.fixed as f (f.contractId + (Math.random().toString()))} <tr>
                                        <td>{f.contractLabel}</td>
                                        <td class="text-right font-medium">{f.amount.toFixed(2)}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {:else}
                    <div class="card bg-base-100 p-8 rounded-lg shadow text-center border border-base-300">
                        <img src="/img/placeholder/no-data-illustration.svg" alt="Нет данных" class="mx-auto w-24 h-24 mb-4 opacity-70"/>
                        <p class="font-semibold text-lg text-base-content/80">Нет записей</p>
                        <p class="opacity-60 text-sm">По фиксированной оплате нет данных за выбранный месяц.</p>
                    </div>
                {/if}
            </section>

            <section>
                <h3 class="text-2xl font-semibold mb-4 pb-2 border-b border-base-300 text-base-content">Почасовая оплата</h3>
                {#if summary.earnings.hourly.length}
                     <div class="overflow-x-auto">
                        <table class="table w-full table-zebra">
                            <thead>
                                <tr>
                                    <th>Сессия/Комментарий</th>
                                    <th>Контракт</th>
                                    <th class="text-right">Часы</th>
                                    <th class="text-right">Сумма ({currencySymbol})</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each summary.earnings.hourly as h (h.sessionId)}
                                    <tr>
                                        <td class="max-w-xs truncate" title={h.comment}>{h.comment || 'Без комментария'}</td>
                                        <td class="max-w-[150px] truncate" title={h.contractLabel}><a href={`/contracts/${h.contractId}`} class="link link-hover text-primary/80">{h.contractLabel}</a></td>
                                        <td class="text-right">{h.hours.toFixed(2)}</td>
                                        <td class="text-right font-medium">{h.amount.toFixed(2)}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {:else}
                    <div class="card bg-base-100 p-8 rounded-lg shadow text-center border border-base-300">
                        <img src="/img/placeholder/no-data-illustration.svg" alt="Нет данных" class="mx-auto w-24 h-24 mb-4 opacity-70"/>
                        <p class="font-semibold text-lg text-base-content/80">Нет записей</p>
                        <p class="opacity-60 text-sm">По почасовой оплате нет данных за выбранный месяц.</p>
                    </div>
                {/if}
            </section>
        </div>
    {:else}
        <div class="text-center py-20">
            <svg class="mx-auto h-24 w-24 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p class="mt-5 text-xl text-base-content/70">Данные по финансам за выбранный период отсутствуют.</p>
            <p class="text-sm text-base-content/50">Пожалуйста, выберите другой месяц или год.</p>
        </div>
    {/if}
</div>