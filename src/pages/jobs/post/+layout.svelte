<script lang="ts">
    import { goto } from '$app/navigation';
    // Импортируем глобальный стор
    // `page` стор все еще нужен для определения начального шага, если пользователь зашел по прямой ссылке
    import { page } from '$app/stores'; 
	import { currentJobCreationStepKey } from '$lib/features/job/create-job/modal';
    import { onMount } from 'svelte';

    interface StepConfig { // Экспортируем интерфейс, если он нужен в сторе или в других местах
        key: string;
        title: string;
        number: number;
    }

    export const steps: StepConfig[] = [ // Этот массив можно оставить здесь или вынести в отдельный файл и импортировать
        { key: 'name', title: 'Название и тип', number: 1 },
        { key: 'description', title: 'Описание заказа', number: 2 },
        { key: 'category', title: 'Категория', number: 3 },
        { key: 'skills', title: 'Навыки', number: 4 },
        { key: 'budget', title: 'Бюджет и сроки', number: 5 },
        { key: 'review', title: 'Проверка и публикация', number: 6 }
    ];

    const totalSteps = steps.length;
    
    // Функция для перехода к шагу
    function goToStep(stepKeyToGo: string) {
        // Мы больше не управляем currentStepKey напрямую здесь.
        // Страница шага, на которую мы переходим, установит новое значение в стор.
        goto(`/jobs/post/${stepKeyToGo}`); 
    }

    // При монтировании компонента прогресс-бара (обычно в +layout.svelte для шагов),
    // мы можем установить начальное значение стора на основе URL,
    // если оно еще не установлено или если мы хотим быть уверены.
    // Это полезно, если пользователь открывает прямую ссылку на определенный шаг.
    onMount(() => {
        const keyFromParam = $page.params.stepKey;
        const foundStep = steps.find(s => s.key === keyFromParam);
        if (foundStep) {
            currentJobCreationStepKey.set(foundStep.key);
        } else if ($page.url.pathname.match(/^\/jobs\/post\/?$/)) {
            // Если базовый URL без ключа, установим первый шаг и редиректнем
            currentJobCreationStepKey.set(steps[0].key);
            goto(`/jobs/post/${steps[0].key}`, { replaceState: true, noScroll: true });
        } else if (!keyFromParam && $page.route.id?.includes('/[stepKey]')) {
            // Если мы на параметризованном маршруте, но ключ пуст, ставим первый шаг
             currentJobCreationStepKey.set(steps[0].key);
        }
    });

    // Вычисляем номер текущего шага на основе ключа из стора
    let currentStepNumber: number;
    $: {
        const foundStep = steps.find(s => s.key === $currentJobCreationStepKey);
        currentStepNumber = foundStep ? foundStep.number : (steps[0]?.number || 1);
    }

</script>

<div class="container mx-auto p-4">
    <div class="flex items-start mb-8 md:mb-10"> 
        {#each steps as step (step.key)}
            <div class="flex-1 text-center px-1">
                <button
                    on:click={() => goToStep(step.key)}
                    class="btn btn-sm md:btn-md rounded-full aspect-square mx-auto flex items-center justify-center mb-1 transition-all duration-300 ease-in-out
                           {$currentJobCreationStepKey === step.key ? 'btn-primary text-primary-content scale-110' : 
                           currentStepNumber > step.number ? 'btn-success text-success-content' : 
                           'btn-ghost bg-base-200 border-base-300 hover:bg-base-300'}"
                    aria-current={$currentJobCreationStepKey === step.key ? 'step' : undefined}
                >
                    <span class="text-xs md:text-sm font-semibold">{step.number}</span>
                </button>
                <p class="text-xs md:text-sm mt-1 {$currentJobCreationStepKey === step.key ? 'text-primary font-semibold' : 'text-base-content/70'}">
                    {step.title}
                </p>
            </div>
            {#if step.number < totalSteps}
                <div class="flex-1 flex items-center pt-3 md:pt-4"> 
                    <div class="w-full h-0.5 {currentStepNumber > step.number ? 'bg-success' : 'bg-base-300'} rounded-full transition-colors duration-300 ease-in-out"></div>
                </div>
            {/if}
        {/each}
    </div>

    <div class="bg-base-100 p-4 sm:p-6 rounded-xl shadow">
        <slot />
    </div>
</div>