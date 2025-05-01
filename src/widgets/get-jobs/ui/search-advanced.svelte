<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { JobEntityStatus, type GetJobsListQueryEmployerLocation } from 'flsurf-client';
	import ModalBase from '$lib/shared/ui/modal/modal-base.svelte';

    let { open, onclose }: { open: boolean, onclose: () => void} = $props(); 

	const dispatch = createEventDispatcher();

	// Расширенные фильтры
	let minHourlyRate = $state(0);
	let maxHourlyRate = $state(0);
	let minProposals = $state(0);
	let maxProposals = $state(0);
	let minDurationDays = $state(0);
	let maxDurationDays = $state(0);
	let employerLocation = $state<GetJobsListQueryEmployerLocation | undefined>(undefined);
	let statuses = $state<JobEntityStatus[]>([]);

	function toggleStatus(status: JobEntityStatus) {
		statuses = statuses.includes(status)
			? statuses.filter((s) => s !== status)
			: [...statuses, status];
	}

	function applyFilters() {
		dispatch('apply', {
			minHourlyRate: minHourlyRate > 0 ? minHourlyRate : undefined,
			maxHourlyRate: maxHourlyRate > 0 ? maxHourlyRate : undefined,
			minProposals: minProposals > 0 ? minProposals : undefined,
			maxProposals: maxProposals > 0 ? maxProposals : undefined,
			minDurationDays: minDurationDays > 0 ? minDurationDays : undefined,
			maxDurationDays: maxDurationDays > 0 ? maxDurationDays : undefined,
			employerLocation: employerLocation || undefined,
			statuses: statuses.length ? statuses : undefined
		});
		onclose();
	}
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<ModalBase {open} onClose={onclose}>
	<h2 class="text-lg font-bold mb-4">Продвинутый поиск</h2>

	<div class="space-y-4">
		<!-- Почасовая ставка -->
		<div>
			<label class="label">Почасовая ставка ($/ч)</label>
			<div class="flex gap-2">
				<input class="input input-bordered w-full" type="number" placeholder="мин." bind:value={minHourlyRate} />
				<input class="input input-bordered w-full" type="number" placeholder="макс." bind:value={maxHourlyRate} />
			</div>
		</div>

		<!-- Кол-во предложений -->
		<div>
			<label class="label">Количество предложений</label>
			<div class="flex gap-2">
				<input class="input input-bordered w-full" type="number" placeholder="мин." bind:value={minProposals} />
				<input class="input input-bordered w-full" type="number" placeholder="макс." bind:value={maxProposals} />
			</div>
		</div>

		<!-- Длительность -->
		<div>
			<label class="label">Длительность (дни)</label>
			<div class="flex gap-2">
				<input class="input input-bordered w-full" type="number" placeholder="мин." bind:value={minDurationDays} />
				<input class="input input-bordered w-full" type="number" placeholder="макс." bind:value={maxDurationDays} />
			</div>
		</div>

		<!-- Локация -->
		<div>
			<label class="label">Локация заказчика</label>
			<input class="input input-bordered w-full" placeholder="Напр. Казахстан, Алматы" bind:value={employerLocation} />
		</div>

		<!-- Статусы -->
		<div>
			<label class="label">Статус</label>
			<div class="space-y-1">
				<label><input type="checkbox" onchange={() => toggleStatus(JobEntityStatus.Open)} /> Open</label>
				<label><input type="checkbox" onchange={() => toggleStatus(JobEntityStatus.InContract)} /> In Progress</label>
				<label><input type="checkbox" onchange={() => toggleStatus(JobEntityStatus.Closed)} /> Closed</label>
			</div>
		</div>

		<div class="flex justify-end mt-4">
			<button class="btn btn-success" onclick={applyFilters}>Применить</button>
		</div>
	</div>
</ModalBase>
