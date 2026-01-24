<script lang="ts">
	// Импортируем глобальный store и функции для работы с ошибками
	import { errorMessages, clearError } from './modal';
	import { derived } from 'svelte/store';

	// Вычисляемый store для критических ошибок
	const criticalErrors = derived(errorMessages, $errors =>
		$errors.filter(e => e.critical)
	);
	// Для некритических ошибок
	const nonCriticalErrors = derived(errorMessages, $errors =>
		$errors.filter(e => !e.critical)
	);
</script>

{#if $criticalErrors.length > 0}
	<!-- Критическая ошибка: показываем оверлей на весь экран -->
	<div class="fixed inset-0 bg-red-100 bg-opacity-90 flex flex-col items-center justify-center z-50">
		{#each $criticalErrors as error (error.id)}
			<div class="bg-white p-6 rounded shadow-lg text-center">
				<p class="text-red-600 font-bold mb-2">Критическая ошибка</p>
				<p>{error.message}</p>
				<button class="mt-4 btn btn-danger" on:click={() => clearError(error.id)}>
					Закрыть
				</button>
			</div>
		{/each}
	</div>
{:else if $nonCriticalErrors.length > 0}
	<!-- Некритические ошибки: уведомления в правом верхнем углу -->
	<div class="fixed top-4 right-4 space-y-2 z-40">
		{#each $nonCriticalErrors as error (error.id)}
			<div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded shadow">
				<p>{error.message}</p>
				<button class="text-sm text-blue-500 underline mt-1" on:click={() => clearError(error.id)}>
					Закрыть
				</button>
			</div>
		{/each}
	</div>
{/if}
