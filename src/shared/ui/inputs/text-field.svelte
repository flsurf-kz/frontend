<script lang="ts">
    export let label: string = '';
    export let placeholder: string = '';
    export let rows: number = 4;
    export let disabled: boolean = false;
    export let value: string = '';
    export let maxLength: number = 0;
  
    $: remaining = maxLength > 0 ? maxLength - value.length : null;
  
    function clear() {
      value = '';
    }
  </script>
  
  <div class="w-full space-y-1 relative">
    {#if label}
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label class="block text-sm font-medium text-gray-700">{label}</label>
    {/if}
  
    <div class="relative">
      <textarea
        class="textarea textarea-bordered w-full resize-y pr-10"
        bind:value
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        maxlength={maxLength > 0 ? maxLength : undefined}
      ></textarea>
  
      {#if value}
        <button
          type="button"
          on:click={clear}
          class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-sm"
          title="Очистить"
        >
          ✕
        </button>
      {/if}
    </div>
  
    {#if maxLength > 0}
      <div class="text-right text-xs text-gray-500">
        {value.length} / {maxLength} символов
      </div>
    {/if}
  </div>
  