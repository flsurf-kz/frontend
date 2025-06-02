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
	import { backendHost } from "$lib/shared/api/client";

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
	<div class="flex justify-between flex-col gap-4">
		<a href="/auth/vk" class="btn btn-outline btn-info btn-xs">Войти через ВКонтакте</a>
	    <a 
	        href="{backendHost}/api/auth/external-login/GoogleOpenIdConnect" 
	        class="btn btn-outline border-primary text-primary hover:bg-primary hover:text-primary-content w-full"
	        rel="external" >
	        <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
	            <path d="M22.56,12.25C22.56,11.47 22.49,10.72 22.36,10H12.28V14.2H18.13C17.85,15.74 17.02,17.04 15.73,17.95V20.68H19.45C21.54,18.76 22.56,15.8 22.56,12.25Z" />
	            <path d="M12.28,24C15.38,24 17.99,22.96 19.45,21.19L15.73,18.46C14.76,19.11 13.61,19.53 12.28,19.53C9.74,19.53 7.59,17.93 6.75,15.59H2.97V18.42C4.48,21.71 8.08,24 12.28,24Z" />
	            <path d="M6.75,15.07C6.54,14.48 6.41,13.85 6.41,13.2C6.41,12.55 6.54,11.92 6.75,11.33V8.5H2.97C2.05,10.23 1.53,12.25 1.53,14.2C1.53,16.15 2.05,18.17 2.97,19.9L6.75,17.07V15.07Z" />
	            <path d="M12.28,5.9C13.83,5.9 15.21,6.46 16.26,7.45L19.52,4.21C17.52,2.37 15.03,1.17 12.28,1.17C8.08,1.17 4.48,3.75 2.97,7.03L6.75,9.86C7.59,7.52 9.74,5.9 12.28,5.9Z" />
	        </svg>
	        Войти через Google
	    </a>
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
