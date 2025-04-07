<script lang="ts">
    export let tags: string[] = [];
    export let readOnly: boolean = false;
  
    // Если нужна логика удаления
    export let onRemove = (index: number) => {};
 </script>
  
<div class="flex flex-wrap gap-2">
{#each tags as tag, i}
  <div class="badge badge-accent flex items-center gap-1">
    {tag}
    {#if !readOnly}
      <button type="button" on:click={() => onRemove(i)}>✕</button>
    {/if}
  </div>
{/each}
</div>
  