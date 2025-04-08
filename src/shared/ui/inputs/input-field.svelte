<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let value: string = '';
    export let placeholder: string = 'Введите текст...';
    export let label: string = '';
    export let error: string = '';
    export let inputType: "email" | "text" | "phone" = "text" 
    export let disabled: boolean = false;
    export let required: boolean = false; 
    
    const dispatch = createEventDispatcher();
  
    function onInput(event: Event) {
      const target = event.target as HTMLInputElement;
      dispatch('change', target.value);
    }
  
    function clearInput() {
      dispatch('change', '');
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
        type={inputType}
        bind:value
        placeholder={placeholder}
        on:input={onInput}
        disabled={disabled}
        {required}
      />
      {#if value}
        <button
          type="button"
          class="absolute top-0 right-0 mt-2 mr-2 text-gray-500"
          on:click={clearInput}
        >
          ✕
        </button>
      {/if}
    </div>
    {#if error}
      <p class="text-red-500 text-sm mt-1">{error}</p>
    {/if}
  </div>
  