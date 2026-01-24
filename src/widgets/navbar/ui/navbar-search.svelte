<script lang="ts">
  import SearchIcon from "$lib/shared/ui/icons/SearchIcon.svelte";

  export let searchResults: { title: string; url: string }[] = [];
  export let onSearch: (query: string) => void;

  let searchInput = "";

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") onSearch(searchInput);
  };

  const handleClickSearch = () => onSearch(searchInput);
</script>

<div class="relative form-control text-sm">
  <div class="flex items-center">
    <input
      type="text"
      placeholder="Поиск..."
      class="input input-bordered focus:outline-hidden input-sm rounded-r-none"
      bind:value={searchInput}
      onkeydown={handleKeyDown}
    />
    <button class="btn btn-success btn-sm rounded-l-none" onclick={handleClickSearch}>
      <SearchIcon className="w-4 h-4 text-white" />
    </button>
  </div>

  {#if searchResults.length > 0}
    <ul class="absolute mt-1 p-1 shadow bg-base-100 rounded w-53 z-50">
      {#each searchResults as res}
        <li>
          <a href={res.url} class="block px-2 py-1 hover:bg-base-200 rounded">
            {res.title}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style lang="postcss">
  .input.input-sm {
    height: 2rem;
    padding: 0 0.5rem;
    font-size: 0.875rem;
  }

  .btn.btn-sm {
    height: 2rem;
    min-height: 2rem;
    padding: 0 0.5rem;
  }

  ul {
    font-size: 0.875rem;
  }
</style>
