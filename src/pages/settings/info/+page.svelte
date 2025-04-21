<script lang="ts">
	import { GlobalClient } from '$lib/shared/api';
	import { UpdateUserCommand, UserEntity } from 'flsurf-client';
	import { EditButton, BaseButton } from '$lib/shared/ui/buttons';
	import { InputField } from '$lib/shared/ui/inputs';
	import { CurrentUser, getCurrentUser } from '$lib/entities/user/model/modal';
	import { get } from 'svelte/store';

	// 1. Деривация текущего пользователя
	const user = $derived(() => {
		const u = get(CurrentUser);
		if (!u) throw new Error('Пользователь не авторизован');
		return u;
	});

	// 2. Форма редактирования (основа - UpdateUserCommand)
	let form = $state(new UpdateUserCommand({ userId: user().id }));

	// 3. Синхронизация данных при загрузке или обновлении
	$effect(() => {
		const u = user();
		form.userId = u.id;
		form.name = u.name;
		form.email = u.email;
		form.surname = u.surname;
		form.telegramId = u.phone;
		form.description = '';
	});

	// 4. Управление редактируемыми полями
	let isEditing = $state({
		name: false,
		email: false,
		location: false,
		address: false,
		phone: false
	});

	// 5. Сохранение конкретного поля
	async function save(field: keyof typeof isEditing) {
		await GlobalClient.updateUser(form.userId, form);
		isEditing[field] = false;

		const updated = await getCurrentUser();
		CurrentUser.set(updated);
	}
</script>

<h3 class="text-lg font-bold">Контактная информация</h3>

<div class="grid md:grid-cols-2 gap-4">
	<!-- User ID -->
	<div class="border rounded-lg p-4">
		<h4 class="font-medium mb-2">User ID</h4>
		<p class="text-sm text-gray-600">{form.userId}</p>
	</div>

	<!-- Имя -->
	<div class="border rounded-lg p-4">
		<div class="flex justify-between items-center mb-2">
			<h4 class="font-medium">Имя</h4>
			<EditButton onclick={() => isEditing.name = !isEditing.name} />
		</div>
		{#if isEditing.name}
			<InputField bind:value={form.name} />
			<BaseButton className="text-sm text-green-600 mt-2" onclick={() => save('name')}>Сохранить</BaseButton>
		{:else}
			<p class="text-sm">{form.name}</p>
		{/if}
	</div>

	<!-- Почта -->
	<div class="border rounded-lg p-4">
		<div class="flex justify-between items-center mb-2">
			<h4 class="font-medium">Почта</h4>
			<EditButton onclick={() => isEditing.email = !isEditing.email} />
		</div>
		{#if isEditing.email}
			<InputField bind:value={form.email} />
			<BaseButton className="text-sm text-green-600 mt-2" onclick={() => save('email')}>Сохранить</BaseButton>
		{:else}
			<p class="text-sm">{form.email}</p>
		{/if}
	</div>

	<!-- Часовой пояс -->
	<div class="border rounded-lg p-4">
		<div class="flex justify-between items-center mb-2">
			<h4 class="font-medium">Часовой пояс</h4>
			<EditButton onclick={() => isEditing.location = !isEditing.location} />
		</div>
		{#if isEditing.location}
			<InputField bind:value={form.description} />
			<BaseButton className="text-sm text-green-600 mt-2" onclick={() => save('location')}>Сохранить</BaseButton>
		{:else}
			<p class="text-sm">{form.description}</p>
		{/if}
	</div>

	<!-- Адрес -->
	<div class="border rounded-lg p-4">
		<div class="flex justify-between items-center mb-2">
			<h4 class="font-medium">Адрес</h4>
			<EditButton onclick={() => isEditing.address = !isEditing.address} />
		</div>
		{#if isEditing.address}
			<InputField bind:value={form.surname} />
			<BaseButton className="text-sm text-green-600 mt-2" onclick={() => save('address')}>Сохранить</BaseButton>
		{:else}
			<p class="text-sm">{form.surname}</p>
		{/if}
	</div>

	<!-- Телефон -->
	<div class="border rounded-lg p-4">
		<div class="flex justify-between items-center mb-2">
			<h4 class="font-medium">Телефон</h4>
			<EditButton onclick={() => isEditing.phone = !isEditing.phone} />
		</div>
		{#if isEditing.phone}
			<InputField bind:value={form.telegramId} />
			<BaseButton className="text-sm text-green-600 mt-2" onclick={() => save('phone')}>Сохранить</BaseButton>
		{:else}
			<p class="text-sm">{form.telegramId}</p>
		{/if}
	</div>
</div>
