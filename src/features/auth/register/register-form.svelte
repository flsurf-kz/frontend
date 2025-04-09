<script lang="ts">
	import { registerUser } from "$lib/entities/user/model";
	import BaseButton from "$lib/shared/ui/buttons/base-button.svelte";
	import { Checkbox } from "$lib/shared/ui/checkboxes";
	import InputField from "$lib/shared/ui/inputs/input-field.svelte";
	import PasswordField from "$lib/shared/ui/inputs/password-field.svelte";

	// Импорт типа схемы регистрации из клиента
	import { RegisterUserSchema, RegisterUserSchemaCountry, RegisterUserSchemaType } from "flsurf-client";

	// Дополнительные поля: тип аккаунта и страна (значения можно расширять)
	let form: RegisterUserSchema = new RegisterUserSchema({
		name: '',
		surname: '',
		email: '',
		country: RegisterUserSchemaCountry.Kazakhstan, 
		type: RegisterUserSchemaType.NonUser, 
		password: '',
	});

	let repeatPassword = '';
	let agreed = false;
	let country = '';

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
		if (!country) {
			error = "Выберите страну";
			return;
		}
		// Если нужно, можно добавить accountType и country в payload
		// Например, расширить RegisterUserSchema или отправлять их отдельно
		loading = true;
		try {
			await registerUser(form);
			alert("Вы успешно зарегистрированы!");
			// Можно выполнить редирект, например: goto('/dashboard');
		} catch (e) {
			error = "Не удалось зарегистрироваться. Проверьте данные.";
		} finally {
			loading = false;
		}
	}
	let countries = Object.values(RegisterUserSchemaCountry);
</script>


<!-- svelte-ignore a11y_label_has_associated_control -->
<form class="space-y-4 max-w-md mx-auto" on:submit|preventDefault={handleSubmit}>
	<div class="flex gap-2">
		<InputField label="Имя" bind:value={form.name} required />
		<InputField label="Фамилия" bind:value={form.surname} required />
	</div>
	<InputField label="Email" inputType="email" bind:value={form.email} required />
	<PasswordField label="Пароль" bind:value={form.password} required />
	<PasswordField label="Повторите пароль" bind:value={repeatPassword} required />

	<!-- Выбор типа аккаунта -->
	<div>
		<label class="label">Тип аккаунта</label>
		<select bind:value={form.type} class="select select-bordered w-full">
			<option value="Freelancer">Фрилансер</option>
			<option value="Client">Заказчик</option>
		</select>
	</div>

	<!-- Выбор страны -->
	<div>
		<label class="label">Страна</label>
		<select bind:value={form.country} class="select select-bordered w-full">
			<option value="" disabled selected>Выберите страну</option>
			{#each countries as country}
				<option value={country}>{country}</option>
			{/each}
		</select>
	</div>

	<!-- Социальные входы -->
	<div class="flex justify-between">
		<a href="/auth/vk" class="btn btn-outline btn-info btn-xs">Войти через ВКонтакте</a>
		<a href="/auth/google" class="btn btn-outline btn-info btn-xs">Войти через Google</a>
	</div>

	<Checkbox value={agreed} onChange={(value) => { agreed = value}} label={"Да, я принимаю Условия обслуживания"} />

	{#if error}
		<p class="text-red-500 text-sm">{error}</p>
	{/if}

	<BaseButton type="submit" className="w-full" disabled={loading}>
		{loading ? "Загрузка..." : "Создать аккаунт"}
	</BaseButton>
</form>
