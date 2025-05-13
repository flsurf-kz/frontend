<script lang="ts">
	import { goto } from '$app/navigation';
	import {
	  JobEntityBudgetType,
	  JobEntityStatus,
	  type JobEntity
	} from 'flsurf-client';
  
	export let job: JobEntity;
  
	// Оплата
	const hourlyRate =
	  job.budgetType === JobEntityBudgetType.Hourly && job.payout?.amount
		? `${job.payout.amount}$ / час`
		: '';
  
	// Ставки
	const proposalCount =
	  (job.proposals?.length ?? 0) > 10
		? 'Ставок: Больше чем 10'
		: `Ставок: ${job.proposals?.length ?? 0}`;
  
	// Инфо о работодателе
	const employerName = job.employer?.fullname
	  ?? job.employer?.name
	  ?? 'Без имени';
	const location = job.employer?.location ?? 'Неизвестно';
  
	// Теги
	const tags = job.requiredSkills?.map(s => s.name) ?? [];
  </script>
  
  <article
	class="card bg-base-100 text-base-content shadow-md rounded-xl p-6 relative overflow-hidden"
  >
	<!-- Полностью кликабельный фон -->
	<a
	  class="absolute inset-0 z-10"
	  aria-label="Перейти к вакансии"
	  href="/jobs/{job.id}"
	></a>
  
	<!-- Заголовок + ставка -->
	<div class="flex justify-between items-start">
	  <div class="space-y-1">
		{#if job.status === JobEntityStatus.Closed} 
			<p class="text-xl text-yellow-200">Работа уже закрыта</p>
		{/if}
		<h3 class="text-xl font-bold">{job.title}</h3>
		<div class="flex items-center text-sm opacity-60 space-x-2">
		  <span class="font-medium">{employerName}</span>
		  <span>·</span>
		  <svg
			xmlns="http://www.w3.org/2000/svg"
			class="w-4 h-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		  >
			<path
			  stroke-linecap="round"
			  stroke-linejoin="round"
			  stroke-width="2"
			  d="M12 11c0 .552-.224 1.052-.586 1.414a2 2 0 01-2.828 0A1.999 1.999 0 018 11a2 2 0 114 0z"
			/>
		  </svg>
		  <span>{location}</span>
		</div>
  
		{#if job.budgetType === JobEntityBudgetType.Hourly}
		  <p class="text-sm opacity-80 mt-1">
			Почасовая оплата – {job.payout?.amount ?? '?'} {job.payout?.currency ?? ''}
		  </p>
		{/if}
	  </div>
  
	  {#if hourlyRate}
		<div class="text-lg font-semibold text-green-500 whitespace-nowrap">
		  {hourlyRate}
		</div>
	  {/if}
	</div>
  
	<!-- Описание -->
	<p class="mt-4 text-base opacity-90 line-clamp-2">
	  {job.description}
	</p>
  
	<!-- Теги -->
	<div class="mt-4 flex flex-wrap gap-2">
	  {#each tags.slice(0,5) as tag}
		<span class="badge badge-outline">{tag}</span>
	  {/each}
	  {#if tags.length > 5}
		<span class="badge badge-outline">+{tags.length - 5}</span>
	  {/if}
	</div>
  
	<!-- Ставки -->
	<p class="mt-4 text-sm opacity-60">{proposalCount}</p>
  </article>
  