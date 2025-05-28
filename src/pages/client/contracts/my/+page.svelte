<script lang="ts">
    import type { PageData } from './$types';
    import { ContractEntityStatus, type ContractEntity, type Money, type UserEntity, type FileEntity } from 'flsurf-client';
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
    import type { SelectItem } from '$lib/shared/types';
    import { goto, invalidateAll } from '$app/navigation';
    import { page } from '$app/stores'; // $page для доступа к URL и данным из load
    import { SearchIcon, FilterIcon, XIcon, FileTextIcon, UserIcon, CalendarIcon, ExternalLinkIcon, BriefcaseIcon } from 'lucide-svelte';
    import { slide } from 'svelte/transition';
    import UserAvatar from '$lib/shared/ui/icons/UserAvatar.svelte'; // Ваш компонент UserAvatar
    import { showError } from '$lib/shared/ui/errors';
    import { onMount } from 'svelte';
	import { CheckboxList } from '$lib/shared/ui/lists';
	import { PagePagination } from '$lib/shared/ui/navigation';

    export let data: PageData;

    let showFiltersPanel = false;
    // Состояния фильтров, инициализируются из data.currentFilters, которые приходят из URL через +page.ts
    let searchTermInput: string = data.currentFilters.searchTerm || '';
    let statusesFilter: string[] = (data.currentFilters.statuses as string[] | null) || [];


    // Обновление локальных состояний фильтров при изменении data (например, при навигации назад/вперед)
    $: if (data.currentFilters) {
        searchTermInput = data.currentFilters.searchTerm || '';
        statusesFilter = (data.currentFilters.statuses as string[] | null) || [];
    }

    onMount(() => {
        if (data.error) {
            showError(data.error, true); // Показываем ошибку загрузки данных, если она есть
        }
    });

    // Опции для фильтра статусов
    const statusOptions: SelectItem[] = Object.values(ContractEntityStatus).map(s_val => {
        let label = s_val.toString(); // Базовое значение
        // Простой маппинг для русских названий (можно улучшить или вынести)
        switch (s_val) {
            case ContractEntityStatus.PendingApproval: label = 'В ожидании'; break;
            case ContractEntityStatus.Active: label = 'Активен'; break;
            case ContractEntityStatus.Completed: label = 'Завершен'; break;
            case ContractEntityStatus.Disputed: label = 'Спор'; break;
            case ContractEntityStatus.Cancelled: label = 'Отменен'; break;
            case ContractEntityStatus.Paused: label = 'На паузе'; break;
        }
        return { key: s_val, label: label };
    });
    
    function countActiveFilters(): number {
        let count = 0;
        if (searchTermInput.trim()) count++;
        if (statusesFilter.length > 0) count++;
        return count;
    }
    $: activeFilterCount = countActiveFilters();

    function applyFiltersAndNavigate() {
        const params = new URLSearchParams();
        params.set('page', '1'); // Сбрасываем на первую страницу при применении фильтров
        params.set('pageSize', data.pageSize.toString());

        if (searchTermInput.trim()) {
            params.set('q', searchTermInput.trim());
        }
        statusesFilter.forEach(stat => {
            if (stat) params.append('status', stat);
        });
        
        const currentPath = $page.url.pathname; // Берем текущий путь
        goto(`${currentPath}?${params.toString()}`, { invalidateAll: true, noScroll: true, keepFocus: true });
        showFiltersPanel = false;
    }

    function clearAllFilters() {
        const params = new URLSearchParams();
        params.set('pageSize', data.pageSize.toString());
        const currentPath = $page.url.pathname;
        goto(`${currentPath}?${params.toString()}`, { invalidateAll: true, noScroll: true });
        // Локальные состояния сбросятся через $: блок при обновлении data
        showFiltersPanel = false;
    }

     function removeFilterTag(type: 'status' | 'search', valueToRemove?: string) {
        if (type === 'status' && valueToRemove) {
            statusesFilter = statusesFilter.filter(s => s !== valueToRemove);
        } else if (type === 'search') {
            searchTermInput = '';
        }
        applyFiltersAndNavigate();
    }
    
    function handlePageChange(event: CustomEvent<number>) {
        const newPage = event.detail;
        const params = new URLSearchParams($page.url.searchParams);
        params.set('page', newPage.toString());
        const currentPath = $page.url.pathname;
        goto(`${currentPath}?${params.toString()}`, { invalidateAll: true, noScroll: true, keepFocus: true });
    }

    function handlePageSizeChange(event: CustomEvent<number>) {
        const newPageSize = event.detail;
        const params = new URLSearchParams($page.url.searchParams);
        params.set('pageSize', newPageSize.toString());
        params.set('page', '1'); 
        const currentPath = $page.url.pathname;
        goto(`${currentPath}?${params.toString()}`, { invalidateAll: true, noScroll: true, keepFocus: true });
    }
    
    function formatDate(dateInput?: Date | string | null, includeTime = false): string {
        if (!dateInput) return '–';
        try {
            const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
            if (isNaN(date.getTime())) return String(dateInput);
            const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
            if (includeTime) { options.hour = '2-digit'; options.minute = '2-digit'; }
            return date.toLocaleDateString('ru-RU', options);
        } catch (e) { return String(dateInput); }
    }

    function formatMoney(money?: Money | null, defaultCurrency = 'KZT'): string {
        if (!money || money.amount == null) return 'Не указана';
        return `${money.amount.toLocaleString('ru-RU', {minimumFractionDigits: 0, maximumFractionDigits: 2} )} ${money.currency?.toString() || defaultCurrency}`;
    }

    function getContractStatusDisplay(status?: ContractEntityStatus): { text: string, className: string } {
        const s = status || "Unknown"; // Если статус не пришел, отображаем как Unknown
        let statusText = s.toString().replace(/([A-Z])/g, ' $1').trim(); // Базовое форматирование
        let className = 'badge-ghost'; // Цвет по умолчанию

        switch (s) {
            case ContractEntityStatus.Active: statusText = 'Активен'; className = 'badge-success'; break;
            case ContractEntityStatus.PendingApproval: statusText = 'В ожидании'; className = 'badge-warning'; break;
            case ContractEntityStatus.Completed: statusText = 'Завершен'; className = 'badge-primary'; break;
            case ContractEntityStatus.Cancelled: statusText = 'Отменен'; className = 'badge-error opacity-70'; break;
            case ContractEntityStatus.Disputed: statusText = 'Спор'; className = 'badge-error'; break;
            case ContractEntityStatus.Paused: statusText = 'На паузе'; className = 'badge-info opacity-80'; break;
            // Добавьте другие статусы из вашего ContractEntityStatus если они есть
        }
        return { text: statusText, className };
    }
    
    function getInitials(name?: string | null): string {
        if (!name) return '??';
        const parts = name.split(' ').filter(Boolean);
        if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        if (parts.length === 1 && parts[0].length > 1) return parts[0].substring(0, 2).toUpperCase();
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return '??';
    }

