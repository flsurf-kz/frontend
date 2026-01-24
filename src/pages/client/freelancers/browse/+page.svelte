<script lang="ts">
    import type { PageData } from './$types'; // FilterOption импортируется из +page.ts
    import { FreelancerProfileEntity } from 'flsurf-client';
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
    // import RadioGroupField from '$lib/shared/ui/inputs/RadioGroupField.svelte'; // Если есть

    import { goto } from '$app/navigation';
    import { debounce } from 'lodash-es';
	import type { SelectItem } from '$lib/shared/types';
	import { ArrowDownIcon, SearchIcon } from '$lib/shared/ui/icons';
	import { InputField } from '$lib/shared/ui/inputs';
	import { CheckboxList } from '$lib/shared/ui/lists';
	import ChoicesField from '$lib/shared/ui/inputs/choices-field.svelte';
	import UserAvatar from '$lib/shared/ui/icons/UserAvatar.svelte';
	import { PagePagination } from '$lib/shared/ui/navigation';

    export let data: PageData;

    // Состояния фильтров, инициализированные из data.currentFilters
    let searchTermInput: string = data.currentFilters.searchTerm || '';
    let selectedTalentBadges: string[] = data.currentFilters.talentBadges || [];
    let minRateInput: string = data.currentFilters.minHourlyRate?.toString() ?? '';
    let maxRateInput: string = data.currentFilters.maxHourlyRate?.toString() ?? '';
    let selectedLocationKey: string = data.currentFilters.location || '';
    let selectedTimeZoneKey: string = (data.currentFilters.timeZones && data.currentFilters.timeZones.length > 0) ? data.currentFilters.timeZones[0] : ''; // Упрощенно, для одного пояса
    let selectedTalentTypeKey: string = data.currentFilters.talentType || 'ALL';
    let contractToHireSelected: boolean = data.currentFilters.contractToHire || false;
    let offersConsultationsSelected: boolean = data.currentFilters.offersConsultations || false;
    let selectedCategoryKey: string = data.currentFilters.categoryId || '';

    const talentTypeOptions: SelectItem[] = [
        { key: 'ALL', label: 'Фрилансеры и Агентства'},
        { key: 'INDIVIDUAL', label: 'Только Фрилансеры'},
        { key: 'AGENCY', label: 'Только Агентства'}
    ];
    
    // Для слайдера (пока инпуты)
    function handleRateInput() {
        // Можно добавить debounce или применять по кнопке
        // Здесь не вызываем applyAllFilters сразу, чтобы пользователь мог ввести оба значения
    }

    const debouncedApplyFilters = debounce(applyAllFilters, 700);

    function applyAllFilters() {
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('pageSize', data.pageSize.toString());

        if (searchTermInput.trim()) params.set('q', searchTermInput.trim());
        
        selectedTalentBadges.forEach(badgeKey => params.append('badge', badgeKey));
        
        const minR = parseFloat(minRateInput);
        const maxR = parseFloat(maxRateInput);
        if (!isNaN(minR) && minR >= 0) params.set('min_rate', minR.toString());
        if (!isNaN(maxR) && maxR > 0 && (isNaN(minR) || maxR >= minR) ) params.set('max_rate', maxR.toString());

        if (selectedLocationKey) params.set('location', selectedLocationKey);
        if (selectedTimeZoneKey) params.append('tz', selectedTimeZoneKey); // Для одного значения, для нескольких - getAll
        
        if (selectedTalentTypeKey && selectedTalentTypeKey !== 'ALL') params.set('talent_type', selectedTalentTypeKey);
        if (contractToHireSelected) params.set('contract_hire', 'true');
        if (offersConsultationsSelected) params.set('consultations', 'true');
        if (selectedCategoryKey) params.set('category_id', selectedCategoryKey);
        if (data.currentFilters.yourHires) params.set('your_hires', 'true'); // Передаем your_hires если он true в data
        
        (data.currentFilters.skills || []).forEach(skillKey => params.append('skill', skillKey)); // Передаем skills если они есть
        
        goto(`/hire-talents?${params.toString()}`, { invalidateAll: true, noScroll: true, keepFocus: true });
    }

    function clearAllFilters() {
        const params = new URLSearchParams();
        params.set('pageSize', data.pageSize.toString());
        goto(`/hire-talents?${params.toString()}`, { invalidateAll: true, noScroll: true });
        // Сброс локальных состояний
        searchTermInput = ''; selectedTalentBadges = []; minRateInput = ''; maxRateInput = '';
        selectedLocationKey = ''; selectedTimeZoneKey = ''; selectedTalentTypeKey = 'ALL';
        contractToHireSelected = false; offersConsultationsSelected = false; selectedCategoryKey = '';
    }

    function handlePageChange(event: CustomEvent<number>) { /* ... как раньше ... */ }
    function handlePageSizeChange(event: CustomEvent<number>) { /* ... как раньше ... */ }

    // Хелперы для отображения (могут быть вынесены)
    function getAvailabilityText(availability?: FreelancerProfileEntity['availability']): string {
        // @ts-ignore // Предполагаем, что FreelancerProfileEntityAvailability это enum из flsurf-client
        if (availability === "AvailableNow" /* FreelancerProfileEntityAvailability.AvailableNow */) return 'Доступен сейчас';
        // @ts-ignore
        if (availability === "AvailableSoon" /* FreelancerProfileEntityAvailability.AvailableSoon */) return 'Скоро будет доступен';
        return 'Нет информации';
    }
    function getAvailabilityClass(availability?: FreelancerProfileEntity['availability']): string {
        // @ts-ignore
        if (availability === "AvailableNow") return 'badge-success !bg-green-500/20 !text-green-400 !border-green-500/30';
        return 'badge-ghost !bg-gray-700 !text-gray-400 !border-gray-600';
    }

    $: freelancers = data.freelancerProfiles; // Для удобства в шаблоне

