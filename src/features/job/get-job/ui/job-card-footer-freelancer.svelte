<script lang="ts">
	import { goto } from "$app/navigation";
	import { CurrentUser } from "$lib/entities/user/model/modal";
	import { BaseButton } from "$lib/shared/ui/buttons";
	import { UserAvatar } from "$lib/shared/ui/icons";
	import { formatDistanceToNowStrict } from "date-fns";
	import { ru } from "date-fns/locale";
	import type { JobEntity } from "flsurf-client";

    // Эти импорты должны быть в <script context="module"> или в основном <script> вашего родительского компонента,
    // где определяется job и CurrentUser. Я дублирую их здесь для ясности контекста.
    // import type { JobEntity, ProposalEntity, UserEntity, FileEntity, ProposalEntityStatus } from 'flsurf-client';
    // import { CurrentUser } from '$lib/entities/user/model/modal'; // Ваш глобальный стор
    // import { UserAvatar } from "$lib/shared/ui/icons"; // Ваш компонент UserAvatar
    // import { formatDistanceToNowStrict } from 'date-fns';
    // import { ru } from 'date-fns/locale';
    // import BaseButton from "$lib/shared/ui/buttons/base-button.svelte"; // Если нужны кнопки действий

    export let job: JobEntity; 

    // Эта функция может быть хелпером в скрипте вашего компонента
    function formatDate(dateInput?: Date | string): string {
        if (!dateInput) return 'недавно';
        try {
            const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
            if (isNaN(date.getTime())) return String(dateInput);
            return formatDistanceToNowStrict(date, { addSuffix: true, locale: ru });
        } catch (e) {
            return String(dateInput); 
        }
    }

    // Предположим, что UserEntity расширен (или через связанный профиль) для рейтинга
    // или мы используем заглушку.
    // function getFreelancerRating(freelancer?: UserEntity): number {
    //    return (freelancer as any)?.rating ?? 0; 
    // }
</script>

{#each (job.proposals ?? []) as proposal (proposal.id)}
    {@const freelancer = proposal.freelancer}
    {@const isMyProposal = $CurrentUser?.id === freelancer?.id}
    {@const coverLetterSnippet = proposal.coverLetter ? 
        (proposal.coverLetter.length > 150 ? proposal.coverLetter.substring(0, 147) + '...' : proposal.coverLetter) 
        : 'Сопроводительное письмо не предоставлено.'}
    {@const proposedRateText = proposal.proposedRate != null ? `${proposal.proposedRate.toLocaleString('ru-RU')} ₸` : 'По договоренности'}
    {@const freelancerRating = (freelancer as any)?.rating ?? 0}


    <div class="bg-base-100 rounded-xl border border-base-300 shadow-md p-5 mb-4 hover:shadow-lg transition-shadow duration-300 ease-in-out">
        <div class="flex flex-col sm:flex-row items-start gap-4">
            <div class="flex-shrink-0 w-full sm:w-auto flex items-center sm:items-start gap-3 sm:gap-4">
                <a href={`/freelancers/${freelancer?.id}`} target="_blank" rel="noopener noreferrer" class="block">
                    <UserAvatar 
                        avatarFile={freelancer?.avatar} 
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover" 
                    />
                </a>
                <div class="flex-grow sm:flex-grow-0">
                    <a href={`/freelancers/${freelancer?.id}`} target="_blank" rel="noopener noreferrer" class="text-base-content hover:text-primary">
                        <h3 class="text-md md:text-lg font-semibold leading-tight">{freelancer?.fullname || freelancer?.name || 'Анонимный фрилансер'}</h3>
                    </a>
                    {#if freelancer?.fullname} 
                        <p class="text-xs text-gray-500 truncate max-w-xs">{freelancer.fullname}</p>
                    {:else if freelancerRating > 0}
                        <div class="flex items-center text-xs text-gray-500 mt-0.5">
                            <svg class="w-3.5 h-3.5 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            <span class="font-medium">{freelancerRating.toFixed(1)}</span>
                        </div>
                    {/if}
                </div>
            </div>

            <div class="flex-1 min-w-0 mt-2 sm:mt-0">
                <div class="flex justify-between items-start text-xs text-gray-400 mb-2">
                    <span>Подано: {formatDate(proposal.createdAt)}</span>
                    {#if proposal.status}
                        <span class="badge badge-sm 
                            {proposal.status === 'Accepted' ? 'badge-success' : 
                             proposal.status === 'Rejected' ? 'badge-error opacity-70' : 
                             proposal.status === 'Hidden' ? 'badge-neutral opacity-60' : 
                             'badge-ghost'}">
                            {proposal.status.toString()}
                        </span>
                    {/if}
                </div>
                
                {#if isMyProposal}
                    <p class="text-sm mt-1 font-medium">Ваша предложенная ставка: 
                        <span class="text-primary font-semibold">{proposedRateText}</span>
                        {#if job.budgetType === 'Hourly' && proposal.proposedRate } / час {/if}
                    </p>
                    {#if proposal.coverLetter}
                        <p class="text-sm text-gray-700 mt-2 whitespace-pre-wrap leading-relaxed bg-base-200 p-3 rounded-md">
                            <strong>Ваше сопроводительное письмо:</strong><br>
                            {proposal.coverLetter}
                        </p>
                    {/if}
                {:else} 
                    {#if proposal.coverLetter}
                        <p class="text-sm text-gray-600 mt-2 italic">Сопроводительное письмо предоставлено.</p>
                    {/if}
                {/if}

                {#if proposal.files && proposal.files.length > 0}
                    <div class="mt-3">
                        <p class="text-xs font-medium text-gray-500 mb-1">
                            Прикреплено файлов: {proposal.files.length}
                            {#if isMyProposal} 
                                ({#each proposal.files as file, idx}
                                    <a href={file.filePath} target="_blank" class="link link-hover text-primary">{file.fileName || `Файл ${idx+1}`}</a>{proposal.files && idx < proposal.files.length - 1 ? ', ' : ''}
                                {/each})
                            {/if}
                        </p>
                    </div>
                {/if}

                {#if isMyProposal && (proposal.status === 'Pending')}
                    <div class="mt-4 flex gap-2">
                        <BaseButton className="outline btn-xs" onclick={() => goto(`/jobs/${job.id}/proposals/${proposal.id}/edit`)}>
                            Редактировать
                        </BaseButton>
                        <BaseButton className="outline btn-error btn-xs" onclick={() => {/* TODO: dispatch 'withdraw', proposal.id */ console.log('Withdraw proposal', proposal.id)}}>
                            Отозвать
                        </BaseButton>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/each}