<script lang="ts">
	import { ContractEntity, JobEntity } from 'flsurf-client';
    import { createEventDispatcher } from 'svelte';
  
    export let currentPage: number = 1;
    export let totalPages: number = 1;
    export let pageSize: number = 10;
    export let pageSizeOptions: number[] = [10, 20, 30];
  
    const dispatch = createEventDispatcher();
  
    function goToPage(page: number) {
      if (page < 1 || page > totalPages) return;
      dispatch('pageChange', page);
    }
  
    function changePageSize(size: number) {
      dispatch('pageSizeChange', size);
    }
  </script>
  
<div class="flex items-center gap-4">
<!-- Выбор количества на странице -->
<div class="flex items-center gap-2">
  <span>Записей на странице:</span>
  <select
    class="select select-bordered w-20"
    bind:value={pageSize}
    on:change={(e) => changePageSize(+e.currentTarget.value )}
  >
    {#each pageSizeOptions as size}
      <option value={size}>{size}</option>
    {/each}
  </select>
</div>

<!-- Нумерация страниц -->
<div class="flex items-center gap-1">
  <button class="btn btn-sm" on:click={() => goToPage(currentPage - 1)}>« Назад</button>
  {#each Array(totalPages) as _, i}
    {#if i + 1 === currentPage}
      <button class="btn btn-sm btn-success">{i + 1}</button>
    {:else if i < currentPage + 2 && i > currentPage - 4}
      <button class="btn btn-sm" on:click={() => goToPage(i + 1)}>{i + 1}</button>
    {:else if i === 0 || i === totalPages - 1}
      <!-- Показываем крайние страницы -->
      <button class="btn btn-sm" on:click={() => goToPage(i + 1)}>{i + 1}</button>
    {:else if i === currentPage - 4 || i === currentPage + 2}
      <span class="mx-1">...</span>
    {/if}
  {/each}
  <button class="btn btn-sm" on:click={() => goToPage(currentPage + 1)}>Вперед »</button>
</div>
</div>
  