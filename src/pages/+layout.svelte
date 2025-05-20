<script lang="ts">
	import { page } from '$app/stores';       // SvelteKit 5
	import '$lib/app/styles.css';
	import { ErrorNotifications } from '$lib/shared/ui/errors';
	import { Footer } from '$lib/shared/ui/footer';
	import { CurrentTheme } from '$lib/shared/ui/theme';
	import { Navbar } from '$lib/widgets/navbar/ui';

	// маршруты, для которых ширину ограничивать не надо
	const overrideList: string[] = ['/messaging', '/chats'];

	/* --------------------------------------------------------
	   достаточно одной реактивной декларации –  isWidthIgnored
	   она каждый раз пересчитывается, когда меняется $page
	   -------------------------------------------------------- */
	$: isWidthIgnored = overrideList
		.some(prefix => $page.url.pathname.startsWith(prefix));

	$: isFooterRemoved = isWidthIgnored; 
</script>

<div data-theme={$CurrentTheme} class="app">
	<Navbar />

	<!-- class directive читается проще, чем строковая склейка -->
	<main class="main-container" class:full-width={isWidthIgnored}>
		<slot />
	</main>

	{#if !isFooterRemoved}
		<Footer />
	{/if}

	<ErrorNotifications />
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.main-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 2rem;
		width: 100%;
		max-width: 90rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	/* когда добавляется .full-width, правила ниже перекрывают базовые */
	.main-container.full-width {
		max-width: none;
		padding: 0;
		margin: 0;
	}
</style>