</script>

<div class="bg-gray-900 text-gray-200 min-h-screen antialiased">
    {#if data.error}
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div class="alert alert-error shadow-lg"><span>{data.error}</span></div>
        </div>
    {/if}

    {#if !data.error}
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav class="mb-8 overflow-x-auto whitespace-nowrap pb-3 border-b border-gray-700 flex items-center gap-x-1 sm:gap-x-2 text-sm">
            <a href="/hire-talents" class="text-gray-300 hover:text-white px-3 py-1.5 rounded-md font-medium hover:bg-gray-700">Все категории</a>
            {#each data.categoryOptions.slice(0, 5) as category (category.key)}
                <a href="/hire-talents?category_id={category.key}" class="text-gray-400 hover:text-white px-3 py-1.5 rounded-md font-medium hover:bg-gray-700">{category.label}</a>
            {/each}
            {#if data.categoryOptions.length > 5}
            <div class="dropdown dropdown-end ml-auto sm:ml-2">
                <button tabIndex={0} class="btn btn-xs btn-ghost text-gray-400 hover:text-white">
                    Еще <ArrowDownIcon className="w-4 h-4 ml-1"/>
                </button>
                <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-gray-700 rounded-box w-52 z-[5]">
                    {#each data.categoryOptions.slice(5) as category (category.key)}
                         <li><a href="/hire-talents?category_id={category.key}">{category.label}</a></li>
                    {/each}
                </ul>
            </div>
            {/if}
        </nav>

        <div class="flex flex-col lg:flex-row gap-8">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <aside class="w-full lg:w-72 xl:w-80 flex-shrink-0 bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6 self-start">
                <h3 class="text-xl font-bold text-white border-b border-gray-700 pb-3 mb-4">Фильтры</h3>

                <InputField bind:value={searchTermInput} placeholder="Поиск по ключевым словам..." id="freelancer-q-search" className="!bg-gray-700 !border-gray-600 text-white placeholder-gray-500">

                </InputField>

                <div>
                    <label class="block text-sm font-semibold text-gray-300 mb-2">Бейдж таланта</label>
                    <CheckboxList options={data.talentBadgeOptions} bind:selected={selectedTalentBadges} name="talent_badges_filter"/>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-300 mb-2">Почасовая ставка ($)</label>
                    <div class="flex items-center gap-2">
                        <InputField inputType="number" placeholder="От" bind:value={minRateInput} className="w-1/2 !bg-gray-700 !border-gray-600 !text-sm text-white" />
                        <span class="text-gray-500">-</span>
                        <InputField inputType="number" placeholder="До" bind:value={maxRateInput} className="w-1/2 !bg-gray-700 !border-gray-600 !text-sm text-white" />
                    </div>
                     </div>
                
                <ChoicesField label="Локация" options={data.locationOptions} bind:value={selectedLocationKey} className="!bg-gray-700 !border-gray-600 [&>select]:text-white" />
                <ChoicesField label="Часовой пояс" options={data.timeZoneOptions} bind:value={selectedTimeZoneKey} className="!bg-gray-700 !border-gray-600 [&>select]:text-white" />
                
                <div>
                    <label class="block text-sm font-semibold text-gray-300 mb-2">Тип исполнителя</label>
                    <!-- {#if typeof RadioGroupField !== 'undefined'}
                        <div class="space-y-1.5">
                        {#each talentTypeOptions as typeOpt (typeOpt.key)}
                            <label class="flex items-center gap-2 p-2 rounded-md hover:bg-gray-700/60 cursor-pointer has-[:checked]:bg-gray-700">
                                <input type="radio" name="fl_talent_type_radio" value={typeOpt.key} bind:group={selectedTalentTypeKey} class="radio radio-primary radio-sm checked:bg-green-500"/>
                                <span class="text-sm text-gray-200">{typeOpt.label}</span>
                            </label>
                        {/each}
                        </div>
                    {:else}
                        <select class="select select-bordered w-full !bg-gray-700 !border-gray-600 text-white" bind:value={selectedTalentTypeKey}>
                            {#each talentTypeOptions as opt}<option value={opt.key}>{opt.label}</option>{/each}
                        </select>
                    {/if} -->
                </div>
                
                <ChoicesField label="Категория" options={data.categoryOptions} bind:value={selectedCategoryKey} className="!bg-gray-700 !border-gray-600 [&>select]:text-white" />
                
                <!-- <InputField 
                    label="Навыки (через запятую)" 
                    placeholder="e.g. Python, Svelte, API" id="fl-skills" 
                    className="!bg-gray-700 !border-gray-600 text-white placeholder-gray-500"
                    value={selectedSkills.join(', ')}
                    on:change={(e) => selectedSkills = e.currentTarget.value.split(',').map(s=>s.trim()).filter(s=>s)}
                /> -->

                <!-- <div class="space-y-1.5 pt-2">
                    <CheckboxField label="Открыт для Contract-to-Hire" bind:checked={contractToHireSelected} name="fl_contract_hire" />
                    <CheckboxField label="Предлагает консультации" bind:checked={offersConsultationsSelected} name="fl_consultations" />
                    <CheckboxField label="Только те, кого я нанимал" bind:checked={data.currentFilters.yourHires} name="fl_your_hires"/>
                </div> -->
                
                <div class="pt-6 space-y-3 border-t border-gray-700 mt-6">
                    <BaseButton onclick={applyAllFilters} className="primary w-full bg-green-600 hover:bg-green-700 border-green-600 !font-semibold">Применить фильтры</BaseButton>
                    <BaseButton onclick={clearAllFilters} className="ghost w-full text-gray-400 hover:text-white hover:bg-gray-700 !font-normal">Сбросить все</BaseButton>
                </div>
            </aside>

            <main class="flex-1 min-w-0">
                <div class="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                    <p class="text-sm text-gray-400">
                        {#if data.totalFreelancers > 0}
                            Показано <span class="font-semibold text-white">{freelancers.length}</span> из <span class="font-semibold text-white">{data.totalFreelancers}</span> фрилансеров
                        {:else if !data.error}
                            Фрилансеры не найдены по вашим критериям
                        {/if}
                    </p>
                    <ChoicesField 
                        options={[{key:'relevance', label:'По релевантности'}, {key:'rate_asc', label:'По ставке (возр.)'}]} 
                        className="!min-w-[180px] [&>select]:!bg-gray-700 [&>select]:!border-gray-600 [&>select]:text-white"
                    />
                </div>

                {#if !data.error && freelancers && freelancers.length > 0}
                    <div class="space-y-5">
                        {#each freelancers as freelancer (freelancer.id)}
                            <article class="bg-gray-800 p-5 rounded-xl shadow-xl flex flex-col md:flex-row gap-x-6 gap-y-4 hover:shadow-green-500/10 hover:border-gray-600 border border-transparent transition-all duration-300">
                                <div class="flex-shrink-0 md:w-24 flex md:flex-col items-center">
                                     <UserAvatar 
                                        imageUrl={freelancer.user?.avatar?.filePath} 
                                     />
                                    <div class="md:mt-3 flex flex-col items-center w-full pl-4 md:pl-0">
                                        <a href={`/hire-talents/invite/${freelancer.userId}`} class="primary btn-sm w-full bg-green-600 hover:bg-green-700 border-green-600 !font-semibold whitespace-nowrap mt-2 md:mt-0">
                                            Пригласить
                                        </a>
                                        <a href={`/freelancers/${freelancer.userId}`} class="link link-hover text-xs text-gray-400 mt-1.5 hover:text-green-400">
                                            Профиль
                                        </a>
                                    </div>
                                </div>

                                <div class="flex-1 min-w-0">
                                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-1">
                                        <div>
                                            <h3 class="text-lg sm:text-xl font-bold text-white hover:text-green-400 leading-tight">
                                                <a href={`/freelancers/${freelancer.userId}`}>{freelancer.user?.fullname || 'Имя не указано'}</a>
                                            </h3>
                                            <p class="text-green-400 font-medium text-sm mb-1.5 max-w-md truncate">
                                                {freelancer.user?.fullname || freelancer.experience?.substring(0,70) || "Специализация не указана"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mb-2.5">
                                        {#if freelancer.costPerHour}<span>• <strong class="text-gray-200">${freelancer.costPerHour.toFixed(0)}</strong>/час</span>{/if}
                                        <!-- {#if freelancer.user?.jobSuccessRate != null}<span>• <strong class="text-gray-200">{freelancer.user.jobSuccessRate}%</strong> Успех</span>{/if}
                                        {#if freelancer.user?.earnedAmountLabel}<span>• {freelancer.user.earnedAmountLabel}</span>{/if} -->
                                    </div>
                                    
                                    {#if freelancer.availability}
                                        <p class="badge badge-xs {getAvailabilityClass(freelancer.availability)} mb-2.5 !py-1 !px-1.5 !text-xs">
                                            {getAvailabilityText(freelancer.availability)}
                                        </p>
                                    {/if}

                                    <p class="text-sm text-gray-300 mb-3 line-clamp-2 md:line-clamp-3 leading-relaxed" title={freelancer.experience || "Нет подробного описания."}>
                                        {freelancer.experience || "Специалист пока не добавил подробное описание своего опыта."}
                                    </p>
                                    
                                    <div class="flex flex-wrap gap-1.5">
                                        {#if freelancer.skills && freelancer.skills.length > 0}
                                            {#each freelancer.skills.slice(0, 6) as skill (skill.id)}
                                                <span class="badge badge-sm !text-xs bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600">{skill.name}</span>
                                            {/each}
                                            {#if freelancer.skills.length > 6}
                                                <span class="badge badge-sm !text-xs bg-gray-700 border-gray-600 text-gray-300">+{freelancer.skills.length - 6}</span>
                                            {/if}
                                        {:else}
                                             <span class="text-xs text-gray-500">Навыки не указаны.</span>
                                        {/if}
                                    </div>

                                    <!-- {#if freelancer.offersConsultations}
                                        <p class="text-xs text-blue-400 mt-2.5 flex items-center">
                                            <IconCheckCircle class="w-3.5 h-3.5 mr-1"/> Предлагает консультации
                                        </p>
                                    {/if} -->
                                </div>
                            </article>
                        {/each}
                    </div>

                    <div class="mt-12 flex justify-center">
                        {#if data.totalPages > 1}
                            <PagePagination
                                currentPage={data.currentPage}
                                totalPages={data.totalPages}
                                pageSize={data.pageSize}
                                on:pageChange={handlePageChange}
                                on:pageSizeChange={handlePageSizeChange}
                            />
                        {/if}
                    </div>
                {:else if !data.error}
                    <div class="text-center py-16 text-gray-500">
                        <svg class="mx-auto h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" ><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                        <p class="text-xl">Фрилансеры не найдены.</p>
                        <p class="text-sm mt-2">Попробуйте изменить критерии поиска или <BaseButton type="button" variant="link" onclick={clearAllFilters} className="text-sm !p-0 !normal-case !text-green-400 hover:!text-green-300">сбросить фильтры</BaseButton>.</p>
                    </div>
                {/if}
            </main>
        </div>
    </div>
    {/if}
</div>