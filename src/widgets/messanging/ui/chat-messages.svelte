<script lang="ts">
    import type { MessageEntity } from 'flsurf-client';
    import { format, isSameDay } from 'date-fns';
  
    /** Принимаем уже загруженный массив сообщений */
    export let messages: MessageEntity[] = [];
  
    /** Утилита: дать строку даты для сравнения */
    function toDayKey(dateStr: string) {
      return format(new Date(dateStr), 'yyyy-MM-dd');
    }
  
    /** Утилита: заголовок группы сообщений */
    function formatHeader(dateStr: string) {
      return format(new Date(dateStr), 'EEEE, MMMM dd'); // Saturday, May 03
    }
  </script>
  
  <div class="flex-1 overflow-auto py-4 px-6 space-y-4">
    {#if messages.length === 0}
      <div class="text-center opacity-60 py-12">
        No messages yet
      </div>
    {/if}
  
    {#each messages as msg, i}
      {#if i === 0 || toDayKey(msg?.sentDate?.toDateString() ?? "") !== toDayKey(messages[i-1].sentDate?.toDateString() ?? "")}
        <!-- Заголовок новой даты -->
        <div class="text-center text-xs opacity-60 my-2">
          {formatHeader(msg.sentDate?.toDateString() ?? "")}
        </div>
      {/if}
  
      <!-- Всегда слева -->
      <div class="flex justify-start">
        <div class="bg-base-200 dark:bg-base-300 text-base-content p-3 rounded-xl max-w-[70%]">
          <!-- Автор и время -->
          <div class="flex justify-between items-center text-xs opacity-60 mb-1">
            <span class="font-medium">{msg.sender?.fullname}</span>
            <span>{msg.sentDate}</span>
          </div>
          <!-- Текст -->
          <div class="whitespace-pre-wrap text-sm">
            {msg.text}
          </div>
          <!-- Файлы -->
          {#if msg.files?.length}
            <div class="mt-2 flex flex-wrap gap-2">
              {#each msg.files as f}
                <a
                  href={f.filePath}
                  target="_blank"
                  class="badge badge-outline text-xs"
                >
                  📎 {f.fileName}
                </a>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
  