<script lang="ts">
    import {
        BookmarkJobCommand,
        JobEntityBudgetType,
        JobEntityStatus,
        type JobEntity,
        type SkillEntity
    }                                    from 'flsurf-client';
    import { GlobalClient }              from '$lib/shared/api';
    import { formatDistanceToNowStrict } from 'date-fns';
    import { ru }                        from 'date-fns/locale';
    import { showNotification }          from '$lib/shared/ui/errors/modal';

    /* ───── UI ──────────────────────────────────────────────────────────── */
    import TagsList            from '$lib/shared/ui/lists/tags-list.svelte';
    import IconThumbDown       from '$lib/shared/ui/icons/IconThumbDown.svelte';
    import IconHeart           from '$lib/shared/ui/icons/IconHeart.svelte';
    import IconPaymentVerified from '$lib/shared/ui/icons/IconPaymentVerified.svelte';
    import IconStarRating      from '$lib/shared/ui/icons/IconStarRating.svelte';
    import IconLocationSimple  from '$lib/shared/ui/icons/IconLocationSimple.svelte';

    /* ───── входные пропсы ──────────────────────────────────────────────── */
    export let job       : JobEntity;
    export let bookmarked = false;          // начальное состояние присылает родитель

    /* ───── dislike — через localStorage + API ─────────────────────────── */
    const LS_DISLIKES = 'disliked_jobs';

    function readDislikes(): Set<string> {
        try { return new Set(JSON.parse(localStorage.getItem(LS_DISLIKES) ?? '[]')); }
        catch { return new Set(); }
    }
    function saveDislikes(s: Set<string>): void {
        localStorage.setItem(LS_DISLIKES, JSON.stringify([...s]));
    }

    let disliked = readDislikes().has(job.id);

    async function toggleDislike(): Promise<void> {
        const nextState = !disliked;

        try {
            await GlobalClient.dislikeJob(job.id);   // сервер сам «переключит» состояние
        } catch (e) {
            showNotification('Не удалось изменить статус «Не интересно».', true);
            return;                                  // ничего не меняем локально
        }

        disliked = nextState;
        const store = readDislikes();
        nextState ? store.add(job.id) : store.delete(job.id);
        saveDislikes(store);
    }

    /* ───── bookmarks ──────────────────────────────────────────────────── */
    async function toggleBookmark(): Promise<void> {
        const nextState = !bookmarked;

        try {
            await GlobalClient.bookmarkJob(
                new BookmarkJobCommand({ jobId: job.id })
            );
        } catch (e) {
            showNotification('Не удалось изменить закладку.', true);
            return;
        }

        bookmarked = nextState;
    }

    /* ───── helper-поля (бюджет / дата / предложения) ─────────────────── */
    let postedTimeAgo = '';
    $: {
        const d = job.publicationDate ?? job.createdAt;
        postedTimeAgo = d
            ? formatDistanceToNowStrict(new Date(d), { locale: ru, addSuffix: true })
            : 'недавно';
    }

    /* бюджет и тип */
    let jobTypeAndBudget = '';
    $: {
        const p = job.payout;
        if (job.budgetType === JobEntityBudgetType.Fixed && p?.amount) {
            jobTypeAndBudget =
                `Фикс. цена · ${p.amount}${p.currency === 'USD' ? '$' : p.currency}`;
        } else if (job.budgetType === JobEntityBudgetType.Hourly && p?.amount) {
            jobTypeAndBudget =
                `Почасовая · ${p.amount}${p.currency === 'USD' ? '$' : p.currency}/час`;
        } else {
            jobTypeAndBudget = 'Бюджет не указан';
        }
    }

    /* предложения (очень упрощённо) */
    let proposalCountText = '';
    $: {
        const n = job.proposals?.length ?? 0;
        proposalCountText =
            n === 0   ? 'Предложений: нет' :
            n < 5     ? `Предложений: ${n}` :
            n <= 10   ? 'Предложений: 5-10' :
                        'Предложений: 10+';
    }

    /* прочие «заглушки» клиента                                    */
    const employerRating   = 4.0;
    const employerSpent    = '1000₸+ spent';
    const employerLocation = job.employer?.location ?? '';
    const skillsTags       = (job.requiredSkills ?? []).map((s: SkillEntity) => s.name);
</script>

<article
    class="bg-base-100 text-gray-300 shadow-lg rounded-lg p-5 relative
           border border-transparent hover:bg-base-200 transition-colors">

    <div class="flex justify-between items-start mb-3 relative">
        <p class="text-xs text-gray-500">Опубликовано&nbsp;{postedTimeAgo}</p>

        <div class="absolute right-0 flex gap-2 z-10">
            <button
                class="rounded-full p-2 bg-base-100 transition-colors
                       {disliked ? 'text-error' : 'text-base-content/60 hover:text-base-content'}"
                title="Не интересно / вернуть"
                onclick={toggleDislike}>
                <IconThumbDown/>
            </button>

            <button
                class="rounded-full p-2 bg-base-100 transition-colors
                       {bookmarked ? 'text-primary' : 'text-base-content/60 hover:text-base-content'}"
                title="Закладка / убрать"
                onclick={toggleBookmark}>
                <IconHeart/>
            </button>
        </div>
    </div>

    <h2 class="text-lg font-semibold text-green-400 mb-2 hover:text-green-500 transition-colors">
        <a href={`/jobs/${job.id}`} class="stretched-link-pseudo">{job.title ?? 'Без названия'}</a>
    </h2>

    <div class="flex flex-wrap items-center text-xs text-gray-400 gap-x-3 gap-y-1 mb-3">
        {#if job.paymentVerified}
            <span class="flex items-center"><IconPaymentVerified/><span class="ml-1">Платёж подтверждён</span></span>
        {/if}
        <span class="flex items-center"><IconStarRating/><span class="ml-1">{employerRating.toFixed(1)}</span></span>
        <span>{employerSpent}</span>
        {#if employerLocation}
            <span class="flex items-center"><IconLocationSimple/><span class="ml-1">{employerLocation}</span></span>
        {/if}
    </div>

    <p class="text-sm text-gray-300 mb-2">{jobTypeAndBudget}</p>
    <p class="text-sm text-gray-400 line-clamp-3 mb-4">{job.description ?? 'Описание отсутствует.'}</p>

    {#if skillsTags.length}
        <TagsList tags={skillsTags} readOnly/>
    {/if}

    <p class="text-xs text-gray-500 mt-4">{proposalCountText}</p>

    {#if job.status === JobEntityStatus.Closed}
        <div class="absolute inset-0 bg-gray-800/60 flex items-center justify-center rounded-lg">
            <span class="text-yellow-400 bg-gray-900 px-3 py-1 rounded">Вакансия закрыта</span>
        </div>
    {/if}
</article>

<style>
    /* «невидимая» ссылка на всю карточку */
    .stretched-link-pseudo::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
    }
</style>
