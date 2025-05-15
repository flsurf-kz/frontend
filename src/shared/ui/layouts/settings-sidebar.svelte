<script lang="ts">
	import type { SelectItem } from '$lib/shared/types';
	import { page } from '$app/stores';

	const sections: SelectItem[] = [
		{ key: 'info',           label: 'Настройка профиля' },
		{ key: 'contact',        label: 'Контактная информация' },
		{ key: 'linked',         label: 'Подключенные аккаунты' },
		{ key: 'security',       label: 'Безопасность' },
		{ key: 'notifications',  label: 'Уведомления' },
		{ key: 'verification',   label: 'Верификация' },
		{ key: 'teams',          label: 'Команды' }, 
		{ key: 'getpaid',        label: 'Финансы' }, 
	];

	// последний сегмент из url
	$: active = $page.url.pathname.split('/').pop();
</script>

<nav class="space-y-1">
	{#each sections as { key, label }}
		<a
			href={`/user/settings/${key}`}
			class="
				px-4 py-2 text-sm font-medium flex items-center
				border-l-2 border-transparent
				transition-colors duration-200
				
				/* hover у неактивных: линия серой, текст чёрным */
				hover:border-base-200 hover:text-base-content
				
				/* активный: толстая чёрная линия + закругления */
				{active === key 
					? 'border-l-4 border-black text-black rounded-l-full'
					: 'text-base-content'}"
		>
			{label}
		</a>
	{/each}
</nav>
