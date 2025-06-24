<script lang="ts">
    import { goto } from "$app/navigation";
  	import { page } from "$app/stores";
  	import InputField from "$lib/shared/ui/inputs/input-field.svelte";
  	import { onMount } from "svelte";
  	import { createJobStore, currentJobCreationStepKey } from "../modal";
    
  
    // Обработчик перехода к следующему шагу
    function handleNext() {
      goto("/jobs/post/description");
    }

    onMount(() => {
      const currentKeyOnPage = $page.params.stepKey;
      if (currentKeyOnPage) {
          currentJobCreationStepKey.set(currentKeyOnPage);
          // console.log(`Category page mounted, current step key set to: ${currentKeyOnPage}`);
      }
    });
  </script>
  
  <div class="space-y-4">
    <h1 class="text-2xl font-bold mb-4">Общая информация</h1>
    <InputField label="Название заказа" bind:value={$createJobStore.title} required />
    <InputField label="Краткое описание" bind:value={$createJobStore.description} required />
  
    <div class="flex justify-end mt-6">
      <button class="btn btn-success" on:click={handleNext}>
        Далее
      </button>
    </div>
  </div>
  