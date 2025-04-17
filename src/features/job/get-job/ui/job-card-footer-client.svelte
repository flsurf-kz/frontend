<script lang="ts">
	import { type ProposalEntity } from 'flsurf-client';

	let { job } = $props();

	let selectedProposal: ProposalEntity | null = null;
	let showConfirmModal = $state(false);

	function openChat(userId: string) {
		// Пример: переход в чат
		console.log("Открыть чат с", userId);
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
</script>

<!-- Действия -->
<div class="flex flex-wrap gap-4 mt-6 mb-2">
	<button class="btn btn-outline btn-error">Удалить заказ</button>
	<button class="btn btn-outline">Скрыть</button>
</div>

<h3 class="text-lg font-semibold mt-6">Ставки</h3>

<!-- Секции ставок -->
<div class="mt-4 space-y-6">
	{#each ['Pending', 'Accepted', 'Hidden'] as group}
		<div>
			<h4 class="text-md font-semibold mb-2">
				{group === 'Pending' && 'Ожидают ответа'}
				{group === 'Accepted' && 'Принятые'}
				{group === 'Hidden' && 'Скрытые'}
			</h4>

			{#each (job.proposals ?? []).filter((p: ProposalEntity) => p.status === group) as proposal}
				<div class="p-4 border rounded-md bg-gray-50">
					<div class="flex justify-between">
						<div>
							<p class="font-bold">{proposal.freelancer?.fullName}</p>
							<p class="text-gray-700 text-sm whitespace-pre-wrap">{proposal.coverLetter}</p>
							<p class="text-sm mt-2 text-gray-500">Ставка: {proposal.proposedRate} ₸</p>
						</div>
						<div class="flex flex-col items-end gap-2">
							{#if group === 'Pending'}
								<button class="btn btn-sm btn-success" onclick={() => acceptProposal(proposal)}>Сохранить</button>
							{/if}
							<button class="btn btn-sm btn-outline" onclick={() => openChat(proposal.freelancerId)}>Чат</button>
						</div>
					</div>
				</div>
			{/each}

			{#if (job.proposals ?? []).filter((p: ProposalEntity) => p.status === group).length === 0}
				<p class="text-sm text-gray-400 italic">Нет предложений</p>
			{/if}
		</div>
	{/each}
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
