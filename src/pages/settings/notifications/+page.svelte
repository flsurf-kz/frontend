<script lang="ts">
	import { BaseButton } from "$lib/shared/ui/buttons";
	import { ChoicesField } from "$lib/shared/ui/inputs";

	let notifyByEmail = true;
	let notifyType = 'important'; // or 'all'
	let message = '';

	async function saveSettings() {
		try {
            // TODO
			// await GlobalClient.updateUser({
			// 	notifyByEmail,
			// 	notifyType
			// });
			message = 'Настройки уведомлений обновлены';
		} catch {
			message = 'Ошибка при сохранении';
		}
	}
</script>

<h3 class="text-lg font-bold mb-4">Уведомления</h3>

<!-- svelte-ignore a11y_label_has_associated_control -->
<div class="space-y-4 max-w-md">
	<div>
		<label class="font-medium text-sm block mb-1">Получать уведомления на email</label>
		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={notifyByEmail} />
			<span class="text-sm">Включить отправку уведомлений на почту</span>
		</label>
	</div>

	<ChoicesField
		label="Тип уведомлений"
		options={[
			{ key: 'important', label: 'Только важные' },
			{ key: 'all', label: 'Все уведомления' }
		]}
		bind:value={notifyType}
	/>

	<BaseButton onclick={saveSettings}>Сохранить</BaseButton>
	{#if message}
		<p class="text-sm text-blue-600 mt-2">{message}</p>
	{/if}
</div>
