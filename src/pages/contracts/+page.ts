import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api'; // Ваш API клиент
import {
    GetContractsListQuery,
    GetContractsListQueryStatus,
    type ContractEntity,
    type ContractEntityStatus, // Ваш enum статусов контракта из flsurf-client
    type UserEntity // Для типа currentUser
} from 'flsurf-client';
// showError будет использоваться в +page.svelte, но можно и здесь для логирования
// import { showError } from '$lib/shared/ui/errors'; 
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { CurrentUser } from '$lib/entities/user/model/modal';

// Интерфейс для данных, которые +page.ts передаст в +page.svelte
export interface MyClientContractsPageData {
    contracts: ContractEntity[];
    totalContracts: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    currentFilters: {
        status?: GetContractsListQueryStatus | null; // Массив выбранных статусов
        searchTerm?: string | null;
    };
    currentUser?: UserEntity; // Передаем информацию о текущем пользователе
    error?: string;
}

const DEFAULT_PAGE_SIZE_CONTRACTS = 10; // Количество контрактов на странице по умолчанию

export const load: PageLoad<MyClientContractsPageData> = async ({ url }) => {
    // @ts-ignore - если userSession не типизирован строго в parent
    const currentUser = get(CurrentUser)

    // Проверка аутентификации и роли пользователя
    if (!currentUser?.id) {
        console.warn("Пользователь не аутентифицирован. Редирект на /login.");
        throw redirect(307, '/auth/login'); // Убедитесь, что '/login' ваш правильный путь
    }
    // Извлечение параметров из URL для пагинации и фильтрации
    const pageParam = url.searchParams.get('page') || '1';
    const pageSizeParam = url.searchParams.get('pageSize') || DEFAULT_PAGE_SIZE_CONTRACTS.toString();
    const statusParams = url.searchParams.get('status') as GetContractsListQueryStatus; // Получаем все значения status
    const searchTermParam = url.searchParams.get('q');

    const currentPage = parseInt(pageParam, 10) || 1;
    const pageSize = parseInt(pageSizeParam, 10) || DEFAULT_PAGE_SIZE_CONTRACTS;
    const start = (currentPage - 1) * pageSize;

    // Сохраняем текущие значения фильтров для передачи в Svelte компонент
    const currentFilters: MyClientContractsPageData['currentFilters'] = {
        status: statusParams ? statusParams : null,
        searchTerm: searchTermParam || null,
    };

    // Формируем DTO для запроса к API
    const queryParams: GetContractsListQuery = new GetContractsListQuery({
        start: 0,
        ends: 100, // Убедитесь, что ваше DTO использует 'limit' или 'ends'
        userId: currentUser.id, // ВАЖНО: Фильтруем контракты по ID текущего клиента
        status: currentFilters.status ?? GetContractsListQueryStatus.Active, 
        // searchTerm: currentFilters.searchTerm || undefined,
        // statuses: currentFilters.statuses?.length ? currentFilters.statuses : undefined,
        // sortBy: 'updatedAt', // Сортировка по умолчанию (например, по дате последнего обновления)
        // sortDirection: 'DESC'
    });

    try {
        // Запрос к API для получения списка контрактов
        // ПРЕДПОЛОЖЕНИЕ: GlobalClient.getContracts возвращает объект { items: ContractEntity[], totalCount: number }
        // Если API возвращает просто массив, логику для totalCount и totalPages нужно будет изменить.
        const response = await GlobalClient.getContractsList(queryParams); 
        
        const contracts = response; 
        const totalContracts = response?.length?? contracts.length; // Если totalCount не пришел, используем длину текущего списка (пагинация будет неточной)
        
        const totalPages = totalContracts > 0 ? Math.ceil(totalContracts / pageSize) : 0;

        return {
            contracts: contracts,
            totalContracts,
            currentPage,
            pageSize,
            totalPages,
            currentFilters,
            currentUser, // Передаем пользователя, может пригодиться в UI
        };

    } catch (error: any) {
        console.error("Ошибка загрузки контрактов клиента:", error);
        // showError(error.message || "Не удалось загрузить список ваших контрактов.", true); // showError для UI - в +page.svelte
        return { // Возвращаем структуру с ошибкой
            contracts: [],
            totalContracts: 0,
            currentPage: 1,
            pageSize,
            totalPages: 0,
            currentFilters,
            currentUser,
            error: error.message || "Не удалось загрузить список ваших контрактов."
        };
    }
};