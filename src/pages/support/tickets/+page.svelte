<script lang="ts">
    import type { PageData } from './$types';
    import { TicketEntityStatus } from 'flsurf-client'; // Убедитесь, что TicketEntityStatus это ваш enum
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte'; // Ваш BaseButton
    import type { SelectItem } from '$lib/shared/types'; // Ваш тип SelectItem
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
	import { ChoicesField, InputField } from '$lib/shared/ui/inputs';
	import { PagePagination } from '$lib/shared/ui/navigation';

    export let data: PageData;

    let subjectFilterInput: string = data.currentSubjectFilter || '';
    // selectedStatus должен быть строкой, так как SelectField работает со строками для value
    let selectedStatus: string = data.currentStatusFilter?.toString() || ''; 
    let userIdFilterInput: string = data.currentUserIdFilter || '';
    // isAssignedToMeFilterInput будет строкой "true", "false", или "" для "все"
    let isAssignedToMeFilterInput: string = data.currentIsAssignedToMeFilter === null ? '' : String(data.currentIsAssignedToMeFilter);


    const statusOptions: SelectItem[] = [
        { key: '', label: 'Все статусы' },
        // Преобразуем enum TicketEntityStatus в SelectItem[]
        // Предполагаем, что TicketEntityStatus - это enum со строковыми значениями
        ...Object.values(TicketEntityStatus).map(status => ({ 
            key: status, 
            // Для label можно добавить маппинг на русские названия, если нужно
            label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() 
        }))
    ];
    
    const assignedToMeOptions: SelectItem[] = [
        { key: '', label: 'Все тикеты'}, // Пустая строка для "не выбрано"
        { key: 'true', label: 'Назначены мне'},
        { key: 'false', label: 'Не назначены мне'}
    ];

    function applyAllFilters() {
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('pageSize', data.pageSize.toString());

        if (subjectFilterInput.trim()) {
            params.set('subject', subjectFilterInput.trim());
        }
        if (selectedStatus) { // selectedStatus теперь строка
            params.set('status', selectedStatus);
        }
        if (data.currentUserIsStaff) {
            if (userIdFilterInput.trim()) {
                params.set('userId', userIdFilterInput.trim());
            }
            if (isAssignedToMeFilterInput) { // Отправляем только если "true" или "false"
                 params.set('isAssignedToMe', isAssignedToMeFilterInput);
            }
        }
        goto(`?${params.toString()}`, { invalidateAll: true, noScroll: true });
    }

    function clearAllFilters() {
        subjectFilterInput = '';
        selectedStatus = ''; // Сброс для SelectField
        userIdFilterInput = '';
        isAssignedToMeFilterInput = ''; // Сброс для SelectField (значение "Все")
        
        const params = new URLSearchParams();
        params.set('pageSize', data.pageSize.toString());
        goto(`?${params.toString()}`, { invalidateAll: true, noScroll: true });
    }
    
    function handlePageChange(event: CustomEvent<number>) {
        const newPage = event.detail;
        const params = new URLSearchParams($page.url.searchParams);
        params.set('page', newPage.toString());
        goto(`?${params.toString()}`, { invalidateAll: true, noScroll: true });
    }

    function handlePageSizeChange(event: CustomEvent<number>) {
        const newPageSize = event.detail;
        const params = new URLSearchParams($page.url.searchParams);
        params.set('pageSize', newPageSize.toString());
        params.set('page', '1'); 
        goto(`?${params.toString()}`, { invalidateAll: true, noScroll: true });
    }

    function formatDate(dateInput?: Date | string): string {
        if (!dateInput) return '–'; // Используем тире для пустых дат
        try {
            const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
            if (isNaN(date.getTime())) return String(dateInput);
            return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return String(dateInput); 
        }
    }

    // Функция для получения класса CSS в зависимости от статуса тикета
    function getStatusBadgeClass(status?: TicketEntityStatus | string): string {
        switch (status) {
            case TicketEntityStatus.Open: return 'badge-info';
            case TicketEntityStatus.InProgress: return 'badge-warning';
            case TicketEntityStatus.Closed: return 'badge-outline'; // или badge-ghost / badge-neutral
            default: return 'badge-ghost';
        }
    }
