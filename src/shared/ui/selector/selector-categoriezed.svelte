<script lang="ts">
    interface Category { 
        key: string, 
        label: string 
        items: Category[] 
    }

    // Принимаем внешние переменные (props)
    export let categories: Category[] = [];
    export let searchValue: string  = "";
    export let selectedValue: string = "";  // keys
  
    // При изменении строки поиска обновляем значение напрямую,
    // оно привязано родительским компонентом через bind:searchValue.
    function handleInput(event: Event) {
      const inputEvent = event as InputEvent; 
      searchValue = inputEvent.data ?? "";
    }
  
    // Обновляем выбранные значения:
    function handleToggle(value: string) {
      selectedValue = value; 
    }
  </script>


<!-- svelte-ignore a11y_label_has_associated_control -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="dropdown dropdown-bottom">
    <!-- Кнопка для открытия списка -->
    <label tabindex="0" class="btn m-1">
      Select Categories
    </label>
  
    <!-- Выпадающее меню -->
    <div tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 max-h-96 overflow-y-auto">
      <!-- Поле поиска -->
      <input
        type="text"
        placeholder="Search..."
        class="input input-bordered w-full mb-2"
        bind:value={searchValue}
        oninput={handleInput} />
  
      <!-- Перебор групп -->
      {#each categories as group}
        <!-- Заголовок группы -->
        <div class="font-bold mt-2">{group.label}</div>
        {#each group.items as item}
          <label class="label cursor-pointer flex gap-2 px-2 py-1">
            <input
              type="checkbox"
              class="checkbox"
              checked={item.key === selectedValue}
              onchange={() => handleToggle(item.key)} />
            <span class="label-text">{item.label}</span>
          </label>
        {/each}
      {/each}
    </div>
  </div>
  