<script lang="ts">
    import type { PageData } from './$types';
    import {
        GlobalClient
    } from '$lib/shared/api';
    import { showNotification } from '$lib/shared/ui/errors/modal';
    import { onMount, onDestroy } from 'svelte';
    import { page } from '$app/stores'; // To access route params if needed, though data prop is primary
	import CreateWorkSessionModal from '$lib/features/contract/ui/create-work-session-modal.svelte';
	import WorkSessionCard from '$lib/entities/job/ui/work-session-card.svelte';
	import { ApproveWorkSessionCommand, GetWorkSessionListQuery, ReactToWorkSessionCommand, SubmitWorkSessionCommand, WorkSessionEntityStatus, type ContractEntity, type WorkSessionEntity } from 'flsurf-client';

    // For simplicity, WorkSessionCard and Modals will be defined in this file.
    // In a larger app, move them to $lib/components/work-sessions/ or similar.

    export let data: PageData;

    let contract = $state<ContractEntity>(data.contract);
    let workSessionsList = $state<WorkSessionEntity[]>(data.workSessions);
    const { userRole, currentUser } = data;

    // --- Component State ---
    let showCreateWorkSessionModal = $state(false);
    let currentWorkSessionForAction: WorkSessionEntity | null = $state(null);
    let showWorkSessionDetailsModal = $state(false);
    let rejectionReason = $state('');
    let showRejectionModal = $state(false);
    let isLoadingSessions = $state(false); // For manual refresh action

    // --- Utility Functions ---
    function formatDate(dateString: string | Date | undefined, includeTime = true): string {
        if (!dateString) return 'Не указано';
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    }

    async function refreshWorkSessions(showLoader = true) {
        if (showLoader) isLoadingSessions = true;
        try {
            const workSessionQuery = new GetWorkSessionListQuery({ contractId: contract.id });
            const sessions = await GlobalClient.getSessionList(workSessionQuery);
            workSessionsList = sessions.sort((a,b) => new Date(b.startDate!).getTime() - new Date(a.endDate!).getTime());
            showNotification('Список рабочих сессий обновлен.', false);
        } catch (e: any) {
            showNotification(e.message || 'Не удалось обновить список сессий.', true);
        } finally {
            if (showLoader) isLoadingSessions = false;
        }
    }

    // --- Action Handlers ---
    async function handleManualLogWorkSession(sessionData: {
        contractId: string; // Should be current contract.id
        startTime: Date;
        endTime: Date;
        description: string;
        // screenshots?: FileParameter[];
    }) {
        if (userRole !== 'freelancer') return;
        try {
            // Replace with your actual command for logging a completed work session by freelancer
            // const command = new SubmitWorkSessionCommand({
            //     contractId: sessionData.contractId,
            //     startTime: sessionData.startTime,
            //     endTime: sessionData.endTime,
            //     description: sessionData.description,
            //     // screenshots: sessionData.screenshots, // Pass if your command supports it
            // });
            // await GlobalClient.submitSession(command); // Adjust API call if command name is different
            showNotification('Сессия добавлена вручную и отправлена на проверку.', false);
            showCreateWorkSessionModal = false;
            await refreshWorkSessions(false);
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || 'Не удалось добавить сессию.';
            showNotification(errorMsg, true);
        }
    }

    async function handleApproveWorkSession(sessionId: string) {
        if (userRole !== 'client' && userRole !== 'staff') return;
        try {
            const command = new ApproveWorkSessionCommand({ sessionId: sessionId });
            await GlobalClient.approveSession(command);
            showNotification('Сессия одобрена.', false);
            await refreshWorkSessions(false);
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || 'Не удалось одобрить сессию.';
            showNotification(errorMsg, true);
        }
    }

    function promptRejectWorkSession(session: WorkSessionEntity) {
        if (userRole !== 'client' && userRole !== 'staff') return;
        currentWorkSessionForAction = session;
        rejectionReason = '';
        showRejectionModal = true;
    }

    async function handleRejectWorkSession() {
        if ((userRole !== 'client' && userRole !== 'staff') || !currentWorkSessionForAction || !rejectionReason.trim()) {
            if((userRole === 'client' || userRole === 'staff') && !rejectionReason.trim()) showNotification('Причина отклонения обязательна.', true);
            return;
        }
        try {
            const command = new ReactToWorkSessionCommand({
                workSessionId: currentWorkSessionForAction.id,
                isApproved: false,
                clientComment: rejectionReason
            });
            await GlobalClient.reactSession(command);
            showNotification('Сессия отклонена.', false);
            showRejectionModal = false;
            currentWorkSessionForAction = null;
            await refreshWorkSessions(false);
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || 'Не удалось отклонить сессию.';
            showNotification(errorMsg, true);
        }
    }

    function viewWorkSessionDetails(session: WorkSessionEntity) {
        currentWorkSessionForAction = session;
        showWorkSessionDetailsModal = true;
    }

    // Derived lists for UI clarity
    const isClientViewing = $derived(userRole === 'client' || userRole === 'staff'); // Staff can act as client
    const isFreelancerViewing = $derived(userRole === 'freelancer');

    $: clientPendingSessions = workSessionsList.filter(ws => ws.status === WorkSessionEntityStatus.Pending);
    $: freelancerOwnPendingSessions = workSessionsList.filter(ws => ws.freelancerId === currentUser?.id && ws.status === WorkSessionEntityStatus.Pending);
    $: approvedSessions = workSessionsList.filter(ws => ws.status === WorkSessionEntityStatus.Approved);
    $: rejectedSessions = workSessionsList.filter(ws => ws.status === WorkSessionEntityStatus.Rejected);
    $: activeSessionByThisFreelancer = workSessionsList.find(ws => ws.freelancerId === currentUser?.id && (ws.endDate === undefined || ws.endDate === null));


    onMount(() => {
        // Data is already loaded by +page.ts
        // SignalR setup for real-time updates could go here
    });

