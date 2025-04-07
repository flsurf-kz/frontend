<script lang="ts">
  type Props = {
    placeholder?: string;
    searchResults: string[];
    searchDelay?: number;
    onSelect: (item: string) => void;
    onSearch: (query: string) => void;
  };

  let {
    placeholder = "Поиск категории...",
    searchResults,
    searchDelay = 300,
    onSelect,
    onSearch
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

  function handleSelect(item: string) {
    onSelect(item);
    query = "";
  }
</script>

<div class="relative">
  <input
    class="input input-bordered w-full"
    type="text"
    placeholder={placeholder}
    bind:value={query}
    oninput={handleInput}
  />

  {#if query && searchResults.length > 0}
    <ul class="absolute z-10 bg-white border border-gray-200 mt-1 w-full max-h-60 overflow-y-auto">
      {#each searchResults as result}
        <li
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onclick={() => handleSelect(result)}
        >
          {result}
        </li>
      {/each}
    </ul>
  {/if}
</div>
