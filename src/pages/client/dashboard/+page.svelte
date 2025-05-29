<script lang="ts">
    import {
        Briefcase, DollarSign, FileText, Mail, Bell, AlertTriangle, PlusCircle, ExternalLink
    } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';

    export let data;

    function formatCurrency(amount?: number, currencyCode: string = "₸") {
        if (typeof amount !== 'number' || isNaN(amount)) return "N/A";
        try {
            // Ensure currencyCode is valid for Intl.NumberFormat or provide a fallback.
            // For KZT, 'KZT' is the standard ISO code.
            const displayCurrency = currencyCode?.toUpperCase() === '₸' ? 'KZT' : currencyCode;
            return new Intl.NumberFormat('ru-RU', { // Specify locale for consistent formatting
                style: 'currency',
                currency: displayCurrency || 'KZT', // Fallback to KZT
                minimumFractionDigits: 0,
                maximumFractionDigits: (amount % 1 === 0) ? 0 : 2 // Show decimals only if present
            }).format(amount);
        } catch (e) {
            console.warn(`Currency formatting error for ${currencyCode}:`, e);
            return `${amount.toLocaleString('ru-RU')} ${currencyCode}`; // Fallback with locale
        }
    }
</script>

<div class="container mx-auto px-4 py-8">
    {#if data.fetchError && (!data.currentUser || !data.clientProfile)} <div class="alert alert-error mb-6">
            <AlertTriangle class="w-6 h-6" />
            <span>{data.fetchError}</span>
        </div>
    {/if}

    <header class="mb-8">
        <h1 class="text-3xl font-bold text-base-content">
            Добро пожаловать, {data.clientProfile?.companyName || data.currentUser?.fullname || 'Клиент'}!
        </h1>
        {#if !(data.fetchError && (!data.currentUser || !data.clientProfile))}
        <p class="text-base-content/70">Обзор вашей активности на платформе.</p>
        {/if}
    </header>

    {#if data.currentUser} 
        {@const walletBalance = data.wallet?.availableBalance.amount}
        {@const walletCurrency = data.wallet?.currency}
        {@const spendingLast30 = data.financeSummary?.totalEarn}
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div class="card bg-base-200 shadow-md p-5">
                <div class="flex items-center space-x-3 mb-2">
                    <Briefcase class="w-8 h-8 text-primary" />
                    <h3 class="text-lg font-semibold text-base-content">Активные Заказы</h3>
                </div>
                <p class="text-3xl font-bold text-primary">{data.clientJobInfo?.activeJobs ?? 0}</p>
                <a href="/dashboard/client/jobs" class="text-sm text-primary hover:underline mt-2 inline-block">Управлять заказами</a>
            </div>

            <div class="card bg-base-200 shadow-md p-5">
                <div class="flex items-center space-x-3 mb-2">
                    <DollarSign class="w-8 h-8 text-success" />
                    <h3 class="text-lg font-semibold text-base-content">Всего Потрачено</h3>
                </div>
                <a href="/dashboard/client/finances" class="text-sm text-success hover:underline mt-2 inline-block">Финансовая история</a>
            </div>

            <div class="card bg-base-200 shadow-md p-5">
                <div class="flex items-center space-x-3 mb-2">
                    <FileText class="w-8 h-8 text-info" />
                    <h3 class="text-lg font-semibold text-base-content">Активные Контракты</h3>
                </div>
                <p class="text-3xl font-bold text-info">{data.activeContracts?.length ?? 0}</p>
                <a href="/dashboard/client/contracts" class="text-sm text-info hover:underline mt-2 inline-block">Управлять контрактами</a>
            </div>

            <div class="card bg-base-200 shadow-md p-5">
                <div class="flex items-center space-x-3 mb-2">
                    <Mail class="w-8 h-8 text-warning" />
                    <h3 class="text-lg font-semibold text-base-content">Непрочитанные Сообщения</h3>
                </div>
                <p class="text-3xl font-bold text-warning">{data.unreadMessagesCount ?? 0}</p>
                <a href="/messages" class="text-sm text-warning hover:underline mt-2 inline-block">Перейти в чаты</a>
            </div>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 card bg-base-100 shadow-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-base-content">Мои Недавние Заказы</h2>
                    <BaseButton className="btn-primary btn-sm" onclick={() => goto('/jobs/create')}>
                        <PlusCircle class="w-4 h-4 mr-2" />
                        Опубликовать Заказ
                    </BaseButton>
                </div>
                {#if data.recentJobs && data.recentJobs.length > 0}
                    <div class="space-y-4">
                        {#each data.recentJobs as job (job.id)}
                            {@const payout = job.payout}
                            <div class="p-4 border border-base-300 rounded-lg hover:shadow-md transition-shadow">
                                <a href={`/jobs/${job.id}`} class="font-semibold text-primary hover:underline block mb-1">{job.title || 'Без названия'}</a>
                                <p class="text-sm text-base-content/70">Статус: <span class="font-medium">{job.status || 'N/A'}</span></p>
                                {#if job.proposals !== undefined && job.proposals !== null}
                                    <p class="text-sm text-base-content/70">Предложений: {job.proposals.length}</p>
                                {/if}
                                <p class="text-sm text-base-content/70">Бюджет: {formatCurrency(payout?.amount, payout?.currency)}</p>
                            </div>
                        {/each}
                    </div>
                    <div class="mt-4 text-right">
                        <a href="/dashboard/client/jobs" class="link link-primary">Все заказы <ExternalLink class="w-3 h-3 inline"/></a>
                    </div>
                {:else if !data.fetchError || (data.fetchError && data.recentJobs?.length === 0)}
                    <p class="text-base-content/70">У вас пока нет опубликованных заказов.</p>
                {/if}
            </div>

            <div class="space-y-6">
                <div class="card bg-base-100 shadow-lg p-6">
                    <h2 class="text-xl font-semibold text-base-content mb-3">Кошелек</h2>

                    <p class="text-2xl font-bold text-accent">{formatCurrency(walletBalance, walletCurrency)}</p>
                    <p class="text-sm text-base-content/70">Доступный баланс</p>
                    <BaseButton className="btn-accent btn-sm mt-4 w-full" onclick={() => goto('/dashboard/client/finances/deposit')}>
                        Пополнить Баланс
                    </BaseButton>
                    <a href="/dashboard/client/finances/payment-methods" class="link link-hover text-sm mt-2 block text-center">Способы оплаты</a>
                </div>

                <div class="card bg-base-100 shadow-lg p-6">
                    <h2 class="text-xl font-semibold text-base-content mb-3">Уведомления</h2>
                    {#if data.recentNotifications && data.recentNotifications.length > 0}
                        <ul class="space-y-2">
                            {#each data.recentNotifications as notification (notification.id)}
                                <li class="text-sm text-base-content/80 border-b border-base-300 pb-1 last:border-b-0">
                                    {notification.text}
                                </li>
                            {/each}
                        </ul>
                        <div class="mt-3 text-right">
                            <a href="/notifications" class="link link-primary">Все уведомления <ExternalLink class="w-3 h-3 inline"/></a>
                        </div>
                    {:else if !data.fetchError || (data.fetchError && data.recentNotifications?.length === 0)}
                        <p class="text-base-content/70">Новых уведомлений нет.</p>
                    {/if}
                </div>
                
                <div class="card bg-base-100 shadow-lg p-6">
                    <h2 class="text-xl font-semibold text-base-content mb-3">Обзор Финансов</h2>
                    {#if spendingLast30}
                        <p class="text-lg">Потрачено за 30 дней: <span class="font-bold">{formatCurrency(spendingLast30.netAmount, "RUB")}</span></p>
                        <div class="mt-4 h-48 bg-base-200 flex items-center justify-center rounded-md">
                            <p class="text-base-content/50">Здесь может быть график расходов</p>
                        </div>
                    {:else if !data.fetchError || (data.fetchError && !spendingLast30)}
                        <p class="text-base-content/70">Данные для обзора финансов отсутствуют.</p>
                    {/if}
                </div>
            </div>
        </section>
    {:else if !data.fetchError}
        <div class="text-center py-10">
             <p class="text-xl text-base-content/70">Для доступа к дашборду клиента, пожалуйста, <a href="/auth/login?redirectTo=/dashboard/client" class="link link-primary">войдите</a> в систему.</p>
        </div>
    {/if}
</div>

<style>
</style>