</script>

<div class="container mx-auto p-4 md:p-6 space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
            <a href={`/contracts/${contract.id}`} class="text-sm link link-hover text-primary">&larr; Назад к контракту</a>
            <h1 class="text-2xl md:text-3xl font-bold">
                Рабочие сессии по контракту
            </h1>
            <p class="text-gray-600">Контракт #{contract.id?.substring(0, 8)} ({contract.job?.title ?? 'Заказ'})</p>
        </div>
        <div class="flex gap-2 items-center">
            {#if isFreelancerViewing}
                <button class="btn btn-primary btn-sm" on:click={() => showCreateWorkSessionModal = true}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M8 1.75a.75.75 0 0 1 .75.75v4.75H13.5a.75.75 0 0 1 0 1.5H8.75v4.75a.75.75 0 0 1-1.5 0V8.75H2.5a.75.75 0 0 1 0-1.5h4.75V2.5A.75.75 0 0 1 8 1.75Z" clip-rule="evenodd" /></svg>
                    Добавить сессию вручную
                </button>
            {/if}
            <button class="btn btn-outline btn-sm" on:click={() => refreshWorkSessions()} disabled={isLoadingSessions}>
                {#if isLoadingSessions} <span class="loading loading-spinner loading-xs"></span> Обновление... {:else} Обновить список {/if}
            </button>
        </div>
    </div>

    {#if isLoadingSessions && workSessionsList.length === 0}
        <div class="text-center py-10"><span class="loading loading-lg"></span> Загрузка сессий...</div>
    {:else}
        {#if isFreelancerViewing && activeSessionByThisFreelancer}
            <div class="alert alert-info shadow-sm mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                    <h3 class="font-bold">Активная сессия (из трекера)</h3>
                    <div class="text-xs">Начата: {formatDate(activeSessionByThisFreelancer.startDate)}. Управляется через десктопное приложение.</div>
                </div>
            </div>
        {/if}

        {#if isClientViewing && clientPendingSessions.length > 0}
            <section class="mb-8">
                <h2 class="text-xl font-semibold text-warning-content mb-4">
                    🔥 Требуют вашей проверки ({clientPendingSessions.length})
                </h2>
                <div class="space-y-4">
                    {#each clientPendingSessions as session (session.id)}
                        <WorkSessionCard bind:session userRole={'client'} {formatDate}
                            on:approve={() => handleApproveWorkSession(session.id!)}
                            on:reject={() => promptRejectWorkSession(session)}
                            on:view_details={() => viewWorkSessionDetails(session)}
                        />
                    {/each}
                </div>
            </section>
        {/if}

        {#if isFreelancerViewing && freelancerOwnPendingSessions.length > 0}
            <section class="mb-8">
                <h2 class="text-xl font-semibold text-info-content mb-4">
                    ⏳ Ожидают проверки заказчиком ({freelancerOwnPendingSessions.length})
                </h2>
                <div class="space-y-4">
                    {#each freelancerOwnPendingSessions as session (session.id)}
                        <WorkSessionCard bind:session userRole={'freelancer'} {formatDate}
                            on:view_details={() => viewWorkSessionDetails(session)}
                        />
                    {/each}
                </div>
            </section>
        {/if}

        {#if approvedSessions.length > 0}
            <section class="mb-8">
                <h2 class="text-xl font-semibold text-success-content mb-4">Одобренные сессии ({approvedSessions.length})</h2>
                <div class="space-y-4">
                    {#each approvedSessions as session (session.id)}
                        <WorkSessionCard bind:session {userRole} {formatDate}
                            on:view_details={() => viewWorkSessionDetails(session)}
                        />
                    {/each}
                </div>
            </section>
        {/if}

        {#if rejectedSessions.length > 0}
            <section class="mb-8">
                <h2 class="text-xl font-semibold text-error-content mb-4">Отклоненные сессии ({rejectedSessions.length})</h2>
                <div class="space-y-4">
                    {#each rejectedSessions as session (session.id)}
                        <WorkSessionCard bind:session {userRole} {formatDate}
                            on:view_details={() => viewWorkSessionDetails(session)}
                        />
                    {/each}
                </div>
            </section>
        {/if}

        {#if workSessionsList.length === 0 && !isLoadingSessions}
            <div class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Нет рабочих сессий</h3>
                <p class="mt-1 text-sm text-gray-500">
                    {#if isFreelancerViewing}Вы еще не добавили сессий по этому контракту.{:else}Исполнитель еще не добавил сессий.{/if}
                </p>
            </div>
        {/if}
    {/if}
</div>

{#if showCreateWorkSessionModal}
    <CreateWorkSessionModal
        contractId={contract.id!}
        on:close={() => showCreateWorkSessionModal = false}
        on:submit={async (event) => {
            await handleManualLogWorkSession(event.detail);
        }}
    />
{/if}

{#if showRejectionModal && currentWorkSessionForAction}
    <div class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg text-error">Отклонить рабочую сессию</h3>
             <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={() => {showRejectionModal = false; currentWorkSessionForAction=null;}}>✕</button>
            <p class="py-2 text-sm">Сессия от {formatDate(currentWorkSessionForAction.startDate)} ({currentWorkSessionForAction.durationInMinutes ?? 'N/A'} мин)</p>
            <textarea class="textarea textarea-bordered w-full mt-2" bind:value={rejectionReason} placeholder="Укажите причину отклонения..."></textarea>
            <div class="modal-action mt-4">
                <button class="btn btn-error" on:click={handleRejectWorkSession} disabled={!rejectionReason.trim()}>Отклонить</button>
                <button class="btn btn-ghost" on:click={() => {showRejectionModal = false; currentWorkSessionForAction=null;}}>Отмена</button>
            </div>
        </div>
    </div>
{/if}

{#if showWorkSessionDetailsModal && currentWorkSessionForAction}
    <div class="modal modal-open modal-bottom sm:modal-middle">
        <div class="modal-box w-full sm:w-11/12 sm:max-w-3xl max-h-[90vh]">
            <h3 class="font-bold text-lg">Детали рабочей сессии</h3>
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={() => {showWorkSessionDetailsModal = false; currentWorkSessionForAction=null;}}>✕</button>
            <div class="py-4 space-y-2 text-sm max-h-[calc(80vh-100px)] overflow-y-auto pr-2">
                <p><strong>Контракт:</strong> <a href={`/contracts/${currentWorkSessionForAction.contractId}`} class="link link-hover">{currentWorkSessionForAction.contractId?.substring(0,8)}...</a></p>
                <p><strong>Исполнитель:</strong> {currentWorkSessionForAction.freelancer?.fullname ?? currentWorkSessionForAction.freelancerId ?? 'N/A'}</p>
                <p><strong>Период:</strong> {formatDate(currentWorkSessionForAction.startDate)} - {currentWorkSessionForAction.endDate ? formatDate(currentWorkSessionForAction.endDate) : "Активна"}</p>
                <p class="mt-2"><strong>Описание от исполнителя:</strong></p>
                <div class="p-3 bg-base-200 rounded-md whitespace-pre-wrap min-h-20 text-xs">{currentWorkSessionForAction.comment || 'Нет описания'}</div>
                <p><strong>Статус:</strong> <span class="badge badge-outline badge-sm">{currentWorkSessionForAction.status}</span></p>
                {#if currentWorkSessionForAction.status === 'Rejected' && currentWorkSessionForAction.clientComment}
                    <p class="text-error mt-1"><strong>Причина отклонения:</strong> {currentWorkSessionForAction.clientComment}</p>
                {/if}

                <h4 class="font-semibold mt-6 mb-2">Скриншоты ({currentWorkSessionForAction.screenshots?.length ?? 0}):</h4>
                {#if currentWorkSessionForAction.screenshots && currentWorkSessionForAction.screenshots.length > 0}
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-base-200 rounded-md">
                        {#each currentWorkSessionForAction.screenshots as screenshot (screenshot.url ?? screenshot.id)}
                            <a href={screenshot.url} target="_blank" rel="noopener noreferrer" class="block border rounded-md hover:shadow-lg transition-shadow overflow-hidden group aspect-video">
                                <img src={screenshot.url} alt="Screenshot {screenshot.timestamp ? ` at ${formatDate(screenshot.timestamp, false)}` : ''}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                                {#if screenshot.timestamp}
                                    <div class="absolute bottom-0 left-0 right-0 p-1 bg-black/30 text-white text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {formatDate(screenshot.timestamp)}
                                    </div>
                                {/if}
                            </a>
                        {/each}
                    </div>
                {:else}
                    <p class="text-sm text-gray-500 italic">Скриншоты отсутствуют.</p>
                {/if}
            </div>
             <div class="modal-action mt-1">
                <button class="btn btn-ghost" on:click={() => {showWorkSessionDetailsModal = false; currentWorkSessionForAction=null;}}>Закрыть</button>
            </div>
        </div>
    </div>
{/if}
