<script lang="ts">
	import { GlobalClient } from "$lib/shared/api";
	import { BaseButton } from "$lib/shared/ui/buttons";
	import { InputField, PasswordField } from "$lib/shared/ui/inputs";


	let oldPassword = '';
	let newPassword = '';
	let newEmail = '';
	let emailCode = '';
	let emailPending = false;
	let message = '';
	let emailConfirmed = false;

	async function changePassword() {
		try {
            // TODO 
			// await GlobalClient.updateUser({ oldPassword, newPassword });
			message = 'Пароль успешно обновлён';
			oldPassword = newPassword = '';
		} catch (e) {
			message = 'Ошибка смены пароля';
		}
	}

	async function requestEmailUpdate() {
		try {
			// await GlobalClient.startUpdateEmail(newEmail);
			emailPending = true;
			message = 'Код подтверждения отправлен на новый email';
		} catch {
			message = 'Не удалось отправить код';
		}
	}

	async function confirmEmailUpdate() {
		try {
			// await GlobalClient.updateEmailConfirm(newEmail, emailCode);
			emailPending = false;
			emailConfirmed = true;
			message = 'Email успешно обновлён';
		} catch {
			message = 'Ошибка подтверждения кода';
		}
	}
</script>

<h3 class="text-lg font-bold mb-4">Безопасность</h3>

<!-- ✅ Смена пароля -->
<div class="border rounded-lg p-4 space-y-3 mb-6">
	<h4 class="font-medium mb-1">Сменить пароль</h4>
	<PasswordField label="Старый пароль" bind:value={oldPassword} />
	<PasswordField label="Новый пароль" bind:value={newPassword} />
	<BaseButton onclick={changePassword}>Сменить пароль</BaseButton>
</div>

<!-- ✅ Смена email -->
<div class="border rounded-lg p-4 space-y-3 mb-6">
	<h4 class="font-medium mb-1">Сменить email</h4>
	<InputField label="Новый email" bind:value={newEmail} />
	<BaseButton onclick={requestEmailUpdate}>Отправить код подтверждения</BaseButton>

	{#if emailPending}
		<InputField label="Код подтверждения" bind:value={emailCode} />
		<BaseButton onclick={confirmEmailUpdate}>Подтвердить</BaseButton>
	{/if}

	{#if emailConfirmed}
		<p class="text-green-600 text-sm">Email подтверждён</p>
	{/if}
</div>

<!-- 🚧 Two-step auth заглушка -->
<div class="border rounded-lg p-4 space-y-3 mb-6">
	<h4 class="font-medium mb-1">Двухэтапная аутентификация</h4>
	<p class="text-sm text-gray-500">Функция будет доступна в будущем.</p>
	<BaseButton onclick={() => {}} disabled>Включить двухфакторную защиту</BaseButton>
</div>

<!-- 🔔 Общий результат -->
{#if message}
	<p class="text-sm text-blue-600 mt-2">{message}</p>
{/if}
