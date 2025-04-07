<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let name: string = 'radio-group';
    export let value: string = '';
    export let options: string[] = [];
  
    const dispatch = createEventDispatcher();
  
    function onChange(newVal: string) {
      dispatch('change', newVal);
    }
</script>
  
<div class="flex flex-col gap-2">
{#each options as option}
  <label class="flex items-center gap-2">
    <input
      type="radio"
      class="radio"
      name={name}
      value={option}
      checked={value === option}
      on:change={() => onChange(option)}
    />
    <span>{option}</span>
  </label>
{/each}
</div>
  