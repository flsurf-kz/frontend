<script lang="ts">
	import type { ContractEntity, JobEntity, WorkSessionEntity } from "flsurf-client";
	import { ssrDynamicImportKey } from "vite/module-runner";

	export let available = 0;
	export let frozen = 0;
	export let pending = 0;

	export let pendingJobs: JobEntity[] = [];
	export let activeContracts: ContractEntity[] = [];
	export let workSessions: WorkSessionEntity[] = [];
</script>

<div class="max-w-4xl mx-auto p-6 space-y-6">
	<h1 class="text-2xl font-bold">Кошелёк</h1>

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="bg-green-100 p-4 rounded shadow text-center">
			<p class="text-sm text-gray-600">Доступно</p>
			<p class="text-xl font-bold text-green-700">₸{available}</p>
		</div>
		<div class="bg-blue-100 p-4 rounded shadow text-center">
			<p class="text-sm text-gray-600">Заморожено</p>
			<p class="text-xl font-bold text-blue-700">₸{frozen}</p>
		</div>
		<div class="bg-yellow-100 p-4 rounded shadow text-center">
			<p class="text-sm text-gray-600">На рассмотрении</p>
			<p class="text-xl font-bold text-yellow-700">₸{pending}</p>
		</div>
	</div>

	<!-- Заказы в ожидании -->
	<div>
		<h2 class="text-lg font-semibold mt-6 mb-2">Ожидают подтверждения</h2>
		{#if pendingJobs.length > 0}
			<ul class="divide-y border rounded bg-white">
				{#each pendingJobs as job}
					<li class="p-3">
						<p class="font-medium">{job.title}</p>
						<p class="text-sm text-gray-500">Оплата: ₸{job.payout?.amount}</p>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-gray-400 text-sm">Нет ожидающих заказов</p>
		{/if}
	</div>

	<!-- Контракты в работе -->
	<div>
		<h2 class="text-lg font-semibold mt-6 mb-2">В процессе</h2>
		{#if activeContracts.length > 0}
			<ul class="divide-y border rounded bg-white">
				{#each activeContracts as contract}
					<li class="p-3">
						<p class="font-medium">"СДЕЛАТЬ НАЗВАНИЯ КОНТРАКТОВ"</p>
						<p class="text-sm text-gray-500">Тип: {contract.budgetType}</p>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-gray-400 text-sm">Нет активных контрактов</p>
		{/if}
	</div>

	<!-- Сессии -->
	<div>
		<h2 class="text-lg font-semibold mt-6 mb-2">Сессии работы</h2>
		{#if workSessions.length > 0}
			<ul class="divide-y border rounded bg-white">
				{#each workSessions as s}
					<li class="p-3">
						<p class="font-medium">Сессия #{s.id}</p>
						<p class="text-sm text-gray-500">Длительность: {s.endDate?.getDate() ?? 0 - (s.startDate?.getDate() ?? 0)} ч.</p>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-gray-400 text-sm">Нет недавних сессий</p>
		{/if}
	</div>
</div>
