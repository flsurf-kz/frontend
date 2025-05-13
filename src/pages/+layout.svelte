<script>
	import '$lib/app/styles.css';
	import { Footer } from '$lib/shared/ui/footer';
	import { CurrentTheme } from '$lib/shared/ui/theme';
	import { Navbar } from '$lib/widgets/navbar/ui';
</script>

<div data-theme={$CurrentTheme} class="app">
	<Navbar/>

	<main>
		<slot />
	</main>

	<Footer />
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 2rem;
		width: 100%;
		max-width: 90rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
