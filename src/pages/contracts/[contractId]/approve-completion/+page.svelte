<script lang="ts">
    import type { PageData } from './$types';
    import { GlobalClient, ClientApproveFinishCommand, type ContractEntityStatus } from '$lib/shared/api';
    import { showNotification } from '$lib/shared/ui/errors/modal';
    import { goto, invalidateAll } from '$app/navigation';
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
    import { MetaTags } from '$lib/shared/ui/meta-tags';

    export let data: PageData;
    const { contract, jobSummary, freelancer } = data;

    let isLegallyBindingAgreementChecked = $state(false);
    let isSubmitting = $state(false);

    const formatDate = (dateStr: string | Date | undefined, includeTime = true) => {
        if (!dateStr) return 'N/A';
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        if (includeTime) { options.hour = '2-digit'; options.minute = '2-digit'; }
        return new Date(dateStr).toLocaleDateString('ru-RU', options);
    };

    const getMoneyDisplay = (money: { amount?: number; currency?: string } | undefined): string => {
        if (!money || typeof money.amount === 'undefined') return 'N/A';
        return `${money.amount.toLocaleString('ru-RU')} ${money.currency ?? '₸'}`;
    };

    // Calculate totalPayable based on contract type, work sessions, and bonuses
    // IMPORTANT: This calculation should ideally be confirmed/provided by the backend
    // on the ContractEntity (e.g., contract.finalPayoutAmountForApproval) for accuracy.
    let totalPayableAmount = $derived(() => {
        let total = 0;
        if (contract.budgetType === 'Fixed') { // ContractEntityStatus.Fixed is wrong here, should be budgetType
            total = contract.budget?.amount ?? 0;
        } else if (contract.budgetType === 'Hourly') { // Same here
            total = (contract.workSessions ?? [])
                .filter(ws => ws.status === 'Approved' || ws.status === 'Paid')
                .reduce((sum, ws) => sum + (ws.amountBilled?.amount ?? 0), 0);
        }
        // Add bonuses - assuming bonuses are part of the contract object or fetched separately
        // For simplicity, let's assume `contract.bonuses` is an array like `[{amount: {amount: 100}}]`
        const totalBonuses = (contract.bonuses ?? []) // Assuming bonuses are on contract
            .filter(b => b.status === 'Awarded' || b.status === 'Paid')
            .reduce((sum, b) => sum + (b.amount?.amount ?? 0), 0);
        total += totalBonuses;
        return total;
    });


    async function handleClientApproveCompletion() {
        if (!isLegallyBindingAgreementChecked) {
            showNotification('Пожалуйста, подтвердите свое согласие с условиями завершения.', true);
            return;
        }
        isSubmitting = true;
        try {
            const command = new ClientApproveFinishCommand({
                contractId: contract.id
                // You could add fields for feedback/rating here if your command supports it
            });
            await GlobalClient.clientApproveFinish(command); // Adjust GlobalClient method name

            showNotification('Контракт успешно завершен! Средства будут перечислены исполнителю.', false);
            // Invalidate contract data cache and navigate
            await invalidateAll(); // Or specific stores/paths
            goto(`/contracts/${contract.id}`);

        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || 'Не удалось подтвердить завершение контракта.';
            showNotification(errorMsg, true);
        } finally {
            isSubmitting = false;
        }
    }
</script>

<MetaTags title={`Подтверждение завершения контракта - ${contract.job?.title ?? contract.id}`} noindex={true} />

<div class="container mx-auto px-4 py-8 md:py-12">
    <div class="max-w-2xl mx-auto">
        <div class="mb-6">
             <a href={`/contracts/${contract.id}`} class="text-sm link link-hover text-primary">&larr; Назад к контракту</a>
            <h1 class="text-3xl font-bold mt-2">Подтверждение завершения контракта</h1>
            <p class="text-gray-600">Контракт #{contract.id?.substring(0,8)}</p>
        </div>

        <div class="card bg-base-100 shadow-xl">
            <div class="card-body space-y-6">
                <div>
                    <h2 class="card-title text-xl mb-2">Детали Заказа</h2>
                    <p><strong>Название:</strong> <a href={`/jobs/${jobSummary.id}`} class="link" target="_blank">{jobSummary.title ?? 'N/A'}</a></p>
                    <p><strong>Исполнитель:</strong> {freelancer?.fullname ?? freelancer?.email ?? 'N/A'}</p>
                </div>

                <div>
                    <h2 class="card-title text-xl mb-2">Временная шкала (упрощенно)</h2>
                    <ul class="list-disc list-inside space-y-1 text-sm">
                        <li><strong>Начало контракта:</strong> {formatDate(contract.startDate)}</li>
                        {#if contract.proposedFinishDateByFreelancer} <li><strong>Предложено завершение исполнителем:</strong> {formatDate(contract.proposedFinishDateByFreelancer)}</li>
                        {/if}
                        <li><strong>Текущая дата (подтверждение):</strong> {formatDate(new Date())}</li>
                    </ul>
                </div>

                <div>
                    <h2 class="card-title text-xl mb-2">Средства к Переводу Исполнителю</h2>
                    <p class="text-3xl font-bold text-success">
                        {getMoneyDisplay({amount: totalPayableAmount, currency: contract.budget?.currency})}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                        (Включает оплату за выполненную работу и все одобренные бонусы, за вычетом комиссий платформы, если применимо).
                        <br />Точная сумма будет рассчитана на стороне сервера.
                    </p>
                </div>

                <div class="form-control mt-4">
                    <label class="label cursor-pointer items-start">
                        <input type="checkbox" class="checkbox checkbox-primary mr-3 mt-1" bind:checked={isLegallyBindingAgreementChecked} />
                        <span class="label-text text-sm">
                            Я подтверждаю, что вся работа по контракту <strong class="font-semibold">"{jobSummary.title ?? 'данному заказу'}"</strong> выполнена исполнителем
                            <strong class="font-semibold">{freelancer?.fullname ?? 'фрилансером'}</strong> в полном объеме и надлежащего качества.
                            Я согласен с переводом указанной суммы исполнителю согласно условиям платформы FlSurf.
                        </span>
                    </label>
                </div>

                <div class="alert alert-warning shadow-sm mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <div>
                        <h3 class="font-bold">Важное замечание!</h3>
                        <div class="text-xs">
                            После вашего подтверждения, средства будут перечислены исполнителю по истечении <strong>2-недельного периода удержания</strong> (холда).
                            В течение этого периода (14 дней) вы имеете право <a href={`/disputes/new?contractId=${contract.id}&source=post_completion`} class="link font-semibold">открыть спор</a>, если обнаружатся скрытые недостатки в выполненной работе.
                        </div>
                    </div>
                </div>

                <div class="card-actions justify-end mt-6">
                    <a href={`/contracts/${contract.id}`} class="btn btn-ghost">Отмена</a>
                    <BaseButton
                        className="btn-success"
                        onclick={handleClientApproveCompletion}
                        disabled={!isLegallyBindingAgreementChecked || isSubmitting}
                        isLoading={isSubmitting}>
                        {isSubmitting ? 'Обработка...' : 'Подтвердить и Завершить Контракт'}
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</div>