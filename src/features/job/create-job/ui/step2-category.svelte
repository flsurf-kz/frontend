<script lang="ts">
	import { goto } from '$app/navigation';
	import SelectorCategoriezed from '$lib/shared/ui/selector/selector-categoriezed.svelte';
	import type { CategoryEntity } from 'flsurf-client';
	import { createJobStore } from '../modal';
	import { GlobalClient } from '$lib/shared/api';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { currentJobCreationStepKey } from '../modal';

  let categories = $state<CategoryEntity[] | undefined>(undefined);

  $effect(() => {
    const sync = { categories }

		GlobalClient.getCategories(searchValue).then(
      (result) => { 
        sync.categories = result;   
      }
    )
	});

	let searchValue = $state("");
	let selectedValues = $state("");
	let categoryId = $state("");
	let selectedSkills = $state<string[]>([]);

  function convertCategories(entities: CategoryEntity[] | undefined): Category[] {
		if (!entities) return [];
		return entities.map((entity) => ({
			key: entity.id,
			label: entity.name ?? '',
			items: convertCategories(entity.subCategories)
		}));
	}

  interface Category {
		key: string;
		label: string;
		items: Category[];
	}

  
	let convertedCategories = $derived(convertCategories(categories));

	function handleNext() {
		createJobStore.update(data => ({
			...data,
			categoryId,
			requiredSkillIds: selectedSkills
		}));
		goto("/jobs/post/skills");
	}

    onMount(() => {
      const currentKeyOnPage = $page.params.stepKey;
      if (currentKeyOnPage) {
          currentJobCreationStepKey.set(currentKeyOnPage);
          // console.log(`Category page mounted, current step key set to: ${currentKeyOnPage}`);
      }
    });
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<div class="space-y-4">
	<h1 class="text-2xl font-bold mb-4">Выбор категории и навыков</h1>

	<!-- Выбор навыков -->
	<div>
		<SelectorCategoriezed
			categories={convertedCategories}
			searchValue={searchValue}
			bind:selectedValue={selectedValues}
		/>
	</div>

	<div class="flex justify-end mt-6">
		<button class="btn btn-success" onclick={handleNext}>Далее</button>
	</div>
</div>
