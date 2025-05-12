<script lang="ts">
	import { goto } from '$app/navigation';
	import { GlobalClient } from '$lib/shared/api';
	import { showNotification } from '$lib/shared/ui/errors/modal';
	import { DeleteJobCommand, HideJobCommand, JobEntity, type ProposalEntity } from 'flsurf-client';

	let { job }: { job: JobEntity } = $props();

	let selectedProposal: ProposalEntity | null = $state(null);
	let showConfirmModal = $state(false);
	let currentGroup: 'Pending' | 'Accepted' | 'Hidden' = $state('Pending');

	function openChat(userId: string) {
		// Пример: переход в чат
		console.log("Открыть чат с", userId);
		// await GlobalClient.openChatForJobClient(new OpenChatForJobClientCommand({jobId: job.id, userId: userId})); 
	}

	function acceptProposal(p: ProposalEntity) {
		selectedProposal = p;
		showConfirmModal = true;
	}

	function confirmAccept() {
		// Тут пойдет вызов API или store
		console.log("Подтверждено:", selectedProposal?.id);
		showConfirmModal = false;
	}
	
	async function deleteJob() { 
		try { 
			let result = await GlobalClient.deleteJob(new DeleteJobCommand({jobId: job.id}))
		} catch (exc) { 
			showNotification("Невозможно удалить работу", true)	
		} 
	}

	async function hideJob() { 
		try { 
			let result = await GlobalClient.hideJob(new HideJobCommand({jobId: job.id}))
		} catch (exc) { 
			showNotification("Работа закрыта"); 
		}
	}
</script>

<!-- Действия -->
<div class="flex flex-wrap gap-4 mt-6 mb-2">
	<button class="btn btn-outline btn-error" onclick={() => deleteJob()}>Удалить заказ</button>
	<button class="btn btn-outline" onclick={() => hideJob()}>Скрыть</button>
</div>

<h2 class="text-lg font-semibold mt-6">Ставки</h2>

<!-- Секции ставок -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="mt-4 space-y-6 ">
	<div class="flex space-x-4 justify-between">
		<h4 class="text-md font-semibold mb-2" onclick={() => currentGroup = 'Pending'}>Ожидают ответа</h4>
		<h4 class="text-md font-semibold mb-2" onclick={() => currentGroup = 'Accepted'}>Принятые</h4>
		<h4 class="text-md font-semibold mb-2" onclick={() => currentGroup = 'Pending'}>Скрытые</h4>
	</div>

	{#each (job.proposals ?? []).filter((p: ProposalEntity) => p.status === currentGroup) as proposal}
		<div class="p-4 border rounded-md bg-gray-50">
			<div class="flex justify-between">
				<div>
					<p class="font-bold">{proposal.freelancer?.fullname}</p>
					<p class="text-gray-700 text-sm whitespace-pre-wrap">{proposal.coverLetter}</p>
					<p class="text-sm mt-2 text-gray-500">Ставка: {proposal.proposedRate} ₸</p>
				</div>
				<div class="flex flex-col items-end gap-2">
					{#if currentGroup === 'Pending'}
						<button class="btn btn-sm btn-success" onclick={() => acceptProposal(proposal)}>Сохранить</button>
					{/if}
					<button class="btn btn-sm btn-outline" onclick={() => openChat(proposal.freelancerId ?? "")}>Чат</button>
				</div>
			</div>
		</div>
	{/each}

	{#if (job.proposals ?? []).filter((p: ProposalEntity) => p.status === currentGroup).length === 0}
		<p class="text-sm text-gray-400 italic">Нет предложений</p>
	{/if}
</div>

<!-- Подтверждение сохранения -->
{#if showConfirmModal}
	<div class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
		<div class="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md z-50">
			<h2 class="text-lg font-bold mb-4">Подтвердить выбор</h2>
			<p class="text-sm text-gray-600 mb-4">
				Вы действительно хотите принять предложение от <b>{selectedProposal?.freelancer?.fullname}</b> на сумму <b>{selectedProposal?.proposedRate} ₸</b>?
			</p>
			<div class="flex justify-end gap-3">
				<button class="btn" onclick={() => showConfirmModal = false}>Отмена</button>
				<button class="btn btn-success" onclick={confirmAccept}>Подтвердить</button>
			</div>
		</div>
	</div>
{/if}
