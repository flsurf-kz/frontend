<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { debounce } from 'lodash-es';
  
    export let tags: string[] = [];
    export let placeholder: string = 'Поиск или добавьте тег...';
    export let label: string = '';
    export let delay: number = 300;
  
    let inputValue = '';
    const dispatch = createEventDispatcher();
  
    const debouncedSearch = debounce((val: string) => {
      dispatch('search', val);
    }, delay);
  
    function onInput(event: Event) {
      inputValue = (event.target as HTMLInputElement).value;
      debouncedSearch(inputValue);
    }
  
    function onKeydown(event: KeyboardEvent) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        addTag();
      }
    }
  
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

    <div class="relative">
      <input
        class="input input-bordered w-full pr-10"
        type="text"
        bind:value={inputValue}
        placeholder={placeholder}
        on:input={onInput}
        on:keydown={onKeydown}
      />
      <span class="absolute top-0 right-0 mt-2 mr-2 text-gray-500">🔍</span>
    </div>
</div>
  