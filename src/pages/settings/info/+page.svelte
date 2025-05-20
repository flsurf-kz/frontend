<script lang="ts">
	import { get } from 'svelte/store';
	import { derived, writable } from 'svelte/store';
	import { page } from '$app/stores';

	import { GlobalClient }         from '$lib/shared/api';
	import { UpdateUserCommand }    from 'flsurf-client';

	import { EditButton, BaseButton } from '$lib/shared/ui/buttons';

	import { CurrentUser, getCurrentUser } from '$lib/entities/user/model/modal';
	import { InputField } from '$lib/shared/ui/inputs';

	/* ------------ пользователь ------------- */
	const user = derived(CurrentUser, u => {
		if (!u) throw new Error('Пользователь не авторизован');
		return u;
	});

	/* ------------ форма -------------------- */
	let form = writable<UpdateUserCommand>(new UpdateUserCommand());

	user.subscribe(u => {
		form.set(
			new UpdateUserCommand({
				userId     : u.id,
				name       : u.name,
				surname    : u.surname,
				email      : u.email,
				telegramId : u.phone
			})
		);
	});

	/* ------------ флаги редактирования ------ */
	const isEditing = writable({
		name     : false,
		email    : false,
		location : false,
		address  : false,
		phone    : false
	});

	async function save(field: keyof typeof $isEditing) {
		const dto = get(form);
		await GlobalClient.updateUser(dto.userId, dto);
		isEditing.update(e => ({ ...e, [field]: false }));
		const refreshed = await getCurrentUser();
		CurrentUser.set(refreshed);
	}
</script>

<h2 class="page-title">Контактная информация</h2>

<!-- ====== АККАУНТ ====== -->
<section class="card">
	<header class="card__header">
		<span>Аккаунт</span>
		<EditButton onclick={() => isEditing.update(e => ({ ...e, name: !e.name }))}/>
	</header>

	<div class="card__row">
		<span class="label">ID&nbsp;пользователя</span>
		<span class="value">{$form.userId}</span>
	</div>

	<div class="card__row">
		<span class="label">Имя</span>
		{#if $isEditing.name}
			<InputField on:change={() => {}} bind:value={$form.name}/>
			<BaseButton className="save-btn" onclick={() => save('name')}>Сохранить</BaseButton>
		{:else}
			<span class="value">{$form.name}</span>
		{/if}
	</div>

	<div class="card__row">
		<span class="label">Почта</span>
		{#if $isEditing.email}
			<InputField on:change={() => {}} bind:value={$form.email}/>
			<BaseButton className="save-btn" onclick={() => save('email')}>Сохранить</BaseButton>
		{:else}
			<span class="value">{$form.email}</span>
		{/if}
	</div>

	<a href="/" class="card__link">Закрыть мой аккаунт</a>
</section>

<!-- ====== ДОП. АККАУНТЫ ====== -->
<section class="card">
	<header class="card__header">Дополнительные аккаунты</header>

	<p class="hint">
		Создание нового аккаунта позволяет использовать платформу по-разному, сохраняя одну учётную запись.
	</p>

	<h5>Клиентский аккаунт</h5>
	<p class="hint">Нанимайте и платите как другая компания. У каждой компании свои методы оплаты и отчёты.</p>
	<BaseButton onclick={() => {}} className="outline">Новый клиентский аккаунт</BaseButton>

	<h5 class="mt-4">Агентский аккаунт</h5>
	<p class="hint">Находите работу и зарабатывайте как менеджер команды фрилансеров.</p>
	<BaseButton onclick={() => {}} className="outline">Новый агентский аккаунт</BaseButton>
</section>

<!-- ====== ЛОКАЦИЯ ====== -->
<section class="card">
	<header class="card__header">
		<span>Локация</span>
		<EditButton onclick={() => isEditing.update(e => ({ ...e, location: !e.location }))}/>
	</header>

	<div class="card__row">
		<span class="label">Часовой пояс</span>
		<span class="value">UTC+06:00 Алматы, Дакка</span>
	</div>

	<div class="card__row">
		<span class="label">Адрес</span>
		{#if $isEditing.address}
			<InputField bind:value={$form.surname}/>
			<BaseButton className="save-btn" onclick={() => save('address')}>Сохранить</BaseButton>
		{:else}
			<span class="value">Akm eshit&nbsp;11<br>Астана, Казахстан</span>
		{/if}
	</div>

	<div class="card__row">
		<span class="label">Телефон</span>
		{#if $isEditing.phone}
			<InputField bind:value={$form.telegramId}/>
			<BaseButton className="save-btn" onclick={() => save('phone')}>Сохранить</BaseButton>
		{:else}
			<span class="value">+7&nbsp;705&nbsp;656&nbsp;1678</span>
		{/if}
	</div>
</section>

<style>
	.page-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; }

	.card {
		border: 1px solid var(--p-100,#e5e7eb);
		border-radius: 6px;
		padding: 1.25rem 1.5rem;
		background: #fff;
		display: flex;
		flex-direction: column;
		gap: .75rem;
		margin-bottom: 1.5rem;
	}

	.card__header {
		font-weight: 600;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: .25rem;
	}

	.card__row { display: flex; gap: .5rem; flex-wrap: wrap; }

	.label { width: 140px; font-size: .875rem; color:#6b7280; }
	.value { font-size: .875rem; }

	.hint { font-size: .8125rem; color:#6b7280; }

	.card__link {
		font-size: .8125rem;
		color: #2563eb;
		cursor: pointer;
		margin-top: .5rem;
	}
	.mt-4     { margin-top: 1rem; }
</style>
