<script lang="ts">
    import type { PageData } from './$types';
    import { JobEntityStatus, type JobEntity, type Statuses } from 'flsurf-client'; // Statuses - это JobEntityStatus[]
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
    import type { SelectItem } from '$lib/shared/types';
    import { goto, invalidateAll } from '$app/navigation';
    import { page } from '$app/stores';
    import { SearchIcon, FilterIcon, XIcon, Edit3Icon, EyeIcon, PlusCircleIcon, FileTextIcon, BriefcaseIcon } from 'lucide-svelte'; // Добавил еще иконки
    import { slide } from 'svelte/transition';
    import { onMount } from 'svelte'; // Для корректной работы со стором $page при инициализации фильтров
	import { CheckboxList } from '$lib/shared/ui/lists';
	import { PagePagination } from '$lib/shared/ui/navigation';

    export let data: PageData;

    let showFiltersPanel = false;

    // Состояния фильтров, инициализированные из data.currentFilters
    // Эти переменные будут использоваться для двусторонней привязки с элементами формы
    let searchTermInput: string = '';
    let statusesFilter: Statuses[] = []; // JobEntityStatus - это string enum
    let jobTypeFilter: 'fixed' | 'hourly' | '' = ''; // Пустая строка для "Все типы"

    // Инициализация фильтров из data (которое приходит из +page.ts и содержит URL параметры)
    // Это лучше делать в onMount или реактивном блоке, чтобы data было доступно
    $: {
        searchTermInput = data.currentFilters.search || '';
        statusesFilter = data.currentFilters.statuses || [];
        jobTypeFilter = data.currentFilters.jobType || '';
    }

    const statusOptions: SelectItem[] = Object.values(JobEntityStatus).map(s => ({
        key: s,
        // Здесь можно добавить русские метки для статусов, если enum английский
        label: s.replace(/([A-Z](?=[a-z]))|([A-Z]+(?=[A-Z][a-z]|\b))/g, ' $1$2').trim() // "Open" -> "Open", "InProgress" -> "In Progress"
    }));

    const jobTypeOptions: SelectItem[] = [
        { key: '', label: 'Все типы' }, // Пустая строка для сброса фильтра
        { key: 'fixed', label: 'Фиксированная цена' },
        { key: 'hourly', label: 'Почасовая оплата' }
    ];
    
    function countActiveFilters(): number {
        let count = 0;
        if (searchTermInput.trim()) count++;
        if (statusesFilter.length > 0) count++;
        if (jobTypeFilter) count++;
        return count;
    }
    $: activeFilterCount = countActiveFilters();

    function applyFiltersAndNavigate() {
        const params = new URLSearchParams();
        params.set('page', '1'); // При применении фильтров всегда переходим на 1-ю страницу
        params.set('pageSize', data.pageSize.toString());

        if (searchTermInput.trim()) {
            params.set('q', searchTermInput.trim());
        }
        statusesFilter.forEach(stat => {
            if (stat) params.append('status', stat); // Убедимся, что не добавляем пустые значения
        });
        if (jobTypeFilter) { 
            params.set('type', jobTypeFilter);
        }
        
        goto(`?${params.toString()}`, { invalidateAll: true, noScroll: true, keepFocus: true });
        showFiltersPanel = false;
    }

    function clearAllFilters() {
        const params = new URLSearchParams();
        params.set('pageSize', data.pageSize.toString()); // Сохраняем текущий размер страницы
        goto(`?${params.toString()}`, { invalidateAll: true, noScroll: true });
        // Локальные состояния сбросятся автоматически через реактивность $: {} блока выше
        // или можно сбросить их здесь явно, если нужно немедленное обновление UI до навигации
        searchTermInput = '';
        statusesFilter = [];
        jobTypeFilter = '';
        showFiltersPanel = false;
    }
    
    function removeFilterTag(type: 'status' | 'jobType' | 'search', valueToRemove?: string) {
        if (type === 'status' && valueToRemove) {
            statusesFilter = statusesFilter.filter(s => s !== valueToRemove);
        } else if (type === 'jobType') {
            jobTypeFilter = ''; // Сбрасываем на "Все типы"
        } else if (type === 'search') {
            searchTermInput = '';
        }
        applyFiltersAndNavigate(); // Переприменяем фильтры
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
    
    function formatDate(dateInput?: Date | string | null, simple: boolean = false): string {
        if (!dateInput) return '–';
        try {
            const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
            if (isNaN(date.getTime())) return String(dateInput); 
            if (simple) return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }); // ДД.ММ.ГГГГ
            return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric', year: 'numeric' }); // 1 янв. 2023 г.
        } catch (e) {
            return String(dateInput);
        }
    }

    function getJobStatusDisplay(status?: JobEntityStatus): { text: string, className: string } {
        const s = status || "Unknown";
        switch(status) {
            case JobEntityStatus.Open: return { text: 'Открыта', className: 'badge-success text-success-content'};
            case JobEntityStatus.Draft: return { text: 'Черновик', className: 'badge-warning text-warning-content'};
            case JobEntityStatus.Closed: return { text: 'Закрыта', className: 'badge-neutral text-neutral-content'};
            case JobEntityStatus.InContract: return { text: 'В контракте', className: 'badge-info text-info-content'};
            case JobEntityStatus.WaitingFreelancerApproval: return { text: 'Ожидает фрилансера', className: 'badge-accent text-accent-content'};
            case JobEntityStatus.Completed: return { text: 'Завершена', className: 'badge-primary text-primary-content'};
            case JobEntityStatus.Expired: return { text: 'Просрочена', className: 'badge-error text-error-content'};
            case JobEntityStatus.SentToModeration: return { text: 'На модерации', className: 'badge-secondary text-secondary-content'};
            default: return { text: s.toString(), className: 'badge-ghost'};
        }
    }

