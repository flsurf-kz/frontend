<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let sortOptions: string[] = ['По времени', 'По релевантности'];
    export let selected: string = sortOptions[0];
  
    const dispatch = createEventDispatcher();
  
    function onSelect(event: Event) {
      const value = (event.target as HTMLSelectElement).value;
      dispatch('change', value);
    }
  </script>
  
<div class="form-control w-full max-w-xs">
    <label class="label">
      <span class="label-text">Сортировать по:</span>
    </label>
    <select
      class="select select-bordered w-full"
      bind:value={selected}
      on:change={onSelect}
    >
      {#each sortOptions as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
</div>
  