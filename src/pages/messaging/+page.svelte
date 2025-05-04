<script lang="ts">
	import { CurrentChat, CurrentMessages } from "$lib/entities/messanging";
	import { 
        ChatHeader, 
        ChatMessages,
        ChatsSidebar, 
        MessageInput, 
        NoChatPlaceholder 
    } from "$lib/widgets/messanging";

</script>
  
  <div class="h-screen flex">
    <!-- левый сайдбар -->
    <ChatsSidebar />
  
    <!-- правая часть -->
    <section class="flex-1 bg-base-100 flex flex-col">
      <ChatHeader />
  
      {#if $CurrentChat}
        <ChatMessages messages={$CurrentMessages} />
        <MessageInput />
      {:else}
        <NoChatPlaceholder />
      {/if}
    </section>
  </div>
  