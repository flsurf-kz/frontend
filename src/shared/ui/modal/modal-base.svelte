<script lang="ts">
    export let open: boolean = false;
    export let onClose = () => {};
  </script>
  
{#if open}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded shadow-lg min-w-[300px]">
        <button class="btn btn-sm btn-circle absolute right-2 top-2" on:click={onClose}>✕</button>
        <slot />
      </div>
    </div>
{/if}
  