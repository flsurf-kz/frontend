<script lang="ts">
  // Импортируем SelectItem, если он в отдельном файле

	import type { SelectItem } from "$lib/shared/types";

  // Компонент принимает список опций и массив выбранных ключей
  export let options: SelectItem[] = [];
  export let selected: string[] = []; // Массив ключей (string) выбранных опций

  // export let name: string = ''; // Если нужно для группировки или форм

  function toggleOption(optionKey: string) {
    if (selected.includes(optionKey)) {
      selected = selected.filter(key => key !== optionKey);
    } else {
      selected = [...selected, optionKey];
    }
    // Если вы хотите эмитить событие при изменении, можно добавить:
    // import { createEventDispatcher } from 'svelte';
    // const dispatch = createEventDispatcher();
    // dispatch('change', selected);
  }
</script>

<div class="flex flex-col gap-2">
  {#each options as option (option.key)}
    <label class="flex items-center gap-2 cursor-pointer p-1 hover:bg-base-200 rounded-md"> 
      <input
        type="checkbox"
        class="checkbox checkbox-primary checkbox-sm"
        value={option.key}
        checked={selected.includes(option.key)}
        on:change={() => toggleOption(option.key)}
      />
      <span class="text-sm">{option.label}</span>
    </label>
  {/each}
</div>

{#if options.length === 0}
  <p class="text-xs text-gray-500 italic">Нет доступных опций.</p>
{/if}