<script lang="ts">
	import { goto } from '$app/navigation';
	import { GlobalClient } from '$lib/shared/api';
	import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
	import { InputField } from '$lib/shared/ui/inputs';
	import TextField from '$lib/shared/ui/inputs/text-field.svelte';
	import { JobEntity, SubmitProposalCommand } from 'flsurf-client';
	import type { PageProps } from './$types';
	import ChoicesField from '$lib/shared/ui/inputs/choices-field.svelte';
	import type { SelectItem } from '$lib/shared/types';

	let { data }: PageProps  = $props();
	let { currentUser, job } = data;

	let proposedRate = $state('');
	let coverLetter = $state('');
	let milestoneMode = $state(true); // true = by milestone, false = by project
	let milestones = $state([{ description: '', dueDate: '', amount: '' }]);
	let projectDuration = $state('');
	let isSubmitting = $state(false);
	let error = $state('');
	let submitted = $state(false);

	const durationOptions: SelectItem[] = [
		{ key: 'short', label: 'Менее недели' },
		{ key: 'medium', label: '1-4 недели' },
		{ key: 'long', label: '1-3 месяца' },
		{ key: 'very_long', label: 'Более 3 месяцев' }
	];

	function addMilestone() {
		milestones = [...milestones, { description: '', dueDate: '', amount: '' }];
	}

	async function submit() {
		isSubmitting = true;
		error = '';
		try {
			await GlobalClient.submitProposal(new SubmitProposalCommand({
				jobId: job.id,
				proposedRate: parseFloat(proposedRate),
				coverLetter,
			}));
			submitted = true;
			goto(`/job/${job.id}`);
		} catch (e) {
			error = 'Ошибка при отправке. Попробуйте позже.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

{#if submitted}
	<p class="text-green-600 font-medium">Ваша ставка отправлена!</p>
{:else}
	<div class="max-w-3xl flex-col justify-center p-6 bg-white rounded-lg shadow space-y-6 min-w-50">
		<h1 class="text-2xl font-bold">Отправить предложение</h1>

		<!-- Job Overview -->
		<div class="bg-gray-50 p-4 rounded border space-y-2">
			<p><strong>Название:</strong> {job.title}</p>
			<p><strong>Описание:</strong> {job.description}</p>
			<p><strong>Бюджет:</strong> {job.payout?.amount ?? '—'} ₸</p>
			<p><strong>Уровень:</strong> {job.level}</p>
			<p><strong>Тип оплаты:</strong> {job.budgetType}</p>
		</div>

		<!-- Оплата -->
		<div class="space-y-4">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="font-medium">Как вы хотите получать оплату?</label>
			<div class="flex gap-6">
				<label><input type="radio" bind:group={milestoneMode} value={true}/> По этапам</label>
				<label><input type="radio" bind:group={milestoneMode} value={false}/> За проект</label>
			</div>

			{#if milestoneMode}
				<!-- По этапам -->
				{#each milestones as milestone, index (index)}
					<div class="grid grid-cols-3 gap-4 items-end">
						<InputField label="Описание" bind:value={milestones[index].description} />
						<InputField label="Дата завершения" inputType="date" bind:value={milestones[index].dueDate} />
						<InputField label="Сумма (₸)" inputType="number" bind:value={milestones[index].amount} />
					</div>
				{/each}
				<button type="button" class="text-blue-500 text-sm mt-2" on:click={addMilestone}>+ Добавить этап</button>
			{:else}
				<!-- За проект -->
				<InputField label="Общая сумма (₸)" inputType="number" bind:value={proposedRate} />
			{/if}
		</div>

		<ChoicesField
			label="Как долго продлится проект?"
			bind:value={projectDuration}
			options={durationOptions}
		/>


		<!-- Письмо -->
		<TextField
			label="Сопроводительное письмо"
			placeholder="Расскажите, почему вы подходите..."
			bind:value={coverLetter}
			rows={6}
		/>

		<!-- Файлы и портфолио -->
		<div>
			<p class="text-sm font-medium mb-1">Файлы (до 10, макс. 25MB)</p>
			<input type="file" multiple class="file-input file-input-sm w-full max-w-xs" />
		</div>

		<!-- Ошибки -->
		{#if error}
			<p class="text-sm text-red-500">{error}</p>
		{/if}

		<!-- Действия -->
		<div class="flex justify-end gap-4">
			<BaseButton className="gray" onclick={() => history.back()}>Отмена</BaseButton>
			<BaseButton className="success" onclick={submit} disabled={isSubmitting}>
				{isSubmitting ? 'Отправка...' : 'Отправить'}
			</BaseButton>
		</div>
	</div>
{/if}

<style>
	input[type='radio'] {
		accent-color: #22c55e;
	}
</style>
