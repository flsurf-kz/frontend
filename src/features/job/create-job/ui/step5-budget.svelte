<script lang="ts">
    import { goto } from '$app/navigation';
	import { createJobStore } from '../modal';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { currentJobCreationStepKey } from '../modal';
	import { CreateJobCommandBudgetType } from 'flsurf-client';
    
    // Локальные переменные
    let budgetType: CreateJobCommandBudgetType = CreateJobCommandBudgetType.Fixed;
    let budget: number | undefined = undefined;
    let hourlyRate: number | undefined = undefined;
    let duration: number | undefined = undefined;
  
    function handleNext() {
      goto("/jobs/post/review");
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
    <h1 class="text-2xl font-bold mb-4">Бюджет и тип работы</h1>
    
    <div>
      <label class="label">Тип работы</label>
      <select bind:value={$createJobStore.budgetType} class="select select-bordered w-full">
        <option value="" disabled selected>Выберите тип работы</option>
        <option value="Fixed">Фиксированная цена</option>
        <option value="Hourly">Почасовая</option>
      </select>
    </div>
    
    {#if budgetType === CreateJobCommandBudgetType.Fixed}
      <div>
        <label class="label">Бюджет (₸)</label>
        <input type="number" bind:value={$createJobStore.budget} placeholder="Укажите бюджет" class="input input-bordered w-full" required />
      </div>
    {:else if budgetType === CreateJobCommandBudgetType.Hourly}
      <div>
        <label class="label">Почасовая ставка (₸)</label>
        <input type="number" bind:value={$createJobStore.hourlyRate}  placeholder="Укажите почасовую ставку" class="input input-bordered w-full" required />
      </div>
    {/if}
    
    <div>
      <label class="label">Продолжительность (дней)</label>
      <input type="number" bind:value={$createJobStore.duration} placeholder="Укажите продолжительность" class="input input-bordered w-full" required />
    </div>
    
    <div class="flex justify-end mt-6">
      <button class="btn btn-success" on:click={handleNext}>Далее</button>
    </div>
  </div>
  