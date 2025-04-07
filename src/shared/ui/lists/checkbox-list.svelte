<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let options: string[] = [];
    export let selected: string[] = [];
  
    const dispatch = createEventDispatcher();
  
    function toggleOption(option: string) {
      let newSelected = [...selected];
      if (newSelected.includes(option)) {
        newSelected = newSelected.filter(o => o !== option);
      } else {
        newSelected.push(option);
      }
      dispatch('change', newSelected);
    }
  </script>
  
<div class="flex flex-col gap-2">
{#each options as option}
  <label class="flex items-center gap-2">
    <input
      type="checkbox"
      class="checkbox"
      checked={selected.includes(option)}
      on:change={() => toggleOption(option)}
    />
    <span>{option}</span>
  </label>
{/each}
</div>
