<script lang="ts">
  import { goto } from '$app/navigation';
  import { CurrentChatsList, openChat, CurrentChat } from '$lib/entities/messanging/';
  import { GlobalClient } from '$lib/shared/api';
  import { showNotification } from '$lib/shared/ui/errors/modal';
  import { InputField } from '$lib/shared/ui/inputs'; // SearchField удален, т.к. InputField используется для поиска участников
  import ModalBase from '$lib/shared/ui/modal/modal-base.svelte';
  import { ChatEntity, CreateChatDto, GetUsersListQuery, UserEntity } from 'flsurf-client'; // Предполагаем UserGetDto или аналогичный тип для пользователя
  import { derived, writable } from 'svelte/store';
  import { page } from '$app/stores';
  import { debounce } from 'lodash';
  import { SearchIcon, UserPlusIcon, XIcon } from '$lib/shared/ui/icons'; // Добавим иконки

  export let chatControl: boolean = false; 
  export let className = '';

  const searchChatsTerm = writable('');
  let localSearchChatsInput = '';
  const debouncedSearchChats = debounce((val: string) => {
    searchChatsTerm.set(val);
  }, 300);

  function onInputSearchChats(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    localSearchChatsInput = v;
    debouncedSearchChats(v);
  }

  const filteredChats = derived(
    [CurrentChatsList, searchChatsTerm],
    ([$list, $s]) =>
      $list.filter((c: any) => c.name.toLowerCase().includes($s.toLowerCase()))
  );

  /* --- Modal flags --- */
  const newModal = writable(false);
  const settingsModal = writable(false);
  const oooModal = writable(false);
  const shortcutsModal = writable(false);
  const integModal = writable(false);

  /* --- Создание нового чата --- */
  let newChatName = ''; // Переименовано для ясности
  let newChatDescription = "";

  // --- Логика для участников ---
  let participantSearchInput = '';
  const participantSearchLoading = writable(false);
  const participantSearchResults = writable<UserEntity[]>([]); // Используем UserEntity
  const selectedParticipants = writable<UserEntity[]>([]);   // Используем UserEntity

  let currentUserId: string | undefined;
  page.subscribe(p => {
    currentUserId = p.data.user?.id;
  });


  const debouncedParticipantSearch = debounce(async () => {
    if (participantSearchInput.trim().length < 2) {
      participantSearchResults.set([]);
      return;
    }
    participantSearchLoading.set(true);
    try {
      // Используем GetUsersListQuery для поиска
      const query = new GetUsersListQuery({
        searchTerm: participantSearchInput,
        ends: 5, // Ограничиваем количество результатов для выпадающего списка
        start: 0
        // Можно добавить фильтр по роли, если это релевантно для поиска участников
        // role: GetUsersListQueryRole.Freelancer // Например, если вы хотите добавлять только фрилансеров
      });
      const results = await GlobalClient.searchUsers(query); // или GlobalClient.getUsersList(query)
      
      participantSearchResults.set(
        results.filter(user =>
          user.id !== currentUserId &&
          !$selectedParticipants.find(p => p.id === user.id)
        )
      );
    } catch (err) {
      console.error("Ошибка поиска пользователей:", err);
      showNotification("Ошибка поиска пользователей");
      participantSearchResults.set([]);
    } finally {
      participantSearchLoading.set(false);
    }
  }, 300);

  function handleParticipantSearchInput(e: Event) {
    participantSearchInput = (e.target as HTMLInputElement).value;
    debouncedParticipantSearch();
  }

  function addParticipant(user: UserEntity) { // Тип изменен на UserEntity
    selectedParticipants.update(current => {
      if (!current.find(p => p.id === user.id)) {
        return [...current, user];
      }
      return current;
    });
    participantSearchResults.update(results => results.filter(r => r.id !== user.id));
    participantSearchInput = '';
    participantSearchResults.set([]); // Сразу очищаем результаты после выбора
  }

  function removeParticipant(userId: string) {
    selectedParticipants.update(current => current.filter(p => p.id !== userId));
    // Опционально: можно снова запустить поиск, чтобы пользователь появился в результатах,
    // но для простоты пока просто удаляем из выбранных.
    debouncedParticipantSearch(); // Обновить результаты поиска, если пользователь был там
  }

  async function createChat() {
    if (!newChatName.trim()) {
      showNotification("Имя чата не может быть пустым.");
      return;
    }

    const participantIds = $selectedParticipants.map(p => p.id);

    const dto = new CreateChatDto({
      name: newChatName,
      description: newChatDescription,
      userIds: participantIds
    });

    try {
      const res = await GlobalClient.createChat(dto);
      const chat = await GlobalClient.getChat(res.id); // Получаем полный объект чата
      CurrentChatsList.update(list => [chat, ...list]);

      newModal.set(false);
      newChatName = '';
      newChatDescription = '';
      selectedParticipants.set([]);
      participantSearchInput = '';
      participantSearchResults.set([]);
      showNotification(`Чат "${chat.name}" успешно создан!`);
    } catch (exc: any) {
      console.error("Ошибка при создании чата:", exc);
      const errorMessage = exc?.error?.message || exc?.message || "Неизвестная ошибка при создании чата";
      showNotification(errorMessage);
    }
  }

  function selectChat(chat: ChatEntity) {
    chatControl = false; 
    openChat(chat);
    const url = new URL($page.url);
    url.searchParams.set('chatId', chat.id);
    goto(url.pathname + url.search, {
      keepFocus: true,
      noScroll: true
    });
  }
