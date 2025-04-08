<script lang="ts">
	import { BaseButton } from "$lib/shared/ui/buttons";
	import { Checkbox } from "$lib/shared/ui/checkboxes";
	import { InputField, PasswordField } from "$lib/shared/ui/inputs";
	import { registerUser } from "$lib/entities/user/model";
	import { RegisterUserSchema } from "flsurf-client";

	let form: RegisterUserSchema = new RegisterUserSchema({
		name: '',
		surname: '',
		email: '',
		password: '',
	}); 

	let repeatPassword = '';
	let agreed = false;
	let loading = false;
	let error: string | null = null;

	async function handleSubmit() {
		error = null;
		if (!agreed) {
			error = "Вы должны принять условия обслуживания";
			return;
		}
		if (form.password.length < 8) {
			error = "Пароль должен быть минимум 8 символов";
			return;
		}
		if (form.password !== repeatPassword) {
			error = "Пароли не совпадают";
			return;
		}

		loading = true;
		try {
			await registerUser(form);
			// Навигация или показ успешного состояния
			alert("Вы успешно зарегистрированы!");
		} catch (e) {
			error = "Не удалось зарегистрироваться. Проверьте данные.";
		}
		loading = false;
	}
</script>

<form class="space-y-4 max-w-md mx-auto" on:submit|preventDefault={handleSubmit}>
	<div class="flex gap-2">
		<InputField label="Имя" bind:value={form.name} required />
		<InputField label="Фамилия" bind:value={form.surname} required />
	</div>
	<InputField label="Email" inputType="email" bind:value={form.email} required />
	<PasswordField label="Пароль" bind:value={form.password} required />
	<PasswordField label="Повторите пароль" bind:value={repeatPassword} required />

	<Checkbox value={agreed} onChange={(v) => { agreed = v } }>
		<!-- Да, я принимаю <a href="/terms" class="text-green-500 underline">Условия обслуживания</a> -->
	</Checkbox>

	{#if error}
		<p class="text-red-500 text-sm">{error}</p>
	{/if}

	<BaseButton type="submit" className="w-full" disabled={loading}>
		{loading ? "Загрузка..." : "Создать аккаунт"}
	</BaseButton>
</form>
