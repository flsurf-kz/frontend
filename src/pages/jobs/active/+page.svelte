<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import type { JobEntity } from 'flsurf-client';
    import JobShortCard from '$lib/entities/job/ui/job-short-card.svelte';
    import SearchField from '$lib/shared/ui/inputs/search-field.svelte';
    import SortChoicesField from '$lib/shared/ui/inputs/sort-choices-field.svelte';
    import { PagePagination } from '$lib/shared/ui/navigation';

    // данные из load()
    export let data: {
        jobs: JobEntity[];
        filters: {
            search: string;
            page: number;
            limit: number;
            sort: string;
        };
    };

    // локальные привязки
    let search = data.filters.search;
    let currentPage = data.filters.page;
    let pageSize = data.filters.limit;
    let sort = data.filters.sort;

    // перенести все текущие query-параметры в URL и перезагрузить страницу
    function updateUrl() {
        const params = new URLSearchParams($page.url.searchParams);
        if (search)  params.set('search', search);
        else         params.delete('search');

        params.set('page', String(currentPage));
        params.set('limit', String(pageSize));

        if (sort)    params.set('sort', sort);
        else         params.delete('sort');

        goto(`${$page.url.pathname}?${params.toString()}`, { keepFocus: true });
    }

    function onSearch(value: string) {
        search = value;
        currentPage = 1;
        updateUrl();
    }

    function onSortChange(value: string) {
        sort = value;
        updateUrl();
    }

    function onPageChange(newPage: number) {
        currentPage = newPage;
        updateUrl();
    }
</script>

<div class="container mx-auto px-4 py-6 space-y-6">
    <h1 class="text-2xl font-semibold">Активные вакансии</h1>

    <!-- Поиск + Сортировка -->
    <div class="flex flex-col md:flex-row justify-between gap-4">
        <SearchField
            bind:value={search}
            on:change={(e) => onSearch(e.detail)} />
        <SortChoicesField
            bind:selected={sort}
            on:change={(e) => onSortChange(e.detail)} />
    </div>

    <!-- Список карточек -->
    {#if data.jobs.length === 0}
        <p class="text-center text-gray-500">Нет активных вакансий.</p>
    {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each data.jobs as job (job.id)}
                <JobShortCard {job} />
            {/each}
        </div>
    {/if}

    <!-- Пагинация -->
    <div class="flex justify-center mt-6">
        <PagePagination
            currentPage={currentPage}
            pageSize={pageSize}
            on:pageChange={(e) => onPageChange(e.detail)}
        />
    </div>
</div>

<style>
    /* при необходимости добавьте свои стили */
</style>
