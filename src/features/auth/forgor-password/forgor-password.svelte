<script lang="ts">
	// Импорт API-клиента — метод forgotPassword должен отправлять email и выдавать код на почту
	import { GlobalClient } from "$lib/shared/api";
	import { goto } from "$app/navigation";
	import { SendResetCodeCommand } from "flsurf-client";

	let email = "";
	let loading = false;
	let error: string | null = null;
	let successMessage: string | null = null;

	async function handleSubmit() {
		error = null;
		successMessage = null;
		if (!email) {
			error = "Пожалуйста, введите ваш email";
			return;
		}
		loading = true;
		try {
			// Предполагаем, что API-метод forgotPassword принимает объект с email
			await GlobalClient.sendResetPasswordCode(new SendResetCodeCommand({ email: email }));
			successMessage = "Код для сброса пароля отправлен на ваш email.";
		} catch (e) {
			error = "Ошибка при отправке кода. Попробуйте позже.";
			console.error(e);
		}
		loading = false;
	}
</script>


		<!-- svelte-ignore a11y_label_has_associated_control -->
<div class="max-w-md mx-auto bg-base-100 p-6 rounded-lg shadow border border-base-300">
	<h1 class="text-2xl font-bold text-center mb-6">Забыли пароль?</h1>
	<p class="mb-4 text-center">Введите ваш email, и мы отправим вам код для сброса пароля.</p>
	<div class="form-control">
		<label class="label">
			<span class="label-text">Email</span>
		</label>
		<input
			type="email"
			placeholder="Введите email"
			class="input input-bordered"
			bind:value={email}
			required
		/>
	</div>
	{#if error}
		<p class="text-red-500 text-sm mt-2">{error}</p>
	{/if}
	{#if successMessage}
		<p class="text-green-500 text-sm mt-2">{successMessage}</p>
	{/if}
	<div class="mt-6">
		<button class="btn btn-success w-full" on:click={handleSubmit} disabled={loading}>
			{loading ? "Отправка..." : "Отправить код"}
		</button>
	</div>
	<div class="text-center mt-4">
		<a href="/login" class="link link-hover">Вернуться к входу</a>
	</div>
</div>
