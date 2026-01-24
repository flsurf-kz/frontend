<script lang="ts">
  import { get, writable, derived } from 'svelte/store';
  import {
    CurrentChat,
    CurrentMessages,
    CurrentMessageReplyTo,
    CurrentEditingMessage
  } from '$lib/entities/messanging';

  import {
    GlobalClient
  } from '$lib/shared/api';

  import {
    SendMessageDto,
    UpdateMessageDto,
    FileEntity,
    MessageEntity
  } from 'flsurf-client';

  import { uploadFiles } from '$lib/entities/messanging';
	import EmojiPicker from '$lib/entities/messanging/ui/emoji-picker.svelte';

  /* --- состояния -------------------------------------------------- */
  const text          = writable('');
  const newFiles      = writable<File[]>([]);          // ещё не загруженные
  const showPicker    = writable(false);

  $: editing  = $CurrentEditingMessage;
  $: replying = $CurrentMessageReplyTo;

  /* при старте Edit копируем текст и существующие файлы */
  $: if (editing) {
    text.set(editing.text ?? '');
    newFiles.set([]);                                  // новые пусто
  }



  /* --- утилиты markdown ------------------------------------------- */
  function wrap(selected: string, before: string, after = before) {
    const textarea: HTMLTextAreaElement | null =
      document.getElementById('msg-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const left  = value.slice(0, selectionStart);
    const mid   = value.slice(selectionStart, selectionEnd) || selected;
    const right = value.slice(selectionEnd);
    const wrapped = `${left}${before}${mid}${after}${right}`;
    textarea.value = wrapped;
    text.set(wrapped);
    textarea.focus();
    textarea.selectionStart = selectionEnd + before.length + after.length;
    textarea.selectionEnd   = textarea.selectionStart;
  }

  /* --- обработчики ------------------------------------------------ */
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleSend() {
    const value = get(text).trim();
    const filesLocal = get(newFiles);

    /* EDIT --------------------------------------------------------- */
    if (editing) {
      if (!value && filesLocal.length === 0) return;
      await GlobalClient.updateMessage(new UpdateMessageDto({
        messageId: editing.id,
        text: value
      }));
      CurrentEditingMessage.set(undefined);
      text.set('');
      newFiles.set([]);
      return;
    }

    /* NEW / REPLY -------------------------------------------------- */
    if (!value && filesLocal.length === 0) return;

    // загружаем файлы
    const uploaded = filesLocal.length ? await uploadFiles(filesLocal) : [];

    const msg: MessageEntity = await GlobalClient.sendMessage(
      new SendMessageDto({
        chatId:  get(CurrentChat)?.id ?? '',
        text:    value,
        files:   uploaded,
        replyToMsg: replying?.id
      })
    );

    console.log(`chat: ${replying?.id ?? ""}, message: ${msg}, text: ${text}, chatId: ${get(CurrentChat)?.id}`)

    /* очистка */
    CurrentMessageReplyTo.set(undefined);
    text.set('');
    newFiles.set([]);
    const fi = document.getElementById('file-input') as HTMLInputElement;
    if (fi) fi.value = '';
    $CurrentMessages = [...$CurrentMessages, msg];      // локальный пуш
  }

  // добавляем в newFiles
  function addFiles(files: File[]) {
    newFiles.update(arr => [...arr, ...files]);
  }
  // удаляем из newFiles по индексу
  function removeNewFile(idx: number) {
    newFiles.update(arr => arr.toSpliced(idx, 1));
  }
  // удаляем старый файл из редактируемого сообщения
  function removeOldFile(fileId: string) {
    CurrentEditingMessage.update(m => {
      if (!m) return m;
      m.files = m.files?.filter(f => f.id !== fileId);
      return m;
    });
  }
</script>

{#if $CurrentChat}
<div class="rounded-xl border border-base-300 p-4 m-2 space-y-3 select-none">

  <!-- reply / edit banner -->
  {#if replying || editing}
    <div class="flex items-center gap-2 text-sm bg-base-200 rounded p-2">
      {#if replying}
        Reply to <strong>{replying.sender?.fullname}</strong>
      {:else if editing}
        Editing message
      {/if}
      <button class="ml-auto btn btn-xs btn-circle"
              on:click={() => {CurrentMessageReplyTo.set(undefined); CurrentEditingMessage.set(undefined)}}>
        ✕
      </button>
    </div>
  {/if}

  <!-- textarea -->
  <!-- svelte-ignore element_invalid_self_closing_tag -->
  <textarea
    id="msg-textarea"
    rows="3"
    on:keydown={onKey}
    bind:value={$text}
    class="textarea flex-1 w-full border-none focus:outline-none resize-none placeholder:text-base-400"
    placeholder="Send a message…"
  />

  <!-- файлы (старые + новые) ------------------------------------ -->
  {#if $CurrentEditingMessage?.files?.length}
    <div class="flex flex-wrap gap-2 mb-2">
      {#each $CurrentEditingMessage.files as f (f.id)}
        <span class="badge badge-outline gap-1">
          📎 {f.fileName}
          <button
            class="btn btn-xs btn-circle btn-ghost"
            on:click={() => removeOldFile(f.id)}
          >✕</button>
        </span>
      {/each}
    </div>
  {/if}

  <!-- toolbar ----------------------------------------------------- -->
  <div class="flex items-center justify-between text-lg px-1">
    <!-- левая половина -->
    <div class="flex items-center gap-3">

      {#if $newFiles.length}
          <div class="flex flex-wrap gap-2 mb-2">
            {#each $newFiles as file, i}
              <span class="badge badge-outline gap-1">
                📎 {file.name}
                <button
                  class="btn btn-xs btn-circle btn-ghost"
                  on:click={() => removeNewFile(i)}
                >✕</button>
              </span>
            {/each}
          </div>
        {/if}

      <!-- markdown buttons -->
      <button class="icon-btn" title="Bold"      on:click={() => wrap('**bold**', '**')}>𝐁</button>
      <button class="icon-btn" title="Italic"    on:click={() => wrap('_italic_', '_')}>𝑰</button>
      <button class="icon-btn" title="Strike"    on:click={() => wrap('~~text~~', '~~')}>S̶</button>
      <button class="icon-btn" title="Inline code" on:click={() => wrap('`code`', '`')}>{'</>'}</button>

      <!-- svelte-ignore element_invalid_self_closing_tag -->
      <span class="mx-2 h-5 w-px bg-base-300" />

      <input
        id="file-input"
        type="file"
        multiple
        class="hidden"
        on:change={(e: any) => addFiles([...e.currentTarget.files])}
      />
      <label for="file-input" class="btn btn-ghost btn-square">📎</label>

      <!-- emoji -->
      <div class="relative">
        <button class="icon-btn" title="Emoji" on:click={() => showPicker.update(v=>!v)}>😊</button>
        {#if $showPicker}
          <EmojiPicker on:select={(e) => {
              text.update(t => t + e.detail);
              showPicker.set(false);
            }}
            className="absolute bottom-12 z-40 shadow-lg"/>
        {/if}
      </div>
    </div>

    <!-- правая половина -->
    <div class="flex items-center gap-2">
      <button class="icon-btn" title="Settings">⚙️</button>
      <button class="btn btn-primary" on:click={handleSend}>➤</button>
    </div>
  </div>
</div>
{/if}

<style>
  textarea::-webkit-scrollbar{width:6px}
  textarea::-webkit-scrollbar-thumb{background:var(--color-base-300)}
</style>
