<script lang="ts">
	import type { SelectItem } from '$lib/shared/types';
	import { page } from '$app/stores';

	const sections: SelectItem[] = [
		{ key: 'info',          label: 'Настройка профиля' },
		{ key: 'linked',        label: 'Подключённые аккаунты' },
		{ key: 'security',      label: 'Безопасность' },
		{ key: 'notifications', label: 'Уведомления' },
		{ key: 'verification',  label: 'Верификация' },
		{ key: 'taxes',         label: 'Налоги' },
		{ key: 'teams',         label: 'Команды' },
		{ key: 'getpaid',       label: 'Финансы' }
	];

	// последний сегмент URL
	$: active = $page.url.pathname.split('/').pop();
</script>

<nav class="space-y-1">
	{#each sections as { key, label }}
		<a
			href={`/settings/${key}`}
			class={`
				px-4 py-2 text-sm font-medium flex items-center transition-colors duration-200
				${active === key
					? 'border-l-8 border-primary text-base-content'
					: 'border-l-2 border-base-300 text-base-content hover:border-base-200 hover:text-base-content'}
			`}
		>
			{label}
		</a>
	{/each}
</nav>