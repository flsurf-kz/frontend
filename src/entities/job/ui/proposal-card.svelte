<script lang="ts">
    import { 
        type ProposalEntity, 
        type UserEntity, 
        type FileEntity, 
        type JobEntity, // Добавляем JobEntity
        JobEntityBudgetType // Для определения типа ставки
    } from 'flsurf-client';
    import { ProposalEntityStatus } from 'flsurf-client'; // Ваш enum для статусов предложений
    import { CurrentUser } from '$lib/entities/user/model/modal'; // Глобальный стор текущего пользователя
    import UserAvatar from '$lib/shared/ui/icons/UserAvatar.svelte'; // Ваш компонент UserAvatar
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
    import { formatDistanceToNowStrict } from 'date-fns';
    import { ru } from 'date-fns/locale';
    import { createEventDispatcher } from 'svelte';

    export let proposal: ProposalEntity;
    export let job: JobEntity; // Принимаем объект вакансии

    const dispatch = createEventDispatcher<{
        accept: ProposalEntity; // Передаем весь объект proposal для удобства
        reject: ProposalEntity;
        messageFreelancer: ProposalEntity; // Передаем proposal, из него можно взять freelancerId
    }>();

    $: freelancer = proposal.freelancer;
    // ЗАГЛУШКА: Рейтинг фрилансера. Эти данные должны приходить из UserEntity или связанного профиля.
    // Предположим, UserEntity был расширен полем rating.
    $: freelancerRating = (freelancer as UserEntity & { rating?: number })?.rating ?? 0; 
    $: freelancerLocation = freelancer?.location 
        ? freelancer.location.toString() // UserEntityLocation enum
        : null;

    $: proposalStatusValue = proposal.status ?? ProposalEntityStatus.Pending;

    let showFullCoverLetter = false;
    const coverLetterSnippetLength = 180; // Немного увеличим для предпросмотра

    $: coverLetterDisplay = proposal.coverLetter
        ? (showFullCoverLetter || proposal.coverLetter.length <= coverLetterSnippetLength
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
        switch (s) {
            case ProposalEntityStatus.Accepted:
                return { text: 'Принято', className: 'badge-success text-success-content' };
            case ProposalEntityStatus.Rejected:
                return { text: 'Отклонено', className: 'badge-error text-error-content' };
            case ProposalEntityStatus.Hidden: // Из вашего enum
                return { text: 'Скрыто заказчиком', className: 'badge-neutral text-neutral-content opacity-70' };
            // Добавьте другие статусы из вашего ProposalEntityStatus, если они есть
            // case ProposalEntityStatus.Interviewing:
            //     return { text: 'Интервью', className: 'badge-info text-info-content' };
            // case ProposalEntityStatus.WithdrawnByFreelancer:
            //     return { text: 'Отозвано исполнителем', className: 'badge-warning text-warning-content opacity-80' };
            case ProposalEntityStatus.Pending:
            default:
                return { text: 'На рассмотрении', className: 'badge-ghost border-base-300 text-base-content' };
        }
    }

    $: statusInfo = getStatusDisplayAndClass(proposalStatusValue);

    // Определяем, является ли текущий пользователь владельцем вакансии
    let isJobOwner: boolean = false;
    $: isJobOwner = $CurrentUser?.id === job?.employerId;

    // Иконки (простые SVG, вынесите в компоненты для лучшей организации)
    const IconStar = `<svg class="w-4 h-4 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
    const IconPaperClip = `<svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>`;
    const IconMessageDots = `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>`;

</script>

<div class="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg p-5 md:p-6 mb-4 transition-shadow duration-300">
    <div class="flex flex-col md:flex-row items-start gap-x-6 gap-y-4">
        <div class="flex-shrink-0 w-full md:w-48 flex flex-col items-center md:items-start text-center md:text-left 
                    border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-6">
            <a href={`/freelancers/${freelancer?.id}`} target="_blank" rel="noopener noreferrer" class="block mb-2 group">
                <UserAvatar 
                    avatarFile={freelancer?.avatar} 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-md ring-2 ring-transparent group-hover:ring-primary transition-all" 
                />
            </a>
            <a href={`/freelancers/${freelancer?.id}`} target="_blank" rel="noopener noreferrer" class="text-lg font-semibold text-primary hover:underline leading-tight break-words w-full">
                {freelancer?.fullname || freelancer?.name || 'Фрилансер'}
            </a>
            {#if freelancerRating > 0 || (freelancer as any)?.reviewsCount > 0} 
                <div class="flex items-center text-xs text-gray-500 mt-1 justify-center md:justify-start">
                    {@html IconStar}
                    <span class="ml-0.5 font-medium">{(freelancerRating || 0).toFixed(1)}</span>
                    {#if (freelancer as any)?.reviewsCount}
                        <span class="ml-1">({(freelancer as any).reviewsCount} отзывов)</span>
                    {/if}
                </div>
            {:else}
                <p class="text-xs text-gray-400 mt-1">Нет рейтинга</p>
            {/if}
            {#if freelancerLocation}
                <p class="text-xs text-gray-500 mt-1 truncate max-w-full" title={freelancerLocation}>{freelancerLocation}</p>
            {/if}
            
            {#if freelancer?.id}
            <BaseButton 
                type="button" 
                className="ghost btn-sm mt-3 !text-primary hover:!bg-primary/10 hover:!border-primary w-full" 
                onclick={() => dispatch('messageFreelancer', proposal)} 
            >
                <span class="mr-1">{@html IconMessageDots}</span>
                Написать {freelancer?.fullname || 'фрилансеру'}"
            </BaseButton>
            {/if}
        </div>

        <div class="flex-1 min-w-0">
            <div class="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                <div>
                    {#if proposal.proposedRate != null && proposal.proposedRate >= 0}
                        <p class="text-2xl font-bold text-gray-800">
                            {proposal.proposedRate.toLocaleString('ru-RU')} 
                            <span class="text-lg text-gray-600">{job?.payout?.currency?.toString() || '₸'}</span> 
                        </p>
                        <p class="text-sm text-gray-500 -mt-1">
                            {job?.budgetType === JobEntityBudgetType.Hourly ? 'в час' : 'за проект'}
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

            {#if proposal.files && proposal.files.length > 0}
                <div class="mb-4">
                    <h4 class="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Прикрепленные файлы:</h4>
                    <ul class="flex flex-wrap gap-2">
                        {#each proposal.files as file (file.id || file.fileName)}
                            <li>
                                <a href={file.filePath} target="_blank" rel="noopener noreferrer" 
                                   class="text-xs bg-base-200 hover:bg-primary hover:text-primary-content text-primary-focus py-1.5 px-2.5 rounded-md flex items-center gap-1.5 transition-colors shadow-sm hover:shadow-md"
                                   title={file.fileName}>
                                    {@html IconPaperClip}
                                    <span class="truncate max-w-[180px]">{file.fileName || 'Прикрепленный файл'}</span>
                                </a>
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}
            
            <div class="flex flex-col sm:flex-row justify-between items-center mt-5 pt-4 border-t border-gray-200">
                <div class="text-sm mb-3 sm:mb-0">
                    <span class="text-gray-600">Статус:</span>
                    <span class="badge {statusInfo.className} badge-md font-semibold ml-1.5">
                        {statusInfo.text}
                    </span>
                </div>
                
                {#if isJobOwner && proposalStatusValue === ProposalEntityStatus.Pending}
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <BaseButton type="button" className="error btn-sm flex-grow sm:flex-grow-0" onclick={() => dispatch('reject', proposal)}>
                            Отклонить
                        </BaseButton>
                        <BaseButton type="button" className="success btn-sm flex-grow sm:flex-grow-0" onclick={() => dispatch('accept', proposal)}>
                            Принять
                        </BaseButton>
                    </div>
                {:else if isJobOwner && proposalStatusValue === ProposalEntityStatus.Accepted}
                     <a href={`/contracts/job/${job.id}`} class="btn btn-sm btn-info w-full sm:w-auto">
                        Перейти к контракту
                     </a>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    /* Для line-clamp, если стандартные Tailwind классы не работают или нужна поддержка старых браузеров */
    .line-clamp-4 {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 4;
    }
    .line-clamp-none {
        -webkit-line-clamp: unset; /* или auto */
    }
    /* Дополнительные стили, если нужны */
</style>