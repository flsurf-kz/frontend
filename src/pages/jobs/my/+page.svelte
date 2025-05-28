<script lang="ts">
    import type { PageData } from './$types';
    import { JobEntityStatus, type JobEntity, type Money, type UserEntity, type FileEntity, ContractEntity } from 'flsurf-client';
    // Предполагаем, что FreelancerJobInvolvementStatus импортируется, если используется для фильтров/отображения
    // import { FreelancerJobInvolvementStatus } from 'flsurf-client'; 
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
    import PagePagination from '$lib/shared/ui/navigation/PagePagination.svelte';
    import { InputField, SelectField } from '$lib/shared/ui/inputs'; 
    // import CheckboxList from '$lib/shared/ui/lists/CheckboxList.svelte'; // Если нужен фильтр по статусам вовлеченности
    // import type { SelectItem } from '$lib/shared/types';
    import { goto, invalidateAll } from '$app/navigation';
    import { page } from '$app/stores';
    import { SearchIcon, FilterIcon, XIcon, BriefcaseIcon, MessageSquareIcon, EyeIcon, ExternalLinkIcon, Edit3Icon } from 'lucide-svelte';
    import { slide } from 'svelte/transition';
    import UserAvatar from '$lib/shared/ui/icons/UserAvatar.svelte';
    import { showError } from '$lib/shared/ui/errors';
    import { onMount } from 'svelte';
	import { getContractStatusDisplay } from '$lib/shared/api/formatter';

    export let data: PageData;
    
    let showFiltersPanel = false;
    let searchTermInput: string = '';
    // let involvementStatusesFilter: FreelancerJobInvolvementStatus[] = [];

    $: {
        searchTermInput = data.currentFilters.searchTerm || '';
        // involvementStatusesFilter = (data.currentFilters.involvementStatuses as FreelancerJobInvolvementStatus[] | null) || [];
    }

    onMount(() => {
        if (data.error) {
            showError(data.error, true);
        }
    });
    
    // const involvementStatusOptions: SelectItem[] = Object.values(FreelancerJobInvolvementStatus || {}).map(s => ({
    //     key: s, label: getFreelancerInvolvementDisplay(s).text // Используем текст из хелпера
    // }));

    // Реализация функций фильтрации
    function countActiveFilters(): number {
        let count = 0;
        if (searchTermInput.trim()) count++;
        // if (involvementStatusesFilter.length > 0) count++;
        return count;
    }

    function applyFiltersAndNavigate() {
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('pageSize', data.pageSize.toString());
        if (searchTermInput.trim()) {
            params.set('q', searchTermInput.trim());
        }
        // involvementStatusesFilter.forEach(stat => {
        //     if (stat) params.append('involvement_status', stat);
        // });
        const currentPath = $page.url.pathname;
        goto(`${currentPath}?${params.toString()}`, { invalidateAll: true, noScroll: true, keepFocus: true });
        showFiltersPanel = false;
    }

    function clearAllFilters() {
        const params = new URLSearchParams();
        params.set('pageSize', data.pageSize.toString());
        const currentPath = $page.url.pathname;
        goto(`${currentPath}?${params.toString()}`, { invalidateAll: true, noScroll: true });
        // Локальные состояния сбросятся через $: блок
        showFiltersPanel = false;
    }
     function removeFilterTag(type: 'search') { // Пока только search
        if (type === 'search') {
            searchTermInput = '';
        }
        applyFiltersAndNavigate();
    }

</script>

