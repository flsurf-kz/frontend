<script lang="ts">
	import { goto } from '$app/navigation';
	import { JobEntityBudgetType, type JobEntity } from 'flsurf-client';

	let { job }: { job: JobEntity } = $props();

	// Примерная логика определения оплаты и ставок
	const hourlyRate = job.payout?.amount && job.budgetType === JobEntityBudgetType.Hourly
		? `${job.payout.amount}$/час`
		: '';

	const proposalCount =
		job.proposals?.length && job.proposals.length > 10
			? 'Ставок: Больше чем 10'
			: `Ставок: ${job.proposals?.length ?? 0}`;

	const employerName = job.employer?.fullname ?? job.employer?.name ?? 'Без имени';
	const location = job.employer?.location ?? 'Неизвестно';

	const tags = job.requiredSkills?.map((s) => s.name) ?? [];
</script>

<div class="p-4 border rounded-xl shadow-sm bg-white space-y-3 relative">
	<a
		href="/jobs/{job.id}"
		class="absolute inset-0 z-10"
		aria-label="Перейти к { job.id }"
	></a>
	<div class="flex justify-between items-start">
		<div class="space-y-1">
			<h3 class="text-lg font-semibold">{job.title}</h3>
			<div class="flex items-center gap-2 text-sm text-gray-600">
				<span class="font-medium">{employerName}</span>
				<span>•</span>
				<span class="inline-flex items-center gap-1">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 .552-.224 1.052-.586 1.414a2 2 0 01-2.828 0A1.999 1.999 0 018 11a2 2 0 114 0z" /></svg>
					{location}
				</span>
			</div>
			{#if job.budgetType === JobEntityBudgetType.Hourly}
				<p class="text-sm text-gray-700">Почасовая оплата - {job.payout?.amount ?? '?'} {job.payout?.currency ?? ''}</p>
			{/if}
		</div>
		{#if hourlyRate}
			<div class="text-sm font-semibold text-green-500 whitespace-nowrap">{hourlyRate}</div>
		{/if}
	</div>

	<p class="text-sm text-gray-800 line-clamp-2">{job.description}</p>

	<div class="flex flex-wrap gap-2">
		{#each tags.slice(0, 5) as tag}
			<span class="badge badge-outline">{tag}</span>
		{/each}
	</div>

	<p class="text-xs text-gray-500 mt-2">{proposalCount}</p>
</div>
