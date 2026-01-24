<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { GetJobsListQueryEmployerLocation, JobEntityLevel, JobEntityStatus } from 'flsurf-client';

	const dispatch = createEventDispatcher();

	// Фильтры
	let categoryId = $state('');
	let levels = $state<JobEntityLevel[]>([]);
	let isHourly = $state<boolean | null>(null);
	let minBudget = $state(0);
	let maxBudget = $state(0);
	let minHourlyRate = $state(0);
	let maxHourlyRate = $state(0);
	let minProposals = $state(0);
	let maxProposals = $state(0);
	let minDurationDays = $state(0);
	let maxDurationDays = $state(0);
	let employerLocation = $state<GetJobsListQueryEmployerLocation | undefined>(undefined);
	let statuses = $state<JobEntityStatus[]>([]);

	function applyFilters() {
		dispatch('change', {
			categoryId: categoryId || undefined,
			levels: levels.length ? levels : undefined,
			isHourly: isHourly !== null ? isHourly : undefined,
			minBudget: minBudget > 0 ? minBudget : undefined,
			maxBudget: maxBudget > 0 ? maxBudget : undefined,
			minHourlyRate: minHourlyRate > 0 ? minHourlyRate : undefined,
			maxHourlyRate: maxHourlyRate > 0 ? maxHourlyRate : undefined,
			minProposals: minProposals > 0 ? minProposals : undefined,
			maxProposals: maxProposals > 0 ? maxProposals : undefined,
			minDurationDays: minDurationDays > 0 ? minDurationDays : undefined,
			maxDurationDays: maxDurationDays > 0 ? maxDurationDays : undefined,
			employerLocation,
			statuses: statuses.length ? statuses : undefined
		});
	}

	function toggle<T>(arr: T[], val: T): T[] {
		return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
	}

	function toggleLevel(level: JobEntityLevel) {
		levels = toggle<JobEntityLevel>(levels, level);
		applyFilters();
	}

	function toggleStatus(status: JobEntityStatus) {
		statuses = toggle(statuses, status);
		applyFilters();
	}
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<form class="space-y-4 w-full lg:w-64">
	<!-- Категория -->
	<div>
		<label class="label">Категория</label>
		<input class="input input-bordered w-full" bind:value={categoryId} onchange={applyFilters} />
	</div>

	<!-- Уровень -->
	<div>
		<label class="label">Опыт</label>
		<label><input type="checkbox" onchange={() => toggleLevel(JobEntityLevel.Beginner)} /> Junior</label>
		<label><input type="checkbox" onchange={() => toggleLevel(JobEntityLevel.Intermediate)} /> Mid</label>
		<label><input type="checkbox" onchange={() => toggleLevel(JobEntityLevel.Expert)} /> Senior</label>
	</div>

	<!-- Тип -->
	<div>
		<label class="label">Тип оплаты</label>
		<select class="select select-bordered w-full" bind:value={isHourly} onchange={applyFilters}>
			<option value="">Любой</option>
			<option value={true}>Почасовая</option>
			<option value={false}>Фиксированная</option>
		</select>
	</div>

	<!-- Бюджет -->
	<div>
		<label class="label">Фикс. прибыль</label>
		<div class="flex gap-2">
			<input type="number" class="input input-bordered w-full" placeholder="мин." bind:value={minBudget} onchange={applyFilters} />
			<input type="number" class="input input-bordered w-full" placeholder="макс." bind:value={maxBudget} onchange={applyFilters} />
		</div>
	</div>

	<!-- Ставка -->
	<div>
		<label class="label">Ставка ($/ч)</label>
		<div class="flex gap-2">
			<input type="number" class="input input-bordered w-full" placeholder="мин." bind:value={minHourlyRate} onchange={applyFilters} />
			<input type="number" class="input input-bordered w-full" placeholder="макс." bind:value={maxHourlyRate} onchange={applyFilters} />
		</div>
	</div>

	<!-- Кол-во предложений -->
	<div>
		<label class="label">Количество предложений</label>
		<div class="flex gap-2">
			<input type="number" class="input input-bordered w-full" bind:value={minProposals} onchange={applyFilters} />
			<input type="number" class="input input-bordered w-full" bind:value={maxProposals} onchange={applyFilters} />
		</div>
	</div>

	<!-- Длительность -->
	<div>
		<label class="label">Длительность (дней)</label>
		<div class="flex gap-2">
			<input type="number" class="input input-bordered w-full" bind:value={minDurationDays} onchange={applyFilters} />
			<input type="number" class="input input-bordered w-full" bind:value={maxDurationDays} onchange={applyFilters} />
		</div>
	</div>

	<!-- Локация -->
	<div>
		<label class="label">Локация заказчика</label>
		<input class="input input-bordered w-full" bind:value={employerLocation} onchange={applyFilters} />
	</div>

	<!-- Статус -->
	<div>
		<label class="label">Статус</label>
		<label><input type="checkbox" onchange={() => toggleStatus(JobEntityStatus.Open)} /> Open</label>
		<label><input type="checkbox" onchange={() => toggleStatus(JobEntityStatus.InContract)} /> In Progress</label>
		<label><input type="checkbox" onchange={() => toggleStatus(JobEntityStatus.Closed)} /> Closed</label>
	</div>
</form>
