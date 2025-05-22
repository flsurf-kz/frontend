import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api';
import {
	GetFreelancerProfileListQuery,
    type FreelancerProfileEntity,
    type GetFreelancerProfileListQueryLocation,
    // Предполагаемые типы, которые могут понадобиться из flsurf-client или вашего проекта
    // UserEntity, SkillEntity, CategoryEntity, LocationEntity, TalentBadgeEntity
    // GetFreelancerProfileListQueryLocation // Определите этот тип, если он сложный
} from 'flsurf-client';
import { showError } from '$lib/shared/ui/errors';

// --- Вспомогательные типы и данные для фильтров (могут быть загружены с API) ---
export interface FilterOption { key: string; label: string; } // Общий тип для опций селектов/чекбоксов

// Пример данных для фильтров (в идеале, это тоже приходит с бэкенда)
const MOCK_TALENT_BADGES: FilterOption[] = [
    { key: 'top_rated_plus', label: 'Top Rated Plus' },
    { key: 'top_rated', label: 'Top Rated' },
    { key: 'rising_talent', label: 'Rising Talent' },
];
const MOCK_LOCATIONS: FilterOption[] = [ /* {key: 'usa', label: 'USA'}, ... */ ];
const MOCK_CATEGORIES: FilterOption[] = [ /* {key: 'webdev', label: 'Web Development'}, ... */ ];
const MOCK_TIMEZONES: FilterOption[] = [ /* {key: 'utc-5', label: 'UTC-5 (ET)'}, ... */ ];


export interface BrowseFreelancersPageData {
    freelancerProfiles: FreelancerProfileEntity[];
    totalFreelancers: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    
    // Опции для фильтров
    talentBadgeOptions: FilterOption[];
    locationOptions: FilterOption[]; // Должны быть объектами с key/label или вашим LocationDto
    categoryOptions: FilterOption[]; // Должны быть объектами с key/label или вашим CategoryDto
    timeZoneOptions: FilterOption[];

    currentFilters: {
        searchTerm?: string | null;
        talentBadges?: string[] | null; // Массив ID или ключей бейджей
        minHourlyRate?: number | null;
        maxHourlyRate?: number | null;
        location?: GetFreelancerProfileListQueryLocation | null; // ID или ключ локации
        timeZones?: string[] | null; // Массив ID или ключей часовых поясов
        talentType?: 'INDIVIDUAL' | 'AGENCY' | 'ALL' | null;
        contractToHire?: boolean | null;
        offersConsultations?: boolean | null;
        categoryId?: string | null; // ID или ключ категории
        yourHires?: boolean | null; // Из вашего DTO
        skills?: string[] | null;   // Из вашего DTO
    };
    error?: string;
}

const DEFAULT_PAGE_SIZE_HIRE = 10;

