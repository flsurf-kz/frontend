<script lang="ts">
    import type { PageData } from './$types';
    import { ContractEntityStatus, JobEntityStatus, Money, MoneyCurrency, TransactionEntityFlow, WorkSessionEntityStatus } from 'flsurf-client';
    // BaseButton теперь используется только для действий, не для ссылок
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte'; 
    import UserAvatar from '$lib/shared/ui/icons/UserAvatar.svelte';
    import { goto, invalidateAll } from '$app/navigation';
    import { page } from '$app/stores';
    import { CurrentUser } from '$lib/entities/user/model/modal';
    import { showError } from '$lib/shared/ui/errors';
    import { onMount } from 'svelte';

    // Иконки
    import { 
        DollarSignIcon, BriefcaseIcon, ClockIcon, MessageSquareIcon, CheckCircleIcon, 
        AlertTriangleIcon, ListChecksIcon, FileTextIcon, UsersIcon, SettingsIcon, 
        PlusCircleIcon, ExternalLinkIcon, Edit3Icon, Trash2Icon, EyeIcon, EyeOffIcon, SendIcon,
        ThumbsUpIcon, ThumbsDownIcon
    } from 'lucide-svelte';

    export let data: PageData;

    $: clientDisplayName = data.clientProfile?.companyName 
        || data.clientProfile?.user?.fullname 
        || $CurrentUser?.fullname 
        || $CurrentUser?.name 
        || "Клиент";

    onMount(() => {
        if (data.error) {
            showError(data.error, true);
        }
    });
    
    function formatDate(dateInput?: Date | string | null, includeTime = false): string {
        if (!dateInput) return '–';
        try {
            const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
            if (isNaN(date.getTime())) return String(dateInput);
            const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
            if (includeTime) {
                options.hour = '2-digit';
                options.minute = '2-digit';
            }
            return date.toLocaleDateString('ru-RU', options);
        } catch (e) { return String(dateInput); }
    }

    function formatMoney(money?: Money, defaultCurrency = 'KZT'): string {
        if (!money || money.amount == null) return 'N/A';
        return `${money.amount.toLocaleString('ru-RU')} ${money.currency?.toString() || defaultCurrency}`;
    }

    function getContractStatusInfo(status?: ContractEntityStatus): { text: string, className: string } {
        const s = status || "Unknown";
        switch (s) {
            case ContractEntityStatus.Active: return { text: 'Активен', className: 'badge-success' };
            case ContractEntityStatus.PendingApproval: return { text: 'В ожидании', className: 'badge-warning' };
            case ContractEntityStatus.Completed: return { text: 'Завершен', className: 'badge-primary' };
            case ContractEntityStatus.Cancelled: return { text: 'Отменен', className: 'badge-error opacity-70' };
            case ContractEntityStatus.Disputed: return { text: 'Спор', className: 'badge-error' };
            default: return { text: s.toString(), className: 'badge-ghost' };
        }
    }

    function getWorkSessionStatusInfo(status?: WorkSessionEntityStatus): { text: string, className: string } {
        const s = status || "Unknown";
        switch (s) {
            case WorkSessionEntityStatus.Pending: return { text: 'Ожидает утверждения', className: 'badge-warning animate-pulse' };
            case WorkSessionEntityStatus.Approved: return { text: 'Утверждена', className: 'badge-info' };
            case WorkSessionEntityStatus.Rejected: return { text: 'Отклонена', className: 'badge-error' };
            default: return { text: s.toString(), className: 'badge-ghost' };
        }
    }
    
    function getJobStatusInfo(status?: JobEntityStatus): { text: string, className: string } {
        const s = status || "Unknown";
        switch(status) {
            case JobEntityStatus.Open: return { text: 'Открыта', className: 'badge-success'};
            case JobEntityStatus.Draft: return { text: 'Черновик', className: 'badge-warning'};
            case JobEntityStatus.Closed: return { text: 'Закрыта', className: 'badge-neutral'};
            case JobEntityStatus.InContract: return { text: 'В контракте', className: 'badge-info'};
            default: return { text: s.toString(), className: 'badge-ghost'};
        }
    }

    async function handleApproveWorkSession(sessionId: string) {
        alert(`TODO: Approve session ${sessionId}`);
        showError("Запрос на утверждение отправлен (демо).");
        data.pendingWorkSessions = data.pendingWorkSessions.filter(ws => ws.id !== sessionId);
    }
    async function handleRejectWorkSession(sessionId: string) {
         alert(`TODO: Reject session ${sessionId}`);
         showError("Запрос на отклонение отправлен (демо).");
         data.pendingWorkSessions = data.pendingWorkSessions.filter(ws => ws.id !== sessionId);
    }

    function getInitials(name?: string | null): string {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        } else if (parts.length === 1 && parts[0].length > 1) {
            return parts[0].substring(0, 2).toUpperCase();
        } else if (parts.length === 1 && parts[0].length === 1) {
            return parts[0].toUpperCase();
        }
        return '??';
    }

