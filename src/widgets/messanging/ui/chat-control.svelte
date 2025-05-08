<script lang="ts">
    import { onMount } from 'svelte';
    import { CurrentChat } from '$lib/entities/messanging';
    import { GlobalClient } from '$lib/shared/api';
    import ModalBase from '$lib/shared/ui/modal/modal-base.svelte';
    import { writable } from 'svelte/store';
	import { CurrentUser } from '$lib/entities/user/model/modal';
	import { FileEntity, MessageEntity, UserEntity } from 'flsurf-client';
	import { SearchField } from '$lib/shared/ui/inputs';
  
    const activeTab = writable<'search' | 'users' | 'media' | 'notes' | 'archive' | null>('search');
    const showAddUserModal = writable(false);
    const showArchiveModal = writable(false);
  
    const searchQuery = writable('');
    const searchResults = writable<MessageEntity[]>([]);
    const usersList = writable<UserEntity[]>([]);
    const mediaFiles = writable<FileEntity[]>([]);
    const notes = writable(localStorage.getItem(`chat_notes_${$CurrentChat?.id}`) || '');
  
    const isOwner = $CurrentChat?.ownerId === $CurrentUser?.id;
  
    async function handleSearch() {
      if (!$searchQuery.trim()) return;
      const res = await GlobalClient.getMessages($CurrentChat?.id || "");
      searchResults.set(res);
    }
  
    async function fetchUsers() {
      const chat = await GlobalClient.getChat($CurrentChat?.id || "");
      usersList.set(chat?.participants || []);
    }
  
    async function fetchMedia() {
      const media: FileEntity[] = [] // await GlobalClient.getChatsMedia($CurrentChat.id);
      mediaFiles.set(media);
    }
  
    function saveNotes() {
      localStorage.setItem(`chat_notes_${$CurrentChat?.id}`, $notes);
    }
  
    function archiveChat() {
      showArchiveModal.set(false);
      // TODO: call API to archive
    }
  
    $: if ($activeTab === 'users') fetchUsers();
    $: if ($activeTab === 'media') fetchMedia();
  </script>
  
<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_missing_attribute -->
  <div class="p-4 space-y-4">
    <div role="tablist" class="tabs tabs-bordered">
      <a role="tab" class="tab" class:tab-active={$activeTab === 'search'} on:click={() => activeTab.set('search')}>Поиск</a>
      <a role="tab" class="tab" class:tab-active={$activeTab === 'users'} on:click={() => activeTab.set('users')}>Пользователи</a>
      <a role="tab" class="tab" class:tab-active={$activeTab === 'media'} on:click={() => activeTab.set('media')}>Медиа</a>
      <a role="tab" class="tab" class:tab-active={$activeTab === 'notes'} on:click={() => activeTab.set('notes')}>Заметки</a>
      {#if isOwner}
        <a role="tab" class="tab text-error" class:tab-active={$activeTab === 'archive'} on:click={() => activeTab.set('archive')}>Архив</a>
      {/if}
    </div>
  
    <div class="pt-4">
      {#if $activeTab === 'search'}
        <SearchField bind:value={$searchQuery} on:search={handleSearch}/>
        <ul class="space-y-2">
          {#each $searchResults as msg}
            <li class="p-3 bg-base-200 rounded-lg">
              <p class="text-sm font-medium">{msg.sender?.fullname}</p>
              <p class="text-xs text-gray-500">{msg.text}</p>
            </li>
          {/each}
        </ul>
  
      {:else if $activeTab === 'users'}
        <ul class="space-y-2">
          {#each $usersList as user}
            <li class="flex items-center gap-3">
              <div class="avatar">
                <div class="w-8 rounded-full">
                  <img src={user.avatar?.filePath} />
                </div>
              </div>
              <span>{user.fullname}</span>
            </li>
          {/each}
        </ul>
        {#if isOwner}
          <button class="btn btn-primary mt-4" on:click={() => showAddUserModal.set(true)}>Добавить людей</button>
        {/if}
  
      {:else if $activeTab === 'media'}
        <div class="grid grid-cols-2 gap-4">
          {#each $mediaFiles as file}
            <a href={file.filePath} target="_blank" class="p-2 border rounded shadow hover:shadow-md transition text-sm">
              📎 {file.fileName}
            </a>
          {/each}
        </div>
  
      {:else if $activeTab === 'notes'}
        <!-- svelte-ignore element_invalid_self_closing_tag -->
        <textarea class="textarea textarea-bordered w-full h-40" bind:value={$notes} on:blur={saveNotes} placeholder="Ваши заметки..." />
  
      {:else if $activeTab === 'archive'}
        <button class="btn btn-error" on:click={() => showArchiveModal.set(true)}>Архивировать чат</button>
      {/if}
    </div>
  </div>
  
  <!-- ========== МОДАЛЫ ========== -->
  
  <ModalBase bind:open={$showAddUserModal} title="Пригласить пользователей">
    <!-- тут можно будет сделать: input для поиска и список юзеров -->
    <p class="text-sm opacity-60">Тут будет поле поиска и список пользователей из getUsersList()</p>
  </ModalBase>
  
  <ModalBase bind:open={$showArchiveModal} title="Архивировать чат">
    <div class="space-y-4">
      <p class="text-warning-content">
        Вы уверены, что хотите архивировать чат? Вы не сможете больше отправлять в него сообщения.
      </p>
      <div class="flex gap-3 justify-end">
        <button class="btn btn-outline" on:click={() => showArchiveModal.set(false)}>Отмена</button>
        <button class="btn btn-error" on:click={archiveChat}>Подтвердить</button>
      </div>
    </div>
  </ModalBase>
  