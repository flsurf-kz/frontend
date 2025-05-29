<script lang="ts">
    import type { PageData } from './$types'; // Assuming you have this from your route
    import {
        ContractEntity,
        UserEntity,
        InitiateDisputeCommand,
        ClientCloseContractCommand,
        ClientAcceptFinishContractCommand,
        FreelancerFinishContractCommand,
        FreelancerAcceptContractCommand, // Make sure this is correctly imported
        UserEntityType,
        ContractEntityStatus,
        type FileEntity,
        type JobEntity,
        type ChatEntity,
        type WorkSessionEntity, // Import WorkSessionEntity
        type CommandResult, // Assuming CommandResult can have an 'id'
        // Money, // If needed for type casting, but usually inferred
    } from 'flsurf-client';
    import { showNotification } from '$lib/shared/ui/errors/modal';
    import { goto } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';
    import { GlobalClient } from '$lib/shared/api';
    import { CurrentUser } from '$lib/entities/user/model/modal';
    import ModalBase from '$lib/shared/ui/modal/modal-base.svelte'; // Adjust path if needed
	import { getContractStatusInfo } from '$lib/shared/api/formatter';

    // Components (placeholders)
    // import ContractFinancials from './_components/contract-financials.svelte';
    // import ContractPartyCard from './_components/contract-party-card.svelte';
    // import ContractTermsSection from './_components/contract-terms-section.svelte';

    let { data } = $props(); 

    let contract = $state(data.contract as ContractEntity);
    let currentUser = $CurrentUser; // Access store value directly with Svelte 5 runes
    let userRole = currentUser?.type;  

    let activeTab = $state('overview');
    let jobTitle = $state('Загрузка названия заказа...');
    let relevantChatId = $state<string | undefined>(undefined);

    // --- Modals State ---
    let showProposeUpdateModal = $state(false);
    // svelte-ignore state_referenced_locally
        let newProposedTerms = $state(contract.contractTerms ?? '');

    let showCancelConfirmModal = $state(false);
    let cancelReason = $state('');

    let showClientAcceptCompletionModal = $state(false);


    // --- Utility Functions ---
    function formatDate(dateString: string | Date | undefined, includeTime = false): string {
        if (!dateString) return 'Не указано';
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    }

    function findRelevantChat() {
        if (contract.job?.chats && contract.employerId && contract.freelancerId) {
            const chat = contract.job.chats.find(c => {
                // Adapt based on actual ChatEntity structure for participants
                const participantIds = c.participants?.map(p => p.id!) || 
                                     (c as any).memberIds || // Fallback for unknown structure
                                     []; 
                return participantIds.includes(contract.employerId!) && participantIds.includes(contract.freelancerId!);
            });
            relevantChatId = chat?.id;
        } else if ((contract as any).chatId) { 
            relevantChatId = (contract as any).chatId;
        }
    }

    async function refreshContractData(showSuccessNotification = false) {
        try {
            const refreshedContract = await GlobalClient.getContract(contract.id);
            contract = refreshedContract; // Update $state variable

            if (contract.jobId && (!contract.job?.title || !contract.job?.chats)) { // Also refresh chats with job
                try {
                    const jobDetails = await GlobalClient.getJob(contract.jobId);
                    jobTitle = jobDetails.title ?? 'Название заказа не найдено';
                    // Assuming jobDetails from getJob has the full JobEntity structure including chats
                    if (jobDetails) {
                        contract.job = jobDetails as JobEntity; // Update the nested job object
                    }
                } catch (jobError) {
                    console.error("Error fetching job details:", jobError);
                    jobTitle = 'Не удалось загрузить название заказа';
                }
            } else {
                jobTitle = contract.job?.title ?? 'Название не указано';
            }
            findRelevantChat();
            if (showSuccessNotification) {
                showNotification('Данные контракта обновлены.', false);
            }
        } catch (e: any) {
            showNotification(e.message || 'Не удалось обновить данные контракта.', true);
        }
    }

    // --- Action Handlers ---
    async function handleProposeUpdateTerms() {
        // ... (placeholder API call as before, ensure specific command and API endpoint)
        showNotification('Функция "Изменить условия" (API заглушка).', false);
        // if (userRole !== UserEntityType.Client || !newProposedTerms.trim()) { /* ... */ return; }
        // try { /* ... API call ... */ await refreshContractData(false); } catch { /* ... */ }
        showProposeUpdateModal = false;
    }

    async function handleRespondToTermsUpdate(accepted: boolean) {
        // ... (placeholder API call as before)
        showNotification(`Функция ответа на изменение условий (${accepted ? 'принято' : 'отклонено'}) (API заглушка).`, false);
        // if (userRole !== UserEntityType.Freelancer) return;
        // try { /* ... API call ... */ await refreshContractData(false); } catch { /* ... */ }
    }
    
    async function handleCancelContractConfirmation() { // Renamed to avoid conflict if called directly
        if (!showCancelConfirmModal) { // This will be called from modal confirm
             showCancelConfirmModal = true; // If called from a button directly first time
             return;
        }
        // if (!cancelReason.trim() && userRole === UserEntityType.Client) { /* ... make reason mandatory ... */ }
        try {
            const command = new ClientCloseContractCommand({ contractId: contract.id, reason: cancelReason });
            const result = await GlobalClient.clientCloseContract(command);
            if (result.isSuccess) {
                showNotification('Контракт отменен.', false);
                await refreshContractData(false);
            } else {
                showNotification(result.message || 'Не удалось отменить контракт.', true);
            }
        } catch (e: any) {
            showNotification(e.message || 'Ошибка при отмене контракта.', true);
        } finally {
            showCancelConfirmModal = false;
            cancelReason = '';
        }
    }

    async function handleFreelancerAcceptContract() {
        if (!isFreelancer || contract.status !== ContractEntityStatus.PendingApproval) return;
        if (!confirm("Вы уверены, что хотите принять этот контракт? Это сделает его активным.")) return;
        try {
            const command = new FreelancerAcceptContractCommand({ contractId: contract.id });
            const result = await GlobalClient.freelancerAcceptContract(command);
            if (result.isSuccess) {
                showNotification('Контракт успешно принят и теперь активен!', false);
                await refreshContractData(false);
            } else {
                showNotification(result.message || 'Не удалось принять контракт.', true);
            }
        } catch (e: any) {
            showNotification(e.message || 'Ошибка при принятии контракта.', true);
        }
    }
    
    async function handleFreelancerSubmitWork() {
        if (!isFreelancer || contract.status !== ContractEntityStatus.Active) return;
        if (!confirm("Вы уверены, что хотите сдать выполненную работу на проверку заказчику?")) return;
        try {
            const command = new FreelancerFinishContractCommand({ contractId: contract.id });
            const result = await GlobalClient.freelancerFinishContract(command);
            if (result.isSuccess) {
                showNotification('Работа отправлена на проверку заказчику.', false);
                await refreshContractData(false); // Expect status: PendingFinishApproval
            } else {
                showNotification(result.message || 'Не удалось сдать работу.', true);
            }
        } catch (e: any) {
            showNotification(e.message || 'Ошибка при сдаче работы.', true);
        }
    }

    function initiateClientAcceptsCompletionModal() {
        if (!isClient || contract.status !== ContractEntityStatus.PendingFinishApproval) return;
        showClientAcceptCompletionModal = true;
    }

    async function confirmClientAcceptsWorkAndFinalizesContract() {
        if (!isClient || contract.status !== ContractEntityStatus.PendingFinishApproval) {
             showClientAcceptCompletionModal = false;
            return;
        }
        try {
            const command = new ClientAcceptFinishContractCommand({ contractId: contract.id });
            const result = await GlobalClient.clientAcceptFinishContract(command);
            if (result.isSuccess) {
                showNotification('Работа принята, контракт успешно завершен!', false);
                await refreshContractData(false); // Expect status: Completed
            } else {
                showNotification(result.message || 'Не удалось подтвердить завершение контракта.', true);
            }
        } catch (e: any) {
            showNotification(e.message || 'Ошибка при подтверждении завершения контракта.', true);
        } finally {
            showClientAcceptCompletionModal = false;
        }
    }

    onMount(async () => {
        await refreshContractData(false); // false to not show "updated" on initial load
        // TODO: Setup SignalR listeners
    });

    onDestroy(() => {
        // TODO: Cleanup SignalR listeners
    });

    const isClient = $derived(contract.employerId === currentUser?.id);
    const isFreelancer = $derived(contract.freelancerId === currentUser?.id);

    // let selectedContractForClientAction: ContractEntity | null = $state(null); // Not strictly needed as 'contract' is $state
    let statusInfo = $derived(getContractStatusInfo(contract.status, contract.pauseReason, isFreelancer, isClient));