</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
    {#if data.error && !data.clientProfile}
        <div class="alert alert-error shadow-lg">
            <span>Ошибка загрузки дашборда: {data.error}</span>
        </div>
    {:else}
        <header class="mb-6 md:mb-10">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-800">
                Добро пожаловать, {clientDisplayName}!
            </h1>
            <p class="text-gray-500 mt-1">Ваш центр управления заказами и финансами.</p>
            
            <div class="mt-6 grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
                <a href="/jobs/post" class="btn btn-primary items-center">
                    <PlusCircleIcon class="w-4 h-4 mr-2"/>Опубликовать заказ
                </a>
                <a href="/messaging" class="btn btn-secondary items-center">
                    <MessageSquareIcon class="w-4 h-4 mr-2"/>Сообщения 
                </a>
                <a href="/freelancers/browse" class="btn btn-secondary items-center">
                    <UsersIcon class="w-4 h-4 mr-2"/>Найти фрилансеров
                </a>
                 <a href="/wallet" class="btn btn-secondary items-center">
                    <DollarSignIcon class="w-4 h-4 mr-2"/>Кошелек
                </a>
                <a href="/settings/info" class="btn btn-ghost items-center">
                    <SettingsIcon class="w-4 h-4 mr-2"/>Настройки
                </a>
            </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-semibold text-gray-700">Ожидают вашего внимания</h2>
                    {#if data.pendingWorkSessions?.length > 0}
                        <a href="/client/work-sessions?status={WorkSessionEntityStatus.Pending}" 
                           class="link text-sm text-primary hover:text-primary-focus">
                            Все ({data.pendingWorkSessions.length})
                        </a>
                    {/if}
                </div>
                <div class="space-y-4">
                    {#if data.pendingWorkSessions && data.pendingWorkSessions.length > 0}
                        {#each data.pendingWorkSessions as session (session.id)}
                            {@const status = getWorkSessionStatusInfo(session.status)}

                            <div class="card card-compact bg-base-100 shadow-md hover:shadow-lg transition-shadow border border-transparent hover:border-warning/50">
                                <div class="card-body">
                                    <div class="flex items-center gap-3 mb-2">
                                        {#if session.freelancer?.avatar}
                                            <UserAvatar avatarFile={session.freelancer.avatar} className="w-10 h-10 rounded-full" />
                                        {:else}
                                            <div class="avatar placeholder">
                                                <div class="bg-neutral-focus text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                                                    <span class="text-sm font-semibold">{getInitials(session.freelancer?.fullname || session.freelancer?.name)}</span>
                                                </div>
                                            </div>
                                        {/if}
                                        <div>
                                            <p class="font-semibold text-sm leading-tight">{session.freelancer?.fullname || 'Фрилансер'}</p>
                                            <p class="text-xs text-gray-500">Сессия от {formatDate(session.submittedAt)}</p>
                                        </div>
                                        <span class="badge {status.className} badge-sm ml-auto whitespace-nowrap">{status.text}</span>
                                    </div>
                                    <p class="text-xs text-gray-600 mb-1">
                                        Контракт: <a href={`/contracts/${session.contractId}`} class="link link-hover">{session.comment}</a>
                                    </p>
                                    {#if session.workedHours != null} <p class="text-xs text-gray-600">Часы: <span class="font-medium">{session.workedHours}</span></p> {/if}
                                    <p class="text-sm text-gray-700 line-clamp-2 my-1">{session.comment || "Без описания"}</p>
                                    <p class="text-md font-semibold mt-1">К оплате: {formatMoney(new Money(
                                        {amount: ((session.contract?.costPerHour?.amount ?? 0) * (session.workedHours ?? 0)), currency: MoneyCurrency.KZT}))}</p>
                                    <div class="card-actions justify-end mt-3">
                                        <BaseButton onclick={() => handleRejectWorkSession(session.id)} className="error btn-xs">
                                            <ThumbsDownIcon class="w-3.5 h-3.5 mr-1"/> Отклонить
                                        </BaseButton>
                                        <BaseButton onclick={() => handleApproveWorkSession(session.id)} className="success btn-xs">
                                            <ThumbsUpIcon class="w-3.5 h-3.5 mr-1"/> Утвердить
                                        </BaseButton>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    {:else}
                        <div class="card bg-base-100 shadow">
                            <div class="card-body items-center text-center p-8">
                                <CheckCircleIcon class="w-12 h-12 text-success mb-2"/>
                                <p class="text-gray-500">Нет элементов, требующих вашего внимания.</p>
                            </div>
                        </div>
                    {/if}
                </div>
            </section>

            <section>
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-semibold text-gray-700">Последние контракты</h2>
                    <a href="/contracts" class="link text-sm text-primary hover:text-primary-focus">Все контракты</a>
                </div>
                 <div class="space-y-3">
                    {#if data.recentContracts && data.recentContracts.length > 0}
                        {#each data.recentContracts as contract (contract.id)}
                            {@const status = getContractStatusInfo(contract.status)}
                            <a href={`/contracts/${contract.id}`} class="block card card-compact bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                                <div class="card-body">
                                    <div class="flex justify-between items-start">
                                        <h3 class="card-title text-md !font-semibold line-clamp-1">
                                            {contract.job?.title || `Контракт №${contract.id.substring(0,8)}`}
                                        </h3>
                                        <span class="badge {status.className} badge-sm whitespace-nowrap">{status.text}</span>
                                    </div>
                                    <p class="text-xs text-gray-500">
                                        Фрилансер: {contract.freelancer?.fullname || 'Не указан'}
                                    </p>
                                    <div class="text-xs text-gray-500">
                                        <span>Сумма: {formatMoney(contract.budget)}</span>
                                        {#if contract.startDate} <span class="ml-2">Начало: {formatDate(contract.startDate)}</span> {/if}
                                    </div>
                                </div>
                            </a>
                        {/each}
                    {:else}
                         <div class="card bg-base-100 shadow">
                            <div class="card-body items-center text-center p-8">
                                <FileTextIcon class="w-12 h-12 text-gray-400 mb-2"/>
                                <p class="text-gray-500">У вас пока нет недавних контрактов.</p>
                            </div>
                        </div>
                    {/if}
                </div>
            </section>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <section>
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-gray-700">Мои активные вакансии</h2>
                    <a href="/my-jobs" class="link text-sm text-primary hover:text-primary-focus">Все вакансии</a>
                </div>
                 <div class="space-y-3">
                    {#if data.activeJobs && data.activeJobs.length > 0}
                        {#each data.activeJobs as job (job.id)}
                            {@const status = getJobStatusInfo(job.status)}
                            <a href={`/jobs/${job.id}`} class="block card card-compact bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                                <div class="card-body !py-3.5 !px-4">
                                    <div class="flex justify-between items-center">
                                        <h4 class="font-medium text-sm line-clamp-1">{job.title}</h4>
                                        <span class="badge {status.className} badge-xs">{status.text}</span>
                                    </div>
                                    <p class="text-xs text-gray-500">Предложений: {job.proposals?.length ?? 0}</p>
                                </div>
                            </a>
                        {/each}
                    {:else}
                        <p class="text-sm text-gray-500 italic p-4 bg-base-100 rounded-lg shadow-sm text-center">Нет активных вакансий.</p>
                    {/if}
                </div>
            </section>

            <section>
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-gray-700">Последние транзакции</h2>
                    <a href="/settings/transactions" class="link text-sm text-primary hover:text-primary-focus">Вся история</a>
                </div>
                <div class="space-y-2">
                    {#if data.recentTransactions && data.recentTransactions.length > 0}
                        {#each data.recentTransactions as tx (tx.id)}
                            <div class="p-3 bg-base-100 rounded-md shadow-sm text-xs flex justify-between items-center hover:bg-base-200 transition-colors">
                                <div>
                                    <span class="font-medium mr-2">
                                        {#if tx.type?.toString().toLowerCase() === 'deposit'}Пополнение
                                        {:else if tx.type?.toString().toLowerCase() === 'payment' && tx.flow === TransactionEntityFlow.Outgoing}Оплата
                                        {:else if tx.type?.toString().toLowerCase() === 'withdrawal'}Вывод
                                        {:else if tx.type?.toString().toLowerCase() === 'refund' && tx.flow === TransactionEntityFlow.Incoming}Возврат
                                        {:else if tx.type?.toString().toLowerCase() === 'bonuspayment' && tx.flow === TransactionEntityFlow.Outgoing}Выплата бонуса
                                        {:else}{tx.type?.toString() || 'Транзакция'}{/if}
                                    </span>
                                    <span class="text-gray-500">({formatDate(tx.createdAt, true)})</span>
                                    {#if tx.comment}<p class="text-gray-600 text-xs italic truncate max-w-xs">{tx.comment}</p>{/if}
                                </div>
                                <span class="font-semibold whitespace-nowrap {tx.flow === TransactionEntityFlow.Incoming ? 'text-success' : 'text-error'}">
                                    {tx.flow === TransactionEntityFlow.Incoming ? '+' : '-'}{formatMoney(tx.netAmount)}
                                </span>
                            </div>
                        {/each}
                    {:else}
                        <p class="text-sm text-gray-500 italic p-4 bg-base-100 rounded-lg shadow-sm text-center">Транзакций пока нет.</p>
                    {/if}
                </div>
            </section>
        </div>
    {/if}
</div>

<style>
    /* Можно добавить кастомные стили здесь, если нужно */
</style>