</script>

<aside class="w-75 bg-base-200 min-h-0 flex flex-col shrink-0 {className}">
  <div class="flex items-center justify-between p-4">
    <h1 class="text-2xl font-bold">Сообщения</h1>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-ghost btn-circle btn-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
      </label>
      <!-- svelte-ignore a11y_no_static_element_interactions -->        
     <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_missing_attribute -->
      <ul tabindex="0" class="menu dropdown-content bg-base-200 text-base-content rounded-box w-60 shadow-lg mt-3 z-[1]">

        <li><a on:click={() => newModal.set(true)}>Создать новый чат</a></li>
        <li><a on:click={() => settingsModal.set(true)}>Настройки сообщений</a></li>
        <li><a on:click={() => oooModal.set(true)}>Не онлайн</a></li>
        <li><a on:click={() => shortcutsModal.set(true)}>Горячие клавиши</a></li>
        <li><a on:click={() => integModal.set(true)}>Настроить интеграции</a></li>
      </ul>
    </div>
  </div>

  <div class="px-4 mb-4">
    <div class="relative">
      <input
        type="text"
        class="input input-bordered w-full pr-10"
        placeholder="Поиск по чатам..."
        bind:value={localSearchChatsInput}
        on:input={onInputSearchChats}
      />
      <SearchIcon
        className="absolute top-1/2 right-3 w-5 h-5 text-gray-500 pointer-events-none -translate-y-1/2"
      />
    </div>
  </div>

  <div class="flex-1 overflow-y-auto px-2 space-y-1 pb-4"> 
    {#each $filteredChats as chat (chat.id)}
      <button
        class="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-blue-600 text-left transition-colors duration-150 ease-in-out"
        on:click={() => selectChat(chat)}
        class:bg-primary={ $CurrentChat?.id === chat.id }
        class:text-primary-content={ $CurrentChat?.id === chat.id }
        class:hover:bg-primary-focus={ $CurrentChat?.id === chat.id }
      >
        <div class="avatar placeholder flex-shrink-0">
          <div class="bg-neutral-focus text-neutral-content rounded-full w-10 h-10 flex items-center justify-center"> 
            <span class="text-sm font-semibold">{chat?.name?.slice(0, 2).toUpperCase()}</span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate">{chat.name}</p>
          <p class="text-xs opacity-70 truncate">
            {chat.lastMessage?.text ?? 'Нет сообщений'}
          </p>
        </div>
        {#if chat.currentUserUnreadMessagesCount ?? 0 > 0} 
          <span class="badge badge-secondary badge-sm ml-auto">{chat.currentUserUnreadMessagesCount}</span>
        {/if}
      </button>
    {/each}
    {#if $filteredChats.length === 0}
      <p class="text-center text-gray-500 p-4">Чаты не найдены.</p>
    {/if}
  </div>
</aside>
<ModalBase bind:open={$newModal} title="Создать новый чат">
  <div class="space-y-4 p-1">
    <InputField bind:value={newChatName} placeholder="Например, 'Обсуждение проекта X'" className="w-full" label="Имя чата" required={true} />
    <InputField bind:value={newChatDescription} placeholder="Краткое описание или цели чата" className="w-full" label="Описание чата (необязательно)"/>

    <div class="form-control">
      <label class="label" for="participant-search-input"> 
        <span class="label-text">Добавить участников</span>
      </label>
      <div class="relative">
        <input
          type="text"
          id="participant-search-input"
          placeholder="Введите имя или email для поиска..."
          class="input input-bordered w-full pr-10"
          bind:value={participantSearchInput}
          on:input={handleParticipantSearchInput}
        />
        {#if $participantSearchLoading}
          <span class="loading loading-spinner loading-sm absolute top-1/2 right-3 -translate-y-1/2"></span>
        {:else}
          <UserPlusIcon className="absolute top-1/2 right-3 w-5 h-5 text-gray-400 pointer-events-none -translate-y-1/2" />
        {/if}
      </div>
    </div>

    {#if $participantSearchResults.length > 0}
      <ul class="mt-1 border border-base-300 rounded-md max-h-32 overflow-y-auto text-sm divide-y divide-base-200">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        {#each $participantSearchResults as user (user.id)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <li class="p-2 hover:bg-base-200 flex justify-between items-center cursor-pointer" on:click={() => addParticipant(user)}>
            <div>
              <span class="font-medium">{user.fullname || user.name || user.email}</span>
              {#if user.email && (user.fullname) } 
                <span class="text-xs text-gray-500 ml-2">({user.email})</span>
              {/if}
            </div>
            <button type="button" class="btn btn-xs btn-outline btn-primary" title="Добавить {user.fullname || user.email}">+</button>
          </li>
        {/each}
      </ul>
    {/if}

    {#if $selectedParticipants.length > 0}
      <div class="mt-3">
        <p class="text-xs font-medium text-gray-600 mb-1">Выбранные участники:</p>
        <ul class="flex flex-wrap gap-1.5">
          {#each $selectedParticipants as participant (participant.id)}
            <li class="badge badge-lg badge-primary gap-1.5 pl-2 pr-1">
              <span>{participant.fullname || participant.name || participant.email}</span>
              <button type="button" on:click={() => removeParticipant(participant.id)} class="btn btn-xs btn-ghost btn-circle !p-0 !min-h-0 !h-4 !w-4" title="Удалить {participant.fullname || participant.email}">
                <XIcon className="w-3 h-3" />
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
    <button class="btn btn-primary w-full mt-6" on:click={createChat} disabled={!newChatName.trim()}>Создать чат</button>
  </div>
</ModalBase>

<ModalBase bind:open={$settingsModal} title="Настройки сообщений">
 <p class="opacity-70">Здесь будут настройки уведомлений, автосохранения черновиков и&nbsp;т.&nbsp;д.</p>
</ModalBase>

<ModalBase bind:open={$oooModal} title="Не онлайн">
 <p class="opacity-70">Функция «Нет на месте». Заглушка.</p>
</ModalBase>

<ModalBase bind:open={$shortcutsModal} title="Горячие клавиши">
 <ul class="list-disc list-inside space-y-1 text-sm">
   <li><kbd class="kbd kbd-sm">Ctrl</kbd> + <kbd class="kbd kbd-sm">K</kbd> — открыть поиск</li>
   <li><kbd class="kbd kbd-sm">Ctrl</kbd> + <kbd class="kbd kbd-sm">↑</kbd> — пред. чат</li>
   <li><kbd class="kbd kbd-sm">Ctrl</kbd> + <kbd class="kbd kbd-sm">↓</kbd> — след. чат</li>
 </ul>
</ModalBase>

<ModalBase bind:open={$integModal} title="Настроить интеграции">
 <p class="opacity-70">Здесь позже появится список интеграций (Slack, Email, Webhooks …)</p>
</ModalBase>

<style>
  /* Стили для лучшего отображения списка чатов и аватарок */
  .avatar .bg-neutral-focus {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>