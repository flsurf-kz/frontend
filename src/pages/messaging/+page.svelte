<script lang="ts">
  import { writable } from 'svelte/store';
  import {
    ChatsSidebar,
    ChatHeader,
    ChatMessages,
    MessageInput,
    NoChatPlaceholder,
  } from '$lib/widgets/messanging';
  import { CurrentChat, CurrentMessages } from '$lib/entities/messanging';
	import ChatControl from '$lib/widgets/messanging/ui/chat-control.svelte';

  /* открыта ли правая панель? */
  export const controlOpen = writable(false);
</script>

<div class="h-screen flex">
  <!-- Sidebar -->
  <ChatsSidebar />

  <!-- Основная область: grid  (chat ‖ control) -->
  <div class="flex-1 grid grid-cols-[1fr_auto]">
    <!-- Chat pane -->
    <section class="flex flex-col bg-base-100">
      <ChatHeader bind:controlOpen={$controlOpen} />

      {#if $CurrentChat}
        <ChatMessages messages={$CurrentMessages} />
        <MessageInput />
      {:else}
        <NoChatPlaceholder />
      {/if}
    </section>

    <!-- Control pane (lazy) -->
    {#if $controlOpen}
      <ChatControl onclose={() => {$controlOpen = false}}/>
    {/if}
  </div>
</div>
