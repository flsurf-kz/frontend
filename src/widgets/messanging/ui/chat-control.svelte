<script lang="ts">
  import { writable, derived, get } from 'svelte/store';
  import {
    CurrentChat,
  } from '$lib/entities/messanging';
	import { CurrentUser } from '$lib/entities/user/model/modal';
	import { GlobalClient } from '$lib/shared/api';
	import { FileEntity, GetUsersListQuery, InviteMemberDto, MessageEntity, UserEntity } from 'flsurf-client';
	import ModalBase from '$lib/shared/ui/modal/modal-base.svelte';
	import { showError } from '$lib/shared/ui/errors';
	import { debounce } from 'lodash';
	import { SearchIcon, UserPlusIcon } from '$lib/shared/ui/icons';
  
  const isOwner = derived(
    [CurrentChat, CurrentUser],
    ([$chat, $me]) => $chat?.ownerId === $me?.id
  );

  /* активная вкладка */
  type Tab = 'search' | 'people' | 'media' | 'notes' | 'archive';
  const tab = writable<Tab>('search');

  export let onclose = () => {}; 
  
  /* ---------- SEARCH MESSAGES ---------- */
  const query = writable('');
  const searchLoading = writable(false);
  const searchRes = writable<MessageEntity[]>([]);

  async function searchMessages() {
    searchLoading.set(true);
    const res = await GlobalClient.getMessages(
        get(CurrentChat)?.id || "", 
      //   query: get(query),
      // })
    );
    searchRes.set(res);
    searchLoading.set(false);
  }

  /* ---------- PEOPLE ---------- */
  const members = writable<UserEntity[]>([]);          // UserEntity[]
  const addModal = writable(false);
  const usersSearch = writable('');
  const usersRes = writable<UserEntity[]>([]);         // найденные юзеры
  const selectedRole = writable<'member' | 'owner'>('member');
  let userSearchInput = ''; // Значение из поля ввода для поиска
  const userSearchLoading = writable(false); // Флаг загрузки при поиске пользователей
  const userSearchResults = writable<UserEntity[]>([]); // Результаты поиска пользователей для добавления
  const isLoading = writable<boolean>(false)

  // Загрузка текущих участников чата
  async function loadMembers() {
    const currentChatId = get(CurrentChat)?.id;
    if (!currentChatId) {
      members.set([]);
      return;
    }
    userSearchLoading.set(true); // Можно использовать и для загрузки участников
    try {
      const chat = await GlobalClient.getChat(currentChatId); // Запрашиваем актуальные данные чата
      let loadedMembers = chat.participants ?? [];
      // Убедимся, что владелец есть в списке и не дублируется
      if (chat.owner) {
        if (!loadedMembers.find(m => m.id === chat.owner!.id)) {
            loadedMembers = [chat.owner, ...loadedMembers]; // Ставим владельца первым для наглядности
        }
      }
      members.set(loadedMembers);
    } catch (error) {
      showError("Ошибка загрузки участников чата", true);
      console.error("Load members error:", error);
      members.set([]);
    } finally {
      userSearchLoading.set(false);
    }
  }
  // Поиск пользователей для добавления в чат (с debounce)
  const performUserSearch = debounce(async () => {
    const searchTerm = userSearchInput.trim();
    if (searchTerm.length < 2) { // Начинаем поиск от 2-х символов
      userSearchResults.set([]);
      return;
    }
    userSearchLoading.set(true);
    try {
      const queryParams = new GetUsersListQuery({
        searchTerm: searchTerm,
        ends: 10, // Ограничиваем количество результатов для выпадающего списка
        start: 0
        // Если нужно искать только определенные роли для добавления:
        // role: GetUsersListQueryRole.Freelancer // Пример
      });
      const results = await GlobalClient.searchUsers(queryParams); // Используем ваш метод searchUsers
      
      const currentMemberIds = get(members).map(m => m.id); // ID уже состоящих в чате
      const selfId = get(CurrentUser)?.id; // ID текущего пользователя (чтобы не добавить самого себя)

      userSearchResults.set(
        results.filter(user => 
          user.id !== selfId && 
          !currentMemberIds.includes(user.id)
        )
      );
    } catch (error) {
      showError("Ошибка поиска пользователей", true);
      console.error("User search error:", error);
      userSearchResults.set([]);
    } finally {
      userSearchLoading.set(false);
    }
  }, 300); // Задержка в 300 мс

  function handleUserSearchInput(event: Event) {
    userSearchInput = (event.target as HTMLInputElement).value;
    performUserSearch();
  }

  async function findUsers() {
    // const res = await GlobalClient.getUsersList(
    //   new GetUsersQuery({ query: get(usersSearch) })
    // );  TODO 
    usersRes.set([]);
  }

