<script lang="ts">
	import JobShortCard from '$lib/entities/job/ui/job-short-card.svelte';
	import { CurrentUser } from '$lib/entities/user/model/modal';
	import { UserAvatar } from '$lib/shared/ui/icons';
	import type { FreelancerProfileEntity, JobEntity, PortfolioProjectEntity } from 'flsurf-client';

	export let data: {
		userId: string;
		profile: FreelancerProfileEntity;
		projects: PortfolioProjectEntity[];
		jobs: JobEntity[];
	};
</script>

<div class="grid lg:grid-cols-3 gap-6">
	<!-- Левая колонка -->
	<div class="col-span-2 space-y-6">
		<!-- Профиль -->
		<div class="p-6 rounded border bg-base-100">
			<div class="flex items-start gap-4">
				<UserAvatar imageUrl={data.profile.user?.avatar?.filePath} className="xl" />
				<div>
					<h2 class="text-xl font-bold">{data.profile.user?.fullname}</h2>
					<p class="text-sm text-gray-500">
						{data.profile.user?.location} – 19 лет
					</p>
				</div>
			</div>

			<div class="mt-4 space-y-1">
				<h3 class="text-lg font-medium">{data.profile.user?.fullname}</h3>
				<p class="text-sm text-gray-700 whitespace-pre-line">{data.profile.experience}</p>
			</div>

			{#if data.profile.costPerHour}
				<div class="mt-2 font-semibold text-green-600 text-right">
					₸{data.profile.costPerHour}/час
				</div>
			{/if}
		</div>

		<!-- Портфолио -->
		{#if data.projects.length > 0}
			<div class="p-6 rounded border bg-base-100">
				<h3 class="text-lg font-bold mb-4">Портфолио</h3>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					{#each data.projects as p}
						<div class="border p-2 rounded bg-base-200 text-center">
							<img src={p.images?.[0]?.filePath} alt={p.name} class="w-full h-32 object-cover rounded mb-2" />
							<p class="text-sm font-semibold">{p.name}</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Навыки -->
		{#if data.profile.skills?.length}
			<div class="p-6 rounded border bg-base-100">
				<h3 class="text-lg font-bold mb-4">Навыки</h3>
				<div class="flex flex-wrap gap-2">
					{#each data.profile.skills as skill}
						<span class="badge badge-outline">{skill.name}</span>
					{/each}
				</div>
			</div>
		{/if}

		<!-- История работы -->
		{#if data.jobs.length > 0}
			<div class="p-6 rounded border bg-base-100">
				<h3 class="text-lg font-bold mb-4">История работы</h3>
				<div class="space-y-4">
					{#each data.jobs as job}
						<JobShortCard {job} />
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Правая колонка -->
	<div class="space-y-6">
		<!-- Статистика -->
		<div class="p-4 border rounded bg-base-100">
			<h3 class="font-bold mb-2">Статистика фрилансера</h3>
			<ul class="text-sm space-y-1">
				<li>Завершенные заказы: 0</li>
				<li>В поиске исполнителя: 1</li>
				<li>В арбитраже: 0</li>
				<li>Отзывы: +0 / -0</li>
			</ul>
		</div>

		<!-- Верификация -->
		<div class="p-4 border rounded bg-base-100">
			<h3 class="font-bold mb-2">Верификация</h3>
			<p class="text-sm">Пользователь верифицирован по номеру, имеет Премиум</p>
		</div>

		<!-- Подключенные аккаунты -->
		<div class="p-4 border rounded bg-base-100">
			<h3 class="font-bold mb-2">Подключенные аккаунты</h3>
			<p class="text-sm">Подключен Telegram</p>
		</div>
	</div>
</div>
