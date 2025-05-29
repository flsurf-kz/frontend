<script lang="ts">
    import { goto } from '$app/navigation';
    import { GlobalClient } from '$lib/shared/api';
    import {
	ContractEntity // For the contract to accept
,
        type ProposalEntity,
        type UserEntity,
        type FileEntity,
        type JobEntity,
        JobEntityBudgetType,
        ProposalEntityStatus,
        ContractEntityStatus, // For checking contract status
        FreelancerAcceptContractCommand,
        StartChatWithFreelancerCommand    } from 'flsurf-client';
    import { CurrentUser } from '$lib/entities/user/model/modal';
    import UserAvatar from '$lib/shared/ui/icons/UserAvatar.svelte';
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
    import ModalBase from '$lib/shared/ui/modal/modal-base.svelte'; // Assuming path
    import { formatDistanceToNowStrict } from 'date-fns';
    import { ru } from 'date-fns/locale';
    import { onMount } from 'svelte';
    import { showNotification } from '$lib/shared/ui/errors/modal';

    export let proposal: ProposalEntity;
    export let job: JobEntity | undefined = undefined; // Passed from parent ("Мои ставки")

    // --- Local State ---
    let showFullCoverLetter = false;
    const coverLetterSnippetLength = 180;

    let showAcceptContractModal = false;
    let contractToAcceptDetails: ContractEntity | null = null;
    let isLoadingContractDetails = false; // To show loading state for contract check
    let associatedContractId: string | undefined = undefined;

    // --- Computed Values ---
    $: freelancer = proposal.freelancer; // This is ME, the current user, in "Мои ставки" context
    $: client = job?.employer; // The client/employer for this job

    $: proposalStatusValue = proposal.status ?? ProposalEntityStatus.Pending;

    $: coverLetterDisplay = proposal.coverLetter
        ? (showFullCoverLetter || (proposal.coverLetter.length) <= coverLetterSnippetLength
            ? proposal.coverLetter
            : proposal.coverLetter.substring(0, coverLetterSnippetLength) + '...')
        : 'Сопроводительное письмо не предоставлено.';

    function formatDate(dateInput?: Date | string): string {
        if (!dateInput) return 'неизвестно';
        try {
            const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
            if (isNaN(date.getTime())) return String(dateInput);
            return formatDistanceToNowStrict(date, { addSuffix: true, locale: ru });
        } catch (e) {
            return String(dateInput); 
        }
    }

    function getStatusDisplayAndClass(status?: ProposalEntityStatus): { text: string, className: string } {
        const s = status || ProposalEntityStatus.Pending;
        // (Keep your existing getStatusDisplayAndClass function here)
        switch (s) {
            case ProposalEntityStatus.Accepted:
                return { text: 'Принято клиентом', className: 'badge-success text-success-content' };
            case ProposalEntityStatus.Rejected:
                return { text: 'Отклонено клиентом', className: 'badge-error text-error-content' };
            case ProposalEntityStatus.Hidden:
                return { text: 'Скрыто (вами или клиентом)', className: 'badge-neutral text-neutral-content opacity-70' };
            case ProposalEntityStatus.Pending:
            default:
                return { text: 'На рассмотрении', className: 'badge-ghost border-base-300 text-base-content' };
        }
    }
    $: statusInfo = getStatusDisplayAndClass(proposalStatusValue);

    // --- API Calls & Actions ---
    async function messageClient() {
        if (!job?.id || !proposal.id || !job.employerId) {
            showNotification("Ошибка: Необходимые данные для создания чата с заказчиком отсутствуют.", true);
            return;
        }
        try {
            // This command identifies the job and proposal.
            // Backend should infer current user is freelancer and facilitate chat with employer.
            const command = new StartChatWithFreelancerCommand({ 
                jobId: job.id, 
                proposalId: proposal.id 
            });
            const result = await GlobalClient.startChatWithFreelancer(command);
            if (result.isSuccess && result.id) {
                goto(`/messaging/${result.id}`);
            } else if (result.isSuccess) {
                showNotification("Чат с заказчиком начат/открыт. Проверьте ваши сообщения.", false);
            } else {
                showNotification(result.message || "Не удалось начать чат с заказчиком.", true);
            }
        } catch (error: any) {
            showNotification(error.message || "Ошибка при попытке начать чат.", true);
        }
    }

    async function checkAndLoadContractForAcceptedProposal() {
        if (proposal.status !== ProposalEntityStatus.Accepted || !$CurrentUser?.id) return;

        // How to find the contractId?
        // 1. Check if proposal object was updated with contractId by backend
        // 2. Check if job object was updated with contractId
        // 3. Fallback: Try to list contracts for this job/proposal filtered by me as freelancer
        //    (This is complex if getContractsList doesn't support fine-grained proposalId filter)

        // Assumption: `proposal.contractId` or `job.contractId` gets populated.
        // Or, a contract is created with `PendingApproval` status for the freelancer.
        let contractIdToFetch: string | undefined = (proposal as any).contractId || job?.contractId;

        // If no direct contractId, and IF your API had a way to get contract by proposal:
        // if (!contractIdToFetch && GlobalClient.getContractByProposalId) { // Hypothetical method
        // try {
        // isLoadingContractDetails = true;
        // const contract = await GlobalClient.getContractByProposalId(proposal.id);
        // if (contract) contractIdToFetch = contract.id;
        // } catch (e) { console.error("No contract found by proposalId", e); }
        // finally { isLoadingContractDetails = false; }
        // }

        // For now, let's assume if client accepts, a contract is created and its ID might be on job.contractId
        // or proposal.contractId (if backend updates it).
        // And that contract would be in PendingApproval for the freelancer.

        if (contractIdToFetch) {
            associatedContractId = contractIdToFetch; // Store it for the "Принять контракт" button
            isLoadingContractDetails = true;
            try {
                const fetchedContract = await GlobalClient.getContract(contractIdToFetch);
                if (fetchedContract && fetchedContract.status === ContractEntityStatus.PendingApproval && fetchedContract.freelancerId === $CurrentUser.id) {
                    contractToAcceptDetails = new ContractEntity(fetchedContract); // Store full details for modal
                } else {
                    contractToAcceptDetails = null; // Contract exists but not in the state we expect for acceptance
                }
            } catch (error) {
                console.error("Error fetching contract details for accepted proposal:", error);
                contractToAcceptDetails = null;
            } finally {
                isLoadingContractDetails = false;
            }
        } else {
            // No direct contract ID found on proposal or job for this accepted proposal.
            // This state means the client accepted the proposal, but a formal contract object
            // is not yet in a state for the freelancer to "accept" via this card.
            // The freelancer might need to wait for client to initiate contract or check notifications.
            console.log("Proposal accepted, but no specific contract found pending freelancer acceptance via proposal/job object.");
        }
    }

    function initiateFreelancerContractAcceptance() {
        if (contractToAcceptDetails) {
            showAcceptContractModal = true;
        } else {
            showNotification("Детали контракта для принятия не найдены.", true);
        }
    }

    async function executeFreelancerAcceptContract() {
        if (!contractToAcceptDetails?.id) {
            showNotification("Ошибка: ID контракта отсутствует.", true);
            return;
        }
        try {
            const command = new FreelancerAcceptContractCommand({ contractId: contractToAcceptDetails.id });
            const result = await GlobalClient.freelancerAcceptContract(command);
            if (result.isSuccess) {
                showNotification('Контракт успешно принят! Теперь он активен.', false);
                showAcceptContractModal = false;
                // Refresh proposal list or navigate, or update local proposal/contract status
                if (proposal.status === ProposalEntityStatus.Accepted) {
                    // Optionally, signify this proposal led to an active contract.
                    // This might involve refetching the parent list or this card's data.
                    // For now, just close modal. Parent page might need invalidation.
                    // Or update a local state for this card if useful.
                    // We might want to hide "Принять контракт" button now.
                    contractToAcceptDetails = null; // Clear it as it's accepted.
                    // Re-check could be triggered to update UI if status changed on backend.
                    checkAndLoadContractForAcceptedProposal(); 
                }
            } else {
                showNotification(result.message || 'Не удалось принять контракт.', true);
            }
        } catch (error: any) {
            showNotification(error.message || 'Ошибка при принятии контракта.', true);
        } finally {
            if (!showAcceptContractModal) contractToAcceptDetails = null; // Ensure reset if modal didn't close itself
        }
    }
    
    // Check for contract to accept when proposal is accepted
    $: if (proposal.status === ProposalEntityStatus.Accepted && $CurrentUser?.id) {
        if(!contractToAcceptDetails && !isLoadingContractDetails && !associatedContractId){ // check only once or if relevant things change
             checkAndLoadContractForAcceptedProposal();
        }
    }

    // Cleanup on modal close
    $: if (!showAcceptContractModal && contractToAcceptDetails) {
        contractToAcceptDetails = null;
    }

    const IconStar = `<svg class="w-4 h-4 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
    const IconPaperClip = `<svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>`;
    const IconMessageDots = `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>`;
    const IconBriefcase = `<svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>`;
    const IconCheckCircle = `<svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

