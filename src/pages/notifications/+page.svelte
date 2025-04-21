<script lang="ts">
	import { goto } from '$app/navigation';
	import { ChoicesField } from '$lib/shared/ui/inputs';
	import { PagePagination } from '$lib/shared/ui/navigation';

	export let data;
	let { notifications, meta } = data;

    function updateQuery(params: Record<string, string | number>) {
    	const q = new URLSearchParams({
    		type: params.type?.toString() ?? meta.type,
    		page: params.page?.toString() ?? meta.currentPage.toString(),
    		limit: params.limit?.toString() ?? meta.pageSize.toString()
    	}).toString();

    	goto(`/notifications?${q}`, { replaceState: true });
    }
</script>

<div class="max-w-3xl mx-auto py-6 px-4 space-y-6">
	<h1 class="text-2xl font-bold">Уведомления</h1>

	<ChoicesField
		label="Тип уведомлений"
		bind:value={meta.type}
		options={[
			{ key: 'all', label: 'Все' },
			{ key: 'System', label: 'Системные' },
			{ key: 'Payment', label: 'Платёжные' },
			{ key: 'Other', label: 'Прочее' }
		]}
		on:change={() => updateQuery({ type: meta.type, page: 1 })}
	/>

	<ul class="divide-y border rounded bg-white mt-4">
		{#each notifications as n}
			<li class="p-4">
				<p class="font-semibold">{n.title}</p>
				<p class="text-sm text-gray-600">{n.text}</p>
			</li>
		{/each}
	</ul>

	<PagePagination
		currentPage={meta.currentPage}
		totalPages={Math.ceil(meta.total / meta.pageSize)}
		pageSize={meta.pageSize}
		on:pageChange={(e) => updateQuery({ page: e.detail })}
		on:pageSizeChange={(e) => updateQuery({ limit: e.detail, page: 1 })}
	/>
</div>
