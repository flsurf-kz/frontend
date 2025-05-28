<script lang="ts">
    // Импорты согласно вашему списку
    import { GlobalClient } from '$lib/shared/api';
    import { goto } from '$app/navigation';
    import { 
        CreateJobCommand, 
        type ICreateJobCommand,
        CreateJobCommandBudgetType,
        CreateJobCommandLevel,
        type CategoryEntity,
        type SkillEntity,
        type CreateFileDto
    } from 'flsurf-client';
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
    import { onMount, tick } from 'svelte'; // Добавил tick для возможного использования после обновления DOM
    import EditIcon from '$lib/shared/ui/icons/EditIcon.svelte';
    import { TagsList } from '$lib/shared/ui/lists';
    import { createJobStore, currentJobCreationStepKey } from '../modal';
	import { showNotification } from '$lib/shared/ui/errors/modal';
	import { writable, type Writable } from 'svelte/store';
	import { page } from '$app/stores';

    // Локальные состояния (не writable, т.к. управляются напрямую или через $createJobStore)
    let loading = false;
    let error: string | null = null;
    let categoryName: string | undefined = undefined; // Убрал writable, будем устанавливать напрямую
    let skillNames: string[] = []; // Убрал writable
    let dataLoading = true; // Убрал writable, обычная переменная

    onMount(async () => {
        dataLoading = true;
        error = null;
        try {
            if ($createJobStore.categoryId) {
                const category = await GlobalClient.getCategory($createJobStore.categoryId);
                categoryName = category?.name;
            } else {
                categoryName = undefined;
            }

            if ($createJobStore.requiredSkillIds && $createJobStore.requiredSkillIds.length > 0) {
                const fetchedSkills: string[] = [];
                for (const skillId of $createJobStore.requiredSkillIds) {
                    try {
                        const skill = await GlobalClient.getSkill(skillId);
                        if (skill?.name) fetchedSkills.push(skill.name);
                    } catch (skillError) {
                        console.warn(`Не удалось загрузить навык с ID ${skillId}:`, skillError);
                    }
                }
                skillNames = fetchedSkills;
            } else {
                skillNames = [];
            }
        } catch (e: any) {
            const errMessage = e?.error?.message || e?.message || "Ошибка загрузки деталей для предпросмотра.";
            error = errMessage;
            showNotification(errMessage, true);
        } finally {
            dataLoading = false;
        }
    });

    function editSection(stepKey: string) {
        goto(`/job/create/${stepKey}`);
    }

    async function saveAsDraft() {
        error = null;
        loading = true;
        try {
            const commandPayload: ICreateJobCommand = { 
                title: $createJobStore.title,
                description: $createJobStore.description,
                categoryId: $createJobStore.categoryId,
                requiredSkillIds: $createJobStore.requiredSkillIds,
                budgetType: $createJobStore.budgetType,
                budget: $createJobStore.budgetType === CreateJobCommandBudgetType.Fixed ? $createJobStore.budget : undefined,
                hourlyRate: $createJobStore.budgetType === CreateJobCommandBudgetType.Hourly ? $createJobStore.hourlyRate : undefined,
                duration: $createJobStore.duration,
                level: $createJobStore.level,
                // status: 'Draft' // Бэкенд должен сам установить статус Draft для этой команды
            };
            // await GlobalClient.saveJobAsDraft(new CreateJobCommand(commandPayload)); // Ваша команда
            console.log("Сохранить как черновик (заглушка):", commandPayload);
            showNotification('Вакансия сохранена как черновик! (Демо)', false);
            // goto('/my-jobs'); 
        } catch (e: any) {
            const errMessage = e?.error?.message || e?.message || "Ошибка сохранения черновика.";
            error = errMessage;
            showNotification(errMessage, true);
        }
        loading = false;
    }

    async function handleSubmit() {
        error = null;
        loading = true;
        try {
            const commandPayload: ICreateJobCommand = {
                title: $createJobStore.title,
                description: $createJobStore.description,
                categoryId: $createJobStore.categoryId,
                requiredSkillIds: $createJobStore.requiredSkillIds,
                budgetType: $createJobStore.budgetType,
                budget: $createJobStore.budgetType === CreateJobCommandBudgetType.Fixed ? $createJobStore.budget : undefined,
                hourlyRate: $createJobStore.budgetType === CreateJobCommandBudgetType.Hourly ? $createJobStore.hourlyRate : undefined,
                duration: $createJobStore.duration,
                level: $createJobStore.level,
                expirationDate: $createJobStore.expirationDate ? new Date($createJobStore.expirationDate) : undefined,
                files: $createJobStore.files,
                // Данные из "Advanced preferences" пока не добавляем в команду, т.к. $createJobStore не изменен для них
            };
            await GlobalClient.createJob(new CreateJobCommand(commandPayload));
            showNotification('Вакансия успешно опубликована!', false);
            createJobStore.set({}); // Очистить стор
            goto('/my-jobs'); 
        } catch (e: any) {
            const errMessage = e?.error?.message || e?.message || "Ошибка публикации вакансии. Проверьте все поля и попробуйте ещё раз.";
            error = errMessage;
            showNotification(errMessage, true);
        }
        loading = false;
    }

    // Хелперы для отображения
    $: categoryDisplay = categoryName || ($createJobStore.categoryId ? 'Загрузка...' : 'Не указано');
    
    $: scopeDisplay = [
        $createJobStore.level ? `Уровень: ${$createJobStore.level.toString()}` : null,
        $createJobStore.duration ? `Длительность: ${$createJobStore.duration} дней` : null,
    ].filter(Boolean).join(', ') || 'Не указано';

    let budgetDisplay = '';
    $: {
        const store = $createJobStore; // Используем $ для доступа к значению стора
        if (store.budgetType === CreateJobCommandBudgetType.Fixed) {
            budgetDisplay = `Фиксированный: ${store.budget || 'N/A'} ${'RUB'}`;
        } else if (store.budgetType === CreateJobCommandBudgetType.Hourly) {
            const rateMin = store.hourlyRate
            const rateMax = store.hourlyRate;
            if (rateMin) {
                budgetDisplay = `Почасовой: ${rateMin} ${'RUB'} / час`;
            } else {
                budgetDisplay = 'Почасовая: Ставка не указана';
            }
        } else {
            budgetDisplay = 'Бюджет не указан';
        }
    }
    
    const previousStepKey = 'attachments';

    // Заглушки для Advanced Preferences (эти значения не будут сохраняться, т.к. createJobStore не изменен)
    let advEnglishLevel = 'any';
    let advHireDate = '1-3_days';
    let advHoursPerWeek = 'more_30';
    let advNumProfessionals = 'one';
    let advTalentType = 'no_preference';
    let advLocation = ''; // Для <select> локации
    onMount(() => {
      const currentKeyOnPage = $page.params.stepKey;
      if (currentKeyOnPage) {
          currentJobCreationStepKey.set(currentKeyOnPage);
          // console.log(`Category page mounted, current step key set to: ${currentKeyOnPage}`);
      }
    });
