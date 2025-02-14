<script>
    import Navbar from '$lib/components/Navbar.svelte'
    import { UserTypes } from '$lib/enums/UserTypes'
</script>

<Navbar userType={UserTypes.Client} isAuthorized={false}/> 

<div class="app">
    <slot></slot>
</div>