</script>

<div class="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg p-5 md:p-6 mb-4 transition-shadow duration-300">
    <div class="flex flex-col md:flex-row items-start gap-x-6 gap-y-4">
        <div class="flex-shrink-0 w-full md:w-48 flex flex-col items-center md:items-start text-center md:text-left 
                    border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-6">
            {#if job?.employer} <a href={`/client/${job.employer.id}`} target="_blank" rel="noopener noreferrer" class="block mb-2 group">
                    <UserAvatar 
                        avatarFile={job.employer.avatar} 
                        altText={`Аватар ${job.employer.fullname ?? 'Заказчика'}`}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-md ring-2 ring-transparent group-hover:ring-primary transition-all" 
                    />
                </a>
                <a href={`/client/${job.employer.id}`} target="_blank" rel="noopener noreferrer" class="text-lg font-semibold text-primary hover:underline leading-tight break-words w-full">
                    {job.employer.fullname || job.employer.name || 'Заказчик'}
                </a>
                {#if job.employer.location}
                    <p class="text-xs text-gray-500 mt-1 truncate max-w-full" title={job.employer.location.toString()}>{job.employer.location.toString()}</p>
                {/if}
                <BaseButton 
                    type="button" 
                    className="ghost btn-sm mt-3 w-full p-2" 
                    onclick={messageClient}
                >
                    <span class="mr-1">{@html IconMessageDots}</span>
                    Написать заказчику
                </BaseButton>
            {:else}
                 <div class="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                    <span class="text-2xl text-gray-400">?</span>
                 </div>
                 <p class="text-lg font-semibold text-gray-700">Информация о заказчике недоступна</p>
            {/if}
        </div>

        <div class="flex-1 min-w-0">
            <div class="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                <div>
                    {#if proposal.proposedRate?.amount !== undefined && proposal.proposedRate.amount >= 0}
                        <p class="text-2xl font-bold text-gray-800">
                            {proposal.proposedRate.amount.toLocaleString()} {proposal.proposedRate.currency}
                            {#if job?.budgetType === JobEntityBudgetType.Hourly}
                                <span class="text-lg text-gray-600">/час</span>
                            {:else}
                                <span class="text-lg text-gray-600">за проект</span>
                            {/if}
                        </p>
                    {:else}
                        <p class="text-gray-600 italic text-sm">Ставка по договоренности</p>
                    {/if}
                </div>
                <div class="text-xs text-gray-500 mt-1 sm:mt-0 whitespace-nowrap pt-1 self-start sm:self-center">
                    Отправлено: {formatDate(proposal.createdAt)}
                </div>
            </div>

            {#if proposal.coverLetter}
                <div class="mb-4 prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    <h4 class="text-sm font-semibold text-gray-600 mb-1">Сопроводительное письмо:</h4>
                    <p class:line-clamp-4={!showFullCoverLetter && (proposal.coverLetter.length) > coverLetterSnippetLength}
                       class:line-clamp-none={showFullCoverLetter}
                       class="whitespace-pre-wrap break-words">
                        {proposal.coverLetter}
                    </p>
                    {#if proposal.coverLetter.length > coverLetterSnippetLength}
                        <button on:click={() => showFullCoverLetter = !showFullCoverLetter} class="text-primary hover:underline text-xs mt-1 font-medium">
                            {showFullCoverLetter ? 'Свернуть' : 'Читать полностью...'}
                        </button>
                    {/if}
                </div>
            {:else}
                <p class="text-sm text-gray-500 italic mb-4">Сопроводительное письмо не предоставлено.</p>
            {/if}

            {#if proposal.files && proposal.files.length > 0} d
                {/if}
            
            <div class="flex flex-col sm:flex-row justify-between items-center mt-5 pt-4 border-t border-gray-200">
                <div class="text-sm mb-3 sm:mb-0">
                    <span class="text-gray-600">Статус вашей ставки:</span>
                    <span class="badge {statusInfo.className} badge-md font-semibold ml-1.5">
                        {statusInfo.text}
                    </span>
                </div>
                
                <div class="flex items-center gap-2 w-full sm:w-auto">
                    {#if proposalStatusValue === ProposalEntityStatus.Accepted}
                        <a href={`/jobs/${job?.id}`} class="btn btn-sm btn-info flex-grow sm:flex-grow-0">
                            {@html IconBriefcase} Посмотреть заказ
                        </a>
                        {#if isLoadingContractDetails}
                            <BaseButton onclick={(e) => {}} className="primary btn-sm flex-grow sm:flex-grow-0" disabled={true}>
                                <span class="loading loading-spinner loading-xs mr-2"></span> Проверка контракта...
                            </BaseButton>
                        {:else if contractToAcceptDetails && contractToAcceptDetails.status === ContractEntityStatus.PendingApproval}
                            <BaseButton className="success btn-sm flex-grow sm:flex-grow-0" onclick={initiateFreelancerContractAcceptance}>
                                {@html IconCheckCircle} Принять контракт
                            </BaseButton>
                        {:else if associatedContractId}
                             <a href={`/contracts/${associatedContractId}`} class="btn btn-sm btn-outline btn-accent flex-grow sm:flex-grow-0">
                                Детали контракта
                            </a>
                        {/if}
                    {/if}
                     </div>
            </div>
        </div>
    </div>
</div>

{#if showAcceptContractModal && contractToAcceptDetails}
    <ModalBase
        bind:open={showAcceptContractModal}
        title="Подтверждение принятия контракта"
    >
        <div class="text-center">
             <p class="text-base-content/80 text-md">Вы собираетесь <strong class="text-success">принять условия контракта</strong> для заказа:</p>
             <p class="font-semibold text-accent text-lg my-1">{job?.title ?? 'Проект не указан'}</p>
             <p class="text-sm text-base-content/70">ID Контракта: {contractToAcceptDetails.id?.substring(0,8)}...</p>
        </div>

        <div class="my-4 text-sm">
            <p><strong>Основные условия (из контракта):</strong></p>
            <ul class="list-disc pl-5 mt-1 text-xs text-base-content/80 space-y-1">
                <li>Статус контракта для принятия: {contractToAcceptDetails.status}</li>
                <li>Бюджет: {contractToAcceptDetails.budget?.amount?.toLocaleString()} {contractToAcceptDetails.budget?.currency} ({contractToAcceptDetails.budgetType})</li>
                {#if contractToAcceptDetails.budgetType === 'Hourly' && contractToAcceptDetails.costPerHour}
                    <li>Ставка: {contractToAcceptDetails.costPerHour.amount?.toLocaleString()} {contractToAcceptDetails.costPerHour.currency}/час</li>
                {/if}
                <li>Условия: <span class="italic whitespace-pre-line max-h-20 overflow-y-auto block bg-base-200 p-1 rounded">{contractToAcceptDetails.contractTerms || "Не указаны"}</span></li>
            </ul>
        </div>
        
        <div class="bg-warning/10 p-3.5 rounded-lg my-5 border border-warning text-warning-content">
            <p class="text-xs text-center leading-relaxed">
                Принимая этот контракт, вы подтверждаете свое согласие со всеми его условиями и обязуетесь выполнить работу качественно и в срок. Это создаст юридически обязывающее соглашение между вами и заказчиком.
            </p>
        </div>

        <div class="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <BaseButton 
                className="ghost flex-1 order-2 sm:order-1" 
                onclick={() => showAcceptContractModal = false }
            >Отмена</BaseButton>
            <BaseButton 
                className="success flex-1 order-1 sm:order-2" 
                onclick={executeFreelancerAcceptContract}
            >Принять Контракт</BaseButton>
        </div>
    </ModalBase>
{/if}

<style>
    /* (keep existing styles) */
</style>