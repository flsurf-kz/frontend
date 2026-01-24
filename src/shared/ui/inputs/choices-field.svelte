<script lang="ts">
	import type { SelectItem } from '$lib/shared/types';
	import { createEventDispatcher } from 'svelte';

	export let options: SelectItem[] = [];
	export let value: string = '';
	export let label: string = '';
	export let disabled: boolean = false;
	export let className: string = ""
	export let required: boolean = false; 

	const dispatch = createEventDispatcher();

	function onSelect(event: Event) {
		const target = event.target as HTMLSelectElement;
		dispatch('change', target.value);
	}
</script>

<div class="form-control w-full max-w-xs {className}">
	{#if label}
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="label">
			<span class="label-text">{label}</span>
		</label>
	{/if}

	<select
		class="select select-bordered w-full"
		bind:value
		on:change={onSelect}
		disabled={disabled}
		{required}
	>
		{#each options as option}
			<option value={option.key}>{option.label}</option>
		{/each}
	</select>
</div>
