<script lang="ts">
	import type { ProposalEntity } from 'flsurf-client';
	export let p: ProposalEntity;

	const started = new Date(p.createdAt).toLocaleDateString(undefined, {
		month: 'short', day: 'numeric', year: 'numeric'
	});
</script>

<a class="block border-t border-base-300 px-4 py-3 hover:bg-base-200/40"
   href={`/jobs/${p.jobId}`}>
	<div class="flex justify-between items-center">
		<div class="text-sm">
			<p class="font-medium">
				Создан {started}
			</p>
			<p class="text-xs opacity-70">
				{Math.round((Date.now()-+new Date(p.createdAt))/1000)} секунд назад
			</p>
		</div>
		<span class="badge badge-success badge-outline">
			{p.status}
		</span>
	</div>

	<h3 class="mt-2 link link-hover text-primary">
		{p.job?.title}
	</h3>

	<p class="text-xs opacity-70 mt-1">
		{p.job?.category?.name ?? 'Общая категория'}
	</p>
</a>
