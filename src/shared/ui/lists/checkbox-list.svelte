<script lang="ts">
  // Компонент принимает список опций и массив выбранных значений (для двустороннего биндинга)
  export let options: string[] = [];
  export let selected: string[] = [];
  
  function toggleOption(option: string) {
    // Если опция уже выбрана – удаляем её, иначе добавляем
    if (selected.includes(option)) {
      selected = selected.filter(o => o !== option);
    } else {
      selected = [...selected, option];
    }
  }
</script>

<div class="flex flex-col gap-2">
  {#each options as option}
    <label class="flex items-center gap-2">
      <input
        type="checkbox"
        class="checkbox"
        checked={selected.includes(option)}
        on:change={() => toggleOption(option)}
      />
      <span>{option}</span>
    </label>
  {/each}
</div>
