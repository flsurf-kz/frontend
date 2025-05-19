<script lang="ts">
    import { goto } from '$app/navigation';
    import { GlobalClient } from '$lib/shared/api'; // Ensure all commands are imported
    import { showNotification } from '$lib/shared/ui/errors/modal';
    import { DeleteJobCommand, HideJobCommand, JobEntityStatus, ProposalEntity, ProposalEntityStatus, ReactToProposalCommand, ReactToProposalCommandReaction, SendDraftJobToModerationCommand, StartChatWithFreelancerCommand, type JobEntity } from 'flsurf-client';
    import { CurrentUser } from '$lib/entities/user/model/modal'; // For potential use if backend needs explicit userId

    let { job }: { job: JobEntity } = $props();

    let selectedProposal: ProposalEntity | null = $state(null);
    let showConfirmModal = $state(false);
    let currentGroup: 'Pending' | 'Accepted' | 'Hidden' | 'Rejected' = $state('Pending'); // Add 'Rejected' if it's a distinct status

    async function openChat(proposal: ProposalEntity) {
        if (!job.id || !proposal.id || !proposal.freelancerId) {
            showNotification("Ошибка: Необходимые ID для создания чата отсутствуют.", true);
            console.error("Missing IDs for chat creation:", { jobId: job.id, proposalId: proposal.id, freelancerId: proposal.freelancerId });
            return;
        }
        
        try {
            console.log(`Attempting to create/open interview chat for job ${job.id}, proposal ${proposal.id}`);
            const command = new StartChatWithFreelancerCommand({ 
                jobId: job.id, 
                proposalId: proposal.id 
                // Backend should get current client's ID from the authenticated session.
                // If explicit freelancerId is needed by this command, add: freelancerId: proposal.freelancerId 
            });
            const result = await GlobalClient.startChatWithFreelancer(command); // API NSwag client
            
            // IMPORTANT: Adjust based on the actual response structure of 'createInterviewChat'
            // Let's assume 'result' is CommandResult and might have 'data' or a specific field for chatId
            if (result && result.isSuccess && result.id) { 
                showNotification("Чат для интервью создан/открыт.", false);
                goto(`/messages/${result.id}`); // Navigate to the specific chat
            } else if (result && result.isSuccess) {
                // If no direct chatId, perhaps navigate to a general messages page or rely on SignalR to update chat list
                showNotification("Чат для интервью создан/открыт. Вы можете найти его в списке ваших чатов.", false);
                // goto('/messages'); // Or refresh current page if chat link appears elsewhere
            }
            else {
                showNotification(result?.message || "Не удалось создать или открыть чат для интервью.", true);
            }
        } catch (error: any) {
            console.error("Error opening/creating interview chat:", error);
            const errorMessage = error.response?.data?.message || error.message || "Ошибка при создании чата для интервью.";
            showNotification(errorMessage, true);
        }
    }

    function initiateAcceptProposal(p: ProposalEntity) {
        selectedProposal = p;
        showConfirmModal = true;
    }

    async function confirmAndAcceptProposal() {
        if (!selectedProposal || !selectedProposal.id || !job.id) {
            showNotification("Ошибка: Не выбрано предложение для принятия.", true);
            return;
        }
        try {
            // This command should trigger contract creation on the backend.
            const command = new ReactToProposalCommand({
                proposalId: selectedProposal.id,
                reaction: ReactToProposalCommandReaction.Accepted // Make sure 'Accept' matches your backend enum/string
            });
            const result = await GlobalClient.reactToProposal(command);
            
            if (result.isSuccess) {
                showNotification("Предложение принято! Контракт создается.", false);
                showConfirmModal = false;
                
                // Update proposal status locally for immediate UI feedback
                const updatedProposals = (job.proposals ?? []).map(p => 
                    p.id === selectedProposal!.id ? new ProposalEntity({ ...p, status: ProposalEntityStatus.Accepted }) : p // Ensure 'Accepted' matches your ProposalStatus enum
                );
                job.proposals = updatedProposals;	
                currentGroup = 'Accepted'; // Switch view
                
                // Optionally, navigate to the newly created contract if the API returns its ID
                // For example: if (result.data && result.data.contractId) { goto(`/contracts/${result.data.contractId}`); }
                // For now, we just update the UI here. The user can navigate to contracts from their dashboard.
            } else {
                showNotification(result.message || "Не удалось принять предложение.", true);
            }
            selectedProposal = null; 

        } catch (error: any) {
            console.error("Error accepting proposal:", error);
            const errorMessage = error.response?.data?.message || error.message || "Ошибка при принятии предложения.";
            showNotification(errorMessage, true);
            showConfirmModal = false;
        }
    }
    
    async function rejectProposal(proposal: ProposalEntity) {
        if (!proposal.id || !job.id) return;
        try {
            const command = new ReactToProposalCommand({
                proposalId: proposal.id,
                reaction: ReactToProposalCommandReaction.Rejected // Make sure 'Reject' matches your backend enum/string
            });
            const result = await GlobalClient.reactToProposal(command);
            if (result.isSuccess) {
                showNotification('Предложение отклонено.', false);
                proposal.status = ProposalEntityStatus.Rejected; // Update status locally
                job.proposals = [...(job.proposals ?? [])]; // Trigger reactivity
            } else {
                showNotification(result.message || 'Не удалось отклонить предложение.', true);
            }
        } catch (e: any) {
            const errorMessage = e.response?.data?.message || e.message || 'Ошибка при отклонении предложения.';
            showNotification(errorMessage, true);
        }
    }

    async function handleDeleteJob() { 
        if (confirm("Вы уверены, что хотите удалить этот заказ? Это действие необратимо.")) {
            try { 
                const result = await GlobalClient.deleteJob(new DeleteJobCommand({ jobId: job.id }));
                if (result.isSuccess) {
                    showNotification("Заказ удален.", false);
                    goto('/jobs'); // Navigate to jobs list or dashboard
                } else {
                    showNotification(result.message || "Не удалось удалить заказ.", true);
                }
            } catch (exc: any) { 
                const errorMessage = exc.response?.data?.message || exc.message || "Ошибка при удалении заказа.";
                showNotification(errorMessage, true);
            }
        }
    }

    async function handleHideJob() { 
        try { 
            const result = await GlobalClient.hideJob(new HideJobCommand({ jobId: job.id }));
            if (result.isSuccess) {
                job.isHidden = !job.isHidden; // Toggle status based on backend logic (assuming it toggles)
                showNotification(job.isHidden ? "Заказ скрыт." : "Заказ снова виден.", false); 
            } else {
                showNotification(result.message || "Не удалось изменить видимость заказа.", true);
            }
        } catch (exc: any) { 
            const errorMessage = exc.response?.data?.message || exc.message || "Ошибка при изменении видимости заказа.";
            showNotification(errorMessage, true); 
        }
    }

    async function sendToModeration() {
        try {
            const result = await GlobalClient.sentDraftToMod(new SendDraftJobToModerationCommand({ jobId: job.id }));
            if (result.isSuccess) {
                showNotification('Заказ отправлен на модерацию.', false);
                // job.status = 'PendingModeration'; // Update status locally or refetch data
                // Consider refetching job data to get the new status
            } else {
                showNotification(result.message || 'Не удалось отправить заказ на модерацию.', true);
            }
        } catch (e: any) {
            const errorMessage = e.response?.data?.message || e.message || 'Ошибка при отправке на модерацию.';
            showNotification(errorMessage, true);
        }
    }

	let filteredProposals: ProposalEntity[] = $state([])
    // Helper to determine which proposals to show based on currentGroup
    $effect(() => { filteredProposals = (job.proposals ?? []).filter((p: ProposalEntity) => {
        if (currentGroup === 'Hidden') return p.status === 'Hidden'; // Assuming 'Hidden' is a valid status from backend
        if (currentGroup === 'Rejected') return p.status === 'Rejected';
        if (currentGroup === 'Accepted') return p.status === 'Accepted';
        if (currentGroup === 'Pending') return p.status === 'Pending';
        return false;
	})});

