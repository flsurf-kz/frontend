<script lang="ts">
	import type { Category } from "$lib/shared/types";

    // Props
    export let categories: Category[] = [];
    export let searchValue: string = ""; // Two-way bindable from parent
    export let selectedValue: string = ""; // Two-way bindable (single selected key)
    export let buttonLabelText: string = "Выбрать категорию"; // Default button text

    // Function to find the label of the currently selected item
    function findLabelForKey(keyToFind: string, categoryGroups: Category[]): string | undefined {
        if (!keyToFind) return undefined;
        for (const group of categoryGroups) {
            for (const item of group.items) {
                if (item.key === keyToFind) {
                    return item.label;
                }
            }
        }
        return undefined;
    }

    // Reactive declaration for the button's display text
    $: currentButtonDisplayLabel = findLabelForKey(selectedValue, categories) || buttonLabelText;

    // Reactive declaration for filtered categories based on search
    $: filteredCategories = (() => {
        if (!searchValue.trim()) {
            return categories;
        }
        const lowerSearch = searchValue.toLowerCase();
        return categories
            .map(group => {
                // If group label matches, include all its items.
                // Otherwise, filter its items.
                const groupLabelMatches = group.label.toLowerCase().includes(lowerSearch);
                const itemsInGroup = group.items.filter(item =>
                    groupLabelMatches || item.label.toLowerCase().includes(lowerSearch)
                );
                return { ...group, items: itemsInGroup };
            })
            .filter(group => group.items.length > 0); // Only include groups that have items after filtering
    })();

    // Function to handle toggling a checkbox
    // For single select, it sets the selectedValue.
    // DaisyUI dropdown typically closes on losing focus or clicking an item inside that doesn't maintain focus.
    function handleToggle(itemKey: string) {
        if (selectedValue === itemKey) {
            // Optional: Allow unselecting if the same item is clicked again
            // selectedValue = ""; // Uncomment to allow unselecting
        } else {
            selectedValue = itemKey;
        }
        // To programmatically close the DaisyUI dropdown, we can try blurring the active element.
        // This works if the dropdown's visibility is tied to focus on its toggle or content.
        if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
            (document.activeElement as HTMLElement).blur();
        }
    }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="dropdown dropdown-bottom">
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_label_has_associated_control -->
   <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
   <label 
        tabindex="0" 
        class="input input-bordered flex items-center justify-between w-full cursor-pointer text-left whitespace-nowrap overflow-hidden focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
        role="button"
        aria-haspopup="true"
        aria-expanded="false" 
        title={currentButtonDisplayLabel}
    >
        <span class="truncate">{currentButtonDisplayLabel}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2 h-5 w-5 text-base-content/60 flex-shrink-0"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </label>

    <div tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full sm:w-64 mt-1 border border-base-300">
        <div class="p-2">
            <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
                <input
                    type="text"
                    placeholder="Поиск..."
                    class="input input-bordered input-sm w-full pl-10"
                    bind:value={searchValue}
                />
            </div>
        </div>

        <div class="max-h-72 overflow-y-auto custom-scrollbar pr-1">
            {#if filteredCategories.length > 0}
                {#each filteredCategories as group (group.key)}
                    {#if group.items.length > 0} <li class="menu-title px-2 pt-2">
                            <span>{group.label}</span>
                        </li>
                        {#each group.items as item (item.key)}
                            <li>
                                <label class="label cursor-pointer py-1.5 px-2 rounded-md hover:bg-base-200 active:bg-primary active:text-primary-content">
                                    <span class="label-text flex-grow truncate" title={item.label}>{item.label}</span>
                                    <input
                                        type="checkbox"
                                        class="checkbox checkbox-primary checkbox-sm"
                                        checked={item.key === selectedValue}
                                        on:change={() => handleToggle(item.key)}
                                    />
                                </label>
                            </li>
                        {/each}
                    {/if}
                {/each}
            {:else if searchValue}
                 <li class="px-2 py-2 text-sm text-base-content/70">Категории не найдены.</li>
            {:else}
                <li class="px-2 py-2 text-sm text-base-content/70">Нет доступных категорий.</li>
            {/if}
        </div>
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: hsl(var(--b3)); /* DaisyUI base-300 */
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: hsl(var(--b3) / 0.7);
    }
</style>