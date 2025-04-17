<script lang="ts">
	import type { IJobEntity } from 'flsurf-client';
	import { formatDistanceToNow, format } from 'date-fns';
	import { ru } from 'date-fns/locale';

	let { job } = $props();

	const formattedDate = job.publicationDate
		? format(job.publicationDate, "dd MMMM yyyy, HH:mm", { locale: ru })
		: "";

	const untilExpiration = job.expirationDate
		? formatDistanceToNow(job.expirationDate, { addSuffix: false, locale: ru })
		: "—";
</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<div class="space-y-4">
	<!-- Header -->
	<div class="flex justify-between items-start">
		<div>
			<h1 class="text-2xl font-bold">{job.title}</h1>
			<p class="text-sm text-gray-500 mt-1">
				{formattedDate} • {job.proposals?.length ?? 0} отклик • {job.views ?? 0} просмотров
			</p>
		</div>
		<div class="flex gap-3">
			<!-- Share -->
			<button class="text-gray-400 hover:text-black" title="Поделиться">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path d="M4 12v1a9 9 0 0018 0v-1M12 20V4m0 0L8 8m4-4l4 4" />
				</svg>
			</button>

			<!-- Bookmark -->
			<button class="text-gray-400 hover:text-black" title="Сохранить">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path d="M5 3v18l7-5 7 5V3H5z" />
				</svg>
			</button>
		</div>
	</div>

	<!-- Skills / Tags -->
	<div class="flex flex-wrap gap-2">
		{#each job.requiredSkills ?? [] as skill}
			<span class="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{skill.name}</span>
		{/each}
	</div>

	<!-- Description -->
	<div class="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
		{job.description}
	</div>

	<!-- Info Grid -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 mt-4">
		<div class="flex items-center gap-2">
			💰
			<div>
				<div class="font-medium">{job.payout?.amount} {job.payout?.currency}</div>
				<div class="text-xs text-gray-500">Оплата</div>
			</div>
		</div>
		<div class="flex items-center gap-2">
			🎯
			<div>
				<div class="font-medium">{job.level}</div>
				<div class="text-xs text-gray-500">Уровень исполнителя</div>
			</div>
		</div>
		<div class="flex items-center gap-2">
			⏰
			<div>
				<div class="font-medium">{untilExpiration}</div>
				<div class="text-xs text-gray-500">До закрытия</div>
			</div>
		</div>
	</div>
</div>
