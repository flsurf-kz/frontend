<script lang="ts">
	import { JobEntityBudgetType, JobEntityStatus, type JobEntity, type SkillEntity } from 'flsurf-client';
    import { formatDistanceToNowStrict } from 'date-fns'; // Для "Posted X hours ago"
    import { ru } from 'date-fns/locale'; // Для русского языка в date-fns

	export let job: JobEntity;

    // Для относительного времени
    let postedTimeAgo: string = '';
    $: {
        if (job.publicationDate || job.createdAt) {
            const dateToCompare = job.publicationDate || job.createdAt;
            try {
                postedTimeAgo = formatDistanceToNowStrict(new Date(dateToCompare), { addSuffix: true, locale: ru });
            } catch (e) {
                postedTimeAgo = "недавно"; // Запасной вариант
            }
        } else {
            postedTimeAgo = "недавно";
        }
    }

    // Форматирование бюджета и типа работы
    let jobTypeAndBudget: string = '';
    $: {
        let parts: string[] = [];
        if (job.budgetType === JobEntityBudgetType.Fixed && job.payout?.amount) {
            parts.push("Фикс. цена");
            if (job.level) parts.push(job.level.toString()); // Предполагаем, что JobEntityLevel это enum или имеет toString()
            parts.push(`Бюджет: ${job.payout.amount}${job.payout.currency === "USD" ? '$' : (job.payout.currency === "KZT" ? '₸' : job.payout.currency )}`);
        } else if (job.budgetType === JobEntityBudgetType.Hourly && job.payout?.amount) {
            parts.push("Почасовая");
            if (job.level) parts.push(job.level.toString());
            parts.push(`Ставка: ${job.payout.amount}${job.payout.currency === "USD" ? '$' : (job.payout.currency === "KZT" ? '₸' : job.payout.currency )}/час`);
        } else {
            if (job.level) parts.push(job.level.toString());
            parts.push("Бюджет не указан");
        }
        jobTypeAndBudget = parts.join(' - ');
    }

    // Информация о клиенте (заглушки, если данных нет в job.employer)
    const employerRating = 4.0; // Пример, если у UserEntity есть rating
    const employerSpent = '1000r+ spent'; // Пример
    const employerLocation = job.employer?.location ?? 'Не указана'; // Пример

    // Количество предложений
    let proposalCountText: string = 'Предложения: ';
    $: {
        const count = job.proposals?.length ?? 0;
        if (count === 0) proposalCountText = 'Предложений: Нет';
        else if (count < 5) proposalCountText = `Предложений: ${count}`;
        else if (count <=10) proposalCountText = 'Предложений: 5-10'; // Как на скриншоте
        else proposalCountText = 'Предложений: 10+';
    }

    const skillsForTagList: SkillEntity[] = job.requiredSkills || [];

</script>

<article class="bg-gray-800 text-gray-300 shadow-lg rounded-lg p-5 relative border border-transparent hover:border-gray-700 transition-colors">
    <div class="flex justify-between items-start mb-3">
        <p class="text-xs text-gray-500">Опубликовано {postedTimeAgo}</p>
        <div class="flex space-x-2 z-20 relative">
            <button title="Не интересно" class="text-gray-500 hover:text-white transition-colors">
                <IconThumbDown />
            </button>
            <button title="Сохранить в закладки" class="text-gray-500 hover:text-white transition-colors">
                <IconHeart />
            </button>
            </div>
    </div>

    <h2 class="text-lg font-semibold text-white mb-2 hover:text-green-400 transition-colors">
        <a href={`/jobs/${job.id}`} class="stretched-link-pseudo">{job.title || 'Без названия'}</a>
    </h2>

    <div class="flex flex-wrap items-center text-xs text-gray-400 space-x-3 mb-3">
        {#if job.paymentVerified}
        <span class="flex items-center">
            <IconPaymentVerified />
            <span class="ml-1">Платеж подтвержден</span>
        </span>
        {/if}
        <span class="flex items-center">
            <IconStarRating />
            <span class="ml-1">{employerRating.toFixed(1)}</span>
        </span>
        <span>{employerSpent}</span>
        {#if employerLocation !== 'Не указана'}
        <span class="flex items-center">
            <IconLocationSimple />
            <span class="ml-1">{employerLocation}</span>
        </span>
        {/if}
    </div>

    <p class="text-sm text-gray-300 mb-3">{jobTypeAndBudget}</p>

    <p class="text-sm text-gray-400 line-clamp-3 mb-4 leading-relaxed">
        {job.description || 'Описание отсутствует.'}
    </p>

    {#if skillsForTagList.length > 0}
        <div class="mb-4">
            <TaggedList items={skillsForTagList} maxVisible={3}/>
        </div>
    {/if}

    <p class="text-xs text-gray-500">{proposalCountText}</p>

    {#if job.status === JobEntityStatus.Closed} 
        <div class="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center rounded-lg z-0">
            <span class="text-yellow-400 font-semibold px-3 py-1 bg-gray-900 rounded">Вакансия закрыта</span>
        </div>
    {/if}
</article>

<style>
    /* Для кликабельной карточки, если не используется <a> вокруг всего */
    .stretched-link-pseudo::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 10; /* Ниже чем у кнопок */
        pointer-events: auto;
        background-color: rgba(0,0,0,0); /* Для срабатывания */
    }
    /* Убедитесь, что интерактивные элементы внутри карточки имеют более высокий z-index, если нужно */
    article:hover .stretched-link-pseudo {
        /* Можно добавить эффект при наведении на "ссылку" */
    }
</style>