<script lang="ts">
  import { differenceInMinutes, format } from 'date-fns';
  import { DeleteMessageDto, PinMessageDto, type MessageEntity } from 'flsurf-client';

  import { GlobalClient } from '$lib/shared/api';
	import { CurrentEditingMessage, CurrentMessageReplyTo } from '$lib/entities/messanging';
	import UserAvatar from '$lib/shared/ui/icons/UserAvatar.svelte';
  /* ---------- входные параметры ---------- */
  export let messages: MessageEntity[] = [];   // уже отсортированные по времени ↑
  export let currentUserId = '';              // id текущего пользователя

  /* ---------- хелперы ---------- */
  const fDate = (d: Date) => format(d, 'yyyy‑MM‑dd'); // для «нового дня»
  const fTime = (d: Date) => format(d, 'p');          // 2:33 PM

  /* ---------- API wrappers ---------- */
  const pin   = async (id: string) =>
    GlobalClient.pinMessage(new PinMessageDto({ messageId: id }));

  const del   = async (id: string) =>
    GlobalClient.deleteMessage(new DeleteMessageDto({ messgeId: id }));

  const reply = (m: MessageEntity) => {
    CurrentEditingMessage.set(undefined);          // перестраховка
    CurrentMessageReplyTo.set(m);
  };

  const edit  = (m: MessageEntity) => {
    CurrentMessageReplyTo.set(undefined);
    CurrentEditingMessage.set(m);
  };
</script>

<!-- прокручиваемая колонка сообщений -->
<div class="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-1">
  {#if messages.length === 0}
    <div class="text-center opacity-60 py-12">No messages yet</div>
  {/if}

  {#each messages as msg, i (msg.id)}
    {@const prev = i > 0 ? messages[i - 1] : null}
    {@const sent = new Date(msg.sentDate ?? "")}
    {@const newDay =
      !prev || fDate(sent) !== fDate(new Date(prev.sentDate ?? ""))}

    {#if newDay}
      <!-- разделитель дат -->
      <div class="text-center text-xs opacity-60 my-3">
        {format(sent, 'EEEE, MMMM dd')}
      </div>
    {/if}

    {@const groupStart =
      !prev ||
      prev.sender?.id !== msg.sender?.id ||
      differenceInMinutes(sent, new Date(prev.sentDate ?? "")) > 10}

    {#if groupStart}
      <!-- шапка группы: аватар + ФИО + время -->
      <div class="flex gap-3 mt-4  hover:bg-base-300 rounded-lg">
        <UserAvatar imageUrl={msg.sender?.avatar?.filePath} width={"30px"} height={"30px"}/>
        <div class="text-sm font-medium">
          {msg.sender?.fullname}
          <span class="text-xs opacity-60 ml-2">{fTime(sent)}</span>
        </div>
      </div>
    {/if}

    <!-- само сообщение -->
    <div class="flex gap-3 group hover:bg-base-300 rounded-lg">
      <div class="w-8 shrink-0"></div> <!-- отступ под аватар -->

      <div class="relative max-w-[70%] whitespace-pre-wrap">
        <div
          class="whitespace-pre-wrap break-words text-sm"
          style="overflow-wrap:anywhere"
        >
          {msg.text}
        </div>

        {#if msg.files?.length}
          <div class="mt-2 flex flex-wrap gap-2">
            {#each msg.files as f (f.id ?? f.filePath)}
              <a
                class="badge badge-outline text-xs"
                target="_blank"
                href={f.filePath}
              >📎&nbsp;{f.fileName}</a>
            {/each}
          </div>
        {/if}

        <!-- кнопки действий -->
        <div
          class="absolute top-0 -translate-y-1/2
                 flex gap-1 justify-end opacity-0 group-hover:opacity-100
                 transition-opacity w-50"
        >
          <button class="icon-btn" title="Pin"   on:click={() => pin(msg.id)}>📌</button>
          <button class="icon-btn" title="Reply" on:click={() => reply(msg)}>↩️</button>

          {#if msg.sender?.id === currentUserId}
            <button class="icon-btn" title="Edit"   on:click={() => edit(msg)}>✏️</button>
            <button class="icon-btn" title="Delete" on:click={() => del(msg.id)}>🗑️</button>
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  /* небольшая круглая кнопка‑иконка */
  .icon-btn {
    width: 24px;
    height: 24px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
  }

  /* .icon-btn:hover {
    background: theme('colors.base.600');
  } */
</style>
