<script lang="ts">
	import { GlobalClient } from '$lib/shared/api';
	import { GetJobsListQuery } from 'flsurf-client';
	import type { JobEntity } from 'flsurf-client';
	import JobFilters from './job-filters.svelte';
	import SearchField from '$lib/shared/ui/inputs/search-field.svelte';
	import SortChoicesField from '$lib/shared/ui/inputs/sort-choices-field.svelte';
	import { PagePagination } from '$lib/shared/ui/navigation';
	import JobShortCard from '$lib/entities/job/ui/job-short-card.svelte';
	import SearchAdvanced from './search-advanced.svelte';
	import { getJobs } from '$lib/entities/job/models/modal';
	$effect(() => {(async () => {
		
		// при желании можно сразу загрузить свежий список через API
		await loadJobs();
	})()});
	let search = $state('');
	let filters = $state({});
	let sort = $state('newest');
	let currentPage = $state(1);
	let pageSize = $state(10);
	let totalPages = $state(1);

	let jobs = $state<JobEntity[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let isAdvancedOpen = $state(false);

  async function loadJobs() {
    loading = true;
    error = null;

    try {
      const { jobs: result, total } = await getJobs({
        search,
        // sortBy: sort,
        page: currentPage,
        limit: pageSize,
        ...filters
      });

      jobs = result;
      totalPages = total ? Math.ceil(total / pageSize) : 1;
    } catch (e) {
      error = 'Ошибка загрузки заказов';
      console.error(e);
    } finally {
      loading = false;
    }
  }

	function handleFiltersChange(newFilters: any) {
		filters = newFilters;
		currentPage = 1;
		loadJobs();
	}

	function handleSearch(value: string) {
		search = value;
		currentPage = 1;
		loadJobs();
	}

	function handleSortChange(value: string) {
		sort = value;
		loadJobs();
	}
</script>

<div class="container mx-auto px-4 py-6 space-y-4">
	<h1 class="text-2xl font-semibold">Доступные заказы</h1>

	<!-- Search + Sort -->
	<div class="flex flex-col md:flex-row justify-between gap-4">
		<div class="flex-1 flex gap-2 items-center">
			<SearchField bind:value={search} on:change={(e) => handleSearch(e.detail)} />
			<button class="text-green-500 text-sm underline" onclick={() => (isAdvancedOpen = true)}>
				Продвинутый поиск
			</button>
		</div>
		<SortChoicesField bind:selected={sort} on:change={(e) => handleSortChange(e.detail)} />
	</div>

  <!-- svelte-ignore a11y_label_has_associated_control -->
	<!-- Filters + Jobs -->
	<div class="flex flex-col lg:flex-row gap-6">
		<JobFilters on:change={(e) => handleFiltersChange(e.detail)} />

		<div class="flex-1 space-y-6">
			{#if loading}
				<p class="text-center text-sm">Загрузка...</p>
			{:else if error}
				<p class="text-center text-red-500">{error}</p>
			{:else if jobs?.length === 0}
				<p class="text-center text-gray-600">Нет заказов</p>
			{:else}

				<div class="flex flex-col gap-4">
					{#each jobs as job}
						<JobShortCard {job} />
					{/each}
				</div>
				<div class="flex justify-between items-center mt-4">
					<div class="flex items-center gap-2 text-sm">
						<label>На странице:</label>
						<select class="select select-bordered" bind:value={pageSize}>
							<option value="5">5</option>
							<option value="10">10</option>
							<option value="20">20</option>
						</select>
					</div>
					<PagePagination currentPage={currentPage} totalPages={totalPages} on:pageChange={() => loadJobs()} />
				</div>
			{/if}
		</div>
	</div>

	{#if isAdvancedOpen}
		<SearchAdvanced open={isAdvancedOpen} onclose={() => (isAdvancedOpen = false)} />
	{/if}
</div>
