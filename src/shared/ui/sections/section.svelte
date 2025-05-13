<script lang="ts">
	export let title = '';
	export let count = 0;
</script>

<div class="collapse collapse-arrow bg-base-100 rounded-lg border border-base-300">
	<input type="checkbox" />
	<div class="collapse-title font-semibold flex items-center gap-2">
		{title} <span class="opacity-60">({count})</span>
	</div>
	<div class="collapse-content p-0">
		<slot />
	</div>
</div>
    