export const load: PageLoad<BrowseFreelancersPageData> = async ({ url, parent, fetch: eventFetch }) => {
    // const { userSession } = await parent(); // Для персонализации, если нужно

    const pageParam = url.searchParams.get('page') || '1';
    const pageSizeParam = url.searchParams.get('pageSize') || DEFAULT_PAGE_SIZE_HIRE.toString();
    
    const currentPage = parseInt(pageParam, 10) || 1;
    const pageSize = parseInt(pageSizeParam, 10) || DEFAULT_PAGE_SIZE_HIRE;
    const start = (currentPage - 1) * pageSize;

    // Собираем все возможные фильтры из URL, даже если DTO их не все поддерживает
    const currentFilters: BrowseFreelancersPageData['currentFilters'] = {
        searchTerm: url.searchParams.get('q'),
        talentBadges: url.searchParams.getAll('badge'),
        minHourlyRate: url.searchParams.get('min_rate') ? parseFloat(url.searchParams.get('min_rate')!) : null,
        maxHourlyRate: url.searchParams.get('max_rate') ? parseFloat(url.searchParams.get('max_rate')!) : null,
        location: url.searchParams.get('location') as GetFreelancerProfileListQueryLocation,
        timeZones: url.searchParams.getAll('tz'),
        talentType: url.searchParams.get('talent_type') as BrowseFreelancersPageData['currentFilters']['talentType'],
        contractToHire: url.searchParams.get('contract_hire') === 'true',
        offersConsultations: url.searchParams.get('consultations') === 'true',
        categoryId: url.searchParams.get('category_id'),
        yourHires: url.searchParams.get('your_hires') === 'true',
        skills: url.searchParams.getAll('skill'),
    };

    // Формируем DTO для API, используя только поддерживаемые поля
    const queryParams: GetFreelancerProfileListQuery = new GetFreelancerProfileListQuery({
        start: start,
        ends: pageSize,
        yourHires: currentFilters.yourHires ?? undefined,
        // location: currentFilters.location ? { name: currentFilters.location } : undefined, // Адаптируйте под ваш GetFreelancerProfileListQueryLocation
        // Для примера, если location в DTO - это строка (ID или имя):
        location: currentFilters.location || undefined,
        skills: currentFilters.skills?.length ? currentFilters.skills : undefined,
        costPerHour: (currentFilters.minHourlyRate !== null || currentFilters.maxHourlyRate !== null)
            ? [currentFilters.minHourlyRate ?? 0, currentFilters.maxHourlyRate ?? 999999]
            : undefined,
        reviewsCount: undefined, // Ваш DTO имеет reviewsCount, но на скриншоте его нет как фильтра. Добавьте, если нужно.
    });
    // Если у вас есть общий текстовый поиск, добавьте его в DTO, если бэкенд поддерживает
    if (currentFilters.searchTerm) {
        (queryParams as any).searchTerm = currentFilters.searchTerm; // Если поле не типизировано, но бэк может его принять
    }


    try {
        // Предполагаем, что API возвращает { items: FreelancerProfileEntity[], totalCount: number }
        // или что GlobalClient.getFreelancerProfileList возвращает такую структуру
        // const response = await GlobalClient.getFreelancerProfileList(queryParams);
        // Заглушка для примера, т.к. реальная структура ответа GlobalClient.getFreelancerProfileList не ясна до конца
         const MOCK_API_RESPONSE = { 
            items: [] as FreelancerProfileEntity[], 
            totalCount: 0 
        };
        const response = await GlobalClient.getFreelancerProfileList(queryParams) || MOCK_API_RESPONSE;

        const totalFreelancers = response.length 
        const totalPages = totalFreelancers > 0 ? Math.ceil(totalFreelancers / pageSize) : 0;

        // Загрузка или определение опций для фильтров
        // В реальном приложении эти данные могут приходить с API
        // const categoriesFromApi = await GlobalClient.getCategoriesForFilter();
        // const locationsFromApi = await GlobalClient.getLocationsForFilter();
        // const talentBadgesFromApi = await GlobalClient.getTalentBadgesForFilter();

        return {
            freelancerProfiles: response || [],
            totalFreelancers,
            currentPage,
            pageSize,
            totalPages,
            currentFilters, // Передаем все фильтры из URL для UI
            talentBadgeOptions: MOCK_TALENT_BADGES, // Замените на реальные данные
            locationOptions: MOCK_LOCATIONS,     // Замените на реальные данные
            categoryOptions: MOCK_CATEGORIES,   // Замените на реальные данные
            timeZoneOptions: MOCK_TIMEZONES,   // Замените на реальные данные
        };

    } catch (error: any) {
        console.error("Ошибка загрузки списка фрилансеров:", error);
        showError(error.message || "Не удалось загрузить список фрилансеров.", true);
        return {
            freelancerProfiles: [],
            totalFreelancers: 0,
            currentPage: 1,
            pageSize,
            totalPages: 0,
            currentFilters,
            talentBadgeOptions: MOCK_TALENT_BADGES,
            locationOptions: MOCK_LOCATIONS,
            categoryOptions: MOCK_CATEGORIES,
            timeZoneOptions: MOCK_TIMEZONES,
            error: error.message || "Не удалось загрузить список фрилансеров."
        };
    }
};