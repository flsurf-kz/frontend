<script lang="ts">
  import { writable } from 'svelte/store';
  import {
    ChatsSidebar,
    ChatHeader,
    ChatMessages,
    MessageInput,
    NoChatPlaceholder,
  } from '$lib/widgets/messanging';
  import { CurrentChat, CurrentMessages, openChat, CurrentChatsList } from '$lib/entities/messanging';
	import ChatControl from '$lib/widgets/messanging/ui/chat-control.svelte';
	import { page } from '$app/stores';

  /* открыта ли правая панель? */
  export const controlOpen = writable(false);

    /* всегда следим за параметром chatId ------------- */
  $: chatIdParam = $page.url.searchParams.get('chatId');


  /* если он изменился – открываем чат */
  $: if (chatIdParam && (!$CurrentChat || $CurrentChat.id !== chatIdParam)) { 
    let chat = $CurrentChatsList.find(x => x.id == chatIdParam)
    if (chat !== undefined) {  
      openChat(chat) 
      $controlOpen = false; 
    }
  }
</script>

<!-- верхний уровень: растягиваемся на весь экран и гасим скролл body -->
<div class="flex-1 min-h-0 flex overflow-hidden">  <!-- +overflow-hidden -->
  <ChatsSidebar chatControl={$controlOpen}/>

  <!-- grid‑контейнер тоже должен уметь ужиматься -->
  <div class="flex-1 grid grid-cols-[1fr_auto] min-h-0"> <!-- +min-h-0 -->
    <!-- chat‑pane -->
    <section class="flex flex-col bg-base-100 min-h-0"> <!-- +min-h-0 -->
      <ChatHeader bind:controlOpen={$controlOpen} />

      {#if $CurrentChat}
        <!-- главный скроллируемый блок -->
        <ChatMessages
          messages={$CurrentMessages}
        />
        <MessageInput />
      {:else}
        <NoChatPlaceholder/>
      {/if}
    </section>

    {#if $controlOpen}
      <ChatControl onclose={() => $controlOpen = false}/>
    {/if}
  </div>
</div>