// Приглашение пользователя в чат
  async function invite(userIdToInvite: string) {
    const currentChatId = get(CurrentChat)?.id;
    if (!currentChatId || !userIdToInvite) {
      showError("Ошибка: ID чата или пользователя не определены.", true);
      return;
    }

    try {
      isLoading.set(true); // Общий индикатор загрузки для модалки
      await GlobalClient.inviteMember(new InviteMemberDto({
        chatId: currentChatId,
        userId: userIdToInvite,
        // role: get(selectedRole) // Передаем выбранную роль
      }));
      showError("Пользователь успешно приглашен!");
      await loadMembers(); // Обновляем список участников в текущем чате
      
      // Очищаем результаты поиска и поле ввода после успешного приглашения
      userSearchResults.update(list => list.filter(u => u.id !== userIdToInvite)); // Удаляем приглашенного из результатов
      // userSearchInput = ''; // Можно оставить, если пользователь хочет добавить еще
      // Для закрытия модалки после одного приглашения:
      // addModal.set(false); 
    } catch (error: any) {
      const errorMessage = error.error?.message || error.message || "Не удалось пригласить пользователя.";
      showError(errorMessage, true);
      console.error("Invite member error:", error);
    } finally {
      isLoading.set(false);
    }
    
  }

    // Сброс состояния при открытии/закрытии модального окна "Добавить людей"
  addModal.subscribe(isOpen => {
    if (isOpen) {
      loadMembers(); // Загружаем актуальный список участников при открытии
    } else {
      userSearchInput = '';
      userSearchResults.set([]);
      selectedRole.set('member'); // Сбрасываем роль на дефолтную
    }
  });

  /* авто‑подгрузки при переключении вкладок */
  $: if ($tab === 'people' && get(CurrentChat)?.id) loadMembers(); // Загружаем участников при переходе на вкладку "People"
  $: if ($tab === 'media' && get(CurrentChat)?.id)  loadMedia();

  /* ---------- MEDIA ---------- */
  const media = writable<FileEntity[]>([]);
  async function loadMedia() {
    // const res = await GlobalClient.getChatsMedia(get(CurrentChat)?.id ?? '');
    media.set([]);
  }

  /* ---------- NOTES ---------- */
  const notesKey = derived(CurrentChat, (c) => `chat_notes_${c?.id}`);
  const notes = writable('');
  $: if (get(notesKey)) {
    notes.set(localStorage.getItem(get(notesKey)) ?? '');
  }
  function saveNotes() {
    localStorage.setItem(get(notesKey), get(notes));
  }

  /* ---------- ARCHIVE ---------- */
  const archiveModal = writable(false);
  async function archiveChat() {
    // await GlobalClient.archiveChat(get(CurrentChat)?.id ?? '');
    archiveModal.set(false);
  }

  /* авто‑подгрузки при переключении вкладок */
  $: if ($tab === 'people') loadMembers();
  $: if ($tab === 'media')  loadMedia();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore element_invalid_self_closing_tag -->
<!-- overlay -->

<!-- drawer -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
 
<!-- svelte-ignore a11y_interactive_supports_focus -->
 
