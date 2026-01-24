<script lang="ts">
    export let title: string = ""; 
</script>

<section class="bg-base-100 rounded-lg shadow border border-base-300">
	<header class="px-4 py-3 font-semibold border-b border-base-300">{title}</header>
	<ul class="divide-y divide-base-300"><slot /></ul>
</section>