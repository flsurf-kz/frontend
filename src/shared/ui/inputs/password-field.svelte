<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let value: string = '';
    export let placeholder: string = 'Введите пароль...';
    export let label: string = '';
    export let error: string = '';
    export let disabled: boolean = false;
    export let required: boolean = false; 
    export let className: string = ''; 
    
    let showPassword = false;
    const dispatch = createEventDispatcher();
  
    function onInput(event: Event) {
      const target = event.target as HTMLInputElement;
      dispatch('change', target.value);
    }
  
    function toggleVisibility() {
      showPassword = !showPassword;
    }
</script>

  <!-- svelte-ignore a11y_label_has_associated_control -->
<div class="form-control w-full">
{#if label}
  <label class="label">
    <span class="label-text">{label}</span>
  </label>
{/if}
<div class="relative w-full">
  <input
    class="input input-bordered w-full pr-10 {className} focus:outline-none"
    type={showPassword ? 'text' : 'password'}
    value={value}
    placeholder={placeholder}
    on:input={onInput}
    disabled={disabled}
    {required}
  />
  <button
    type="button"
    class="absolute top-0 right-0 mt-2 mr-2 text-gray-500"
    on:click={toggleVisibility}
  >
    {#if showPassword} <img src="https://cdn-icons-png.flaticon.com/512/11502/11502607.png" alt="" class="w-5 h-5 object-contain"> {/if}
    {#if !showPassword} <img src="https://cdn-icons-png.flaticon.com/512/8275/8275675.png" alt="" class="w-5 h-5 object-contain"> {/if}
  </button>
</div>
{#if error}
  <p class="text-red-500 text-sm mt-1">{error}</p>
{/if}
</div>
  