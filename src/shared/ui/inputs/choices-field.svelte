<script lang="ts">
	import type { SelectItem } from '$lib/shared/types';
	import { NotificationEntity } from 'flsurf-client';
    import { createEventDispatcher } from 'svelte';
  
    export let options: SelectItem[] = [];
    export let value: string = '';
    export let label: string = '';
    export let disabled: boolean = false;
  
    const dispatch = createEventDispatcher();
  
    function onSelect(event: Event) {
      const target = event.target as HTMLSelectElement;
      dispatch('change', target.value);
    }
</script>
  
<div class="form-control w-full max-w-xs">
{#if label}
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label">
    <span class="label-text">{label}</span>
  </label>
{/if}
<select
  class="select select-bordered w-full"
  bind:value
  on:change={onSelect}
  disabled={disabled}
>
  {#each options as option}
    <option value={option}>{option}</option>
  {/each}
</select>
</div>
  