<script lang="ts">
  import { CurrentChat } from '$lib/entities/messanging';
  export let controlOpen = false;
</script>

<header class="h-14 flex items-center justify-between px-6 border-b border-base-300">
  {#if $CurrentChat}
    <h2 class="text-xl font-semibold truncate">{$CurrentChat.name}</h2>

    <button
      class="btn btn-ghost btn-square btn-sm"
      on:click={() => controlOpen = !controlOpen}
      aria-label="Chat settings"
    >⚙</button>
  {:else}
    <span>Выбери чат</span>
  {/if}
</header>
