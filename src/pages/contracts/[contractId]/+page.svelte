<script lang="ts">
    import type { PageData } from './$types';
    import {
        ContractEntity, // Assuming JobEntity is nested or you fetch its title separately
        UserEntity,
        // Commands (ensure these exist in your flsurf-client and are correctly defined)
        InitiateDisputeCommand,
        ClientCloseContractCommand, // Generic: backend needs to know who is cancelling for fee logic
        // ClientSpecificCancelCommand, FreelancerSpecificCancelCommand might be better
        ClientAcceptFinishContractCommand, // e.g., Client approves completion
        FreelancerFinishContractCommand,
		UserEntityType,
		ContractEntityStatus, // Freelancer indicates work is done
    } from 'flsurf-client'; // Your NSwag generated client
    import { showNotification } from '$lib/shared/ui/errors/modal';
    import { goto } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';
	import { GlobalClient } from '$lib/shared/api';
	import { CurrentUser } from '$lib/entities/user/model/modal';

    // Components (placeholders, create these in a _components folder)
    // import ContractFinancials from './_components/contract-financials.svelte';
    // import ContractPartyCard from './_components/contract-party-card.svelte'; // For client/freelancer info
    // import ContractTermsSection from './_components/contract-terms-section.svelte';

    let { data } = $props(); 

    let contract = $state(data.contract);
    let currentUser = $CurrentUser;
    let userRole = $CurrentUser?.type;  

    let activeTab = $state('overview');
    let jobTitle = $state('Загрузка названия заказа...');

    // --- Modals State ---
    let showProposeUpdateModal = $state(false);
    let newProposedTerms = $state(contract.contractTerms ?? '');

    let showCancelConfirmModal = $state(false);
    let cancelReason = $state(''); // Optional reason for cancellation

    // --- Utility Functions ---
    function formatDate(dateString: string | Date | undefined): string {
        if (!dateString) return 'Не указано';
        return new Date(dateString).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    async function refreshContractData() {
        try {
            const refreshedContract = await GlobalClient.getContract(contract.id);
            contract = refreshedContract;
            if (contract.jobId && !contract.job?.title) { // If job title wasn't in initial contract load
                try {
                    const jobDetails = await GlobalClient.getJob(contract.jobId); // getJob returns JobDetails
                    jobTitle = jobDetails.title ?? 'Название заказа не найдено';
                } catch {
                    jobTitle = 'Не удалось загрузить название заказа';
                }
            } else {
                jobTitle = contract.job?.title ?? 'Название не указано';
            }
            showNotification('Данные контракта обновлены.', false);
        } catch (e: any) {
            showNotification(e.message || 'Не удалось обновить данные контракта.', true);
        }
    }

    // --- Action Handlers ---
    async function handleProposeUpdateTerms() {
        if (userRole !== UserEntityType.Client || !newProposedTerms.trim()) {
            showNotification('Только заказчик может предлагать изменения условий, и описание условий не должно быть пустым.', true);
            return;
        }
        try {
            // ASSUMPTION: You have a specific command like ProposeContractTermsUpdateCommand
            // For now, using a generic UpdateContractCommand as a placeholder.
            // This command should ideally store the 'proposedTerms' and change contract status
            // to something like 'PendingFreelancerApprovalForTerms'.
            // const command = new UpdateContractCommand({ // Replace with actual specific command
            //     contractId: contract.id,
            //     contractTerms: newProposedTerms, // This implies direct update or a specific field for proposed terms
            //     // You might need other fields if UpdateContractCommand is a general purpose one.
            // });
            // await GlobalClient.updateContract(command); // Your API call
            showNotification('Предложение об изменении условий отправлено фрилансеру.', false);
            showProposeUpdateModal = false;
            await refreshContractData();
        } catch (e: any) {
            showNotification(e.message || 'Ошибка при отправке предложения об изменении условий.', true);
        }
    }

    async function handleRespondToTermsUpdate(accepted: boolean) {
        if (userRole !== UserEntityType.Freelancer) return;
        try {
            // ASSUMPTION: You have a command like RespondToContractTermsUpdateCommand
            // This command would take contractId and the 'accepted' boolean.
            // If accepted, it makes proposedTerms the actual contractTerms and updates status.
            // If rejected, it might revert status or notify client.
            // const command = new RespondToTermsCommand({ contractId: contract.id, accepted });
            // await GlobalClient.respondToTerms(command); // Your API call (placeholder)
            showNotification(`Ваш ответ на изменение условий (${accepted ? 'принято' : 'отклонено'}) зарегистрирован.`, false);
            await refreshContractData();
        } catch (e: any) {
            showNotification(e.message || 'Ошибка при ответе на изменение условий.', true);
        }
    }

    async function handleCancelContract() {
        if (!showCancelConfirmModal) {
            showCancelConfirmModal = true;
            return;
        }
        if (!cancelReason.trim() && userRole === UserEntityType.Client) { // Example: make reason mandatory for client
             // showNotification("Пожалуйста, укажите причину отмены.", true);
             // return;
        }

        try {
            // This command needs to handle the fee logic based on who is cancelling
            // And your "no escrow" fund movement logic.
            const command = new ClientCloseContractCommand({ // This needs to be specific or backend handles role
                contractId: contract.id,
                reason: cancelReason,
                // userId: currentUser.id // Backend might get this from token
            });
            await GlobalClient.clientCloseContract(command); // Your API call
            showNotification('Контракт отменен.', false);
            showCancelConfirmModal = false;
            await refreshContractData(); // Status will change
        } catch (e: any) {
            showNotification(e.message || 'Ошибка при отмене контракта.', true);
        }
    }

    async function handleFreelancerRequestsCompletion() {
        if (userRole !== UserEntityType.Freelancer) return;
        try {
            // const command = new FreelancerSubmitForCompletionCommand({ contractId: contract.id });
            // await GlobalClient.freelancerSubmitForCompletion(command); // Your API call (placeholder)
            showNotification('Запрос на завершение контракта отправлен заказчику.', false);
            await refreshContractData(); // Status might change to 'PendingClientCompletionApproval'
        } catch (e: any) {
            showNotification(e.message || 'Ошибка при отправке запроса на завершение.', true);
        }
    }

    async function handleClientConfirmsCompletion() {
        if (userRole !== UserEntityType.Client) return;
        try {
            // This command will trigger the final fund calculations and the 2-week hold.
            // const command = new CompleteContractCommand({ contractId: contract.id });
            // await GlobalClient.completeContract(command); // Your API call (placeholder)
            showNotification('Завершение контракта подтверждено. Средства будут перечислены исполнителю согласно правилам.', false);
            await refreshContractData(); // Status might change to 'Completed' or 'FundsPendingRelease'
        } catch (e: any) {
            showNotification(e.message || 'Ошибка при подтверждении завершения контракта.', true);
        }
    }


    onMount(async () => {
        await refreshContractData(); // Initial full load / refresh job title
        // TODO: Setup SignalR listeners for this contractId if you have them
        // e.g., contractHub.on("ContractUpdated", (updatedContract) => { if (updatedContract.id === contract.id) contract = updatedContract; });
    });

    onDestroy(() => {
        // TODO: Cleanup SignalR listeners
    });

    // Determine if current user is Client or Freelancer for this contract
    const isClient = $derived(contract.employerId === currentUser?.id);
    const isFreelancer = $derived(contract.freelancerId === currentUser?.id);

</script>

<div class="container mx-auto p-4 md:p-6 space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
            <h1 class="text-2xl md:text-3xl font-bold flex items-center gap-2">
                Контракт
                <span class="badge badge-neutral text-sm">#{contract.id.substring(0, 8)}</span>
            </h1>
            <a href={`/jobs/${contract.jobId}`} class="text-lg text-blue-600 hover:underline break-all" target="_blank">
                {jobTitle}
            </a>
        </div>
        <button class="btn btn-sm btn-outline btn-primary" onclick={refreshContractData} aria-label="Обновить данные контракта">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
            Обновить
        </button>
    </div>

    <div class="p-4 bg-base-200 rounded-lg shadow-md text-center sm:text-left">
        <span class="font-semibold">Статус контракта:</span>
        <span class="font-bold text-primary ml-2">{contract.status ?? 'Неизвестен'}</span>
        {#if contract.isPaused}
            <span class="ml-2 badge badge-warning">Приостановлен: {contract.pauseReason ?? 'Без указания причины'}</span>
        {/if}
    </div>

    <div class="card bg-base-100 shadow-xl p-4">
        <h2 class="card-title text-lg mb-3">Возможные действия:</h2>
        <div class="flex flex-wrap gap-3">
            {#if contract.status === 'Active'}
                {#if isClient}
                    <button class="btn btn-sm btn-outline" onclick={() => showProposeUpdateModal = true}>Изменить условия</button>
                    {/if}
                {#if isFreelancer}
                    {/if}
                 <button class="btn btn-sm btn-error" onclick={() => handleCancelContract()}>Отменить контракт</button>
            {/if}

            {#if contract.status === ContractEntityStatus.PendingFinishApproval && isFreelancer} <button class="btn btn-sm btn-success" onclick={() => handleRespondToTermsUpdate(true)}>Принять новые условия</button>
                <button class="btn btn-sm btn-error" onclick={() => handleRespondToTermsUpdate(false)}>Отклонить новые условия</button>
            {/if}

            {#if contract.status === ContractEntityStatus.PendingApproval && isClient} <button class="btn btn-sm btn-success" onclick={handleClientConfirmsCompletion}>Подтвердить завершение</button>
                 {/if}

             {#if contract.status !== 'Cancelled' && contract.status !== 'Completed' && !contract.disputeId }
                <a href={`/disputes/new?contractId=${contract.id}`} class="btn btn-sm btn-warning">Открыть спор</a>
            {/if}
        </div>
    </div>


    <div role="tablist" class="tabs tabs-bordered tabs-lg mt-6">
        <a role="tab" class="tab [--tab-border-color:oklch(var(--p))] focus:outline-none" class:tab-active={activeTab === 'overview'} onclick={() => activeTab = 'overview'}>Обзор</a>
        {#if contract.budgetType === 'Hourly'}
            <a role="tab" class="tab [--tab-border-color:oklch(var(--p))]" class:tab-active={activeTab === 'work_sessions'} onclick={() => activeTab = 'work_sessions'}>Рабочие сессии</a>
        {/if}
        <a role="tab" class="tab [--tab-border-color:oklch(var(--p))]" class:tab-active={activeTab === 'tasks_milestones'} onclick={() => activeTab = 'tasks_milestones'}>Задачи/Этапы</a>
        <a role="tab" class="tab [--tab-border-color:oklch(var(--p))]" class:tab-active={activeTab === 'files'} onclick={() => activeTab = 'files'}>Файлы</a>
        <a role="tab" class="tab [--tab-border-color:oklch(var(--p))]" class:tab-active={activeTab === 'communication'} onclick={() => activeTab = 'communication'}>Общение</a>
        {#if userRole === UserEntityType.Staff}
            <a role="tab" class="tab" class:tab-active={activeTab === 'staff_tools'} onclick={() => activeTab = 'staff_tools'}>Инструменты персонала</a>
        {/if}
    </div>

    <div class="py-6 card bg-base-100 shadow-xl p-6 min-h-[300px]">
        {#if activeTab === 'overview'}
            <h2 class="text-xl font-semibold mb-4">Детали контракта</h2>
            <div class="grid md:grid-cols-3 gap-6">
                <div class="space-y-4">
                    <div>
                        <h3 class="font-medium text-gray-500 text-sm">Заказчик</h3>
                        <p class="font-semibold text-lg">{contract.employer?.fullname ?? contract.employerId}</p>
                        {#if contract.employer?.email}<a href="mailto:{contract.employer.email}" class="text-blue-500 text-sm">{contract.employer.email}</a>{/if}
                    </div>
                    <div>
                        <h3 class="font-medium text-gray-500 text-sm">Исполнитель</h3>
                        <p class="font-semibold text-lg">{contract.freelancer?.fullname ?? contract.freelancerId}</p>
                        {#if contract.freelancer?.email}<a href="mailto:{contract.freelancer.email}" class="text-blue-500 text-sm">{contract.freelancer.email}</a>{/if}
                    </div>
                </div>

                <div class="space-y-4">
                    <div>
                        <h3 class="font-medium text-gray-500 text-sm">Дата начала</h3>
                        <p class="font-semibold">{formatDate(contract.startDate)}</p>
                    </div>
                    {#if contract.endDate}
                        <div>
                            <h3 class="font-medium text-gray-500 text-sm">Дата завершения (план)</h3>
                            <p class="font-semibold">{formatDate(contract.endDate)}</p>
                        </div>
                    {/if}
                     <div>
                        <h3 class="font-medium text-gray-500 text-sm">Тип контракта</h3>
                        <p class="font-semibold">{contract.budgetType === 'Fixed' ? 'Фиксированная оплата' : contract.budgetType === 'Hourly' ? 'Почасовая оплата' : contract.budgetType}</p>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <h3 class="font-medium text-gray-500 text-sm">Общий бюджет</h3>
                        <p class="font-semibold text-xl text-success">{contract.budget?.amount ?? 'N/A'} {contract.budget?.currency ?? ''}</p>
                    </div>
                    {#if contract.budgetType === 'Hourly' && contract.costPerHour}
                        <div>
                            <h3 class="font-medium text-gray-500 text-sm">Ставка в час</h3>
                            <p class="font-semibold">{contract.costPerHour.amount} {contract.costPerHour.currency}</p>
                        </div>
                    {/if}
                    <div>
                        <h3 class="font-medium text-gray-500 text-sm">Оставшийся бюджет (у заказчика)</h3>
                        <p class="font-semibold">{contract.remainingBudget?.amount ?? 'N/A'} {contract.remainingBudget?.currency ?? ''}</p>
                    </div>
                </div>
            </div>

            <div class="mt-8">
                <h3 class="text-lg font-semibold mb-2">Условия контракта</h3>
                <div class="prose max-w-none p-4 bg-base-200 rounded-md min-h-[100px]">
                    {@html contract.contractTerms?.replace(/\n/g, '<br>') ?? '<p><em>Условия не указаны.</em></p>'}
                </div>
            </div>

            <div class="mt-8">
                 <h3 class="text-lg font-semibold mb-2">Финансовая сводка (упрощенно)</h3>
                 <p>Эта секция будет детализировать движение средств согласно вашей "прямой перевод, без эскроу" модели.</p>
                 <p>Например: сколько было переведено исполнителю, сколько удержано при отменах и т.д.</p>
            </div>


        {:else if activeTab === 'work_sessions' && contract.budgetType === 'Hourly'}
            <p class="text-center py-10">Раздел рабочих сессий будет здесь.</p>

        {:else if activeTab === 'tasks_milestones'}
            <p class="text-center py-10">Раздел задач и этапов будет здесь.</p>

        {:else if activeTab === 'files'}
            <p class="text-center py-10">Раздел файлов будет здесь.</p>

        {:else if activeTab === 'communication'}
            <div class="text-center py-10">
                <p>Основной чат по контракту: [Ссылка на чат]</p>
                 <p class="mt-4">Согласованные пункты (из GlobalClient.freelancerWorkApprove()): [Отображение]</p>
            </div>


        {:else if activeTab === 'staff_tools' && userRole === UserEntityType.Staff}
            <p class="text-center py-10">Инструменты для персонала будут здесь.</p>
        {/if}
    </div>
</div>

{#if showProposeUpdateModal}
<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-2xl">
        <h3 class="font-bold text-lg">Предложить новые условия контракта</h3>
        <p class="py-2 text-sm">Опишите предлагаемые изменения. Фрилансер должен будет их согласовать.</p>
        <textarea class="textarea textarea-bordered w-full min-h-[200px] mt-2" bind:value={newProposedTerms} placeholder="Введите новые или измененные условия..."></textarea>
        <div class="modal-action mt-4">
            <button class="btn btn-primary" onclick={handleProposeUpdateTerms} disabled={!newProposedTerms.trim()}>Отправить на согласование</button>
            <button class="btn btn-ghost" onclick={() => showProposeUpdateModal = false}>Отмена</button>
        </div>
    </div>
</div>
{/if}

{#if showCancelConfirmModal}
<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-lg">
        <h3 class="font-bold text-lg text-error">Подтверждение отмены контракта</h3>
        <p class="py-2 text-sm">Вы уверены, что хотите отменить этот контракт? Это действие может повлечь за собой финансовые обязательства согласно правилам платформы.</p>
        <textarea class="textarea textarea-bordered w-full mt-2" bind:value={cancelReason} placeholder="Причина отмены (рекомендуется)"></textarea>
        <div class="modal-action mt-4">
            <button class="btn btn-error" onclick={handleCancelContract}>Да, отменить контракт</button>
            <button class="btn btn-ghost" onclick={() => showCancelConfirmModal = false}>Нет, вернуться</button>
        </div>
    </div>
</div>
{/if}