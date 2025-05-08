<script lang="ts">
    import { sendText, uploadFiles, CurrentChat } from '$lib/entities/messanging';
	import { GlobalClient } from '$lib/shared/api';
	import { SendMessageDto } from 'flsurf-client';
    import { get, writable } from 'svelte/store';
    const text = writable('');
    let fileInput!: HTMLInputElement;
  
    async function handleSend() {
      text.update(v => v.trim());
      if (!get(text)) return;
  
      // файлы, если выбраны
      const files = fileInput?.files ? await uploadFiles([...fileInput.files]) : [];
      await GlobalClient.sendMessage(new SendMessageDto({
        chatId: $CurrentChat?.id ?? "", 
        text: $text, 
        files: files, 
      }))
      text.set('');
      if (fileInput) fileInput.value = '';
    }
  </script>
  
  {#if $CurrentChat}
  <!-- svelte-ignore element_invalid_self_closing_tag -->
    <div class="border-t border-base-300 p-4">
      <div class="flex items-end gap-3">
        <textarea
          bind:value={$text}
          placeholder="Send a message…"
          rows="1"
          class="textarea textarea-bordered flex-1 resize-y"
        />
        <input
          type="file"
          multiple
          bind:this={fileInput}
          class="hidden"
          id="file-input"
        />
        <label for="file-input" class="btn btn-ghost btn-square">
          📎
        </label>
        <button class="btn btn-primary" on:click={handleSend}>➤</button>
      </div>
    </div>
  {/if}
  