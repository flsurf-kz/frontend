<script lang="ts">
	import { HeadedSection } from "$lib/shared/ui/sections";
import type { JobEntity, NotificationEntity, WorkSessionEntity } from "flsurf-client";

	/* данные из load */
	export let data: {
		stats:            any;
		notifications:    NotificationEntity[];
		recommendedJobs:  JobEntity[];
		recentSessions:   WorkSessionEntity[];
	};

	const { stats } = data;
</script>

<!-- ───────────────────────── page container ────────────────────── -->
<div class="max-w-6xl mx-auto p-6 space-y-8">

	<!-- Greeting + quick numbers -->
	<section class="flex flex-col gap-4 sm:flex-row sm:items-center">
		<h1 class="text-3xl font-bold">Добро пожаловать 👋</h1>

		<div class="stats bg-base-200 shadow grow">
			<div class="stat">
				<div class="stat-title">Заработано за 12 мес.</div>
				<div class="stat-value">
					₸{(stats?.yearEarn ?? 0).toLocaleString()}
				</div>
			</div>
			<div class="stat">
				<div class="stat-title">Активные контракты</div>
				<div class="stat-value">{stats?.activeContracts ?? 0}</div>
			</div>
			<div class="stat">
				<div class="stat-title">Открытых предложений</div>
				<div class="stat-value">{stats?.pendingProposals ?? 0}</div>
			</div>
		</div>
	</section>

	<!-- 1. Latest notifications -->
	<HeadedSection title="Недавние события">
		{#each data.notifications as n}
			<li class="flex gap-3 items-start py-2 border-b border-base-300 last:border-0">
				<div class="w-2 mt-1.5 h-2 rounded-full bg-primary"></div>
				<div class="flex-1">
					<p class="font-medium">{n.title}</p>
					<p class="text-sm opacity-70">{n.text}</p>
				</div>
				<span class="text-xs opacity-60">{new Date(n.createdAt).toLocaleDateString()}</span>
			</li>
		{:else}
			<p class="opacity-60 p-4">Новых событий нет.</p>
		{/each}
	</HeadedSection>

	<!-- 2. Recommended jobs -->
	<HeadedSection title="Рекомендуемые проекты">
		{#each data.recommendedJobs as j}
			<a href={`/jobs/${j.id}`} class="block px-4 py-3 hover:bg-base-200 rounded-lg">
				<p class="font-medium">{j.title}</p>
				<p class="text-xs opacity-70 truncate">{j.description}</p>
				<span class="badge badge-outline badge-sm mt-1">
					{j.budgetType === 'Hourly' ? `${j.payout?.amount}₸/ч` : 'Fixed'}
				</span>
			</a>
		{:else}
			<p class="opacity-60 p-4">Пока ничего не нашлось — заполните профиль!</p>
		{/each}
		<div class="text-right m-3">
			<a href="/jobs" class="link link-primary">Все проекты →</a>
		</div>
	</HeadedSection>

	<!-- 3. Recent work‑sessions -->
	<HeadedSection title="Недавние рабочие сессии">
		<table class="table table-zebra text-sm">
			<thead>
				<tr>
					<th>Проект</th><th>Дата</th><th>Длительность</th><th>↗</th>
				</tr>
			</thead>
			<tbody>
				{#each data.recentSessions as s}
					<tr>
						<td class="truncate">
							<a href={`/contracts/${s.contractId}`} class="link">
								{s.comment ?? s.contractId}
							</a>
						</td>
						<td>{new Date(s.startDate ?? "").toLocaleDateString()}</td>
						<td>
							{#if s.endDate}
								{Math.round((+new Date(s.endDate)-+new Date(s.startDate ?? ""))/36e5)} ч
							{:else}—{/if}
						</td>
						<td>
							<a class="btn btn-ghost btn-xs" href={`/sessions/${s.id}`}>open</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</HeadedSection>
</div>

