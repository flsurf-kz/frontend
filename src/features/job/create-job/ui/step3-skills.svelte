<script lang="ts">
    import { goto } from '$app/navigation';
    import SelectorTaggableSearch from '$lib/shared/ui/selector/selector-taggable-search.svelte';
    import { createJobStore, currentJobCreationStepKey } from '../modal'; // Adjust path
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import type { SelectItem } from '$lib/shared/types';
    import { GlobalClient } from '$lib/shared/api';
    import { showNotification } from '$lib/shared/ui/errors/modal';
    import type { SkillModel } from 'flsurf-client'; // Import SkillModel

    // --- Svelte 4 State ---
    let selectedItems: SelectItem[] = [];
    let searchResultsForSelector: SelectItem[] = []; // For SelectorTaggableSearch results
    // let currentSearchQueryInSelector = ""; // If needed to track input from SelectorTaggableSearch

    // State for suggested/popular skills
    let jobCategoryName = "UX/UI Дизайна"; // Placeholder, ideally get from createJobStore.categoryId
    let fetchedSuggestedSkills: SelectItem[] = [];
    let isLoadingSuggestedSkills = false;
    let suggestedSkillsError: string | null = null;


    // --- Event Handlers for SelectorTaggableSearch ---
    async function handleSearchInSelector(query: string) {
        // currentSearchQueryInSelector = query;
        if (!query.trim()) {
            searchResultsForSelector = [];
            return;
        }
        try {
            const result: SkillModel[] = await GlobalClient.getSkills(query);
            searchResultsForSelector = result.map(
                (v) => ({ key: v.id ?? v.name ?? "", label: v.name ?? "" })
            );
        } catch (error) {
            console.error("Error fetching skills for selector:", error);
            showNotification("Не удалось загрузить список навыков для поиска.", true);
            searchResultsForSelector = [];
        }
    }

    function handleAddSkill(item: SelectItem) {
        if (!selectedItems.find(si => si.key === item.key)) {
            selectedItems = [...selectedItems, item];
        }
    }

    function handleRemoveSkill(indexToRemove: number) {
        selectedItems = selectedItems.filter((_, index) => index !== indexToRemove);
    }

    // --- Handler for Suggested Skills ---
    function addSuggestedSkill(skill: SelectItem) {
        handleAddSkill(skill); // Reuse the existing add logic
    }
    
    // --- Navigation ---
    function handleNext() {
        if (selectedItems.length < 1) {
            showNotification("Пожалуйста, выберите хотя бы один навык.", true);
            return;
        }
        createJobStore.update(data => ({
            ...data,
            requiredSkillIds: selectedItems.map((v) => v.key),
            // Optionally store full selectedSkillItems if useful for re-hydration
            // selectedSkillItems: selectedItems 
        }));
        goto("/jobs/post/volume"); // Or your next step path
    }

    onMount(async () => {
        const currentKeyOnPage = $page.params.stepKey;
        if (currentKeyOnPage) {
            currentJobCreationStepKey.set(currentKeyOnPage);
        }

        // Attempt to re-hydrate selectedItems from the store if coming back to this step
        // This part depends on how `createJobStore` is structured and if it stores selected skills.
        // For example:
        const unsubscribe = createJobStore.subscribe(storeState => {
            if (storeState && storeState.requiredSkillIds && storeState.requiredSkillIds.length > 0 && selectedItems.length === 0) {
                 // If only IDs are stored, you'd need to fetch their labels here to reconstruct SelectItem[]
                 // For simplicity, if storeState.selectedSkillItems (SelectItem[]) exists:
                 // selectedItems = storeState.selectedSkillItems || [];
                 // This is complex if only IDs are stored, as it requires N API calls for labels.
                 // It's better if the store can hold the SelectItem[] structure or if you fetch them all here.
            }
            // If categoryId is in store, try to get category name for "Popular skills for X"
            if (storeState?.categoryId) {
                GlobalClient.getCategory(storeState.categoryId).then(cat => {
                    if (cat?.name) jobCategoryName = cat.name;
                }).catch(e => console.error("Failed to get category name for popular skills title", e));
            }
        });
        unsubscribe(); // Immediately unsubscribe if only for initial read

        // Fetch suggested/popular skills
        isLoadingSuggestedSkills = true;
        suggestedSkillsError = null;
        try {
            // Fetch a general list of skills, or skills for a specific category if API supports
            // Passing empty string might return all or popular skills.
            const skills: SkillModel[] = await GlobalClient.getSkills(""); 
            // You might want to limit the number of suggested skills, e.g., .slice(0, 20)
            fetchedSuggestedSkills = skills.map(s => ({ key: s.id, label: s.name })).slice(0, 20);
        } catch (error) {
            console.error("Error fetching suggested skills:", error);
            suggestedSkillsError = "Не удалось загрузить предлагаемые навыки.";
            showNotification(suggestedSkillsError, true);
        } finally {
            isLoadingSuggestedSkills = false;
        }
    });
