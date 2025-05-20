<script lang="ts">
	import { registerUser } from "$lib/entities/user/model";
	import BaseButton from "$lib/shared/ui/buttons/base-button.svelte";
	import { Checkbox } from "$lib/shared/ui/checkboxes";
	import InputField from "$lib/shared/ui/inputs/input-field.svelte";
	import PasswordField from "$lib/shared/ui/inputs/password-field.svelte";
	import { page } from '$app/state'; 

	// Импорт типа схемы регистрации из клиента
	import { RegisterUserSchema, RegisterUserSchemaCountry, RegisterUserSchemaType } from "flsurf-client";
	import { goto } from "$app/navigation";

	let userTypeParam = page.url.searchParams.get('type') || "";

	// Массив реальных значений enum
	let validUserTypes = Object.values(RegisterUserSchemaType) as string[];

	// Если параметр совпадает с одним из значений enum — используем его, иначе дефолт
	let userType: RegisterUserSchemaType = validUserTypes.includes(userTypeParam)
		? (userTypeParam as RegisterUserSchemaType)
		: RegisterUserSchemaType.NonUser; // например, дефолтный

	// Дополнительные поля: тип аккаунта и страна (значения можно расширять)
	let form: RegisterUserSchema = new RegisterUserSchema({
		name: '',
		surname: '',
		email: '',
		country: RegisterUserSchemaCountry.Kazakhstan, 
		type: userType, 
		password: '',
		rememberMe: false, 
	});

	let repeatPassword = '';
	let agreed = false;

	let loading = false;
	let error: string | null = null;
	
	const validateEmail = (email: string) => {
	  return String(email)
	    .toLowerCase()
	    .match(
	      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	    );
	};

	async function handleSubmit() {
		error = null;
		if (!agreed) {
			error = "Вы должны принять условия обслуживания";
			return;
		}
		if (form.password.length <= 8) {
			console.log(form.password)
			error = "Пароль должен быть минимум 8 символов";
			return;
		}
		if (form.password !== repeatPassword) {
			error = "Пароли не совпадают";
			return;
		}
		if (!form.country) {
			error = "Выберите страну";
			return;
		}
		if (!validateEmail(form.email)) { 
			error = "Неправильный эмейл"
			return; 
		}
		if ((form.name + " " + form.surname).split(" ").length != 2) { 
			error = "Не должно быть пробела в имени и фамилии"
			return; 
		}
		// Если нужно, можно добавить accountType и country в payload
		// Например, расширить RegisterUserSchema или отправлять их отдельно
		loading = true;
		try {
			await registerUser(form);
			goto('/');
		} catch (e) {
			error = "Не удалось зарегистрироваться. Проверьте данные.";
		} finally {
			loading = false;
		}
	}
	let countries = Object.values(RegisterUserSchemaCountry);
</script>


<!-- svelte-ignore a11y_label_has_associated_control -->
<form class="space-y-3 max-w-md mx-auto rounded-lg p-6 bg-base-100 border-base-200 mb-10 shadow border" on:submit|preventDefault={handleSubmit}>
	<h1 class="text-2xl font-bold text-center mb-6">
		Зарегистрироваться в <span class="text-green-600">FLSurf.kz</span>
	</h1>

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
	
	<Checkbox
		value={form.rememberMe ?? false} 
		onChange={() => { form.rememberMe = !form.rememberMe}} 
		disabled={false} 
		label={"Запомнить вход на этом устройстве"}
	/>

	<Checkbox value={agreed} onChange={(value) => { agreed = value}} label={"Да, я принимаю Условия обслуживания"} />

	{#if error}
		<p class="text-red-500 text-sm">{error}</p>
	{/if}

	
	<BaseButton type="submit" className="w-full" disabled={loading} onclick={() => {}}>
		{loading ? "Загрузка..." : "Создать аккаунт"}
	</BaseButton>
</form>
