// src/routes/your-finance-summary-path/+page.ts
import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api';
import { CurrentUser } from '$lib/entities/user/model/modal'; // Путь к вашему стору CurrentUser
import { get } from 'svelte/store';
import {
    GetFinanceSummaryQuery,
    type FinanceSummaryDto
} from 'flsurf-client';

export interface FinancePageData {
    summary: FinanceSummaryDto | null;
    months: { label: string; value: number }[];
    years: number[];
    selectedMonth: number;
    selectedYear: number;
    error?: string | null;
    // loading cостояние будет управляться через $navigating в Svelte компоненте
}

export const load: PageLoad = async ({ url, depends }) => {

    const currentUser = get(CurrentUser);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

    // Получаем месяц и год из URL searchParams или используем текущие по умолчанию
    let queryMonth = parseInt(url.searchParams.get('month') || '', 10) || currentMonth;
    let queryYear = parseInt(url.searchParams.get('year') || '', 10) || currentYear;

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
        { label: 'Январь', value: 1 }, { label: 'Февраль', value: 2 },
        { label: 'Март', value: 3 }, { label: 'Апрель', value: 4 },
        { label: 'Май', value: 5 }, { label: 'Июнь', value: 6 },
        { label: 'Июль', value: 7 }, { label: 'Август', value: 8 },
        { label: 'Сентябрь', value: 9 }, { label: 'Октябрь', value: 10 },
        { label: 'Ноябрь', value: 11 }, { label: 'Декабрь', value: 12 }
    ];

    // Проверка, чтобы выбранные значения были в допустимых диапазонах
    if (!months.some(m => m.value === queryMonth)) queryMonth = currentMonth;
    if (!years.includes(queryYear)) queryYear = currentYear;

    if (!currentUser?.id) {
        return {
            summary: null,
            months,
            years,
            selectedMonth: queryMonth,
            selectedYear: queryYear,
            error: "Пользователь не авторизован. Невозможно загрузить финансовую сводку."
        };
    }

    try {
        const summary = await GlobalClient.getUserFinancesSummary(
            new GetFinanceSummaryQuery({
                month: queryMonth,
                year: queryYear,
                userId: currentUser.id
            })
        );
        return {
            summary,
            months,
            years,
            selectedMonth: queryMonth,
            selectedYear: queryYear,
            error: null
        };
    } catch (e: any) {
        console.error("Error loading finance summary:", e);
        return {
            summary: null,
            months,
            years,
            selectedMonth: queryMonth,
            selectedYear: queryYear,
            error: e.message || "Не удалось загрузить финансовую сводку за выбранный период."
        };
    }
};