</script>

<div class="container mx-auto p-4 md:p-6 space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
            <h1 class="text-2xl md:text-3xl font-bold flex items-center gap-2">
                Контракт
                <span class="badge badge-neutral text-sm">#{contract.id?.substring(0, 8)}</span>
            </h1>
            <a href={`/jobs/${contract.jobId}`} class="text-lg text-primary hover:underline break-all" target="_blank" rel="noopener noreferrer">
                {jobTitle}
            </a>
        </div>
        <button class="btn btn-sm btn-outline btn-primary" onclick={() => refreshContractData(true)} aria-label="Обновить данные контракта">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
            Обновить
        </button>
    </div>

    <div class={`p-4 rounded-lg shadow-md text-sm ${statusInfo.className ?? 'bg-base-200'}`}>
        <div class="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span class="font-semibold text-base-content">Статус контракта:</span>
            <span class="font-bold text-lg {statusInfo.className ? '' : 'text-primary'}">{statusInfo.label}</span>
        </div>
        {#if statusInfo.description}
            <p class="mt-1 text-xs opacity-90 leading-snug">{statusInfo.description}</p>
        {/if}
        {#if contract.isPaused && contract.status !== ContractEntityStatus.Paused}
            <div class="mt-1 pt-1 border-t border-current/20">
                 <span class="text-xs opacity-80 font-semibold">Дополнительно: Контракт временно приостановлен.
                    {#if contract.pauseReason}
                        Причина: {contract.pauseReason}
                    {/if}
                </span>
            </div>
        {/if}
    </div>

    <div class="card bg-base-100 shadow-xl p-4">
        <h2 class="card-title text-lg mb-3">Возможные действия:</h2>
        <div class="flex flex-wrap gap-3">
            {#if isFreelancer && contract.status === ContractEntityStatus.PendingApproval}
                <button class="btn btn-sm btn-success" onclick={handleFreelancerAcceptContract}>Принять контракт</button>
            {/if}

            {#if isFreelancer && contract.status === ContractEntityStatus.Active}
                <button class="btn btn-sm btn-primary" onclick={handleFreelancerSubmitWork}>Сдать работу на проверку</button>
            {/if}
            
            {#if isClient && contract.status === ContractEntityStatus.PendingFinishApproval}
                <button class="btn btn-sm btn-success" onclick={initiateClientAcceptsCompletionModal}>Рассмотреть и принять работу</button>
                <button class="btn btn-sm btn-outline btn-warning" onclick={() => showNotification('Функция "Запросить доработку / Отклонить сдачу" в разработке.', false)}>Запросить доработку</button>
            {/if}

            {#if contract.status === ContractEntityStatus.Active}
                {#if isClient}
                    <button class="btn btn-sm btn-outline" onclick={() => showProposeUpdateModal = true}>Изменить условия (Заглушка)</button>
                {/if}
                {#if isFreelancer && (contract as any).status === 'TermsProposedByClient'}  <button class="btn btn-sm btn-success" onclick={() => handleRespondToTermsUpdate(true)}>Принять новые условия (Заглушка)</button>
                     <button class="btn btn-sm btn-error" onclick={() => handleRespondToTermsUpdate(false)}>Отклонить новые условия (Заглушка)</button>
                {/if}
                <button class="btn btn-sm btn-error" onclick={() => showCancelConfirmModal = true}>Отменить контракт</button>
            {/if}

            {#if contract.status !== ContractEntityStatus.Cancelled && contract.status !== ContractEntityStatus.Completed && contract.status !== ContractEntityStatus.Closed && contract.status !== ContractEntityStatus.PendingApproval && !contract.disputeId }
                <a href={`/disputes/new?contractId=${contract.id}`} class="btn btn-sm btn-warning">Открыть спор</a>
            {/if}
        </div>
    </div>

    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_missing_attribute -->
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
                    <div><h3 class="font-medium text-gray-500 text-sm">Заказчик</h3><p class="font-semibold text-lg">{contract.employer?.fullname ?? contract.employerId}</p>{#if contract.employer?.email}<a href="mailto:{contract.employer.email}" class="text-blue-500 text-sm">{contract.employer.email}</a>{/if}</div>
                    <div><h3 class="font-medium text-gray-500 text-sm">Исполнитель</h3><p class="font-semibold text-lg">{contract.freelancer?.fullname ?? contract.freelancerId}</p>{#if contract.freelancer?.email}<a href="mailto:{contract.freelancer.email}" class="text-blue-500 text-sm">{contract.freelancer.email}</a>{/if}</div>
                </div>
                <div class="space-y-4">
                    <div><h3 class="font-medium text-gray-500 text-sm">Дата начала</h3><p class="font-semibold">{formatDate(contract.startDate)}</p></div>
                    {#if contract.endDate}<div><h3 class="font-medium text-gray-500 text-sm">Дата завершения (план)</h3><p class="font-semibold">{formatDate(contract.endDate)}</p></div>{/if}
                    <div><h3 class="font-medium text-gray-500 text-sm">Тип контракта</h3><p class="font-semibold">{contract.budgetType === 'Fixed' ? 'Фиксированная оплата' : contract.budgetType === 'Hourly' ? 'Почасовая оплата' : contract.budgetType}</p></div>
                </div>
                <div class="space-y-4">
                    <div><h3 class="font-medium text-gray-500 text-sm">Общий бюджет</h3><p class="font-semibold text-xl text-success">{contract.budget?.amount?.toLocaleString() ?? 'N/A'} {contract.budget?.currency ?? ''}</p></div>
                    {#if contract.budgetType === 'Hourly' && contract.costPerHour}<div><h3 class="font-medium text-gray-500 text-sm">Ставка в час</h3><p class="font-semibold">{contract.costPerHour.amount?.toLocaleString()} {contract.costPerHour.currency}</p></div>{/if}
                    <div><h3 class="font-medium text-gray-500 text-sm">Оставшийся бюджет (у заказчика)</h3><p class="font-semibold">{contract.remainingBudget?.amount?.toLocaleString() ?? 'N/A'} {contract.remainingBudget?.currency ?? ''}</p></div>
                </div>
            </div>
            <div class="mt-8"><h3 class="text-lg font-semibold mb-2">Условия контракта</h3><div class="prose max-w-none p-4 bg-base-200 rounded-md min-h-[100px]">{@html contract.contractTerms?.replace(/\n/g, '<br>') ?? '<p><em>Условия не указаны.</em></p>'}</div></div>
            <div class="mt-8"><h3 class="text-lg font-semibold mb-2">Финансовая сводка (упрощенно)</h3><p>Эта секция будет детализировать движение средств.</p></div>

        {:else if activeTab === 'work_sessions' && contract.budgetType === 'Hourly'}
            <h2 class="text-xl font-semibold mb-4">Учет рабочих сессий</h2>
            {#if contract.workSessions && contract.workSessions.length > 0}
                <div class="overflow-x-auto">
                    <table class="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>Начало</th>
                                <th>Конец</th>
                                <th>Часы</th>
                                <th>Комментарий</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each contract.workSessions as session (session.id)}
                                <tr>
                                    <td>{formatDate(session.startDate, true)}</td>
                                    <td>{session.endDate ? formatDate(session.endDate, true) : 'Активна'}</td>
                                    <td>{session.workedHours?.toFixed(2) ?? 'N/A'}</td>
                                    <td class="max-w-xs truncate" title={session.comment}>{session.comment ?? '-'}</td>
                                    <td><span class="badge badge-sm {session.status === 'Approved' ? 'badge-success' : session.status === 'Pending' ? 'badge-warning' : 'badge-ghost'}">{session.status ?? 'N/A'}</span></td>
                                    <td>
                                        <a href={`/contracts/${contract.id}/sessions/${session.id}`} class="btn btn-xs btn-outline btn-primary">Детали</a>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {:else}
                <p class="text-center py-10 text-base-content/70">Рабочие сессии по этому контракту еще не зафиксированы.</p>
            {/if}

        {:else if activeTab === 'tasks_milestones'}
            <h2 class="text-xl font-semibold mb-4">Задачи и Этапы</h2>
            <p class="text-center py-10 text-base-content/70">Раздел задач и этапов находится в разработке.</p>
            {:else if activeTab === 'files'}
            <h2 class="text-xl font-semibold mb-4">Файлы контракта</h2>
            {#if contract.files && contract.files.length > 0}
                <ul class="list-disc list-inside pl-1 space-y-2">
                    {#each contract.files as file (file.id)}
                        <li class="text-sm">
                            <a href={file.filePath} target="_blank" rel="noopener noreferrer" class="link link-primary hover:underline" download={file.fileName}>
                                {file.fileName}
                            </a>
                            <span class="text-xs text-base-content/60 ml-2">({(file.size ?? 0 / 1024).toFixed(1)} KB) - {formatDate(file.createdAt)}</span>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p class="text-center py-10 text-base-content/70">К этому контракту файлы не прикреплены.</p>
            {/if}

        {:else if activeTab === 'communication'}
            <h2 class="text-xl font-semibold mb-4">Общение по контракту</h2>
            {#if relevantChatId}
                <p class="mb-2">Для обсуждения деталей контракта, пожалуйста, используйте связанный чат:</p>
                <a href={`/messaging/${relevantChatId}`} class="btn btn-primary">Перейти в чат с {isClient ? contract.freelancer?.fullname : contract.employer?.fullname}</a>
            {:else}
                <p class="text-base-content/70">Чат для этого контракта не найден или еще не создан.</p>
                <button class="btn btn-outline btn-sm mt-2" onclick={() => showNotification('Функция создания чата из контракта в разработке', false)}>Начать чат (Заглушка)</button>
            {/if}
            <p class="mt-6 text-base-content/70">Согласованные пункты и важные договоренности (в разработке)</p>

        {:else if activeTab === 'staff_tools' && userRole === UserEntityType.Staff}
            <p class="text-center py-10">Инструменты для персонала (в разработке).</p>
        {/if}
    </div>
</div>

{#if showProposeUpdateModal}
    <ModalBase bind:open={showProposeUpdateModal} title="Предложить новые условия контракта">
        <p class="py-2 text-sm text-base-content/80">Опишите предлагаемые изменения. Исполнитель должен будет их согласовать.</p>
        <textarea class="textarea textarea-bordered w-full min-h-[150px] mt-2" bind:value={newProposedTerms} placeholder="Введите новые или измененные условия..."></textarea>
        <div class="modal-action mt-4">
            <button class="btn btn-ghost" onclick={() => showProposeUpdateModal = false}>Отмена</button>
            <button class="btn btn-primary" onclick={handleProposeUpdateTerms} disabled={!newProposedTerms.trim()}>Отправить на согласование</button>
        </div>
    </ModalBase>
{/if}

{#if showCancelConfirmModal}
     <ModalBase bind:open={showCancelConfirmModal} title="Подтверждение отмены контракта">
        <p class="py-2 text-sm text-base-content/80">Вы уверены, что хотите отменить этот контракт? Это действие может повлечь за собой финансовые обязательства согласно правилам платформы FLSURF.KZ.</p>
        <textarea class="textarea textarea-bordered w-full mt-2" bind:value={cancelReason} placeholder="Причина отмены (рекомендуется)"></textarea>
        <div class="modal-action mt-4">
            <button class="btn btn-ghost" onclick={() => showCancelConfirmModal = false}>Нет, вернуться</button>
            <button class="btn btn-error" onclick={handleCancelContractConfirmation}>Да, отменить контракт</button>
        </div>
    </ModalBase>
{/if}

{#if showClientAcceptCompletionModal}
    <ModalBase
        bind:open={showClientAcceptCompletionModal}
        title="Подтверждение завершения работы по контракту"
    >
        <div class="text-center mb-4">
            <p class="text-base-content/80 text-md">Вы собираетесь подтвердить, что исполнитель <strong class="text-primary">{contract.freelancer?.fullname ?? 'Исполнитель'}</strong> успешно завершил работу по контракту:</p>
            <p class="font-semibold text-accent text-lg my-1.5">{jobTitle}</p>
        </div>
        <p class="text-md text-center mb-3">
            Сумма к выплате исполнителю (или итоговая сумма по контракту): <span class="font-bold text-lg text-success">{contract.budget?.amount?.toLocaleString() ?? 'N/A'} {contract.budget?.currency}</span>
        </p>
        <div class="bg-base-200 p-3.5 rounded-lg my-5 border border-base-300">
            <p class="text-xs text-base-content/70 text-center leading-relaxed">
                Это действие приведет к завершению контракта и запуску процесса выплаты средств исполнителю согласно условиям платформы FLSURF.KZ (например, после периода удержания, если он предусмотрен). Убедитесь, что вы полностью удовлетворены качеством выполненной работы.
            </p>
        </div>
        <div class="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <button class="btn btn-ghost flex-1 order-2 sm:order-1" onclick={() => showClientAcceptCompletionModal = false}>Отмена</button>
            <button class="btn btn-success flex-1 order-1 sm:order-2" onclick={confirmClientAcceptsWorkAndFinalizesContract}>Подтвердить и Завершить</button>
        </div>
    </ModalBase>
{/if}

<style>
    /* Add any specific styles if needed */
    .tabs-bordered .tab {
        border-color: hsl(var(--b2)); /* Slightly darker border for tabs */
    }
    .tabs-bordered .tab-active {
        border-color: hsl(var(--p)); /* Primary color for active tab border */
        border-bottom-width: 2px;
        font-weight: 600;
    }
</style>