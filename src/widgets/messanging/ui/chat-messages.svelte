<script lang="ts">
  import { differenceInMinutes, format, parseISO } from 'date-fns';
  import { DeleteMessageDto, PinMessageDto, type MessageEntity } from 'flsurf-client';

  import { fixIso, GlobalClient } from '$lib/shared/api';
	import { CurrentEditingMessage, CurrentMessageReplyTo, CurrentMessages } from '$lib/entities/messanging';
	import UserAvatar from '$lib/shared/ui/icons/UserAvatar.svelte';
	import { EditButton } from '$lib/shared/ui/buttons';
	import { EditIcon, PinIcon, ReplyIcon, TrashIcon } from '$lib/shared/ui/icons';
	import { CurrentUser } from '$lib/entities/user/model/modal';
	import { writable } from 'svelte/store';
  /* ---------- входные параметры ---------- */
  export let messages: MessageEntity[] = [];   // уже отсортированные по времени ↑
  export let currentUserId = $CurrentUser?.id;              // id текущего пользователя

  /* ---------- хелперы ---------- */
  export function toDate(input: string | Date): Date {
    if (input instanceof Date) return input;

    // обрезаем дробную часть до 3 цифр (1495165 → 149)
    const normalized = input.replace(
      /\.(\d{3})\d*(Z|[+\-]\d{2}:\d{2})$/,
      '.$1$2'
    );

    return parseISO(normalized);
  }

  /** Формат даты «2025-05-20» */
  export const fDate = (d: string | Date) =>
    format(toDate(d), 'yyyy-MM-dd');

  /** Формат времени «15:55» */
  export const fTime = (d: string | Date) =>
    format(toDate(d), 'HH:mm');

  const selectedMessageId = writable<string | null>(null);

  /* ---------- API wrappers ---------- */
  const pin   = async (id: string) =>
    await GlobalClient.pinMessage(new PinMessageDto({ messageId: id }));

  const del   = async (id: string) => { 
    await GlobalClient.deleteMessage(new DeleteMessageDto({ messgeId: id }));
  
    let index = $CurrentMessages.findIndex(x => x.id == id)
    $CurrentMessages = [
      ...$CurrentMessages.slice(0, index - 1), 
      ...$CurrentMessages.slice(index + 1, $CurrentMessages.length)
    ]
  }
  const reply = (m: MessageEntity) => {
    CurrentEditingMessage.set(undefined);          // перестраховка
    CurrentMessageReplyTo.set(m);
  };

  const edit  = (m: MessageEntity) => {
    CurrentMessageReplyTo.set(undefined);
    CurrentEditingMessage.set(m);
  };

  const selectMessage = (id: string) => { 
    if ($selectedMessageId == id) { 
      selectedMessageId.set("")
    } else { 
      selectedMessageId.set(id)
    }
  }
</script>

<!-- прокручиваемая колонка сообщений -->
<div class="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-1">
  {#if messages.length === 0}
    <div class="text-center opacity-60 py-12">No messages yet</div>
  {/if}

  {#each messages as msg, i (msg.id + '-' + i)}
    {@const prev        = i > 0 ? messages[i - 1] : null}
    {@const sent        = toDate(msg.createdAt ?? msg.sentDate)}
    {@const prevSent    = prev 
        ? toDate(msg.createdAt ?? msg.sentDate)
        : null}
    {@const newDay      = !prev || fDate(sent) !== fDate(prevSent!)}
    {@const groupStart  = !prev 
        || prev.sender?.id !== msg.sender?.id
        || differenceInMinutes(sent, prevSent!) > 10}
    {@const isSelected  = $selectedMessageId === msg.id}
    <div>
      {#if newDay}
        <!-- разделитель дат -->
        <div class="text-center text-xs opacity-60 my-3">
          {format(sent, 'EEEE, MMMM dd')}
        </div>
      {/if}


      {#if groupStart}
        <!-- шапка группы: аватар + ФИО + время -->
        <div class="flex gap-3 mt-4  hover:bg-base-300 rounded-lg">
          <UserAvatar imageUrl={msg.sender?.avatar?.filePath} width={"35px"} height={"35px"}/>
          <div class="text-sm font-medium">
            {msg.sender?.fullname}
            <span class="text-xs opacity-60 ml-2">{fTime(sent)}</span>
          </div>
        </div>
      {/if}

      <!-- само сообщение -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        class="flex relative gap-3 group hover:bg-base-300 rounded-lg" 
        on:click={() => selectMessage(msg.id)}
      >
        <div class="w-9 shrink-0"></div> <!-- отступ под аватар -->

        <div class="relative max-w-[70%]">
          <div
            class="whitespace-pre-wrap break-words text-sm pt-2"
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


        </div>
          <div
            class="absolute top-0 right-40 -translate-y-1/2 translate-x-full
                   flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            class:opacity-100={isSelected}
            on:click|stopPropagation
          >
            <button class="icon-btn bg-base-100" title="Pin"   on:click={() => pin(msg.id)}>
              <PinIcon className="w-5 h-5"/>
            </button>

            <button class="icon-btn bg-base-100" title="Reply" on:click={() => reply(msg)}>
              <ReplyIcon className="w-5 h-5"/>
            </button>

            {#if msg.sender?.id === currentUserId}

              <button class="icon-btn bg-base-100" title="Delete" on:click={() => edit(msg)}>
                <EditIcon width={"18"} height={"18"}/>
              </button>
              <button class="icon-btn bg-base-100" title="Delete" on:click={() => del(msg.id)}>
                <TrashIcon className="w-5 h-5"/>
              </button>
            {/if}
          </div>
      </div>
    </div>
  {/each}
</div>

<style>
  /* небольшая круглая кнопка‑иконка */
  .icon-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    border: 1px solid #13fc03; 
  }

  .icon-btn:hover { 
    background-color: var(--color-base-300);
  }

  /* .icon-btn:hover {
    background: theme('colors.base.600');
  } */
</style>
