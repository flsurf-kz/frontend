import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api';
import {
    TicketEntity,
    GetTicketsDto,
    TicketEntityStatus,
    UserEntityType // Ваш DTO
} from 'flsurf-client';
import { showError } from '$lib/shared/ui/errors';
import { CurrentUser } from '$lib/entities/user/model/modal';
import { get } from 'svelte/store';

// Определяем интерфейс для данных, возвращаемых функцией load
export interface SupportTicketsPageData {
    tickets: TicketEntity[];
    currentPage: number;
    pageSize: number;
    totalTickets: number;
    totalPages: number;
    currentSubjectFilter?: string | null;
    currentStatusFilter?: TicketEntityStatus | string | null;
    currentUserIdFilter?: string | null; // Только для staff
    currentIsAssignedToMeFilter?: boolean | null; // Только для staff
    currentUserIsStaff: boolean; // Флаг, является ли пользователь staff
    error?: string;
}

const DEFAULT_PAGE_SIZE = 10; // Значение по умолчанию для pageSize

export const load: PageLoad<SupportTicketsPageData> = async ({ url, parent }) => {
    const parentData = await parent();
    // Предполагаем, что parentData.user содержит информацию о пользователе, включая его роль/статус staff
    // Например: const currentUserIsStaff = parentData.user?.role === 'Staff' || parentData.user?.isStaff || false;
    // Для примера, если parentData.user не определен, будем считать, что это не staff
    const currentUser = get(CurrentUser); // Замените на реальный способ получения пользователя
    const currentUserIsStaff = currentUser?.type === UserEntityType.Staff || currentUser?.role === 'Admin' || currentUser?.role === 'Moderator' || false; // Адаптируйте под вашу логику ролей
    const currentUserIdForNonStaff = currentUser?.id; // ID текущего пользователя для фильтрации "мои тикеты"

    const pageParam = url.searchParams.get('page') || '1';
    const pageSizeParam = url.searchParams.get('pageSize') || DEFAULT_PAGE_SIZE.toString();
    const subjectParam = url.searchParams.get('subject');
    const statusParam = url.searchParams.get('status') as TicketEntityStatus | null;
    const userIdParam = url.searchParams.get('userId');
    const isAssignedToMeParam = url.searchParams.get('isAssignedToMe');

    const currentPage = parseInt(pageParam, 10) || 1;
    const pageSize = parseInt(pageSizeParam, 10) || DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;

    const queryParams: GetTicketsDto = new GetTicketsDto({
        start: start,
        ends: pageSize, // Используем ends как limit/pageSize
        subject: subjectParam || undefined,
        // status: statusParam || undefined,
    });

    if (currentUserIsStaff) {
        if (userIdParam) {
            queryParams.userId = userIdParam;
        }
        if (isAssignedToMeParam !== null) {
            queryParams.isAssignedToMe = isAssignedToMeParam === 'true';
        }
    } else {
        // Если пользователь не staff, он видит только свои тикеты.
        // Бэкенд должен это обработать, если userId не передан, ИЛИ мы явно передаем его ID.
        // "не приминяе userId и assignedToMe" - если это означает не передавать эти фильтры от не-staff,
        // то бэкенд должен сам отфильтровать по current user.
        // Если это означает, что non-staff ВИДЯТ ТОЛЬКО СВОИ, то передаем их ID:
        queryParams.userId = currentUserIdForNonStaff; // Показываем только тикеты текущего пользователя
        queryParams.isAssignedToMe = undefined; // Этот фильтр не для них
    }


    try {
        // Предполагаем, что API возвращает { items: TicketEntity[], totalCount: number }
        // или адаптируйте под GlobalClient.getSupportTickets, если он возвращает другую структуру
        const response = await GlobalClient.getTickets(queryParams);

        // Предпочтительный вариант: API возвращает totalCount
        const tickets = response || response; // Адаптируйте, если структура ответа другая
        const totalTickets = response.length || 0; // Адаптируйте

        const totalPages = Math.ceil(totalTickets / pageSize);

        return {
            tickets: tickets || [],
            currentPage: currentPage,
            pageSize: pageSize,
            totalTickets: totalTickets,
            totalPages: totalPages,
            currentSubjectFilter: subjectParam,
            currentStatusFilter: statusParam,
            currentUserIdFilter: currentUserIsStaff ? userIdParam : null,
            currentIsAssignedToMeFilter: currentUserIsStaff && isAssignedToMeParam !== null ? (isAssignedToMeParam === 'true') : null,
            currentUserIsStaff: currentUserIsStaff,
        };

    } catch (error: any) {
        console.error("Ошибка загрузки тикетов поддержки:", error);
        showError(error.message || "Не удалось загрузить список тикетов.", true);
        return {
            tickets: [],
            currentPage: 1,
            pageSize: pageSize,
            totalTickets: 0,
            totalPages: 0,
            currentUserIsStaff: currentUserIsStaff, // Передаем даже при ошибке, чтобы UI мог это учесть
            error: error.message || "Не удалось загрузить список тикетов."
        };
    }
};