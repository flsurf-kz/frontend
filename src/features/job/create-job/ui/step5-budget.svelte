<script lang="ts">
    import { goto } from '$app/navigation';
	import { createJobStore } from '../modal';
    
    // Локальные переменные
    let budgetType: string = "";
    let budget: number | null = null;
    let hourlyRate: number | null = null;
    let duration: number | null = null;
  
    function handleNext() {
      createJobStore.update(data => ({
        ...data,
        budgetType: budgetType as any,
        budget: budget ?? undefined,
        hourlyRate: hourlyRate ?? undefined,
        duration: duration ?? undefined
      }));
      goto("/job/create/description");
    }
  </script>
  
<!-- svelte-ignore a11y_label_has_associated_control -->
  <div class="space-y-4">
    <h1 class="text-2xl font-bold mb-4">Бюджет и тип работы</h1>
    
    <div>
      <label class="label">Тип работы</label>
      <select bind:value={budgetType} class="select select-bordered w-full">
        <option value="" disabled selected>Выберите тип работы</option>
        <option value="fixed">Фиксированная цена</option>
        <option value="hourly">Почасовая</option>
      </select>
    </div>
    
    {#if budgetType === "fixed"}
      <div>
        <label class="label">Бюджет (₸)</label>
        <input type="number" bind:value={budget} placeholder="Укажите бюджет" class="input input-bordered w-full" required />
      </div>
    {:else if budgetType === "hourly"}
      <div>
        <label class="label">Почасовая ставка (₸)</label>
        <input type="number" bind:value={hourlyRate} placeholder="Укажите почасовую ставку" class="input input-bordered w-full" required />
      </div>
    {/if}
    
    <div>
      <label class="label">Продолжительность (дней)</label>
      <input type="number" bind:value={duration} placeholder="Укажите продолжительность" class="input input-bordered w-full" required />
    </div>
    
    <div class="flex justify-end mt-6">
      <button class="btn btn-success" on:click={handleNext}>Далее</button>
    </div>
  </div>
  