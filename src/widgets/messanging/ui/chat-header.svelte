<script lang="ts">
    import { CurrentChat } from '$lib/entities/messanging';
 </script>
  
<!-- svelte-ignore a11y_consider_explicit_label -->
<header class="h-14 flex items-center justify-between px-6 border-b border-base-300">
{#if $CurrentChat}
  <h2 class="text-xl font-semibold truncate">{$CurrentChat.name}</h2>
{:else}
  <span>Select a chat</span>
{/if}

<!-- иконки действий -->
<div class="flex items-center gap-4">
  <button class="btn btn-ghost btn-sm btn-square">
    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none"
         viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 6v6l4 2" />
    </svg>
  </button>
  <!-- … -->
</div>
</header>
  