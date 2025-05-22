<script lang="ts">
    import type { PageData } from './$types';
    import { JobEntityStatus, Statuses, type JobEntity } from 'flsurf-client'; // Ваш enum и тип
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
    import type { SelectItem } from '$lib/shared/types';
    import { goto, invalidateAll } from '$app/navigation';
    import { page } from '$app/stores';
    import { SearchIcon, UserPlusIcon, XIcon } from '$lib/shared/ui/icons'; // Иконки
    import { slide } from 'svelte/transition'; // Для анимации панели фильтров
	import { CheckboxList } from '$lib/shared/ui/lists';
	import { PagePagination } from '$lib/shared/ui/navigation';

    export let data: PageData;

    let showFiltersPanel = false;

    // Состояния фильтров, инициализированные из data.currentFilters
    let searchTermInput = data.currentFilters.search || '';
    // statusesFilter будет массивом выбранных статусов
    let statusesFilter: Statuses[] = data.currentFilters.statuses || [];
    // jobTypeFilter может быть 'fixed', 'hourly', или null (для 'All')
    let jobTypeFilter: 'fixed' | 'hourly' | null = data.currentFilters.jobType || null;

    // Опции для фильтров
    const statusOptions: SelectItem[] = Object.values(JobEntityStatus).map(s => ({
        key: s,
        // Здесь можно добавить русские метки для статусов
        label: s.replace(/([A-Z])/g, ' $1').trim() // "Open" -> "Open", "InProgress" -> "In Progress"
    }));

    const jobTypeOptions: SelectItem[] = [
        { key: 'all', label: 'Все типы' }, // Специальное значение для сброса фильтра
        { key: 'fixed', label: 'Фиксированная цена' },
        { key: 'hourly', label: 'Почасовая оплата' }
    ];

    // Фильтры "Posted by" и "Visibility" со скриншота требуют доп. логики/полей в DTO/API
    // Пока оставим их как плейсхолдеры или упростим до "Мои вакансии"
    // let postedByFilter = data.currentFilters.postedBy || 'me'; // 'me', 'all_coworkers'
    // let visibilityFilter: string[] = data.currentFilters.visibility || [];


    function countActiveFilters(): number {
        let count = 0;
        if (searchTermInput) count++;
        if (statusesFilter.length > 0) count++;
        if (jobTypeFilter && jobTypeFilter !== null) count++;
        // if (postedByFilter !== 'me') count++;
        // if (visibilityFilter.length > 0) count++;
        return count;
    }
    $: activeFilterCount = countActiveFilters();

    function applyAllFilters() {
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('pageSize', data.pageSize.toString());

        if (searchTermInput.trim()) params.set('q', searchTermInput.trim());
        statusesFilter.forEach(stat => params.append('status', stat));
        if (jobTypeFilter) { // Отправляем только если не 'all' (т.е. не null)
            params.set('type', jobTypeFilter);
        }
        // if (postedByFilter) params.set('posted_by', postedByFilter);
        // visibilityFilter.forEach(vis => params.append('visibility', vis));
        
        goto(`?${params.toString()}`, { invalidateAll: true, noScroll: true, keepFocus: true });
        showFiltersPanel = false;
    }

    function clearAllFilters() {
        const params = new URLSearchParams();
        params.set('pageSize', data.pageSize.toString());
        goto(`?${params.toString()}`, { invalidateAll: true, noScroll: true });
        // Сброс локальных состояний фильтров
        searchTermInput = '';
        statusesFilter = [];
        jobTypeFilter = null;
        // postedByFilter = 'me';
        // visibilityFilter = [];
        showFiltersPanel = false;
    }
    
    function removeFilterTag(type: 'status' | 'jobType' | 'search', value?: string) {
        if (type === 'status' && value) {
            statusesFilter = statusesFilter.filter(s => s !== value);
        } else if (type === 'jobType') {
            jobTypeFilter = null;
        } else if (type === 'search') {
            searchTermInput = '';
        }
        applyAllFilters();
    }

    function handlePageChange(event: CustomEvent<number>) {
        const newPage = event.detail;
        const params = new URLSearchParams($page.url.searchParams);
        params.set('page', newPage.toString());
        goto(`?${params.toString()}`, { invalidateAll: true, noScroll: true, keepFocus: true });
    }

    function handlePageSizeChange(event: CustomEvent<number>) {
        const newPageSize = event.detail;
        const params = new URLSearchParams($page.url.searchParams);
        params.set('pageSize', newPageSize.toString());
        params.set('page', '1');
        goto(`?${params.toString()}`, { invalidateAll: true, noScroll: true, keepFocus: true });
    }
    
    function formatDate(dateInput?: Date | string, simple: boolean = false): string {
        if (!dateInput) return '–';
        try {
            const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
            if (isNaN(date.getTime())) return String(dateInput); 
            if (simple) return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
            return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {
            return String(dateInput);
        }
    }

    function getJobStatusBadgeClass(status?: JobEntityStatus): string {
        switch(status) {
            case JobEntityStatus.Open: return 'bg-green-500 text-white';
            case JobEntityStatus.Draft: return 'bg-yellow-400 text-gray-800';
            case JobEntityStatus.Closed: return 'bg-gray-500 text-white';
            case JobEntityStatus.InContract: return 'bg-blue-500 text-white';
            case JobEntityStatus.WaitingFreelancerApproval: return 'bg-orange-400 text-white';
            case JobEntityStatus.Completed: return 'bg-purple-500 text-white'; // Пример
            case JobEntityStatus.Expired: return 'bg-red-500 text-white';
            case JobEntityStatus.SentToModeration: return 'bg-indigo-500 text-white';
            default: return 'bg-gray-300 text-gray-700';
        }
    }

</script>

<div class="bg-gray-900 text-gray-200 min-h-screen px-4 py-8 md:px-6 md:py-10">
    <div class="max-w-6xl mx-auto">
        <header class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 class="text-3xl font-bold text-white">Все вакансии</h1>
            <a href="/post-job" class="primary bg-green-600 hover:bg-green-700 border-green-600 text-white !font-semibold">
                <UserPlusIcon className="w-5 h-5 mr-1.5" />
                Опубликовать новую
            </a>
        </header>

        {#if data.error}
            <div class="alert alert-error shadow-lg mb-6"><span>{data.error}</span></div>
        {/if}

        <div class="mb-6 flex flex-col sm:flex-row gap-4 items-center">
            <div class="relative flex-grow w-full sm:w-auto">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input 
                    type="search" 
                    bind:value={searchTermInput}
                    on:input={() => setTimeout(applyAllFilters, 600)}
                    placeholder="Поиск по опубликованным вакансиям..." 
                    class="input input-bordered w-full pl-10 bg-gray-800 border-gray-700 focus:border-green-500 placeholder-gray-500 text-white" />
            </div>
            <BaseButton onclick={() => showFiltersPanel = !showFiltersPanel} className="ghost border-gray-700 hover:bg-gray-700 w-full sm:w-auto !font-normal">
                <SearchIcon className="h-5 w-5 mr-1.5" />
                Фильтры {#if activeFilterCount > 0}<span class="badge badge-xs bg-green-500 border-green-500 text-white ml-1.5">{activeFilterCount}</span>{/if}
            </BaseButton>
        </div>

        {#if showFiltersPanel}
        <div transition:slide class="mb-6 p-6 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl space-y-6">
            <h3 class="text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-4">Параметры фильтрации</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <p class="text-sm font-medium text-gray-300 mb-2">Статус вакансии</p>
                    <CheckboxList bind:group={statusesFilter} options={statusOptions} name="job_status_filter_group" />
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-300 mb-2">Тип оплаты</p>
                    <div class="space-y-1.5">
                        <label class="flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 cursor-pointer">
                            <input type="radio" name="job_type_filter_radio" value={null} bind:group={jobTypeFilter} class="radio radio-primary radio-sm"/>
                            <span class="text-sm text-gray-200">Все типы</span>
                        </label>
                        {#each jobTypeOptions.filter(opt => opt.key !== 'all') as opt (opt.key)}
                        <label class="flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 cursor-pointer">
                            <input type="radio" name="job_type_filter_radio" value={opt.key} bind:group={jobTypeFilter} class="radio radio-primary radio-sm"/>
                            <span class="text-sm text-gray-200">{opt.label}</span>
                        </label>
                        {/each}
                    </div>
                </div>
                 </div>
            <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-700 mt-4">
                <BaseButton onclick={clearAllFilters} className="ghost text-gray-400 hover:text-white hover:bg-gray-700 w-full sm:w-auto !font-normal">Сбросить</BaseButton>
                <BaseButton onclick={applyAllFilters} className="primary bg-green-600 hover:bg-green-700 border-green-600 w-full sm:w-auto !font-semibold">Применить</BaseButton>
            </div>
        </div>
        {/if}

        {#if statusesFilter.length > 0 || (jobTypeFilter && jobTypeFilter !== null) || searchTermInput}
        <div class="mb-6 flex flex-wrap items-center gap-2 py-2">
            <span class="text-sm text-gray-400 mr-2">Активные фильтры:</span>
            {#if searchTermInput}
                <span class="badge badge-lg bg-gray-700 text-gray-300 gap-1.5 items-center">
                    Поиск: "{searchTermInput}" <button class="opacity-60 hover:opacity-100" on:click={() => removeFilterTag('search')}><XIcon className="w-3 h-3"/></button>
                </span>
            {/if}
            {#each statusesFilter as sf (sf)}
                <span class="badge badge-lg bg-gray-700 text-gray-300 gap-1.5 items-center">
                    Статус: {statusOptions.find(o => o.key === sf)?.label || sf}
                    <button class="opacity-60 hover:opacity-100" on:click={() => removeFilterTag('status', sf)}><XIcon className="w-3 h-3"/></button>
                </span>
            {/each}
            {#if jobTypeFilter}
                 <span class="badge badge-lg bg-gray-700 text-gray-300 gap-1.5 items-center">
                    Тип: {jobTypeOptions.find(o => o.key === jobTypeFilter)?.label || jobTypeFilter}
                    <button class="opacity-60 hover:opacity-100" on:click={() => removeFilterTag('jobType')}><XIcon className="w-3 h-3"/></button>
                </span>
            {/if}
            {#if activeFilterCount > 0}
            <BaseButton onclick={clearAllFilters} className="link text-green-500 hover:text-green-400 text-sm normal-case !pl-2 !min-h-0 !h-auto !py-0.5">
                Очистить все
            </BaseButton>
            {/if}
        </div>
        {/if}

        {#if data.jobPosts && data.jobPosts.length > 0}
            <div class="space-y-4">
                {#each data.jobPosts as job (job.id)}
                    <div class="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start gap-4 hover:border-green-500 transition-colors">
                        <div class="flex-grow min-w-0">
                            <h2 class="text-xl font-semibold text-white hover:text-green-400 mb-1 truncate" title={job.title}>
                                <a href={`/jobs/${job.id}`}>{job.title}</a>
                            </h2>
                            <p class="text-xs text-gray-400 mb-1.5">
                                Создано {formatDate(job.createdAt, true)} 
                                {#if job.employerId === $page.data.user?.id}вами{:else if job.employer?.fullname} {job.employer.fullname}{/if}
                            </p>
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="badge {getJobStatusBadgeClass(job.status)} badge-sm !font-medium">{job.status?.toString() || 'N/A'}</span>
                                <span class="text-xs text-gray-500">
                                    {#if job.status === JobEntityStatus.Draft}
                                        Черновик - Сохранено {formatDate(job.lastModifiedAt || job.createdAt)}
                                    {:else if job.status === JobEntityStatus.Open && job.expirationDate}
                                        Открыто до {formatDate(job.expirationDate)}
                                    {:else}
                                        {formatDate(job.lastModifiedAt || job.createdAt)}
                                    {/if}
                                </span>
                                </div>
                        </div>
                        <div class="flex-shrink-0 flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:mt-0">
                            {#if job.status === JobEntityStatus.Draft}
                                <a href={`/post-job/edit/${job.id}`} class="primary btn-sm bg-green-600 hover:bg-green-700 border-green-600 w-full sm:w-auto">Редактировать</a>
                            {:else if job.status === JobEntityStatus.Open}
                                <a href={`/jobs/${job.id}/proposals`} class="secondary btn-sm border-gray-600 text-gray-300 hover:bg-gray-700 w-full sm:w-auto">Отклики</a>
                            {:else}
                                <a href={`/jobs/${job.id}`} class="ghost btn-sm border-gray-700 text-gray-400 hover:bg-gray-700 w-full sm:w-auto">Детали</a>
                            {/if}
                            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                            <div class="dropdown dropdown-end">
                                <BaseButton onclick={() => {}} tabindex={0} className="ghost btn-sm btn-circle text-gray-400 hover:text-white hover:bg-gray-700">
                                    <UserPlusIcon className="w-5 h-5" />
                                </BaseButton>
                                <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-gray-700 rounded-box w-48 z-[5]">
                                    <li><a href={`/jobs/${job.id}`} class="text-sm hover:bg-gray-600">Просмотр</a></li>
                                    {#if job.status === JobEntityStatus.Open}
                                        <!-- svelte-ignore a11y_missing_attribute -->
                                        <li><a class="text-sm hover:bg-gray-600">Пригласить фрилансеров</a></li>
                                        <!-- svelte-ignore a11y_missing_attribute -->
                                        <li><a class="text-sm hover:bg-gray-600">Закрыть (нанять)</a></li>
                                    {/if}
                                    {#if job.status === JobEntityStatus.Draft || job.status === JobEntityStatus.Open}
                                        <li><a href={`/post-job/edit/${job.id}`} class="text-sm hover:bg-gray-600">Редактировать</a></li>
                                    {/if}
                                    <li><a class="text-error hover:bg-red-700/20 text-sm" href="/">Удалить</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

             <div class="mt-12 flex justify-center">
                {#if data.totalPages > 1}
                    <PagePagination
                        currentPage={data.currentPage}
                        totalPages={data.totalPages}
                        pageSize={data.pageSize}
                        on:pageChange={handlePageChange}
                        on:pageSizeChange={handlePageSizeChange}
                    />
                {/if}
            </div>
        {:else if !data.error}
             <div class="text-center py-16 text-gray-500">
                <svg class="mx-auto h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                <p class="text-xl">У вас пока нет опубликованных вакансий.</p>
                {#if activeFilterCount > 0}
                     <p class="text-sm mt-2">Попробуйте изменить или <BaseButton type="button" variant="link" onclick={clearAllFilters} className="text-sm !p-0 !normal-case !text-green-400 hover:!text-green-300">сбросить фильтры</BaseButton>.</p>
                {/if}
            </div>
        {/if}
    </div>
</div>