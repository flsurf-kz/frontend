<script lang="ts">
  import { get, writable } from 'svelte/store';
  import { CurrentChat, CurrentEditingMessage, CurrentMessageReplyTo } from '$lib/entities/messanging';
  import { GlobalClient } from '$lib/shared/api';
  import {
    SendMessageDto,
	UpdateMessageDto,
  } from 'flsurf-client';

  import { uploadFiles } from '$lib/entities/messanging';

  const text      = writable('');
  let   fileInput!: HTMLInputElement;

  $: editing = $CurrentEditingMessage;   // удобный флаг
  $: replying = $CurrentMessageReplyTo;

  /* Автоматически подставляем текст при начале Edit */
  $: if (editing) text.set(editing.text ?? '');

  async function handleSend() {
    const value = get(text).trim();
    if (!value && !(fileInput?.files?.length)) return;

    /* --- EDIT ------------------------------------------------------ */
    if (editing) {
      await GlobalClient.updateMessage(
        new UpdateMessageDto({ messageId: editing.id, text: value })
      );
      CurrentEditingMessage.set(undefined);
      text.set('');
      return;
    }

    /* --- обычное отправление / reply ------------------------------ */
    const files = fileInput?.files
      ? await uploadFiles([...fileInput.files])
      : [];

    await GlobalClient.sendMessage(
      new SendMessageDto({
        chatId: get(CurrentChat)?.id ?? '',
        text:   value,
        files,
        replyToMsg: replying?.id          // undefined если нет reply
      })
    );

    /* очистка */
    if (replying) CurrentMessageReplyTo.set(undefined);
    text.set('');
    if (fileInput) fileInput.value = '';
  }
</script>

{#if $CurrentChat}
  <div class="border-t border-base-300 p-4 space-y-2">
    <!-- панель «Вы отвечаете …» -->
    {#if replying}
      <div class="flex items-center gap-2 text-sm bg-base-200 rounded p-2">
        Reply to <strong>{replying.sender?.fullname}</strong>
        <button class="ml-auto btn btn-xs btn-circle"
                on:click={() => CurrentMessageReplyTo.set(undefined)}>✕</button>
      </div>
    {/if}

    <div class="flex items-end gap-3">
      <!-- svelte-ignore element_invalid_self_closing_tag -->
      <textarea
        bind:value={$text}
        placeholder={editing ? 'Edit message…' : 'Send a message…'}
        rows="1"
        class="textarea textarea-bordered flex-1 resize-y"
      />

      <input type="file" multiple bind:this={fileInput} class="hidden" id="file-input" />
      <label for="file-input" class="btn btn-ghost btn-square">📎</label>

      <button class="btn btn-primary" on:click={handleSend}>
        {editing ? '✓' : '➤'}
      </button>
    </div>
  </div>
{/if}
