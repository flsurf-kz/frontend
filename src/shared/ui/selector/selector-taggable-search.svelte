<script lang="ts">
	import type { SelectItem } from '$lib/shared/types';

  // Для Svelte 5: используем руны ($state) и получаем пропсы через $props()
  // Обратите внимание: обновите Svelte до v5, чтобы $state работал.
  type Props = {
    placeholder?: string;
    selectedItems: SelectItem[];
    searchResults: SelectItem[];
    searchDelay?: number;
    onSearch: (query: string) => void;
    onAdd: (item: SelectItem) => void;
    onRemove: (index: number) => void;
  };

  let {
    placeholder = "Введите текст для поиска...",
    selectedItems,
    searchResults,
    searchDelay = 300,
    onSearch,
    onAdd,
    onRemove
  }: Props = $props();

  let query = $state("");

  import { debounce } from 'lodash';

  const debouncedSearch = debounce((q: string) => {
    onSearch(q);
  }, searchDelay);

  function handleInput(e: Event) {
    query = (e.currentTarget as HTMLInputElement).value;
    debouncedSearch(query);
  }

  function selectItem(item: SelectItem) {
    if (!selectedItems.includes(item)) {
      onAdd(item);
    }
    query = "";
  }

  function removeItem(index: number) {
    onRemove(index);
  }
</script>

<div class="relative">
  <!-- Список выбранных тегов -->
  <div class="flex flex-wrap gap-2 mb-2">
    {#each selectedItems as item, index}
      <div class="badge badge-accent flex items-center gap-1">
        {item.label}
        <button type="button" onclick={() => removeItem(index)}>✕</button>
      </div>
    {/each}
  </div>

  <!-- Поле ввода для поиска -->
  <input
    class="input input-bordered w-full"
    type="text"
    placeholder={placeholder}
    bind:value={query}
    oninput={handleInput}
  />

  <!-- Выпадающий список результатов поиска -->
  {#if query && searchResults.length > 0}
    <ul class="absolute z-10 bg-white border border-gray-200 mt-1 w-full max-h-60 overflow-y-auto">
      {#each searchResults as result}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <li
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onclick={() => selectItem(result)}
        >
          {result.label}
        </li>
      {/each}
    </ul>
  {/if}
</div>
