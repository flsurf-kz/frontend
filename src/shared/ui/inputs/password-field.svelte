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
<div class="form-control w-full max-w-xs">
{#if label}
  <label class="label">
    <span class="label-text">{label}</span>
  </label>
{/if}
<div class="relative">
  <input
    class="input input-bordered w-full pr-10 {className}"
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
    {#if showPassword} 🙈 {/if}
    {#if !showPassword} 👁️ {/if}
  </button>
</div>
{#if error}
  <p class="text-red-500 text-sm mt-1">{error}</p>
{/if}
</div>
  