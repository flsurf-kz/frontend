import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api';
import {
    type JobEntity,
    GetJobsListQuery,
    type JobEntityStatus,
	type Statuses, // Ваш enum статусов из flsurf-client
    // JobEntityBudgetType, // Если будете фильтровать по типу бюджета через isHourly или похожее поле
} from 'flsurf-client';
import { showError } from '$lib/shared/ui/errors';
import { redirect } from '@sveltejs/kit';

export interface MyJobsPageData {
    jobPosts: JobEntity[];
    totalJobPosts: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    currentFilters: {
        search?: string | null;
        statuses?: Statuses[] | null;
        jobType?: 'fixed' | 'hourly' | null; // Для фильтра по типу (Fixed-price/Hourly)
    };
    // Предполагаем, что информация о пользователе (включая ID) доступна из parent()
    // currentUserIsClient: boolean; // Можно добавить, если нужна особая логика для UI
    error?: string;
}

const DEFAULT_PAGE_SIZE_MY_JOBS = 10;

export const load = async ({ url, parent }) => {
    const parentData = await parent();
    // @ts-ignore - Предполагаем, что parentData.user содержит данные сессии
    const currentUser = parentData.user;

    if (!currentUser?.id) { // Простая проверка авторизации
        throw redirect(307, '/login'); // Или ваша страница входа
    }
    // Можно добавить проверку, что пользователь является клиентом, если это необходимо
    // if (currentUser.type !== 'Client') {
    //     showError("Доступ запрещен.", true);
    //     return { /* ... данные с ошибкой ... */ };
    // }

    const pageParam = url.searchParams.get('page') || '1';
    const pageSizeParam = url.searchParams.get('pageSize') || DEFAULT_PAGE_SIZE_MY_JOBS.toString();
    
    const currentPage = parseInt(pageParam, 10) || 1;
    const pageSize = parseInt(pageSizeParam, 10) || DEFAULT_PAGE_SIZE_MY_JOBS;
    const start = (currentPage - 1) * pageSize;

    const currentFilters: MyJobsPageData['currentFilters'] = {
        search: url.searchParams.get('q'),
        statuses: url.searchParams.getAll('status') as Statuses[], // Приводим к массиву статусов
        jobType: url.searchParams.get('type') as ('fixed' | 'hourly' | null),
    };

    const queryParams: GetJobsListQuery = new GetJobsListQuery({
        start: start,
        ends: pageSize,
        search: currentFilters.search || undefined,
        clientId: currentUser.id, // <--- ВАЖНО: Фильтруем вакансии по ID текущего пользователя (клиента)
        statuses: currentFilters.statuses?.length ? currentFilters.statuses : undefined,
        // Маппинг 'fixed'/'hourly' на isHourly
        isHourly: currentFilters.jobType === 'hourly' ? true : (currentFilters.jobType === 'fixed' ? false : undefined),
        // sortType: GetJobsListQuerySortType.CreatedAt, // Пример сортировки по умолчанию
        // sortOption: GetJobsListQuerySortOption.Desc,
    });

    try {
        // ПРЕДПОЛОЖЕНИЕ: GlobalClient.getJobsList ДОЛЖЕН ВЕРНУТЬ ОБЪЕКТ С `items` и `totalCount`
        // Если он возвращает просто JobEntity[], вам нужно будет изменить это.
        const response = await GlobalClient.getJobsList(queryParams);
        
        const totalJobPosts = response.length
        
        // Если API не вернул totalCount, а только массив, то для корректной работы PagePagination
        // totalJobPosts должен быть реальным общим количеством.
        // Если getJobsList возвращает только массив текущей страницы:
        // const jobPosts = response;
        // const totalJobPosts = 0; // НЕОБХОДИМО ПОЛУЧИТЬ РЕАЛЬНОЕ ЗНАЧЕНИЕ С БЭКЕНДА ДЛЯ ПАГИНАЦИИ

        const totalPages = totalJobPosts > 0 ? Math.ceil(totalJobPosts / pageSize) : 0;

        return {
            jobPosts: response || [],
            totalJobPosts,
            currentPage,
            pageSize,
            totalPages,
            currentFilters,
        };

    } catch (error: any) {
        console.error("Ошибка загрузки списка вакансий 'My Jobs':", error);
        showError(error.message || "Не удалось загрузить ваши вакансии.", true);
        return {
            jobPosts: [],
            totalJobPosts: 0,
            currentPage: 1,
            pageSize,
            totalPages: 0,
            currentFilters,
            error: error.message || "Не удалось загрузить ваши вакансии."
        };
    }
};