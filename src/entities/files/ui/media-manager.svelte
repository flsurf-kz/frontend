<script lang="ts">
  import type { FileEntity } from 'flsurf-client';
  import { processAndUploadFiles } from './modal';

  // Пропсы компонента
  export let files: FileEntity[] = [];
  export let label: string = 'Добавить файл';
  export let maxFileSizeMB: number = 40;

  // Обработчик выбора файлов
  async function onFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      const selected = Array.from(target.files);
      // Загружаем файлы через вынесенную функцию
      const uploadedFiles = await processAndUploadFiles(selected, maxFileSizeMB);
      // Обновляем локальный список файлов
      files = [...files, ...uploadedFiles];
      target.value = ''; // сброс значения input
    }
  }

  // Локальное удаление файла из списка
  function removeFile(index: number) {
    files = files.filter((_, i) => i !== index);
  }
</script>

<div class="space-y-2">
  <label class="flex items-center gap-2 cursor-pointer btn btn-outline btn-success w-fit">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
      viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586" />
    </svg>
    {label}
    <input
      type="file"
      class="hidden"
      on:change={onFileSelect}
      multiple
    />
  </label>

  <p class="text-sm text-gray-500">
    Максимальный размер файла: {maxFileSizeMB} MB
  </p>

  {#each files as file, i}
    <div class="flex items-center gap-2 bg-gray-100 p-2 rounded">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586" />
      </svg>
      <span>{file.fileName}</span>
      <button class="ml-auto text-red-500" type="button" on:click={() => removeFile(i)}>
        🗑
      </button>
    </div>
  {/each}
</div>
