<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let tags: string[] = [];
    export let placeholder: string = 'Введите тег и нажмите Enter...';
    export let label: string = '';
  
    const dispatch = createEventDispatcher();
    let inputValue = '';
  
    function addTag() {
      const trimmed = inputValue.trim();
      if (trimmed) {
        dispatch('add', trimmed);
        inputValue = '';
      }
    }
  
    function removeTag(index: number) {
      dispatch('remove', index);
    }
  
    function onKeydown(event: KeyboardEvent) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        addTag();
      }
    }
</script>
  
<div class="form-control w-full max-w-xs">
{#if label}
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label">
    <span class="label-text">{label}</span>
  </label>
{/if}
  
<div class="flex flex-wrap gap-2 mb-2">
  {#each tags as tag, i}
    <div class="badge badge-accent flex items-center gap-1">
      {tag}
      <button type="button" on:click={() => removeTag(i)}>✕</button>
    </div>
  {/each}
</div>

<input
  class="input input-bordered w-full"
  type="text"
  bind:value={inputValue}
  placeholder={placeholder}
  on:keydown={onKeydown}
/>
</div>
  