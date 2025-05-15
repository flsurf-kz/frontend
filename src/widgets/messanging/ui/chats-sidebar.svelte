<script lang="ts">
	import { goto } from '$app/navigation';
  import { CurrentChatsList, openChat, CurrentChat } from '$lib/entities/messanging/';
	import { GlobalClient } from '$lib/shared/api';
	import { showNotification } from '$lib/shared/ui/errors/modal';
	import { InputField, SearchField } from '$lib/shared/ui/inputs';
	import ModalBase from '$lib/shared/ui/modal/modal-base.svelte';
	import { CreateChatDto } from 'flsurf-client';
  import { derived } from 'svelte/store';
  import { writable } from 'svelte/store';
  import { page } from '$app/stores' 
	import { debounce } from 'lodash';
	import { SearchIcon } from '$lib/shared/ui/icons';

  export let className = ''

    // оригинальный стор для фильтрации
  const search = writable('');
  // локальный биндинг для поля ввода
  let localSearch = '';

  // дебаунс на 300 мс
  const debounced = debounce((val: string) => {
    search.set(val);
  }, 300);

  function onInputSearch(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    localSearch = v;
    debounced(v);
  }

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
  let description = "" 

  async function createChat() {
    try { 
      let res = await GlobalClient.createChat(new CreateChatDto({
        name: newName, 
        description: description, 
      }))
      let chat = await GlobalClient.getChat(res.id); 
      $CurrentChatsList = [...$CurrentChatsList, chat] 
    } catch (exc) { 
      showNotification("Ошибка при создании чата")
    } 
    newModal.set(false);
    newName = '';
    description = ''
  }

  function selectChat(id: string) {
    /* 1. открываем чат логически */
    openChat(id);

    /* 2. синхронизируем адресную строку
       – оставляем тот же путь, только /?chatId=…                */
    const url = new URL($page.url);
    url.searchParams.set('chatId', id);

    /* 3. переходим без перезагрузки */
    goto(url.pathname + url.search, {
      keepFocus: true,
      noScroll:  true
    });
  }
</script>
  
  <aside class="w-75 bg-base-200 min-h-0  flex flex-col  shrink-0 {className}">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_missing_attribute -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="flex items-center justify-between p-4">
      <h1 class="text-2xl font-bold">Сообщения</h1>
    
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
    
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <ul tabindex="0"
            class="menu dropdown-content bg-base-200 text-base-content
                   rounded-box w-60 shadow mt-3">
          <li><a on:click={() => newModal.set(true)}>Создать новый чат</a></li>
          <li><a on:click={() => settingsModal.set(true)}>Настройки сообщении</a></li>
          <li><a on:click={() => oooModal.set(true)}>Не онлайн</a></li>
          <li><a on:click={() => shortcutsModal.set(true)}>Горячие клавишы</a></li>

          <li><a on:click={() => integModal.set(true)}>Настроить интеграции</a></li>
        </ul>
      </div>
    </div>
  
    <div class="px-4 mb-4">
      <div class="relative">
        <input
          type="text"
          class="input input-bordered w-full pr-10"
          placeholder="Поиск..."
          bind:value={localSearch}
          on:input={onInputSearch}
        />
        <SearchIcon
          className="absolute top-1/2 right-3 w-5 h-5 text-gray-500 pointer-events-none -translate-y-1/2"
        />
      </div>
    </div>
  
    <!-- ===== Chats list ===== -->
    <div class="flex-1 overflow-y-auto px-2 space-y-2">
      {#each $filtered as chat}
        <button
          class="flex items-center gap-3 w-full px-3 py-2 rounded-lg
                 hover:bg-base-300 text-left"
          on:click={() => selectChat(chat.id)}
          class:selected={$CurrentChat?.id === chat.id}
        >
          <div class="avatar placeholder">
            <div class="bg-primary text-primary-content rounded-full w-8">
              {chat?.name?.slice(0, 1)}
            </div>
          </div>
          <div class="flex-1">
            <p class="font-medium truncate">{chat.name}</p>
            <p class="text-xs opacity-60 max-w-50" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
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
    <InputField bind:value={newName} placeholder="Как вы его бы назвали?" className="w-full" label="Имя чата"/>
    <InputField bind:value={description} placeholder="Чем бы описали чат?" className="w-full" label="Описание чата"/>
    <button class="btn btn-primary" on:click={createChat}>Создать</button>
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

<style>
  .selected { 
    background-color: green;
    color: white; 
  }
</style>