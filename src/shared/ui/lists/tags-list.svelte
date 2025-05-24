<script lang="ts">
  // Пропсы компонента
  export let tags: string[] = [];
  export let readOnly: boolean = false;
  /** Максимальное количество тегов для отображения. Остальные будут скрыты под "+N". 
   * Установите в Infinity или очень большое число, чтобы показать все.
   */
  export let maxVisible: number = Infinity; 
  
  // Колбэк для удаления тега. Передает индекс удаляемого тега в оригинальном массиве `tags`.
  export let onRemove: (tagIndex: number) => void = (index) => {
    console.warn("Обработчик onRemove не передан в TagsList. Тег с индексом", index, "не будет удален из родительского состояния.");
    // Для демонстрации можно добавить логику удаления из локального 'tags',
    // но это нарушит однонаправленный поток данных, если 'tags' - это проп.
    // tags = tags.filter((_, i) => i !== index); // Не делайте так, если tags - это prop
  };

  // Вычисляемые значения для отображения
  let visibleTags: string[] = [];
  let hiddenCount: number = 0;

  $: {
    if (tags.length > maxVisible) {
      visibleTags = tags.slice(0, maxVisible);
      hiddenCount = tags.length - maxVisible;
    } else {
      visibleTags = [...tags]; // Работаем с копией для итерации
      hiddenCount = 0;
    }
  }
</script>

<div class="flex flex-wrap gap-2 items-center">
  {#each visibleTags as tag, index (tag + '-' + index)}
    <div 
      class="bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-lg flex items-center whitespace-nowrap"
      title={tag}
    >
      <span>{tag}</span>
      {#if !readOnly}
        <button 
          type="button" 
          on:click={() => onRemove(index)} 
          class="ml-1.5 text-gray-500 hover:text-gray-700 focus:outline-none leading-none flex items-center justify-center"
          aria-label="Удалить тег {tag}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}
    </div>
  {/each}

  {#if hiddenCount > 0}
    <div class="bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-lg whitespace-nowrap">
      +{hiddenCount}
    </div>
  {/if}
</div>

{#if tags.length === 0}
    <p class="text-xs text-gray-500 italic">Теги не добавлены.</p>
{/if}