<!-- svelte-ignore a11y_missing_attribute -->
<div class="h-full flex flex-col bg-base-200 text-base-content w-[320px] sm:w-[360px] border-l border-base-300">
  <!-- header -->
  <header class="p-4 flex items-center gap-3 border-b border-base-300">
    {#if $tab !== 'search'}
      <button class="btn btn-ghost btn-square btn-sm"
              on:click={() => tab.set('search')}>
        ←
      </button>
    {/if}
    <h3 class="font-semibold truncate flex-1">
      {$CurrentChat?.name}
    </h3>
    <button class="btn btn-ghost btn-circle btn-sm" on:click={onclose}>✕</button>
  </header>

  <!-- tabs switcher (order depends on owner) -->
  <nav class="tabs tabs-bordered w-full">
    <a role="tab" class="tab" class:tab-active={$tab === 'search'}
       on:click={() => tab.set('search')}>Search</a>

    {#if !$isOwner}
      <a role="tab" class="tab" class:tab-active={$tab === 'media'}
         on:click={() => tab.set('media')}>Media</a>
    {/if}

    <a role="tab" class="tab" class:tab-active={$tab === 'people'}
       on:click={() => tab.set('people')}>People</a>

    {#if $isOwner}
      <a role="tab" class="tab" class:tab-active={$tab === 'media'}
         on:click={() => tab.set('media')}>Media</a>
    {/if}

    <a role="tab" class="tab" class:tab-active={$tab === 'notes'}
       on:click={() => tab.set('notes')}>Notes</a>

    {#if $isOwner}
      <a role="tab" class="tab text-error" class:tab-active={$tab === 'archive'}
         on:click={() => tab.set('archive')}>Archive</a>
    {/if}
  </nav>

  <!-- content -->
  <section class="flex-1 overflow-y-auto p-4 space-y-4">

    <!-- SEARCH ------------------------------------------------------- -->
    {#if $tab === 'search'}
      <div class="flex gap-2">
        <input class="input input-bordered flex-1"
               bind:value={$query}
               on:keydown={(e) => e.key === 'Enter' && searchMessages()}
               placeholder="Search messages…" />
        <button class="btn btn-primary" on:click={searchMessages}>Go</button>
      </div>

      {#if $searchLoading}
        <p class="opacity-60">Searching…</p>
      {:else}
        <ul class="space-y-2">
          {#each $searchRes as m}
            <li class="bg-base-100 p-3 rounded-lg">
              <p class="font-medium text-sm">{m.sender?.fullname}</p>
              <p class="text-xs opacity-70 mb-1">{m.sentDate?.toLocaleString?.()}</p>
              <p class="text-sm">{m.text}</p>
            </li>
          {/each}
          {#if $searchRes.length === 0}
            <p class="opacity-60 text-sm">No results</p>
          {/if}
        </ul>
      {/if}
    {/if}

    <!-- PEOPLE ------------------------------------------------------- -->
    {#if $tab === 'people'}
      <ul class="space-y-2">
        {#each $members as u}
          <li class="flex items-center gap-3">
            <div class="avatar">
              <div class="w-8 rounded-full">
                <img src={u.avatar?.filePath} />
              </div>
            </div>
            <span class="flex-1">{u.fullname}</span>
            {#if u.id === $CurrentChat?.ownerId}
              <span class="badge badge-outline badge-sm">owner</span>
            {/if}
          </li>
        {/each}
      </ul>

      {#if $isOwner}
        <button class="btn btn-outline w-full mt-3"
                on:click={() => addModal.set(true)}>
          Добавить людей
        </button>
      {/if}
    {/if}

    <!-- MEDIA -------------------------------------------------------- -->
    {#if $tab === 'media'}
      <ul class="space-y-2">
        {#each $media as f}
          <li>
            <a href={f.filePath} class="link" target="_blank">
              📎 {f.fileName}
            </a>
          </li>
        {/each}
        {#if $media.length === 0}
          <p class="opacity-60 text-sm">No files yet</p>
        {/if}
      </ul>
    {/if}

    <!-- NOTES -------------------------------------------------------- -->
    {#if $tab === 'notes'}
      <textarea
        class="textarea textarea-bordered w-full h-40"
        bind:value={$notes}
        on:blur={saveNotes}
      />
    {/if}

    <!-- ARCHIVE ------------------------------------------------------ -->
    {#if $tab === 'archive'}
      <button class="btn btn-error w-full"
              on:click={() => archiveModal.set(true)}>
        Archive chat
      </button>
    {/if}
  </section>
</div>

<ModalBase bind:open={$addModal} title="Добавить участников в чат">
  <div class="space-y-4 p-1">
    <div class="form-control">
      <label class="label" for="user-search-input">
        <span class="label-text">Поиск пользователей</span>
      </label>
      <div class="relative">
        <input 
          type="text"
          id="user-search-input"
          class="input input-bordered w-full pr-10"
          placeholder="Введите имя, фамилию или email..."
          bind:value={userSearchInput}
          on:input={handleUserSearchInput} />
        {#if $userSearchLoading}
          <span class="loading loading-spinner loading-xs absolute top-1/2 right-3 -translate-y-1/2"></span>
        {:else}
          <SearchIcon className="absolute top-1/2 right-3 w-5 h-5 text-gray-400 pointer-events-none -translate-y-1/2" />
        {/if}
      </div>
    </div>
    
    <div class="form-control w-full">
        <label class="label" for="user-role-select">
            <span class="label-text">Назначить роль</span>
        </label>
        <select id="user-role-select" class="select select-bordered w-full" bind:value={$selectedRole}>
            <option value="member">Участник (Member)</option>
            <option value="owner">Владелец (Owner)</option> 
        </select>
    </div>

    {#if !$userSearchLoading && $userSearchResults.length === 0 && userSearchInput.trim().length >= 2}
        <p class="text-sm text-gray-500 text-center py-2">Пользователи не найдены или уже в чате.</p>
    {/if}

    {#if $userSearchResults.length > 0}
    <ul class="max-h-60 overflow-y-auto space-y-1 border border-base-300 rounded-md p-2">
      {#each $userSearchResults as u (u.id)}
        <li class="p-2 hover:bg-base-200 rounded-md flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 overflow-hidden">
            <div class="avatar placeholder flex-shrink-0">
              <div class="bg-neutral text-neutral-content rounded-full w-8 h-8 text-xs flex items-center justify-center">
                <span>{u.fullname?.slice(0,2)?.toUpperCase()?.slice(0,2)?.toUpperCase() || '??'}</span>
              </div>
            </div>
            <div class="flex-grow overflow-hidden">
                <span class="block font-medium text-sm truncate" title={u.fullname || u.email}>{u.fullname  || u.email}</span>
                {#if u.email && (u.fullname) }
                    <span class="block text-xs text-gray-500 truncate" title={u.email}>{u.email}</span>
                {/if}
            </div>
          </div>
          <button 
            class="btn btn-sm btn-outline btn-primary flex-shrink-0"
            on:click={() => invite(u.id)}
            disabled={get(isLoading)}
            title="Пригласить {u.fullname || u.email}">
            <UserPlusIcon className="w-4 h-4 mr-1" /> Пригласить
          </button>
        </li>
      {/each}
    </ul>
    {/if}
  </div>
</ModalBase>

<!-- MODAL ▸ archive confirm ----------------------------------------- -->
<ModalBase bind:open={$archiveModal} title="Archive chat">
  <p class="mb-4">
    Are you sure you want to archive this chat?  
    You will no longer be able to send messages.
  </p>
  <div class="flex justify-end gap-3">
    <button class="btn" on:click={() => archiveModal.set(false)}>Cancel</button>
    <button class="btn btn-error" on:click={archiveChat}>Archive</button>
  </div>
</ModalBase>