</script>

<div class="container mx-auto px-4 py-10">
    <header class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 class="text-3xl font-bold text-base-content">Мои Вакансии</h1>
        <div class="flex gap-2">
            <a href="/contracts/" class="btn btn-outline btn-secondary items-center"> 
                <FileTextIcon class="w-4 h-4 mr-1.5"/> Мои Контракты
            </a>
            <a href="/jobs/post/name" class="btn btn-primary items-center">
                <PlusCircleIcon class="w-5 h-5 mr-1.5"/>Опубликовать новую
            </a>
        </div>
    </header>

    {#if data.error}
        <div class="alert alert-error shadow-lg mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{data.error}</span>
        </div>
    {/if}

    <div class="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div class="relative flex-grow w-full sm:w-auto">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon class="h-5 w-5 text-base-content/50" />
            </span>
            <input 
                type="search" 
                bind:value={searchTermInput}
                on:input={() => setTimeout(applyFiltersAndNavigate, 600)} 
                placeholder="Поиск по моим вакансиям..." 
                class="input input-bordered w-full pl-10 bg-base-200 text-base-content placeholder-base-content/50 focus:border-primary" />
        </div>
        <BaseButton onclick={() => showFiltersPanel = !showFiltersPanel} className="ghost border-base-300 hover:bg-base-300/60 w-full sm:w-auto !font-normal text-base-content">
            <FilterIcon class="h-5 w-5 mr-1.5" />
            Фильтры {#if activeFilterCount > 0}<span class="badge badge-xs badge-primary text-primary-content ml-1.5">{activeFilterCount}</span>{/if}
        </BaseButton>
    </div>

    {#if showFiltersPanel}
    <div transition:slide class="mb-6 p-6 bg-base-200 border border-base-300 rounded-xl shadow-lg space-y-6">
        <h3 class="text-lg font-semibold text-base-content border-b border-base-300 pb-2 mb-4">Параметры фильтрации</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
                <p class="text-sm font-medium text-base-content/80 mb-2">Статус вакансии</p>
                <CheckboxList bind:selected={statusesFilter} options={statusOptions}/>
            </div>
            <div>
                <p class="text-sm font-medium text-base-content/80 mb-2">Тип оплаты</p>
                <div class="space-y-1.5">
                    {#each jobTypeOptions as opt (opt.key)}
                    <label class="flex items-center gap-2 p-2 rounded-md hover:bg-base-300/40 cursor-pointer has-[:checked]:bg-primary/10">
                        <input type="radio" name="job_type_filter_radio" value={opt.key || null} bind:group={jobTypeFilter} class="radio radio-primary radio-sm checked:!bg-primary"/>
                        <span class="text-sm text-base-content">{opt.label}</span>
                    </label>
                    {/each}
                </div>
            </div>
        </div>
        <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-base-300 mt-4">
            <BaseButton onclick={clearAllFilters} className="ghost hover:bg-base-300/60 w-full sm:w-auto !font-normal text-base-content">Сбросить</BaseButton>
            <BaseButton onclick={applyFiltersAndNavigate} className="primary w-full sm:w-auto !font-semibold">Применить</BaseButton>
        </div>
    </div>
    {/if}

    {#if statusesFilter.length > 0 || (jobTypeFilter) || searchTermInput}
    <div class="mb-6 flex flex-wrap items-center gap-2 py-2">
        <span class="text-sm text-base-content/70 mr-2">Активные фильтры:</span>
        {#if searchTermInput}
            <span class="badge badge-lg bg-base-300 text-base-content gap-1.5 items-center">
                Поиск: "{searchTermInput}" <button class="opacity-60 hover:opacity-100 text-base-content/70" on:click={() => removeFilterTag('search')}><XIcon class="w-3 h-3"/></button>
            </span>
        {/if}
        {#each statusesFilter as sf (sf)}
            <span class="badge badge-lg bg-base-300 text-base-content gap-1.5 items-center">
                Статус: {statusOptions.find(o => o.key === sf)?.label || sf}
                <button class="opacity-60 hover:opacity-100 text-base-content/70" on:click={() => removeFilterTag('status', sf)}><XIcon class="w-3 h-3"/></button>
            </span>
        {/each}
        {#if jobTypeFilter}
             <span class="badge badge-lg bg-base-300 text-base-content gap-1.5 items-center">
                Тип: {jobTypeOptions.find(o => o.key === jobTypeFilter)?.label || jobTypeFilter}
                <button class="opacity-60 hover:opacity-100 text-base-content/70" on:click={() => removeFilterTag('jobType')}><XIcon class="w-3 h-3"/></button>
            </span>
        {/if}
        {#if activeFilterCount > 0}
        <BaseButton onclick={clearAllFilters} className="link text-primary hover:text-primary-focus text-sm normal-case !pl-2 !min-h-0 !h-auto !py-0.5">
            Очистить все
        </BaseButton>
        {/if}
    </div>
    {/if}

    <div class="space-y-4">
        {#if data.jobPosts && data.jobPosts.length > 0}
            {#each data.jobPosts as job (job.id)}
                {@const statusInfo = getJobStatusDisplay(job.status)}
                <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow rounded-xl border border-transparent hover:border-primary/30">
                    <div class="card-body p-5 md:p-6">
                        <div class="flex flex-col sm:flex-row justify-between items-start gap-3">
                            <div class="flex-grow min-w-0">
                                <h2 class="card-title text-lg md:text-xl hover:text-primary transition-colors">
                                    <a href={`/jobs/${job.id}`}>{job.title || "Без названия"}</a>
                                </h2>
                                <p class="text-xs text-base-content/70 mt-0.5 mb-1.5">
                                    Опубликовано: {formatDate(job.publicationDate || job.createdAt, true)}
                                </p>
                                <div class="flex items-center gap-2 flex-wrap">
                                    <span class="badge {statusInfo.className} badge-sm !font-medium">{statusInfo.text}</span>
                                    <span class="text-xs text-base-content/60">
                                        {#if job.status === JobEntityStatus.Draft}
                                            Черновик - Сохранено {formatDate(job.lastModifiedAt || job.createdAt)}
                                        {:else if job.status === JobEntityStatus.Open && job.expirationDate}
                                            Открыто до {formatDate(job.expirationDate)}
                                        {:else}
                                            Обновлено: {formatDate(job.lastModifiedAt || job.createdAt)}
                                        {/if}
                                    </span>
                                </div>
                            </div>
                            <div class="flex-shrink-0 flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                                <a href={`/jobs/${job.id}`} class="btn btn-sm btn-outline btn-primary w-full sm:w-auto">
                                    <EyeIcon class="w-4 h-4 mr-1"/> Посмотреть
                                </a>
                                {#if job.status === JobEntityStatus.Draft || job.status === JobEntityStatus.Open }
                                <a href={`/jobs/edit/${job.id}`} class="btn btn-sm btn-outline w-full sm:w-auto">
                                    <Edit3Icon class="w-4 h-4 mr-1"/> Редактировать
                                </a>
                                {/if}
                                </div>
                        </div>
                         {#if job.description}
                         <p class="text-sm text-base-content/80 mt-3 line-clamp-2 leading-relaxed">
                            {job.description}
                         </p>
                         {/if}
                    </div>
                </div>
            {/each}

             <div class="mt-10 flex justify-center">
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
            <div class="text-center py-16">
                <BriefcaseIcon class="mx-auto h-20 w-20 text-base-content/30 mb-4"/>
                <p class="text-xl text-base-content/70">У вас пока нет опубликованных вакансий.</p>
                <p class="text-sm text-base-content/60 mt-2">Готовы найти идеального исполнителя?</p>
                <a href="/jobs/post/name" class="btn btn-primary mt-6">Опубликовать первую вакансию</a>
            </div>
        {/if}
    </div>
</div>