<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { debounce } from 'lodash'; // Нужно установить lodash: `npm i lodash`
  
    export let value: string = '';
    export let placeholder: string = 'Поиск...';
    export let label: string = '';
    export let disabled: boolean = false;
    export let delay: number = 300; // задержка в мс
  
    const dispatch = createEventDispatcher();
  
    const debouncedChange = debounce((val: string) => {
      dispatch('search', val);
    }, delay);
  
    function onInput(event: Event) {
      const target = event.target as HTMLInputElement;
      value = target.value;
      debouncedChange(value);
    }
</script>

<div class="form-control w-full max-w-xs">
{#if label}
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label">
    <span class="label-text">{label}</span>
  </label>
{/if}
<div class="relative">
  <input
    class="input input-bordered w-full pr-10"
    type="text"
    bind:value
    placeholder={placeholder}
    on:input={onInput}
    disabled={disabled}
  />
  <span class="absolute top-0 right-0 mt-2 mr-2 text-gray-500">🔍</span>
</div>
</div>
  