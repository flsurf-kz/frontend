<script lang="ts">
    import { goto } from "$app/navigation";
	import InputField from "$lib/shared/ui/inputs/input-field.svelte";
	import { createJobStore } from "../modal";
  
    // Локальные переменные для шага 1
    let title = '';
    let description = '';
  
    // Обработчик перехода к следующему шагу
    function handleNext() {
      // Обновляем стор, записывая общую информацию
      createJobStore.update(data => ({
        ...data,
        title,
        description,
        timestamp: new Date()
      }));
      goto("/job/create/step2");
    }
  </script>
  
  <div class="space-y-4">
    <h1 class="text-2xl font-bold mb-4">Общая информация</h1>
    <InputField label="Название заказа" bind:value={title} required />
    <InputField label="Краткое описание" bind:value={description} required />
  
    <div class="flex justify-end mt-6">
      <button class="btn btn-success" on:click={handleNext}>
        Далее
      </button>
    </div>
  </div>
  