</script>

<div class="space-y-6 p-4 md:p-6 max-w-3xl mx-auto bg-base-100 rounded-lg shadow-lg">
    <h1 class="text-2xl font-bold mb-1 text-base-content">Навыки, необходимые для заказа</h1>
    <p class="text-sm text-base-content/70 mb-6">
        Укажите ключевые навыки, которыми должен обладать исполнитель. Это поможет найти наиболее подходящих кандидатов.
    </p>
    
    <div class="mb-3">
        <label for="skill-search" class="block text-sm font-medium text-base-content mb-1">Поиск или добавление своих навыков</label>
        <SelectorTaggableSearch 
            placeholder="Например, JavaScript, Копирайтинг, 3D Моделирование" 
            selectedItems={selectedItems}
            searchResults={searchResultsForSelector} 
            searchDelay={300}
            onSearch={handleSearchInSelector} 
            onAdd={handleAddSkill} 
            onRemove={handleRemoveSkill}
        />
    </div>

    <p class="text-xs text-base-content/60 mb-6">
        <span class="text-info font-semibold">💡 Совет:</span> Для лучших результатов добавьте 3-5 ключевых навыков.
    </p>

    <div class="pt-4 border-t border-base-300">
        <h2 class="text-lg font-semibold mb-3 text-base-content">
            Предлагаемые навыки {#if jobCategoryName && jobCategoryName !== "UX/UI Дизайна"}для категории "{jobCategoryName}"{/if}
        </h2>
        {#if isLoadingSuggestedSkills}
            <div class="flex justify-center items-center py-4">
                <span class="loading loading-dots loading-md text-primary"></span>
            </div>
        {:else if suggestedSkillsError}
            <p class="text-sm text-error">{suggestedSkillsError}</p>
        {:else if fetchedSuggestedSkills.length > 0}
            <div class="flex flex-wrap gap-2">
                {#each fetchedSuggestedSkills as skill (skill.key)}
                    {@const isSelected = selectedItems.some(si => si.key === skill.key)}
                    <button 
                        type="button"
                        class="btn btn-xs sm:btn-sm gap-1 {isSelected ? 'btn-active btn-primary text-primary-content' : 'btn-outline border-base-300 hover:bg-primary/10 hover:border-primary'}"
                        on:click={() => addSuggestedSkill(skill)}
                        disabled={isSelected}
                        title={isSelected ? 'Навык уже добавлен' : `Добавить ${skill.label}`}
                    >
                        {skill.label}
                        {#if !isSelected}
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        {/if}
                    </button>
                {/each}
            </div>
        {:else}
            <p class="text-sm text-base-content/60">Предлагаемые навыки не найдены.</p>
        {/if}
    </div>
    
    <div class="flex justify-end mt-8 pt-6 border-t border-base-300">
        <button class="btn btn-primary btn-md" on:click={handleNext} disabled={selectedItems.length === 0}>
            Далее
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
    </div>
</div>