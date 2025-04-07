<script lang="ts">
	import { goto } from '$app/navigation';
    import { page } from '$app/state';

	function goHome() {
		goto('/');
	}
</script>

{#if page.status == 404}
    <div class="min-h-[50vh] flex flex-col items-center justify-center bg-base-10">
    	<h1 class="text-[40px] text-green-500">404</h1>
    	<p class="mt-4 text-2xl font-semibold text-gray-700">Ой, страница не найдена!</p>
    	<p class="mt-2 text-gray-500">Кажется, вы заблудились. Вернитесь на главную страницу.</p>
    	
    	<button class="btn btn-success mt-6" onclick={goHome}>
    		Вернуться домой
    	</button>
    </div>
{/if}
