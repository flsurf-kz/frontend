<script lang="ts">
	import type { SelectItem } from '$lib/shared/types';
	import { page } from '$app/stores';

	const sections: SelectItem[] = [
		{ key: 'info', label: 'Настройка профиля' },
		{ key: 'contact', label: 'Контактная информация' },
		{ key: 'linked', label: 'Подключенные аккаунты' },
		{ key: 'security', label: 'Безопасность' },
		{ key: 'notifications', label: 'Уведомления' },
		{ key: 'verification', label: 'Верификация' },
		{ key: 'teams', label: 'Команды' }
	];

	$: currentPath = $page.url.pathname;
</script>

<nav class="space-y-1">
	{#each sections as { key, label }}
		<a
			href={`/settings/${key}`}
			class="block px-4 py-2 rounded text-sm font-medium transition
				{currentPath.startsWith(`/user/settings/${key}`)
					? 'bg-primary text-white'
					: 'hover:bg-base-200 text-base-content'}"
		>
			{label}
		</a>
	{/each}
</nav>