<div class="container mx-auto px-4 py-10">
    <header class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 class="text-3xl font-bold text-base-content">Мои Работы и Предложения</h1>
        <a href="/jobs/browse" class="btn btn-primary btn-outline items-center">
            <SearchIcon class="w-4 h-4 mr-1.5"/> Найти новые заказы
        </a>
    </header>

    {#if data.error && (!data.jobs || data.jobs.length === 0)}
        <div class="alert alert-error shadow-lg mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{data.error}</span>
        </div>
    {/if}

    <div class="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div class="relative flex-grow w-full sm:w-auto">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon class="h-5 w-5 text-base-content/50" />
            </span>
            <input 
                type="search" 
                bind:value={searchTermInput}
                on:input={() => setTimeout(applyFiltersAndNavigate, 600)}
                placeholder="Поиск по названию вакансии, клиенту..." 
                class="input input-bordered w-full pl-10 bg-base-200 text-base-content placeholder-base-content/50 focus:border-primary" />
        </div>
        </div>

    {#if searchTermInput}
    <div class="mb-6 flex flex-wrap items-center gap-2 py-2">
        <span class="text-sm text-base-content/70 mr-2">Активный фильтр:</span>
        <span class="badge badge-lg bg-base-300 text-base-content gap-1.5 items-center">
            Поиск: "{searchTermInput}" <button class="opacity-60 hover:opacity-100 text-base-content/70" on:click={() => removeFilterTag('search')}><XIcon class="w-3 h-3"/></button>
        </span>
        <BaseButton onclick={clearAllFilters} className="link text-primary hover:text-primary-focus text-sm normal-case !pl-2 !min-h-0 !h-auto !py-0.5">
            Очистить
        </BaseButton>
    </div>
    {/if}


    <div class="space-y-6">
        {#if data.jobs && data.jobs.length > 0}
            {#each data.jobs as job (job.id)}
                {@const involvementInfo = getContractStatusDisplay((job as any).myInvolvementStatus, job.status)}
                {@const client = job.employer}
                <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow rounded-xl border border-transparent hover:border-primary/30">
                    <div class="card-body p-5 md:p-6">
                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex-shrink-0 md:w-1/5 flex items-center md:flex-col md:items-start text-center md:text-left mb-3 md:mb-0">
                                {#if client}
                                    {#if client.avatar}
                                        <UserAvatar avatarFile={client.avatar} className="w-12 h-12 md:w-16 md:h-16 rounded-full mb-0 md:mb-2 mr-3 md:mr-0"/>
                                    {:else}
                                    <div class="avatar placeholder mb-0 md:mb-2 mr-3 md:mr-0">
                                        <div class="bg-neutral-focus text-neutral-content rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                                            <span class="text-lg md:text-xl">{getInitials(client.fullname || client.name)}</span>
                                        </div>
                                    </div>
                                    {/if}
                                    <div class="flex-grow">
                                        <p class="font-semibold text-base-content text-md leading-tight">{client.fullname || 'Клиент'}</p>
                                        {#if client.location}
                                        <p class="text-xs text-base-content/70">{client.location.toString()}</p>
                                        {/if}
                                    </div>
                                {:else}
                                    <div class="avatar placeholder mb-2"><div class="bg-neutral-focus text-neutral-content rounded-full w-16 h-16"><span>??</span></div></div>
                                    <p class="font-semibold text-base-content">Клиент не указан</p>
                                {/if}
                            </div>

                            <div class="flex-grow">
                                <div class="flex justify-between items-start mb-1">
                                    <h3 class="text-lg md:text-xl font-semibold text-base-content hover:text-primary transition-colors line-clamp-2">
                                        <a href={`/jobs/${job.id}`}>{job.title || 'Без названия'}</a>
                                    </h3>
                                    <span class="badge {involvementInfo.className} badge-md !font-semibold whitespace-nowrap">{involvementInfo.text}</span>
                                </div>
                                <p class="text-xs text-base-content/60 mb-2">
                                    Общий статус вакансии: 
                                    <span class="font-medium">{job.status?.toString() || 'N/A'}</span>
                                    {#if job.payout} | Бюджет: {formatMoney(job.payout)} {job.budgetType?.toString() === 'Hourly' ? '/час' : ''} {/if}
                                </p>
                                <p class="text-sm text-base-content/80 line-clamp-2 leading-relaxed mb-3">
                                    {job.description || "Описание вакансии отсутствует."}
                                </p>
                                <div class="flex flex-wrap gap-2 items-center">
                                    <a href={`/jobs/${job.id}`} class="btn btn-sm btn-outline btn-primary">
                                        <EyeIcon class="w-4 h-4 mr-1"/> Детали вакансии
                                    </a>
                                    {#if (job as any).myContractId}
                                        <a href={`/freelancer/contracts/dashboard/${(job as any).myContractId}`} class="btn btn-sm btn-outline btn-secondary">
                                            К моему контракту
                                        </a>
                                    {:else if (job as any).myProposalId && involvementInfo.text === 'Предложение подано'}
                                         <a href={`/jobs/${job.id}/proposals/my`} class="btn btn-sm btn-outline"> {/* Пример URL */}
                                            Мое предложение
                                        </a>
                                    {/if}
                                    
                                    {#if (job as any).chatId}
                                        <a href={`/messages?chatId=${(job as any).chatId}`} class="btn btn-sm btn-outline">
                                           <MessageSquareIcon class="w-4 h-4 mr-1"/> Обсудить
                                        </a>
                                    {/if}
                                    
                                    {#if involvementInfo.text === 'Контракт активен'}
                                        <BaseButton className="accent btn-sm" onclick={() => alert(`TODO: Сдать работу по вакансии ${job.id}`)}>Сдать работу</BaseButton>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}

            <div class="mt-10 flex justify-center">
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
            <div class="text-center py-16">
                <BriefcaseIcon class="mx-auto h-20 w-20 text-base-content/30 mb-4"/>
                <p class="text-xl text-base-content/70">У вас пока нет активных работ или предложений.</p>
                <p class="text-sm text-base-content/60 mt-2">Самое время найти интересный проект!</p>
                <a href="/jobs/browse" class="btn btn-primary mt-6">Искать заказы</a>
            </div>
        {/if}
    </div>
</div>

<style>
/* Стили можно добавить здесь */
</style>