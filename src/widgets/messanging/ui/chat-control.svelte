<script lang="ts">
  import { writable, derived, get } from 'svelte/store';
  import {
    CurrentChat,
  } from '$lib/entities/messanging';
	import { CurrentUser } from '$lib/entities/user/model/modal';
	import { GlobalClient } from '$lib/shared/api';
	import { FileEntity, InviteMemberDto, MessageEntity, UserEntity } from 'flsurf-client';
	import ModalBase from '$lib/shared/ui/modal/modal-base.svelte';
  
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

  async function loadMembers() {
    const chat = await GlobalClient.getChat(get(CurrentChat)?.id ?? '');
    members.set(chat.participants ?? []);
    if (chat.owner)
      members.set([...$members, chat.owner])
  }

  async function findUsers() {
    // const res = await GlobalClient.getUsersList(
    //   new GetUsersQuery({ query: get(usersSearch) })
    // );  TODO 
    usersRes.set([]);
  }

  async function invite(userId: string) {
    await GlobalClient.inviteMember(new InviteMemberDto({
      chatId: get(CurrentChat)?.id ?? "",
      userId: userId ?? "",
      // owner: get(selectedRole),
    }));
    await loadMembers();
    addModal.set(false);
  }

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
          Add people
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

<!-- MODAL ▸ add people --------------------------------------------- -->
<ModalBase bind:open={$addModal} title="Add people">
  <div class="space-y-4">
    <input class="input input-bordered w-full"
           placeholder="Search users…"
           bind:value={$usersSearch}
           on:input={findUsers} />
    <select class="select select-bordered w-full"
            bind:value={$selectedRole}>
      <option value="member">Member</option>
      <option value="owner">Owner</option>
    </select>

    <ul class="max-h-60 overflow-y-auto space-y-2">
      {#each $usersRes as u}
        <li class="flex items-center justify-between">
          <span>{u.fullname}</span>
          <button class="btn btn-sm btn-primary"
                  on:click={() => invite(u.id)}>
            Invite
          </button>
        </li>
      {/each}
    </ul>
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
