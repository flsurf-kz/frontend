<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';
    import SelectorCategoriezed from '$lib/shared/ui/selector/selector-categoriezed.svelte'; // Ensure this path is correct
    import type { CategoryEntity } from 'flsurf-client';
    import { page } from '$app/stores';
    import { onMount, afterUpdate } from 'svelte'; // afterUpdate might be useful for reacting to prop changes if needed
    import type { PageData } from './$types'; // Type for the data from the load function
	import { createJobStore, currentJobCreationStepKey } from '$lib/features/job/create-job/modal';
	import type { Category } from '$lib/shared/types';

    export let data: PageData; // Data from the load function

    // Local state for the component
    let searchValueForSelector = ""; // This will be bound to SelectorCategoriezed's search input
    $: selectedCategoryKey = $createJobStore.categoryId;  // This will be bound to SelectorCategoriezed's selectedValue
    
    let selectedSkills: string[] = []; // From your original code for skills selection

    // This interface defines the structure SelectorCategoriezed expects for its 'categories' prop.
    // Ideally, SelectorCategoriezed would export this type, or it would be in a shared types file.

    // Function to convert API CategoryEntity[] to the format SelectorCategoriezed needs
    function convertCategoriesForSelector(entities: CategoryEntity[] | undefined): Category[] {
        if (!entities) return [];
        return entities.map((entity) => ({
            key: entity.id!, // Assuming 'id' is always present and is the key
            label: entity.name ?? 'Без названия',
            items: convertCategoriesForSelector(entity.subCategories) // Recursive call for sub-categories
        }));
    }

    // Reactive variables derived from props or state
    let apiCategories: CategoryEntity[] = [];
    let categoriesForSelector: Category[] = [];
    let fetchError: string | null = null;

    // Debounce timer for search input
    let debounceTimer: number;

    // This $: block will react to changes in `data` (from load function)
    // and to `searchValueForSelector` (from user typing into SelectorCategoriezed's search)
    $: {
        if (data && data.categories) {
            apiCategories = data.categories;
            categoriesForSelector = convertCategoriesForSelector(apiCategories);
        }
        if (data && data.error) {
            fetchError = data.error;
        } else {
            fetchError = null;
        }
        // Initialize searchValueForSelector from URL's initialSearchQuery only once or if it differs
        if (data && data.initialSearchQuery !== undefined && searchValueForSelector !== data.initialSearchQuery) {
            // This syncs the search input in SelectorCategoriezed if the URL changes (e.g. back/fwd)
            // Only update if truly different to avoid loops if bind:searchValue is used aggressively by child
        }
    }
    
    // This reactive block handles triggering a backend search when searchValueForSelector changes
    // (which is bound to the search input within SelectorCategoriezed)
    $: if (typeof searchValueForSelector === 'string') {
        // Check if the current URL search param 'q' is different from our searchValueForSelector
        // Also ensures we don't navigate if both are empty (initial state or cleared search)
        const currentUrlQuery = $page.url.searchParams.get('q') || "";
        const newSearchTerm = searchValueForSelector.trim();

        if (currentUrlQuery !== newSearchTerm) {
            clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(() => {
                const newUrl = new URL($page.url);
                if (newSearchTerm) {
                    newUrl.searchParams.set('q', newSearchTerm);
                } else {
                    newUrl.searchParams.delete('q');
                }
                // Only navigate if the href actually changes to prevent redundant loads
                if (newUrl.href !== $page.url.href) {
                    goto(newUrl.href, {
                        keepFocus: true,      // Keep focus on the search input
                        replaceState: true,   // Avoid polluting browser history for each keystroke
                        invalidateAll: true   // Re-run the load function
                    });
                }
            }, 500); // 500ms debounce
        }
    }


    function handleNext() {
        if (!selectedCategoryKey) {
            alert("Пожалуйста, выберите категорию."); // Or show a more user-friendly error
            return;
        }
        createJobStore.update(storeData => ({
            ...storeData,
            categoryId: selectedCategoryKey,
            requiredSkillIds: selectedSkills // Assuming selectedSkills is managed elsewhere or will be added
        }));
        goto("/jobs/post/skills"); // Navigate to the next step
    }

    onMount(() => {
        const currentKeyOnPage = $page.params.stepKey; // From URL like /your-path/[stepKey]
        if (currentKeyOnPage) {
            currentJobCreationStepKey.set(currentKeyOnPage);
        }
        // Initialize searchValueForSelector from the URL's 'q' param when component mounts
        // This ensures the search box in SelectorCategoriezed reflects the initial URL state
        const initialQueryFromUrl = $page.url.searchParams.get('q');
        if (initialQueryFromUrl !== null) {
            searchValueForSelector = initialQueryFromUrl;
        }
    });

</script>

<div class="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-base-content">Выбор категории проекта</h1>

    {#if fetchError}
        <div class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{fetchError}</span>
        </div>
    {/if}
    
    <div>
        <p class="text-sm text-base-content/70 mb-2">
            Начните вводить название для поиска по категориям или выберите из списка.
        </p>
        <SelectorCategoriezed
            categories={categoriesForSelector}
            bind:searchValue={searchValueForSelector}
            bind:selectedValue={selectedCategoryKey}
            buttonLabelText="Выберите категорию"
        />
    </div>

    {#if selectedCategoryKey}
        <div class="mt-4 p-3 bg-base-200 rounded-md">
            <p class="text-sm text-base-content">Выбранная категория: <span class="font-semibold">
                {(categoriesForSelector.find(x => x.key == selectedCategoryKey) ?? {label: "Нету у категории имени"}).label}
            </span></p>
        </div>
    {/if}

    <div class="flex justify-end mt-8 pt-4 border-t border-base-300">
        <button class="btn btn-primary" type="button" on:click={handleNext} disabled={!selectedCategoryKey}>
            Далее
        </button>
    </div>
</div>