</script>

<div class="flex flex-wrap gap-4 mt-6 mb-2 items-center">
    {#if job.status === JobEntityStatus.Draft} <button class="btn btn-primary" onclick={sendToModeration}>Отправить на модерацию</button>
    {/if}
    <a href={`/jobs/${job.id}/edit`} class="btn btn-outline">Редактировать</a>
    <button class="btn btn-outline" onclick={handleHideJob}>
        {job.isHidden ? 'Сделать видимым' : 'Скрыть заказ'}
    </button>
    <button class="btn btn-outline btn-error" onclick={handleDeleteJob}>Удалить заказ</button>
</div>

<h2 class="text-lg font-semibold mt-8">Предложения исполнителей ({job.proposals?.length ?? 0})</h2>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_missing_attribute -->
<div role="tablist" class="tabs tabs-bordered mt-2 mb-6">
    <a role="tab" class="tab" class:tab-active={currentGroup === 'Pending'} onclick={() => currentGroup = 'Pending'}>
        Ожидают ({job.proposals?.filter(p => p.status === 'Pending').length ?? 0})
    </a>
    <a role="tab" class="tab" class:tab-active={currentGroup === 'Accepted'} onclick={() => currentGroup = 'Accepted'}>
        Принятые ({job.proposals?.filter(p => p.status === 'Accepted').length ?? 0})
    </a>
    <a role="tab" class="tab" class:tab-active={currentGroup === 'Rejected'} onclick={() => currentGroup = 'Rejected'}>
        Отклоненные ({job.proposals?.filter(p => p.status === 'Rejected').length ?? 0})
    </a>
    <a role="tab" class="tab" class:tab-active={currentGroup === 'Hidden'} onclick={() => currentGroup = 'Hidden'}>
        Скрытые ({job.proposals?.filter(p => p.status === 'Hidden').length ?? 0})
    </a>
</div>

<div class="space-y-6">
    {#if filteredProposals.length > 0}
        {#each filteredProposals as proposal (proposal.id)}
            <div class="p-4 border rounded-lg bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div class="flex-grow">
                        <div class="flex items-center gap-3 mb-2">
                            <img src={proposal.freelancer?.avatar?.filePath ?? '/default-avatar.png'} alt="avatar" class="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <p class="font-bold text-lg">{proposal.freelancer?.fullname ?? proposal.freelancer?.name ?? 'Исполнитель не указан'}</p>
                                <a href={`/freelancer/${proposal.freelancerId}`} target="_blank" rel="noopener noreferrer" class="text-sm text-blue-600 hover:underline">
                                    Просмотреть профиль
                                </a>
                            </div>
                        </div>
                        
                        <p class="text-gray-700 text-sm whitespace-pre-wrap mt-2 leading-relaxed">{proposal.coverLetter}</p>
                        <p class="text-sm mt-3 font-medium">Предложенная ставка: <span class="text-primary">{proposal.proposedRate} ₸</span></p>
                        <p class="text-xs text-gray-500 mt-1">Отправлено: {new Date(proposal.createdAt ?? Date.now()).toLocaleDateString()}</p>
                        </div>
                    <div class="flex flex-col sm:items-end gap-2 mt-3 sm:mt-0 flex-shrink-0 w-full sm:w-auto">
                        {#if proposal.status === 'Pending'}
                            <button 
                                class="btn btn-sm btn-success w-full" 
                                onclick={() => initiateAcceptProposal(proposal)}
                            >
                                Принять предложение
                            </button>
                            <button 
                                class="btn btn-sm btn-outline btn-error w-full" 
                                onclick={() => rejectProposal(proposal)}
                            >
                                Отклонить
                            </button>
                        {/if}
                         <button 
                            class="btn btn-sm btn-outline w-full" 
                            onclick={() => openChat(proposal)}
                        >
                            Начать чат (Интервью)
                        </button>
                        {#if proposal.status === 'Accepted'}
                             <a href={`/contracts/job/${job.id}`} class="btn btn-sm btn-info w-full">
                                Перейти к контракту
                            </a>
                            {/if}
                    </div>
                </div>
            </div>
        {/each}
    {:else}
        <p class="text-base text-gray-500 italic text-center py-4">Нет предложений в этой категории.</p>
    {/if}
</div>

{#if showConfirmModal && selectedProposal}
    <div class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
        <div class="bg-base-100 rounded-xl shadow-2xl p-6 w-[90%] max-w-lg z-50 transform scale-100 transition-transform duration-300 ease-in-out">
            <h2 class="text-xl font-bold mb-4 text-center">Подтверждение выбора исполнителя</h2>
            <div class="text-center mb-2">
                <img src={selectedProposal.freelancer?.avatar?.filePath ?? '/default-avatar.png'} alt="avatar" class="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
                <p class="text-lg">Вы собираетесь принять предложение от</p>
                <p class="font-semibold text-primary text-xl my-1">{selectedProposal.freelancer?.fullname ?? selectedProposal.freelancer?.name}</p>
            </div>
            <p class="text-sm text-center mb-1">На сумму: <span class="font-bold text-lg">{selectedProposal.proposedRate} ₸</span></p>
            
            <div class="bg-base-200 p-3 rounded-md my-4">
                <p class="text-xs text-neutral-content text-center">
                    Это действие приведет к созданию контракта. Средства будут зарезервированы/переведены с вашего счета согласно условиям платформы:
                    {#if job.budgetType === 'Fixed'}
                        полная сумма контракта.
                    {:else if job.budgetType === 'Hourly'}
                        сумма за первые 3 часа работы.
                    {:else}
                        согласно типу оплаты заказа.
                    {/if}
                </p>
            </div>

            <div class="flex justify-center gap-4 mt-6">
                <button class="btn btn-ghost flex-1" onclick={() => { showConfirmModal = false; selectedProposal = null; }}>Отмена</button>
                <button class="btn btn-success flex-1" onclick={confirmAndAcceptProposal}>Подтвердить и создать контракт</button>
            </div>
        </div>
    </div>
{/if}