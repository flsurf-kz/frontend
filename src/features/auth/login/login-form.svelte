<script lang="ts">
	import { goto } from "$app/navigation";
	import { loginUser } from "$lib/entities/user/model";
	import { backendHost } from "$lib/shared/api/client";
	import BaseButton from "$lib/shared/ui/buttons/base-button.svelte";
	import { Checkbox } from "$lib/shared/ui/checkboxes";
	import { InputField, PasswordField } from "$lib/shared/ui/inputs";
	import { LoginUserSchema } from "flsurf-client";

	let email = '';
	let password = '';
	let loading = false;
	let error: string | null = null;
	let rememberMe = false; 

	async function handleLogin() {
		error = null;
		if (!email || !password) {
			error = "Пожалуйста, введите email и пароль";
			return;
		}

		loading = true;
		try {
			await loginUser(new LoginUserSchema({email, password, rememberMe}));
			goto('/'); // редирект после логина
		} catch (e) {
			error = "Неверные данные для входа";
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto bg-base-100 p-6 rounded-lg m-30 shadow border border-base-200 space-y-4 text-base-content">
	<h1 class="text-2xl font-bold text-center mb-6">
		Войти в <span class="text-green-600">FLSurf.kz</span>
	</h1>

	<InputField placeholder="Юзернейм или почта" bind:value={email} />
	<PasswordField placeholder="Пароль" bind:value={password} />

	{#if error}
		<p class="text-sm text-red-500">{error}</p>
	{/if}

	<Checkbox value={rememberMe} onChange={() => { rememberMe = !rememberMe}} disabled={false} label={"Запомнить вход на этом устройстве"}/>

	<BaseButton className="btn btn-success w-full" onclick={handleLogin} disabled={loading}>
		{loading ? "Вход..." : "Продолжить"}
	</BaseButton>


	<div class="divider">или</div>

	<a href="{backendHost}/api/auth/external-login/GoogleOpenIdConnect"  class="btn w-full bg-blue-500 text-white hover:bg-blue-600">
		<img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="" class="w-5 h-5 mr-2" />
		Зайти через Google
	</a>

	<div class="text-center mt-[-10px] mb-[-10px]">
		<a href="/auth/forgor-password" class="text-sm text-blue-500 hover:text-blue-600">Забыли пароль? </a>
	</div>

	<div class="text-center mt-4 text-sm">
		Нету аккаунта FLSurf.kz?
	</div>

	<div class="text-center mt-1">
		<a href="/auth/register" class="btn btn-outline btn-sm btn-success">Зарегистрироваться</a>
	</div>
</div>
