<script lang="ts">
	import { GlobalClient } from "$lib/shared/api";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { get } from 'svelte/store';
	import { ResetPasswordCommand } from "flsurf-client";

	// Получаем код сброса из параметров URL
	$: code = get(page).url.searchParams.get("code");

	let password = "";
	let repeatPassword = "";
	let loading = false;
	let error: string | null = null;
	let successMessage: string | null = null;

	async function handleReset() {
		error = null;
		successMessage = null;
		if (!code) {
			error = "Код для сброса отсутствует. Проверьте ссылку.";
			return;
		}
		if (password.length < 8) {
			error = "Пароль должен содержать не менее 8 символов";
			return;
		}
		if (password !== repeatPassword) {
			error = "Пароли не совпадают";
			return;
		}
		loading = true;
		try {
			// Предположим, API-метод resetPassword принимает объект с code и новым паролем
			await GlobalClient.resetPassword(new ResetPasswordCommand({ code, newPassword: password }));
			successMessage = "Пароль успешно сброшен. Вы будете перенаправлены на страницу входа.";
			setTimeout(() => goto("/login"), 3000);
		} catch (e) {
			error = "Ошибка сброса пароля. Проверьте данные и попробуйте ещё раз.";
			console.error(e);
		}
		loading = false;
	}
</script>

<div class="max-w-md mx-auto bg-base-100 p-6 rounded-lg shadow border border-base-300">
	<h1 class="text-2xl font-bold text-center mb-6">Сброс пароля</h1>
	{#if !code}
		<p class="text-red-500 text-center mb-4">Код для сброса пароля отсутствует. Проверьте свою ссылку.</p>
	{/if}
	<div class="form-control">
		<label class="label">
			<span class="label-text">Новый пароль</span>
		</label>
		<input
			type="password"
			placeholder="Введите новый пароль"
			class="input input-bordered"
			bind:value={password}
			required
		/>
	</div>
	<div class="form-control">
		<label class="label">
			<span class="label-text">Повторите новый пароль</span>
		</label>
		<input
			type="password"
			placeholder="Повторите пароль"
			class="input input-bordered"
			bind:value={repeatPassword}
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
		<button class="btn btn-success w-full" on:click={handleReset} disabled={loading || !code}>
			{loading ? "Обработка..." : "Сбросить пароль"}
		</button>
	</div>
	<div class="text-center mt-4">
		<a href="/login" class="link link-hover">Вернуться ко входу</a>
	</div>
</div>
