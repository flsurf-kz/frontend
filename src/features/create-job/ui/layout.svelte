<script lang="ts">
    import { goto } from '$app/navigation';
    // Для примера количество шагов – 7.
    let currentStep = 1;
    const totalSteps = 7;
    
    const steps = [
      "Общая информация",
      "Детали заказа",
      "Бюджет и график",
      "Навыки и категория",
      "Файлы и вложения",
      "Описание и уточнения",
      "Подтверждение"
    ];
    
    // Функция для перехода к определённому шагу.
    function goToStep(step: number) {
      currentStep = step;
      goto(`/job/create/step${step}`);
    }
  </script>
  
<div class="container mx-auto p-4">
<!-- Прогресс-бар -->
<div class="flex items-center mb-6">
  {#each steps as stepTitle, i}
    <div class="flex-1 text-center">
      <button
        on:click={() => goToStep(i + 1)}
        class="btn btn-xs {currentStep === i + 1 ? 'btn-success' : 'btn-ghost'} w-full"
      >
        {i + 1}
      </button>
      <p class="text-xs mt-1">{stepTitle}</p>
    </div>
    {#if i !== steps.length - 1}
      <div class="w-4 h-1 bg-base-300 mx-1"></div>
    {/if}
  {/each}
</div>

<!-- Слот для содержимого конкретного шага -->
<div>
  <slot />
</div>
</div>
  