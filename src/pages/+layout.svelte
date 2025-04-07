<script>
	import '$lib/app/styles.css';
	import { UserTypes } from '$lib/entities/user/enums/user-types';
	import { Footer } from '$lib/shared/ui/footer';
	import { Navbar } from '$lib/widgets/navbar/ui';
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
