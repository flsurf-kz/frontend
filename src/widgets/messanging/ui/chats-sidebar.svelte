<script lang="ts">
  import { CurrentChatsList, openChat } from '$lib/entities/messanging/';
	import { GlobalClient } from '$lib/shared/api';
	import ModalBase from '$lib/shared/ui/modal/modal-base.svelte';
	import { CreateChatDto } from 'flsurf-client';
  import { derived } from 'svelte/store';
  import { writable } from 'svelte/store';

  const search = writable('');
  const filtered = derived(
    [CurrentChatsList, search],
    ([$list, $s]) =>
      $list.filter((c: any) => c.name.toLowerCase().includes($s.toLowerCase()))
  );

      /* --- modal flags --- */
  const newModal        = writable(false);
  const settingsModal   = writable(false);
  const oooModal        = writable(false);
  const shortcutsModal  = writable(false);
  const integModal      = writable(false);

  /* --- dummy chat create --- */
  let newName = '';
  async function createChat() {
    GlobalClient.createChat(new CreateChatDto({
      name: newName
    }))
    newModal.set(false);
    newName = '';
  }
</script>
  
  <aside class="w-72 bg-base-200 h-full flex flex-col">
    
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="flex items-center justify-between p-4">
      <h1 class="text-2xl font-bold">Messages</h1>
    
      <!-- three‑dots dropdown -->
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-circle btn-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5"
               fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </label>
    
        <ul tabindex="0"
            class="menu dropdown-content bg-base-200 text-base-content
                   rounded-box w-60 shadow mt-3">
          <li><a on:click={() => newModal.set(true)}>Start a new conversation</a></li>
          <li><a on:click={() => settingsModal.set(true)}>Message settings</a></li>
          <li><a on:click={() => oooModal.set(true)}>Out of office</a></li>
          <li><a on:click={() => shortcutsModal.set(true)}>Shortcut keys</a></li>
          <li><a on:click={() => integModal.set(true)}>Configure integrations</a></li>
        </ul>
      </div>
    </div>
  
    <div class="px-4 mb-4">
      <input
        class="input input-bordered w-full"
        placeholder="Search"
        bind:value={$search}
      />
    </div>
  
    <!-- ===== Chats list ===== -->
    <div class="flex-1 overflow-y-auto px-2 space-y-2">
      {#each $filtered as chat}
        <button
          class="flex items-center gap-3 w-full px-3 py-2 rounded-lg
                 hover:bg-base-300 text-left"
          on:click={() => openChat(chat.id)}
        >
          <div class="avatar placeholder">
            <div class="bg-primary text-primary-content rounded-full w-8">
              {chat?.name?.slice(0, 1)}
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
  
<!-- ------------------------------------------------------------------ -->
<!-- =========================  Modals  =============================== -->
<!-- ------------------------------------------------------------------ -->

<!-- 1. New conversation -->
<ModalBase bind:open={$newModal} title="Start a new conversation">
  <div class="space-y-4">
    <input
      class="input input-bordered w-full"
      placeholder="Conversation name"
      bind:value={newName}
    />
    <button class="btn btn-primary" on:click={createChat}>Create</button>
  </div>
</ModalBase>

<!-- 2. Message settings -->
<ModalBase bind:open={$settingsModal} title="Message settings">
  <p class="opacity-70">
    Здесь будут настройки уведомлений, автосохранения черновиков и&nbsp;т.&nbsp;д.
  </p>
</ModalBase>

<!-- 3. Out of office -->
<ModalBase bind:open={$oooModal} title="Out of office">
  <p class="opacity-70">Функция «Нет на месте». Заглушка.</p>
</ModalBase>

<!-- 4. Shortcut keys -->
<ModalBase bind:open={$shortcutsModal} title="Shortcut keys">
  <ul class="list-disc list-inside space-y-1 text-sm">
    <li><kbd class="kbd kbd-sm">Ctrl</kbd> + <kbd class="kbd kbd-sm">K</kbd> — открыть поиск</li>
    <li><kbd class="kbd kbd-sm">Ctrl</kbd> + <kbd class="kbd kbd-sm">↑</kbd> — пред. чат</li>
    <li><kbd class="kbd kbd-sm">Ctrl</kbd> + <kbd class="kbd kbd-sm">↓</kbd> — след. чат</li>
  </ul>
</ModalBase>

<!-- 5. Configure integrations -->
<ModalBase bind:open={$integModal} title="Configure integrations">
  <p class="opacity-70">
    Здесь позже появится список интеграций (Slack, Email, Webhooks …)
  </p>
</ModalBase>