</script>

<div class="bg-base-300 text-base-content min-h-screen p-4 md:p-8">
    <div class="max-w-3xl mx-auto">
        <header class="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h1 class="text-2xl md:text-3xl font-bold text-base-content mb-3 sm:mb-0">Детали вакансии (Предпросмотр)</h1>
            <BaseButton 
                className="primary bg-green-600 hover:bg-green-700 border-green-600 !font-semibold text-white" 
                onclick={handleSubmit} 
                loading={loading}
                disabled={loading || dataLoading}>
                {loading ? "Публикация..." : "Опубликовать вакансию"}
            </BaseButton>
        </header>

        {#if dataLoading}
            <div class="text-center py-10">
                <span class="loading loading-lg loading-spinner text-primary"></span>
                <p class="mt-2 text-base-content/70">Загрузка данных для предпросмотра...</p>
            </div>
        {:else if error && !dataLoading}
            <div class="alert alert-error shadow-lg">
                <span>{error}</span>
            </div>
        {:else}
            <div class="space-y-3">
                <section class="bg-base-100 border border-base-300 rounded-lg p-5">
                    <div class="flex justify-between items-center">
                        <h2 class="text-xl font-semibold text-base-content">{$createJobStore.title || "Без названия"}</h2>
                        <button on:click={() => editSection('name')} aria-label="Редактировать название" class="btn btn-xs btn-ghost text-base-content/60 hover:text-primary p-1">
                            <EditIcon className="w-4 h-4" /> 
                        </button>
                    </div>
                </section>

                <section class="bg-base-100 border border-base-300 rounded-lg p-5">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-md font-medium text-base-content/80">Описание</h3>
                        <button on:click={() => editSection('description')} aria-label="Редактировать описание" class="btn btn-xs btn-ghost text-base-content/60 hover:text-primary p-1">
                             <EditIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <p class="text-sm text-base-content/90 whitespace-pre-wrap leading-relaxed">{$createJobStore.description || "Описание не предоставлено."}</p>
                </section>

                <section class="bg-base-100 border border-base-300 rounded-lg p-5">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-md font-medium text-base-content/80">Категория</h3>
                            <p class="text-sm text-base-content">{($createJobStore.categoryId ? 'Загрузка...' : 'Не указано')}</p>
                        </div>
                        <button on:click={() => editSection('category')} aria-label="Редактировать категорию" class="btn btn-xs btn-ghost text-base-content/60 hover:text-primary p-1">
                             <EditIcon className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                <section class="bg-base-100 border border-base-300 rounded-lg p-5">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="text-md font-medium text-base-content/80">Требуемые навыки</h3>
                        <button on:click={() => editSection('skills')} aria-label="Редактировать навыки" class="btn btn-xs btn-ghost text-base-content/60 hover:text-primary p-1">
                             <EditIcon className="w-4 h-4" />
                        </button>
                    </div>
                    {#if skillNames.length > 0}
                        <TagsList tags={skillNames} readOnly={true} maxVisible={7} />
                    {:else if ($createJobStore.requiredSkillIds?.length ?? 0) > 0 && dataLoading}
                         <p class="text-sm text-base-content/70 italic">Загрузка навыков...</p>
                    {:else}
                        <p class="text-sm text-base-content/70 italic">Навыки не указаны.</p>
                    {/if}
                </section>

                <section class="bg-base-100 border border-base-300 rounded-lg p-5">
                     <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-md font-medium text-base-content/80">Объем и условия</h3>
                            <p class="text-sm text-base-content">{scopeDisplay}</p>
                        </div>
                        <button on:click={() => editSection('budget')} aria-label="Редактировать объем и условия" class="btn btn-xs btn-ghost text-base-content/60 hover:text-primary p-1">
                             <EditIcon className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                <section class="bg-base-100 border border-base-300 rounded-lg p-5">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-md font-medium text-base-content/80">Бюджет</h3>
                            <p class="text-sm text-base-content">{budgetDisplay}</p>
                        </div>
                        <button on:click={() => editSection('budget')} aria-label="Редактировать бюджет" class="btn btn-xs btn-ghost text-base-content/60 hover:text-primary p-1">
                             <EditIcon className="w-4 h-4" />
                        </button>
                    </div>
                </section>
                
                {#if $createJobStore.files && $createJobStore.files.length > 0}
                <section class="bg-base-100 border border-base-300 rounded-lg p-5">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-md font-medium text-base-content/80">Прикрепленные файлы ({$createJobStore.files.length})</h3>
                        <button on:click={() => editSection('attachments')} aria-label="Редактировать файлы" class="btn btn-xs btn-ghost text-base-content/60 hover:text-primary p-1">
                             <EditIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <ul class="list-disc list-inside pl-1 space-y-1">
                        {#each $createJobStore.files as file (file.fileId || file.name)}
                            <li class="text-sm text-base-content/90 truncate" title={file.name}>
                                {file.name}
                            </li>
                        {/each}
                    </ul>
                </section>
                {/if}

                <div class="collapse collapse-arrow bg-base-200 border border-base-300 rounded-lg text-base-content">
                    <input type="checkbox" name="screening_questions_accordion" class="peer" /> 
                    <div class="collapse-title text-md font-medium peer-checked:bg-base-300/60 peer-checked:text-primary flex justify-between items-center">
                        <span>Screening questions <span class="text-xs opacity-70">(optional)</span></span>
                         <button on:click|stopPropagation={() => editSection('screening_questions')} aria-label="Редактировать отборочные вопросы" class="btn btn-xs btn-ghost text-base-content/60 hover:text-primary p-1 relative z-10">
                             <EditIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div class="collapse collapse-arrow bg-base-200 border border-base-300 rounded-lg text-base-content">
                    <input type="checkbox" name="advanced_prefs_accordion" class="peer" id="advanced-prefs-toggle"/> 
                    <div class="collapse-title text-md font-medium peer-checked:bg-base-300/60 peer-checked:text-primary flex justify-between items-center">
                        <div>
                            <span>Advanced preferences <span class="text-xs opacity-70">(optional)</span></span>
                            <p class="text-xs text-base-content/70 font-normal">Hours per week, hire date, and more</p>
                        </div>
                         <button 
                            on:click|stopPropagation={() => editSection('advanced_preferences')} 
                            aria-label="Редактировать дополнительные параметры" 
                            class="btn btn-xs btn-ghost text-base-content/60 hover:text-primary p-1 relative z-10">
                             <EditIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <div class="collapse-content bg-base-200/80">
                        <div class="p-4 space-y-6">
                            <div>
                                <h4 class="text-sm font-semibold text-base-content/90 mb-2">English level</h4>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                    {#each ['Any level', 'Conversational or better', 'Fluent or better', 'Native or bilingual only'] as level, i}
                                    <label class="flex items-center gap-2 cursor-pointer text-sm">
                                        <input type="radio" name="english_level" value={level.toLowerCase().replace(/ /g, '_')} bind:group={advEnglishLevel} class="radio radio-xs radio-primary checked:bg-green-500"/>
                                        <span>{level}</span>
                                    </label>
                                    {/each}
                                </div>
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold text-base-content/90 mb-2">Hire date</h4>
                                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                    {#each ['1 to 3 days', 'One week', 'Two weeks', 'One month'] as dateOpt, i}
                                    <label class="flex items-center gap-2 cursor-pointer text-sm">
                                        <input type="radio" name="hire_date" value={dateOpt.toLowerCase().replace(/ /g, '_')} bind:group={advHireDate} class="radio radio-xs radio-primary checked:bg-green-500"/>
                                        <span>{dateOpt}</span>
                                    </label>
                                    {/each}
                                </div>
                            </div>
                            <div>
                                <h4 class="text-sm font-semibold text-base-content/90 mb-2">Hours per week</h4>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                    {#each ['More than 30 hrs/week', 'Less than 30 hrs/week', "I'm not sure"] as hoursOpt, i}
                                    <label class="flex items-center gap-2 cursor-pointer text-sm">
                                        <input type="radio" name="hours_per_week" value={hoursOpt.toLowerCase().replace(/[^a-z0-9_]/g, '')} bind:group={advHoursPerWeek} class="radio radio-xs radio-primary checked:bg-green-500"/>
                                        <span>{hoursOpt}</span>
                                    </label>
                                    {/each}
                                </div>
                            </div>
                             <div>
                                <h4 class="text-sm font-semibold text-base-content/90 mb-2">Number of professionals needed</h4>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                    {#each ['One person', 'More than one person'] as numOpt, i}
                                    <label class="flex items-center gap-2 cursor-pointer text-sm">
                                        <input type="radio" name="num_professionals" value={numOpt.toLowerCase().replace(/ /g, '_')} bind:group={advNumProfessionals} class="radio radio-xs radio-primary checked:bg-green-500"/>
                                        <span>{numOpt}</span>
                                    </label>
                                    {/each}
                                </div>
                            </div>
                            <div class="form-control w-full max-w-md">
                                <label class="label" for="adv-talent-type"><span class="label-text text-sm font-semibold text-base-content/90">Talent type</span></label>
                                <select id="adv-talent-type" class="select select-sm select-bordered bg-base-100 border-base-300 w-full" bind:value={advTalentType}>
                                    <option value="no_preference">No preference</option>
                                    <option value="freelancers_only">Freelancers only</option>
                                    <option value="agencies_only">Agencies only</option>
                                </select>
                            </div>
                            <div class="form-control w-full max-w-md">
                                <label class="label" for="adv-location"><span class="label-text text-sm font-semibold text-base-content/90">Location</span></label>
                                <select id="adv-location" class="select select-sm select-bordered bg-base-100 border-base-300 w-full" bind:value={advLocation}>
                                    <option value="">Add regions or countries</option>
                                    <option value="usa">United States</option>
                                    <option value="canada">Canada</option>
                                    <option value="kazakhstan">Kazakhstan</option>
                                </select>
                                <p class="text-xs text-base-content/70 mt-1">These location preferences will be displayed to all candidates, but anyone can submit proposals.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
        
        <div class="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-700">
            <BaseButton 
                className="ghost hover:bg-base-200/80 !text-base-content/80 !border-base-content/30 w-full sm:w-auto !font-normal" 
                onclick={() => goto(`/job/create/${previousStepKey}`)}
                disabled={loading || dataLoading}>
                Назад
            </BaseButton>
            <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <BaseButton 
                    className="secondary bg-base-200 hover:bg-base-300/80 border-base-300 !text-base-content/90 w-full sm:w-auto !font-semibold" 
                    onclick={saveAsDraft} 
                    loading={loading}
                    disabled={loading || dataLoading}>
                    Сохранить как черновик
                </BaseButton>
                <BaseButton 
                    className="primary bg-green-600 hover:bg-green-700 border-green-600 !font-semibold text-white w-full sm:w-auto" 
                    onclick={handleSubmit} 
                    loading={loading}
                    disabled={loading || dataLoading}>
                    {loading ? "Публикация..." : "Опубликовать вакансию"}
                </BaseButton>
            </div>
        </div>
    </div>
</div>

<style>
    /* Стили для аккордеона и кнопок редактирования внутри него */
    .collapse-title button {
        pointer-events: auto; 
        opacity: 0.6; /* По умолчанию полупрозрачны */
        transition: opacity 0.2s ease-in-out;
    }
    .collapse-title:hover button,
    .collapse:focus-within .collapse-title button {
        opacity: 1;
    }
    /* Убедимся, что нажатие на кнопку редактирования не открывает/закрывает аккордеон, если это нежелательно */
    .collapse-title button:active, .collapse-title button:focus {
        /* Можно добавить стили, чтобы показать, что кнопка нажата, но не влиять на аккордеон */
    }
</style>