</script>

<div class="container mx-auto px-4 py-10">
    <header class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 class="text-3xl font-bold text-base-content">Мои Контракты</h1>
        <a href="/client/jobs/my" class="btn btn-outline btn-secondary items-center">
             <BriefcaseIcon class="w-4 h-4 mr-1.5"/> Мои Вакансии
        </a>
    </header>

    {#if data.error && (!data.contracts || data.contracts.length === 0)}
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
                placeholder="Поиск по названию, фрилансеру..." 
                class="input input-bordered w-full pl-10 bg-base-200 text-base-content placeholder-base-content/50 focus:border-primary" />
        </div>
        <BaseButton onclick={() => showFiltersPanel = !showFiltersPanel} className="ghost border-base-300 hover:bg-base-300/60 w-full sm:w-auto !font-normal text-base-content">
            <FilterIcon class="h-5 w-5 mr-1.5" />
            Фильтры {#if activeFilterCount > 0}<span class="badge badge-xs badge-primary text-primary-content ml-1.5">{activeFilterCount}</span>{/if}
        </BaseButton>
    </div>

    {#if showFiltersPanel}
    <div transition:slide class="mb-6 p-6 bg-base-200 border border-base-300 rounded-xl shadow-lg space-y-6">
        <h3 class="text-lg font-semibold text-base-content border-b border-base-300 pb-2 mb-4">Фильтры контрактов</h3>
        <div>
            <p class="text-sm font-medium text-base-content/80 mb-2">Статус контракта</p>
            <CheckboxList bind:selected={statusesFilter} options={statusOptions}/>
        </div>
        <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-base-300 mt-4">
            <BaseButton onclick={clearAllFilters} className="ghost hover:bg-base-300/60 w-full sm:w-auto !font-normal text-base-content">Сбросить</BaseButton>
            <BaseButton onclick={applyFiltersAndNavigate} className="primary w-full sm:w-auto !font-semibold">Применить</BaseButton>
        </div>
    </div>
    {/if}

    {#if statusesFilter.length > 0 || searchTermInput}
    <div class="mb-6 flex flex-wrap items-center gap-2 py-2">
        <span class="text-sm text-base-content/70 mr-2">Активные фильтры:</span>
        {#if searchTermInput}
            <span class="badge badge-lg bg-base-300 text-base-content gap-1.5 items-center">
                Поиск: "{searchTermInput}" <button class="opacity-60 hover:opacity-100 text-base-content/70" on:click={() => removeFilterTag('search')}><XIcon class="w-3 h-3"/></button>
            </span>
        {/if}
        {#each statusesFilter as sf (sf)}
            <span class="badge badge-lg bg-base-300 text-base-content gap-1.5 items-center">
                Статус: {statusOptions.find(o => o.key === sf)?.label || sf}
                <button class="opacity-60 hover:opacity-100 text-base-content/70" on:click={() => removeFilterTag('status', sf)}><XIcon class="w-3 h-3"/></button>
            </span>
        {/each}
        {#if activeFilterCount > 0}
        <BaseButton onclick={clearAllFilters} className="link text-primary hover:text-primary-focus text-sm normal-case !pl-2 !min-h-0 !h-auto !py-0.5">
            Очистить все
        </BaseButton>
        {/if}
    </div>
    {/if}

    <div class="space-y-6">
        {#if data.contracts && data.contracts.length > 0}
            {#each data.contracts as contract (contract.id)}
                {@const statusInfo = getContractStatusDisplay(contract.status)}
                <a href={`/contracts/dashboard/${contract.id}`} class="block card bg-base-100 shadow-lg hover:shadow-xl transition-shadow rounded-xl border border-transparent hover:border-primary/40">
                    <div class="card-body p-5 md:p-6">
                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex-shrink-0 md:w-1/4 flex items-center md:flex-col md:items-start text-center md:text-left mb-3 md:mb-0 md:border-r md:border-base-200 md:pr-4">
                                {#if contract.freelancer}
                                    {#if contract.freelancer.avatar}
                                        <UserAvatar avatarFile={contract.freelancer.avatar} className="w-12 h-12 md:w-16 md:h-16 rounded-full mb-0 md:mb-2 mr-3 md:mr-0" />
                                    {:else}
                                    <div class="avatar placeholder mb-0 md:mb-2 mr-3 md:mr-0">
                                        <div class="bg-neutral-focus text-neutral-content rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                                            <span class="text-lg md:text-xl">{getInitials(contract.freelancer.fullname || contract.freelancer.name)}</span>
                                        </div>
                                    </div>
                                    {/if}
                                    <div class="flex-grow">
                                        <p class="font-semibold text-base-content text-md leading-tight">{contract.freelancer.fullname || 'Фрилансер'}</p>
                                        <span class="text-xs text-base-content/60">Исполнитель</span>
                                    </div>
                                {:else}
                                    <div class="avatar placeholder mb-2"><div class="bg-neutral-focus text-neutral-content rounded-full w-16 h-16"><span>??</span></div></div>
                                    <p class="font-semibold text-base-content">Фрилансер не указан</p>
                                {/if}
                            </div>
                            <div class="flex-grow">
                                <div class="flex justify-between items-start mb-1">
                                    <h3 class="text-lg md:text-xl font-semibold text-base-content hover:text-primary transition-colors line-clamp-2">
                                        {contract.job?.title || `Контракт от ${formatDate(contract.createdAt)}`}
                                    </h3>
                                    <span class="badge {statusInfo.className} badge-md !font-semibold whitespace-nowrap">{statusInfo.text}</span>
                                </div>
                                <div class="text-sm text-base-content/80 space-y-0.5">
                                    <p><strong>Сумма:</strong> {formatMoney(contract.costPerHour)}</p>
                                    <p>
                                        <strong>Даты:</strong> 
                                        {formatDate(contract.startDate)} - {contract.endDate ? formatDate(contract.endDate) : (contract.status === ContractEntityStatus.Active ? 'Активен' : 'Бессрочно')}
                                    </p>
                                    {#if contract.id}
                                        <p class="text-xs text-base-content/60">ID: <span class="font-mono">{contract.id.substring(0,8)}...</span></p>
                                    {/if}
                                </div>
                                <div class="mt-4 text-right">
                                    <span class="btn btn-sm btn-primary btn-outline">
                                        К дашборду <ExternalLinkIcon class="w-3.5 h-3.5 ml-1.5"/>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
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
                <FileTextIcon class="mx-auto h-20 w-20 text-base-content/30 mb-4"/>
                <p class="text-xl text-base-content/70">У вас пока нет контрактов.</p>
                {#if activeFilterCount > 0}
                     <p class="text-sm text-base-content/60 mt-2">Попробуйте изменить или <BaseButton type="button" variant="link" onclick={clearAllFilters} className="text-sm !p-0 !normal-case text-primary hover:text-primary-focus">сбросить фильтры</BaseButton>.</p>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
/* Стили можно добавить здесь, если стандартных классов DaisyUI/Tailwind недостаточно */
</style>