<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import JobShortCard from '$lib/entities/job/ui/job-short-card.svelte';
	import { PagePagination } from '$lib/shared/ui/navigation';
	import type { BookmarkedJobEntity } from 'flsurf-client';

	/* props из load */
	export let data: {
		list:        BookmarkedJobEntity[];
		page:        number;
		pageSize:    number;
		totalPages:  number;
	};

	/* helper: менять query‑строку без перезагрузки */
	function nav(p: number, size = data.pageSize) {
		const q = new URLSearchParams(page.url.searchParams);
		q.set('page',      String(p));
		q.set('pageSize',  String(size));
		goto(`?${q.toString()}`, { keepFocus: true, noScroll: true, invalidateAll: true });
	}
</script>

<div class="max-w-5xl p-6 space-y-6">

	<h1 class="text-3xl font-bold">Сохраненные заказы</h1>

	{#if data.list.length}
		<div class="grid gap-6 lg:grid-cols-2">
			{#each data.list as b}
				<JobShortCard job={b.job} />
			{/each}
		</div>

		<!-- pagination -->
		<PagePagination
			currentPage={data.page}
			totalPages={data.totalPages}
			pageSize={data.pageSize}
			on:pageChange={(e)=> nav(e.detail.page)}
			on:pageSizeChange={(e)=> nav(1, e.detail.size)} />
	{:else}
		<p class="opacity-60">Вы пока что не сохранили никакие заказы.</p>
	{/if}
</div>
