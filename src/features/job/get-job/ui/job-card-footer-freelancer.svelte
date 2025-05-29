<script lang="ts">
    import { goto } from "$app/navigation";
    import { CurrentUser } from "$lib/entities/user/model/modal"; // Your Svelte store for the current user
    import { BaseButton } from "$lib/shared/ui/buttons";
    import { UserAvatar } from "$lib/shared/ui/icons";
    import { formatDistanceToNowStrict, parseISO } from "date-fns";
    import { ru } from "date-fns/locale";
    import { JobEntityBudgetType, type JobEntity, type ProposalEntity, type UserEntity, type FileEntity, ProposalEntityStatus } from "flsurf-client";
    import { Award, Edit3, Trash2, MessageSquare, ThumbsUp, ThumbsDown, Star } from 'lucide-svelte';
    import { page } from '$app/stores'; // For $page.url.pathname

    export let job: JobEntity;

    // Helper for formatting date
    function formatDate(dateInput?: Date | string): string {
        if (!dateInput) return 'недавно';
        try {
            const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
            if (isNaN(date.getTime())) return String(dateInput);
            return formatDistanceToNowStrict(date, { addSuffix: true, locale: ru });
        } catch (e) {
            console.warn("Ошибка форматирования даты:", dateInput, e);
            return String(dateInput);
        }
    }

    // Check if the current freelancer has already proposed for this job
    $: hasCurrentUserProposed = ($CurrentUser?.id && job.proposals?.some(p => p.freelancerId === $CurrentUser?.id)) ?? false;

    function getFreelancerStats(freelancer?: UserEntity) {
        if (!freelancer) return { rating: 0, positiveReviews: 0, negativeReviews: 0, isVerified: false, isOnline: false };
        const idHash = freelancer.id?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) ?? 0;
        return {
            rating: parseFloat(((idHash % 50) / 10).toFixed(1)),
            positiveReviews: (idHash % 150) + 5,
            negativeReviews: (idHash % 5),
            isVerified: (idHash % 3) === 0,
            isOnline: freelancer.isOnline ?? (idHash % 2) === 0,
        };
    }

    async function withdrawProposal(proposalId?: string) {
        if (!proposalId) return;
        if (confirm("Вы уверены, что хотите отозвать свое предложение?")) {
            try {
                alert(`Отозвать предложение ${proposalId} (TODO: API call)`);
            } catch (error) {
                console.error("Withdraw error:", error);
            }
        }
    }

    function formatDuration(days?: number): string {
        if (days == null) return '';
        if (days === 1) return '1 день';
        if (days >= 2 && days <= 4) return `${days} дня`;
        return `${days} дней`;
    }

</script>

