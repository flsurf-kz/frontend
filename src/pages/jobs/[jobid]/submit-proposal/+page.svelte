<script lang="ts">
	import { goto } from '$app/navigation';
	import { GlobalClient } from '$lib/shared/api';
	import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
	import { InputField } from '$lib/shared/ui/inputs';
	import TextField from '$lib/shared/ui/inputs/text-field.svelte';
	import { SubmitProposalCommand } from 'flsurf-client';

	let { job } = $props();

	let proposedRate = $state('');
	let coverLetter = $state('');
	let isSubmitting = $state(false);
	let error = $state('');
	let submitted = $state(false);

	async function submit() {
		isSubmitting = true;
		error = '';
		try {
			await GlobalClient.submitProposal(new SubmitProposalCommand({
				jobId: job.jobId,
				proposedRate: parseFloat(proposedRate),
				coverLetter: coverLetter, 
			}))
			submitted = true;
			goto(`/job/${job.jobId}`);
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
	<div class="space-y-6 max-w-2xl mx-auto bg-white border rounded-lg shadow-sm p-6">
		<h1 class="text-2xl font-bold">Отправить предложение</h1>
		<p class="text-gray-600">Заказ: <span class="font-medium">{job.title}</span></p>

		<!-- Цена -->
		<InputField
			label="Предложенная цена (в ₸)"
			inputType="number"
			bind:value={proposedRate}
			required
		/>

		<!-- Сообщение -->
		<TextField
			label="Сопроводительное письмо"
			placeholder="Расскажите, почему вы подходите..."
			bind:value={coverLetter}
			rows={6}
		/>

		<!-- Прикрепление файлов -->
		<!-- {#if FileUploader} <FileUploader bind:files={attachedFiles}/> {/if} -->

		{#if error}
			<p class="text-sm text-red-500">{error}</p>
		{/if}

		<div class="flex justify-end gap-4">
			<BaseButton className="gray" onclick={() => history.back()}>Отмена</BaseButton>
			<BaseButton className="success" onclick={submit} disabled={isSubmitting}>
				{isSubmitting ? 'Отправка...' : 'Отправить'}
			</BaseButton>
		</div>
	</div>
{/if}
