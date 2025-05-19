<script lang="ts">
    import type { PageData } from './$types';
    import type { TransactionEntity, TransactionEntityType, TransactionEntityStatus } from 'flsurf-client';

    export let data: PageData;
    const { contract, feeTransactions, userRole, currentUser } = data;

    const formatDate = (dateString: string | Date | undefined, includeTime = true): string => {
        if (!dateString) return 'Не указано';
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        if (includeTime) { options.hour = '2-digit'; options.minute = '2-digit'; }
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    const getMoneyDisplay = (money: { amount?: number; currency?: string } | undefined): string => {
        if (!money || typeof money.amount === 'undefined') return 'N/A';
        return `${money.amount.toLocaleString('ru-RU')} ${money.currency ?? '₸'}`;
    };

    // Using the same display helpers as in the main contract page for consistency
    const getTransactionTypeDisplay = (type: TransactionEntityType | undefined): string => {
        switch(type) {
            case 'CancellationFee': return 'Штраф за отмену контракта';
            case 'ClientFine': return 'Штраф Заказчику';
            case 'FreelancerFine': return 'Штраф Исполнителю';
            case 'PlatformCommission': return 'Комиссия платформы';
            // Add more specific fee types if they exist
            default: return type ?? 'Неизвестный сбор';
        }
    };
    const getTransactionStatusDisplay = (status: TransactionEntityStatus | undefined): string => {
         switch(status) {
            case 'Pending': return 'В ожидании';
            case 'Completed': return 'Уплачено/Списано';
            case 'Failed': return 'Ошибка';
            case 'Cancelled': return 'Отменено';
            case 'Disputed': return 'Оспаривается'; // If fees can be disputed
            default: return status ?? 'Неизвестен';
        }
    };

    // Freelancer can appeal a fee (your note)
    async function appealFee(transactionId: string) {
        if (userRole !== 'freelancer') return;
        // This would likely create a new dispute or a specific type of support ticket
        // For example:
        // const reason = prompt("Укажите причину апелляции по этому сбору:");
        // if (reason && reason.trim()) {
        //     try {
        //         await GlobalClient.createTicket(new CreateTicketDto({
        //             title: `Апелляция по сбору ID: ${transactionId.substring(0,8)} (Контракт ID: ${contract.id.substring(0,8)})`,
        //             description: reason,
        //             relatedEntityType: 'Transaction',
        //             relatedEntityId: transactionId,
        //             priority: 'High'
        //         }));
        //         showNotification('Ваша апелляция по сбору отправлена на рассмотрение.', false);
        //         // Potentially update transaction status to 'Disputed' or refresh list
        //     } catch (e: any) {
        //         showNotification(e.message || 'Не удалось отправить апелляцию.', true);
        //     }
        // }
        alert(`Функционал апелляции для сбора ID: ${transactionId} еще не реализован.`);
    }

</script>

<div class="container mx-auto p-4 md:p-6">
    <div class="mb-6">
        <a href={`/contracts/${contract.id}`} class="text-sm link link-hover text-primary">&larr; Назад к контракту #{contract.id?.substring(0,8)}</a>
        <h1 class="text-2xl md:text-3xl font-bold mt-1">Штрафы и сборы по контракту</h1>
        <p class="text-gray-600">Контракт: {contract.job?.title ?? contract.id}</p>
    </div>

    {#if feeTransactions.length > 0}
        <div class="overflow-x-auto card bg-base-100 shadow-xl p-4 md:p-6">
            <table class="table table-sm w-full">
                <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Тип сбора/штрафа</th>
                        <th>Описание</th>
                        <th>Сумма</th>
                        <th>Статус</th>
                        <th>Затронутая сторона</th>
                        {#if userRole === 'freelancer'}<th>Действия</th>{/if}
                    </tr>
                </thead>
                <tbody>
                    {#each feeTransactions as fee (fee.id)}
                        {@const isFeeForCurrentUser = (userRole === 'client' && fee.payerId === currentUser.id) || (userRole === 'freelancer' && fee.payerId === currentUser.id)}
                        <tr class:bg-warning/10={isFeeForCurrentUser && fee.amount && fee.amount.amount && fee.amount.amount > 0}>
                            <td>{formatDate(fee.transactionDate)}</td>
                            <td><span class="badge badge-neutral badge-sm">{getTransactionTypeDisplay(fee.type)}</span></td>
                            <td class="text-xs">{fee.description ?? '-'}</td>
                            <td class="font-medium whitespace-nowrap">{getMoneyDisplay(fee.amount)}</td>
                            <td><span class="badge badge-ghost badge-sm">{getTransactionStatusDisplay(fee.status)}</span></td>
                            <td>
                                {#if fee.payerId === contract.employerId}Заказчик
                                {:else if fee.payerId === contract.freelancerId}Исполнитель
                                {:else if fee.payeeId === contract.employerId && fee.type === 'FreelancerFine'}Заказчик (компенсация)
                                {:else if fee.payeeId === contract.freelancerId && fee.type === 'ClientFine'}Исполнитель (компенсация)
                                {:else if fee.type === 'PlatformCommission'}Платформа
                                {:else}N/A{/if}
                            </td>
                            {#if userRole === 'freelancer'}
                                <td>
                                    {#if fee.payerId === currentUser.id && fee.status !== 'Disputed' && fee.status !== 'Refunded'}
                                        <button class="btn btn-xs btn-outline btn-warning" on:click={() => appealFee(fee.id!)}>
                                            Апеллировать
                                        </button>
                                    {:else if fee.status === 'Disputed'}
                                        <span class="text-xs italic">На рассмотрении</span>
                                    {/if}
                                </td>
                            {/if}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {:else}
        <div class="text-center py-12 card bg-base-100 shadow-xl p-6">
            <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296A3.745 3.745 0 0 1 16.5 21a3.745 3.745 0 0 1-3.296-1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043A3.745 3.745 0 0 1 4.5 18a3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 15c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296A3.745 3.745 0 0 1 7.5 6c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043A3.745 3.745 0 0 1 16.5 9c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Штрафы и сборы отсутствуют</h3>
            <p class="mt-1 text-sm text-gray-500">По этому контракту не было зафиксировано штрафов или специфических сборов.</p>
        </div>
    {/if}
</div>