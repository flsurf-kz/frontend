<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { UserTypes } from '$lib/enums/UserTypes'
	import Footer from '$lib/components/Footer.svelte';
</script>

<div class="app">
	<Navbar userType={UserTypes.Client} isAuthorized={true}/>

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
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