<div class="mt-8 pt-6 border-t border-base-300">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 class="text-xl font-semibold text-base-content">
            Предложения исполнителей ({job.proposals?.length ?? 0})
        </h2>
        {#if $CurrentUser && !hasCurrentUserProposed && job.status === 'Open'}
            <BaseButton
                className="btn-primary btn-sm w-full sm:w-auto"
                onclick={() => goto(`/jobs/${job.id}/submit-proposal/`)}
            >
                <Award class="w-4 h-4 mr-2" />
                Отправить свое предложение
            </BaseButton>
        {:else if $CurrentUser && hasCurrentUserProposed}
             <p class="text-sm text-success italic">Вы уже отправили предложение на этот заказ.</p>
        {/if}
    </div>

    {#if job.proposals && job.proposals.length > 0}
        <div class="space-y-6"> 
            {#each job.proposals as proposal (proposal.id)}
                {@const freelancer = proposal.freelancer}
                {@const isMyProposal = $CurrentUser?.id === freelancer?.id}
                {@const stats = getFreelancerStats(freelancer)}
                {@const coverLetterDisplay = proposal.coverLetter ?
                    (isMyProposal || (proposal.coverLetter?.length ?? 0) <= 250 ? proposal.coverLetter : proposal.coverLetter!.substring(0, 247) + '...')
                    : 'Сопроводительное письмо не предоставлено.'}
                {@const proposedRateText = proposal.proposedRate != null ? `${proposal.proposedRate.amount} ₸` : 'По договоренности'}
                {@const durationText = formatDuration((proposal as any).estimatedDurationDays)} 

                <div class="card bg-base-100 rounded-xl border border-base-200/60 shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
                    <div class="card-body p-4 md:p-5">
                        <div class="flex flex-col md:flex-row gap-4 md:gap-6">
                            <div class="md:w-1/3 lg:w-1/4 flex-shrink-0">
                                <div class="flex items-start gap-3">
                                    <a href={`/freelancers/${freelancer?.id}`}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       class="avatar relative flex-shrink-0 w-12 h-12" title={stats.isOnline ? 'В сети' : 'Не в сети'}>
                                        <UserAvatar
                                            avatarFile={freelancer?.avatar}
                                            className="rounded-full object-cover ring-1 ring-base-300" />
                                        {#if stats.isOnline}
                                            <span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-success ring-2 ring-base-100"></span>
                                        {/if}
                                    </a>
                                    <div>
                                        <a href={`/freelancers/${freelancer?.id}`} target="_blank" rel="noopener noreferrer" class="text-base-content hover:text-primary transition-colors">
                                            <h3 class="text-md lg:text-lg font-semibold leading-tight flex items-center">
                                                {freelancer?.fullname || freelancer?.name || 'Фрилансер'}
                                                {#if stats.isVerified}
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 ml-1.5 text-blue-500"><path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.602 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.498 4.49 4.49 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.491 4.491 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.602-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" /></svg>
                                                {/if}
                                            </h3>
                                        </a>
                                        <div class="flex flex-wrap items-center text-xs text-base-content/70 mt-1.5 gap-x-2 gap-y-1">
                                            <span class="flex items-center" title={`Рейтинг: ${stats.rating.toFixed(1)}`}>
                                                <Star class="w-3.5 h-3.5 text-yellow-400 mr-0.5" fill="currentColor"/>
                                                {stats.rating.toFixed(1)}
                                            </span>
                                            <span class="flex items-center" title={`Положительные отзывы: ${stats.positiveReviews}`}>
                                                <ThumbsUp class="w-3.5 h-3.5 text-success mr-0.5"/>
                                                {stats.positiveReviews}
                                            </span>
                                            <span class="flex items-center" title={`Отрицательные отзывы: ${stats.negativeReviews}`}>
                                                <ThumbsDown class="w-3.5 h-3.5 text-error/70 mr-0.5"/>
                                                {stats.negativeReviews}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {#if isMyProposal && proposal.status}
                                     <div class="mt-3">
                                        <span class="badge badge-sm 
                                            {proposal.status === ProposalEntityStatus.Accepted ? 'badge-success' : 
                                             proposal.status === ProposalEntityStatus.Rejected ? 'badge-error opacity-70' : 
                                             proposal.status === ProposalEntityStatus.Hidden ? 'badge-neutral opacity-60' : 
                                             'badge-info'}">
                                            Ваша ставка: {ProposalEntityStatus[proposal.status] ?? proposal.status.toString()}
                                        </span>
                                     </div>
                                {:else if proposal.status && !isMyProposal}
                                    <div class="mt-3">
                                        <span class="badge badge-sm badge-ghost opacity-80">
                                            {ProposalEntityStatus[proposal.status] ?? proposal.status.toString()}
                                        </span>
                                    </div>
                                {/if}
                            </div>

                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-start mb-2 gap-2">
                                    <div>
                                        {#if isMyProposal && (proposal.status === ProposalEntityStatus.Pending)}
                                            <div>Иди нахуй</div>
                                        {/if}
                                    </div>
                                    <div class="text-right flex-shrink-0">
                                        <div class="flex items-center justify-end gap-2 text-sm md:text-base font-semibold">
                                            {#if durationText}
                                                <span class="text-base-content/80">{durationText}</span>
                                                <span class="text-base-content/50">|</span>
                                            {/if}
                                            <span class="text-primary">{proposedRateText}</span>
                                            {#if job.budgetType === JobEntityBudgetType.Hourly && proposal.proposedRate}
                                                <span class="text-xs font-normal text-base-content/70 self-end">/ час</span>
                                            {/if}
                                            <button title="Связаться с исполнителем" class="text-base-content/50 hover:text-primary transition-colors">
                                                <MessageSquare class="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <p class="text-sm text-base-content/90 whitespace-pre-wrap leading-relaxed mb-3">
                                    {coverLetterDisplay}
                                    {#if !isMyProposal && proposal.coverLetter && proposal.coverLetter.length > 250}
                                        <button class="link link-primary text-xs ml-1" onclick={(e) => {
                                            const target = e.currentTarget as HTMLElement;
                                            const fullTextEl = target.previousSibling as HTMLElement;
                                            if(fullTextEl) fullTextEl.textContent = proposal.coverLetter!;
                                            target.remove();
                                        }}>показать полностью</button>
                                    {/if}
                                </p>

                                {#if proposal.files && proposal.files.length > 0}
                                    <div class="mb-3">
                                        <p class="text-xs font-medium text-base-content/70 mb-1">Прикрепленные файлы:</p>
                                        <div class="flex flex-wrap gap-2">
                                            {#each proposal.files as file (file.id)}
                                                <a href={file.filePath} target="_blank" rel="noopener noreferrer" class="text-xs link link-hover text-primary bg-base-200 px-2 py-1 rounded-md truncate max-w-[150px]" title={file.fileName}>
                                                    📄 {file.fileName || `Файл ${file.id?.substring(0,5)}`}
                                                </a>
                                            {/each}
                                        </div>
                                    </div>
                                {/if}
                                
                                <div class="flex flex-col sm:flex-row justify-between items-end gap-2 mt-2">
                                    {#if isMyProposal && (proposal.status === ProposalEntityStatus.Pending)}
                                        <div class="flex gap-2">
                                            <BaseButton className="btn-outline btn-xs" onclick={() => goto(`/jobs/${job.id}/proposals/${proposal.id}/edit`)}>
                                                <Edit3 class="w-3 h-3 mr-1" /> Редактировать
                                            </BaseButton>
                                            <BaseButton className="btn-outline btn-error btn-xs" onclick={() => withdrawProposal(proposal.id)}>
                                                <Trash2 class="w-3 h-3 mr-1" /> Отозвать
                                            </BaseButton>
                                        </div>
                                    {:else}
                                     <div></div> {/if}
                                    <span class="text-xs text-base-content/60 mt-1 sm:mt-0 self-end">{formatDate(proposal.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else if !$CurrentUser}
        <p class="text-sm text-center text-base-content/70 py-6">
            <a href="/auth/login?redirectTo={$page.url.pathname}" class="link link-primary">Войдите</a> или <a href="/auth/register" class="link link-primary">зарегистрируйтесь</a>, чтобы отправить свое предложение.
        </p>
    {:else if !hasCurrentUserProposed && job.status === 'Open'}
         <p class="text-sm text-center text-base-content/70 py-6">
            На этот заказ еще нет предложений. Будьте первым!
        </p>
    {:else if job.status !== 'Open'}
         <p class="text-sm text-center text-base-content/70 py-6">
            Прием предложений на этот заказ завершен (статус: {job.status}). 
        </p>
    {:else}
         <p class="text-sm text-center text-base-content/70 py-6">
            Предложений пока нет.
        </p>
    {/if}
</div>