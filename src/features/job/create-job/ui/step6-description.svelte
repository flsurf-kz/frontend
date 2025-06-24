<script lang="ts">
  import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { createJobStore, currentJobCreationStepKey } from '../modal';
  
    // Дополнительное описание
    let additionalInfo = "";
  
    function handleNext() {
      goto("/jobs/post/category");
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
    <h1 class="text-2xl font-bold mb-4">Дополнительная информация</h1>
    <div class="form-control">
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label class="label">Уточнения, дополнительные условия</label>
      <textarea bind:value={$createJobStore.description} placeholder="Введите дополнительные сведения" class="textarea textarea-bordered w-full" rows="4"></textarea>
    </div>
    <div class="flex justify-end mt-6">
      <button class="btn btn-success" on:click={handleNext}>Далее</button>
    </div>
  </div>
  