<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let value: string | number = '';
    export let placeholder: string = 'Введите текст...';
    export let label: string = '';
    export let error: string = '';
    export let inputType: "email" | "text" | "phone" | "number" = "text" 
    export let disabled: boolean = false;
    export let required: boolean = false; 
    export let className: string = ""
    export let maxlength: number = 0; 
    
    const dispatch = createEventDispatcher();
  
    function onInput(event: Event) {
      const target = event.target as HTMLInputElement;
      dispatch('change', target.value);
    }
  
    function clearInput() {
      dispatch('change', '');
    }
  </script>
  
  <div class="form-control w-full flex-col">
    {#if label}
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">
        <span class="label-text">{label}</span>
      </label>
    {/if}
    <div class="relative  w-full">
      <input
        class="input input-bordered w-full pr-10 focus:outline-none {className}"
        type={inputType}
        bind:value
        placeholder={placeholder}
        on:input={onInput}
        disabled={disabled}
        {required}
        {maxlength}
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
  