</script>

<div class="container mx-auto px-4 py-10">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 class="text-3xl font-bold text-gray-800">Тикеты Поддержки</h1>
        {#if data.currentUserIsStaff }
            <a href="/support/tickets/new" class="primary btn-sm sm:btn-md">Создать тикет</a>
        {/if}
    </div>

    {#if data.error}
        <div class="alert alert-error shadow-lg mb-6">
            <span>{data.error}</span>
        </div>
    {/if}

    <div class="mb-8 p-4 md:p-6 bg-base-200 rounded-xl shadow-lg space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-end">
            <InputField label="Поиск по теме" bind:value={subjectFilterInput} placeholder="Введите тему..." id="subject-filter"/>
            
            <ChoicesField
                label="Статус"
                bind:value={selectedStatus}
                options={statusOptions}
            />

            {#if data.currentUserIsStaff}
                <InputField label="ID Пользователя (для Staff)" bind:value={userIdFilterInput} placeholder="Введите User ID" id="userid-filter"/>
                
                <ChoicesField
                    label="Назначение (для Staff)"
                    bind:value={isAssignedToMeFilterInput}
                    options={assignedToMeOptions}
                />
            {/if}
        </div>
        <div class="flex flex-col sm:flex-row gap-2 pt-3">
            <BaseButton onclick={applyAllFilters} className="primary w-full sm:w-auto">Применить фильтры</BaseButton>
            <BaseButton onclick={clearAllFilters} className="ghost w-full sm:w-auto">Сбросить все</BaseButton>
        </div>
    </div>

    {#if data.tickets && data.tickets.length > 0}
        <div class="overflow-x-auto bg-white rounded-lg shadow">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th class="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тема</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                        <th class="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
                        <th class="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Создан</th>
                        <th class="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Обновлен</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each data.tickets as ticket (ticket.id)}
                        <tr class="hover:bg-gray-50">
                            <td class="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm font-mono">
                                <a href={`/support/tickets/${ticket.id}`} class="link link-hover text-primary">
                                    {ticket.id.substring(0, 8)}...
                                </a>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate" title={ticket.subject}>
                                <a href={`/support/tickets/${ticket.id}`} class="hover:text-primary">
                                    {ticket.subject}
                                </a>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm">
                                <span class="badge {getStatusBadgeClass(ticket.status)} badge-sm">
                                    {ticket.status?.toString() || 'N/A'}
                                </span>
                            </td>
                            <td class="hidden sm:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500 truncate" title={ticket.createdBy?.fullname}>
                                {ticket.createdBy?.fullname || ticket.createdById?.substring(0,8) || 'Система'}
                            </td>
                            <td class="hidden lg:table-cell px-4 py-3 whitespace-nowrap text-xs text-gray-500">{formatDate(ticket.createdAt)}</td>
                            <td class="hidden lg:table-cell px-4 py-3 whitespace-nowrap text-xs text-gray-500">{formatDate(ticket.lastModifiedAt)}</td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                <a href={`/support/tickets/${ticket.id}`} class="btn btn-xs btn-outline btn-primary">
                                    Детали
                                </a>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="mt-8 flex justify-center">
            {#if data.totalPages > 1}
                <PagePagination
                    currentPage={data.currentPage}
                    totalPages={data.totalPages}
                    pageSize={data.pageSize}
                    pageSizeOptions={[10, 20, 50, 100]}
                    on:pageChange={handlePageChange}
                    on:pageSizeChange={handlePageSizeChange}
                />
            {/if}
        </div>

    {:else if !data.error}
        <div class="text-center py-16">
            <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-xl text-gray-500 mt-4">Тикеты не найдены.</p>
            {#if subjectFilterInput || selectedStatus || (data.currentUserIsStaff && (userIdFilterInput || isAssignedToMeFilterInput !== ''))}
                <p class="text-sm text-gray-400 mt-2">
                    Попробуйте изменить или 
                    <BaseButton type="button" variant="link" onclick={clearAllFilters} className="text-sm !p-0 !normal-case !inline !min-h-0">сбросить фильтры</BaseButton>.
                </p>
            {/if}
        </div>
    {/if}
</div>