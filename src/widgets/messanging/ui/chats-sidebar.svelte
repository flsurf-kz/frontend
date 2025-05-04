<script lang="ts">
    import { CurrentChatsList, openChat } from '$lib/entities/messanging/';
    import { derived } from 'svelte/store';
    import { writable } from 'svelte/store';
  
    const search = writable('');
    const filtered = derived(
      [CurrentChatsList, search],
      ([$list, $s]) =>
        $list.filter((c: any) => c.name.toLowerCase().includes($s.toLowerCase()))
    );
  </script>
  
  <aside class="w-72 bg-base-200 h-full flex flex-col">
    <h1 class="text-2xl font-bold p-4">Messages</h1>
  
    <div class="px-4 mb-4">
      <input
        class="input input-bordered w-full"
        placeholder="Search"
        bind:value={$search}
      />
    </div>
  
    <div class="flex-1 overflow-y-auto px-2 space-y-2">
      {#each $filtered as chat}
        <button
          class="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-base-300 text-left"
          on:click={() => openChat(chat.id)}
        >
          <div class="avatar placeholder">
            <div class="bg-primary text-primary-content rounded-full w-8">
              {chat.name.slice(0, 1)}
            </div>
          </div>
          <div class="flex-1">
            <p class="font-medium truncate">{chat.name}</p>
            <p class="text-xs opacity-60 truncate">
              {chat.lastMessage?.text ?? ''}
            </p>
          </div>
        </button>
      {/each}
    </div>
  </aside>
  