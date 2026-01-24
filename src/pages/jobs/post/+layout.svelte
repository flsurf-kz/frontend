<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    /* глобальный стор с текущим шагом */
    export const currentJobCreationStepKey = writable('name');

    interface StepConfig {
        key:    string;
        title:  string;
        number: number;
    }

    export const steps: StepConfig[] = [
        { key:'name',        title:'Название и тип',        number:1 },
        { key:'description', title:'Описание заказа',       number:2 },
        { key:'category',    title:'Категория',             number:3 },
        { key:'skills',      title:'Навыки',                number:4 },
        { key:'budget',      title:'Бюджет и сроки',        number:5 },
        { key:'volume', title: "Обьем работ", number:6}, 
        { key:'review',      title:'Проверка и публикация', number:7 }
    ];

    const totalSteps = steps.length;

    function goToStep(stepKey: string): void {
        goto(`/jobs/post/${stepKey}`);
    }

    /* при загрузке / при каждом изменении URL — обновляем стор */
    $: {
        const segments = $page.url.pathname.split('/').filter(Boolean);
        const last     = segments[segments.length - 1] ?? '';
        const found    = steps.find(s => s.key === last);
        currentJobCreationStepKey.set(found ? found.key : steps[0].key);
    }

    /* номер активного шага для окраски полос */
    let currentStepNumber = 1;
    $: {
        const act = steps.find(s => s.key === $currentJobCreationStepKey);
        currentStepNumber = act ? act.number : 1;
    }
</script>

<div class="container mx-auto p-4">
    <!-- ░░░ Progress-bar ░░░ -->
    <div class="flex items-start mb-8 md:mb-10">
        {#each steps as step (step.key)}
            <div class="flex-1 text-center px-1">
                <button
                    class="
                        btn btn-sm md:btn-md rounded-full aspect-square mx-auto flex items-center justify-center mb-1
                        transition-all duration-300
                        {$currentJobCreationStepKey === step.key
                            ? 'btn-primary text-primary-content scale-110'
                            : currentStepNumber > step.number
                                ? 'btn-success text-success-content'
                                : 'btn-ghost bg-base-200 border-base-300 hover:bg-base-300'}"
                    onclick={() => goToStep(step.key)}
                    aria-current={$currentJobCreationStepKey === step.key ? 'step' : undefined}
                >
                    <span class="text-xs md:text-sm font-semibold">{step.number}</span>
                </button>
                <p class="text-xs md:text-sm mt-1
                          {$currentJobCreationStepKey === step.key
                              ? 'text-primary font-semibold'
                              : 'text-base-content/70'}">
                    {step.title}
                </p>
            </div>

            {#if step.number < totalSteps}
                <div class="flex-1 flex items-center pt-3 md:pt-4">
                    <div class="w-full h-0.5
                                {currentStepNumber > step.number
                                    ? 'bg-success'
                                    : 'bg-base-300'} rounded-full">
                    </div>
                </div>
            {/if}
        {/each}
    </div>

    <!-- контент шага -->
    <div class="bg-base-100 p-4 sm:p-6 rounded-xl shadow">
        <slot />
    </div>
</div>
