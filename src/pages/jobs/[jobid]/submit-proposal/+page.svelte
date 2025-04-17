<script lang="ts">
	import { goto } from '$app/navigation';

	let { job } = $props();

	let proposedRate = '';
	let coverLetter = '';
	let isSubmitting = false;
	let error = '';
	let submitted = false;

	async function submit() {
		isSubmitting = true;
		error = '';
		try {
			await GlobalClient.submitProposal({
				jobId: job.jobId,
				proposedRate: parseFloat(proposedRate),
				coverLetter
			});
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
			type="number"
			bind:value={proposedRate}
			required
			min="100"
		/>

		<!-- Сообщение -->
		<Textarea
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
			<BaseButton color="gray" on:click={() => history.back()}>Отмена</BaseButton>
			<BaseButton color="success" on:click={submit} disabled={isSubmitting}>
				{isSubmitting ? 'Отправка...' : 'Отправить'}
			</BaseButton>
		</div>
	</div>
{/if}
