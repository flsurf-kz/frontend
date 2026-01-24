<script lang="ts">
    import { goto } from '$app/navigation';
    import { GlobalClient } from '$lib/shared/api';
    import { showNotification } from '$lib/shared/ui/errors/modal';
    import {
        DeleteJobCommand,
        HideJobCommand,
        JobEntityStatus,
        ProposalEntity,
        ProposalEntityStatus,
        ReactToProposalCommand,
        ReactToProposalCommandReaction,
        SendDraftJobToModerationCommand,
        StartChatWithFreelancerCommand,
        CreateContractCommand,
        type JobEntity,
        type CommandResult,

		CreateContractCommandPaymentSchedule

    } from 'flsurf-client';
    import { CurrentUser } from '$lib/entities/user/model/modal';
    import ModalBase from '$lib/shared/ui/modal/modal-base.svelte';
    import { UserAvatar } from '$lib/shared/ui/icons';

    let { job }: { job: JobEntity } = $props();

    let selectedProposalForContract: ProposalEntity | null = $state(null); // For the contract creation modal
    let showConfirmContractModal = $state(false); // Modal for contract creation
    let currentGroup: 'Pending' | 'Accepted' | 'Hidden' | 'Rejected' = $state('Pending');

    // --- Chat Function (remains the same) ---
    async function openChat(proposal: ProposalEntity) {
        if (!job.id || !proposal.id) {
            showNotification("Ошибка: ID заказа или предложения отсутствуют для создания чата.", true);
            return;
        }
        try {
            const command = new StartChatWithFreelancerCommand({ jobId: job.id, proposalId: proposal.id });
            const result: CommandResult & { id?: string } = await GlobalClient.startChatWithFreelancer(command);
            if (result?.isSuccess && result.id) {
                goto(`/messaging?chatId=${result.id}`);
            } else if (result?.isSuccess) {
                showNotification("Чат создан/открыт. Вы можете найти его в списке ваших чатов.", false);
            } else {
                showNotification(result?.message || "Не удалось создать или открыть чат.", true);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Ошибка при создании чата.";
            showNotification(errorMessage, true);
        }
    }

    // --- Accept Proposal (Pending -> Accepted, NO SVELTE MODAL) ---
    async function acceptProposal(proposal: ProposalEntity) {
        if (!proposal || !proposal.id || !job.id) {
            showNotification("Ошибка: Некорректные данные для принятия предложения.", true);
            return;
        }
        // Optional: simple browser confirmation
        if (!confirm(`Вы уверены, что хотите принять предложение от "${proposal.freelancer?.fullname ?? 'исполнителя'}"? Это изменит статус предложения на "Принято".`)) {
            return;
        }

        try {
            const command = new ReactToProposalCommand({
                proposalId: proposal.id,
                reaction: ReactToProposalCommandReaction.Accepted
            });
            const result = await GlobalClient.reactToProposal(command);
            
            if (result.isSuccess) {
                showNotification("Предложение принято! Теперь вы можете оформить контракт.", false);
                job.proposals = (job.proposals ?? []).map(p =>
                    p.id === proposal.id ? new ProposalEntity({ ...p, status: ProposalEntityStatus.Accepted }) : p
                );
                job.proposals = [...job.proposals]; // Trigger reactivity
                currentGroup = 'Accepted'; // Switch view to see the accepted proposal
            } else {
                showNotification(result.message || "Не удалось принять предложение.", true);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Ошибка при принятии предложения.";
            showNotification(errorMessage, true);
        }
    }
    
    // --- Reject Proposal (remains largely the same) ---
    async function rejectProposal(proposal: ProposalEntity) {
        if (!proposal.id || !job.id) return;
        // Optional: Add a confirm() dialog here too if desired
        if (!confirm(`Вы уверены, что хотите отклонить предложение от "${proposal.freelancer?.fullname ?? 'исполнителя'}"?`)) {
            return;
        }
        try {
            const command = new ReactToProposalCommand({
                proposalId: proposal.id,
                reaction: ReactToProposalCommandReaction.Rejected
            });
            const result = await GlobalClient.reactToProposal(command);
            if (result.isSuccess) {
                showNotification('Предложение отклонено.', false);
                proposal.status = ProposalEntityStatus.Rejected; // Update status locally
                job.proposals = [...(job.proposals ?? [])]; // Trigger reactivity
                // No need to switch currentGroup, it should filter out or move to Rejected tab if user clicks it
            } else {
                showNotification(result.message || 'Не удалось отклонить предложение.', true);
            }
        } catch (e: any) {
            const errorMessage = e.response?.data?.message || e.message || 'Ошибка при отклонении предложения.';
            showNotification(errorMessage, true);
        }
    }

    // --- Contract Creation Flow (for 'Accepted' proposals) ---
    function initiateContractCreation(proposal: ProposalEntity) {
        if (proposal.status !== ProposalEntityStatus.Accepted) {
            showNotification("Можно оформить контракт только для уже принятого предложения.", true);
            return;
        }
        selectedProposalForContract = proposal;
        showConfirmContractModal = true;
    }

    async function executeContractCreation() {
        if (!selectedProposalForContract || !job.id || !selectedProposalForContract.id) {
            showNotification("Ошибка: Отсутствуют данные для создания контракта.", true);
            showConfirmContractModal = false;
            return;
        }
        try {
            const command = new CreateContractCommand({
                proposalId: selectedProposalForContract.id,
                contractTerms: "Да", 
                paymentSchedule: CreateContractCommandPaymentSchedule.OnCompletion, 
                // Include other necessary fields for CreateContractCommand if any
                // amount: selectedProposalForContract.proposedRate?.amount,
                // currency: selectedProposalForContract.proposedRate?.currency,
            });
            try {
                const result: CommandResult & { id?: string } = await GlobalClient.createContract(command);

                if (result.isSuccess) {
                    showNotification("Контракт успешно создан! Ожидаем принятия контракта от фрилансера", false);
                    if (result.id) { // Assuming the contract ID is returned in 'id'
                        // Optionally update the proposal to link it to the contractId if your model supports it
                        // selectedProposalForContract.contractId = result.id; 
                        goto(`/jobs/${result.id}`);
                    } else {
                        // Consider fetching updated job details or navigating to a contracts list
                        // invalidateAll(); or specific key
                    }
                } else {
                    showNotification(result.message || "Не удалось создать контракт.", true);
                }
            } catch (exc: any) { 
                if (exc?.status !== 409) { 
                    throw exc; 
                } 
                showNotification("Не хватает баланса для создания контракта.");
                return; 
            } 
            
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Ошибка при создании контракта.";
            showNotification(errorMessage, true);
        } finally {
            showConfirmContractModal = false; // This will trigger the $effect to nullify selectedProposalForContract
        }
    }

    // --- Job Management Functions (Delete, Hide, Send to Mod - remain the same) ---
    async function handleDeleteJob() { /* ... */ }
    async function handleHideJob() { /* ... */ }
    async function sendToModeration() { /* ... */ }

    // --- Filtered Proposals (remains the same) ---
    let filteredProposals: ProposalEntity[] = $state([]);
    $effect(() => {
        filteredProposals = (job.proposals ?? []).filter((p: ProposalEntity) => {
            if (currentGroup === 'Hidden') return p.status === ProposalEntityStatus.Hidden;
            if (currentGroup === 'Rejected') return p.status === ProposalEntityStatus.Rejected;
            if (currentGroup === 'Accepted') return p.status === ProposalEntityStatus.Accepted;
            if (currentGroup === 'Pending') return p.status === ProposalEntityStatus.Pending;
            return false;
        });
    });

    // Reset selectedProposalForContract when contract modal closes
    $effect(() => {
        if (!showConfirmContractModal) {
            selectedProposalForContract = null;
        }
    });

</script>

<div class="flex flex-wrap gap-4 mt-6 mb-2 items-center">
    {#if job.status === JobEntityStatus.Draft}
        <button class="btn btn-primary" onclick={sendToModeration}>Отправить на модерацию</button>
    {/if}
    <a href={`/jobs/${job.id}/edit`} class="btn btn-outline">Редактировать</a>
    <button class="btn btn-outline" onclick={handleHideJob}>
        {job.isHidden ? 'Сделать видимым' : 'Скрыть заказ'}
    </button>
    <button class="btn btn-outline btn-error" onclick={handleDeleteJob}>Удалить заказ</button>
</div>

<h2 class="text-lg font-semibold mt-8">Предложения исполнителей ({job.proposals?.length ?? 0})</h2>

<div role="tablist" class="tabs tabs-bordered mt-2 mb-6">
    <button role="tab" class="tab" class:tab-active={currentGroup === 'Pending'} onclick={() => currentGroup = 'Pending'}>
        Ожидают ({job.proposals?.filter(p => p.status === ProposalEntityStatus.Pending).length ?? 0})
    </button>
    <button role="tab" class="tab" class:tab-active={currentGroup === 'Accepted'} onclick={() => currentGroup = 'Accepted'}>
        Принятые ({job.proposals?.filter(p => p.status === ProposalEntityStatus.Accepted).length ?? 0})
    </button>
    <button role="tab" class="tab" class:tab-active={currentGroup === 'Rejected'} onclick={() => currentGroup = 'Rejected'}>
        Отклоненные ({job.proposals?.filter(p => p.status === ProposalEntityStatus.Rejected).length ?? 0})
    </button>
    <button role="tab" class="tab" class:tab-active={currentGroup === 'Hidden'} onclick={() => currentGroup = 'Hidden'}>
        Скрытые ({job.proposals?.filter(p => p.status === ProposalEntityStatus.Hidden).length ?? 0})
    </button>
</div>

<div class="space-y-6">
    {#if filteredProposals.length > 0}
        {#each filteredProposals as proposal (proposal.id)}
            <div class="p-4 border rounded-lg bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                <div class="flex flex-col sm:flex-row items-start gap-4">
                    <div class="flex-grow">
                        <div class="flex items-center gap-3 mb-2">
                            <UserAvatar 
                                avatarFile={proposal.freelancer?.avatar}
                                altText={`Аватар ${proposal.freelancer?.fullname ?? 'исполнителя'}`} 
                                className="w-12 h-12 rounded-full object-cover shadow-sm" 
                            />
                            <div>
                                <p class="font-bold text-lg">{proposal.freelancer?.fullname ?? proposal.freelancer?.name ?? 'Исполнитель не указан'}</p>
                                <a href={`/freelancer/${proposal.freelancerId}`} target="_blank" rel="noopener noreferrer" class="text-sm text-blue-600 hover:underline">
                                    Просмотреть профиль
                                </a>
                            </div>
                        </div>
                        <p class="text-gray-700 text-sm whitespace-pre-wrap mt-2 leading-relaxed">{proposal.coverLetter}</p>
                        <p class="text-sm mt-3 font-medium">Предложенная ставка: <span class="text-primary">{proposal.proposedRate?.amount?.toLocaleString()} {proposal.proposedRate?.currency}</span></p>
                        <p class="text-xs text-gray-500 mt-1">Отправлено: {new Date(proposal.createdAt ?? Date.now()).toLocaleDateString('ru-RU')}</p>
                    </div>
                    <div class="flex flex-col sm:items-end gap-2 mt-3 sm:mt-0 flex-shrink-0 w-full sm:w-auto">
                        {#if proposal.status === ProposalEntityStatus.Pending}
                            <button 
                                class="btn btn-sm btn-success w-full" 
                                onclick={() => acceptProposal(proposal)} >Отправить в принятые</button>
                            <button 
                                class="btn btn-sm btn-outline btn-error w-full" 
                                onclick={() => rejectProposal(proposal)}
                            >Отклонить</button>
                        {/if}
                        {#if proposal.status === ProposalEntityStatus.Accepted}
                             <button 
                                class="btn btn-sm btn-primary w-full" 
                                onclick={() => initiateContractCreation(proposal)} >Оформить контракт</button>
                        {/if}
                        <button 
                            class="btn btn-sm btn-outline w-full" 
                            onclick={() => openChat(proposal)}
                        >Начать чат (Интервью)</button>
                        
                        {#if job.contractId && proposal.status === ProposalEntityStatus.Accepted}
                            <a href={`/contracts/${job.contractId}`} class="btn btn-sm btn-info w-full">
                                Перейти к контракту заказа
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

{#if showConfirmContractModal && selectedProposalForContract}
    <ModalBase
        bind:open={showConfirmContractModal}
        title="Подтверждение создания контракта" 
    >
        <div class="text-center">
            <UserAvatar 
                avatarFile={selectedProposalForContract.freelancer?.avatar}
                altText={`Аватар ${selectedProposalForContract.freelancer?.fullname ?? 'исполнителя'}`} 
                className="w-16 h-16 rounded-full object-cover mx-auto mb-3 shadow-md" 
            />
            <p class="text-base-content/80 text-md">Вы собираетесь <strong class="text-primary">создать контракт</strong> с исполнителем:</p>
            <p class="font-semibold text-primary text-xl my-1.5">
                {selectedProposalForContract.freelancer?.fullname ?? selectedProposalForContract.freelancer?.name ?? 'Неизвестный исполнитель'}
            </p>
        </div>

        <p class="text-md text-center mb-3">
            На сумму: <span class="font-bold text-lg text-success">{selectedProposalForContract.proposedRate?.amount?.toLocaleString() ?? 'N/A'} { selectedProposalForContract.proposedRate?.currency }</span>
        </p>
        
        <div class="bg-base-200 p-3.5 rounded-lg my-5 border border-base-300">
            <p class="text-xs text-base-content/70 text-center leading-relaxed">
                Это действие приведет к созданию юридически обязывающего контракта. Средства будут зарезервированы или переведены с вашего счета согласно условиям платформы FLSURF.KZ:
                {#if job?.budgetType === 'Fixed'} полная сумма контракта.
                {:else if job?.budgetType === 'Hourly'}
                    сумма за первые несколько часов работы (например, за депозит на 3 часа).
                {:else}
                    согласно типу оплаты заказа.
                {/if}
                <br/>Убедитесь, что все условия согласованы с исполнителем.
            </p>
        </div>

        <div class="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <button 
                class="btn btn-ghost flex-1 order-2 sm:order-1" 
                onclick={() => showConfirmContractModal = false }
            >Отмена</button>
            <button 
                class="btn btn-primary flex-1 order-1 sm:order-2" onclick={executeContractCreation} 
            >Подтвердить и Создать Контракт</button> 
        </div>
    </ModalBase>
{/if}