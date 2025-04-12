<script lang="ts">
    import { goto } from '$app/navigation';
	import SelectorTaggableSearch from '$lib/shared/ui/selector/selector-taggable-search.svelte';
	import type { SkillEntity } from 'flsurf-client';
	import { createJobStore } from '../modal';
	import type { SelectItem } from '$lib/shared/types';
	import { GlobalClient } from '$lib/shared/api';
  
    let skillIds: string[] = $state([]);

    let selectedItems: SelectItem[] = $state([])
    let searchResults: SelectItem[] = $state([]) 

    async function handleSearch(query: string) { 
        const result = await GlobalClient.getSkills()
        searchResults = result.map(
            (v) => ({key: v.id, label: v.name ?? ""})
        )
    }

    function handleAdd(item: SelectItem) { 
        selectedItems = [...selectedItems, item]
    }

    function handleRemove(index: number) { 
        selectedItems = [
            ...selectedItems.slice(0, index-1), ...selectedItems.slice(index+1, selectedItems.length)]
    }
    
    function handleNext() {
      createJobStore.update(data => ({
        ...data,
        requiredSkillIds: selectedItems.map((v) => v.key), 
      }));
      goto("/job/create/step4");
    }
  </script>
  
<!-- svelte-ignore a11y_label_has_associated_control -->
  <div class="space-y-4">
    <h1 class="text-2xl font-bold mb-4">Навыки работы которые нужны для заказа</h1>
    
    <SelectorTaggableSearch 
        placeholder="Навыки работы" 
        selectedItems={selectedItems} 
        searchResults={searchResults} 
        searchDelay={0.5} 
        onSearch={(query: string) => handleSearch(query)} 
        onAdd={(itemKey: SelectItem) => handleAdd(itemKey)} 
        onRemove={(index: number) => handleRemove(index)}/>
    
    
    <div class="flex justify-end mt-6">
      <button class="btn btn-success" onclick={handleNext}>Далее</button>
    </div>
  </div>
  