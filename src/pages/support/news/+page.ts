// src/routes/news/+page.ts
import { GlobalClient } from '$lib/shared/api';
import { error } from '@sveltejs/kit';
import type { NewsEntity } from 'flsurf-client';

export const load = async ({ url }: { url: any }) => {
    try {
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = 10; // Количество новостей на странице

        // Рассчитываем параметры start и ends для API
        // start: 0-based index
        // ends: количество элементов для загрузки
        const apiStart = (page - 1) * pageSize;
        const apiEnds = pageSize + 1; // Запрашиваем на один элемент больше для проверки наличия следующей страницы

        // Параметры includeHidden, startDate, endDate - по умолчанию или из URL, если нужно
        const includeHidden = url.searchParams.get('includeHidden') === 'true' || false; // Пример
        const startDate = url.searchParams.get('startDate') ? new Date(url.searchParams.get('startDate')) : undefined;
        const endDate = url.searchParams.get('endDate') ? new Date(url.searchParams.get('endDate')) : undefined;
        const changeNotes = url.searchParams.get("changeNotes") ? true : false; 

        // ПРЕДПОЛОЖЕНИЕ: Этот эндпоинт отдает "общие" новости.
        // Если для "общих новостей" и "change notes" должны быть разные данные,
        // а API метод один, то нужна либо доработка API (фильтр по категории),
        // либо вы будете использовать разные эндпоинты (если они есть),
        // либо вся логика разделения ложится на контент новостей и их ручную фильтрацию при создании.
        // Сейчас этот +page.ts будет получать все новости, доступные через getNewsList.
        const allNewsFetched = await GlobalClient.getNewsList(
            apiStart,
            apiEnds,
            includeHidden,
            startDate, // Раскомментируйте, если используете
            endDate,    // Раскомментируйте, если используете, 
            changeNotes, 
        );

        let hasNextPage = false;
        let newsItemsToDisplay: NewsEntity[] = [];

        if (allNewsFetched.length > pageSize) {
            hasNextPage = true;
            newsItemsToDisplay = allNewsFetched.slice(0, pageSize);
        } else {
            hasNextPage = false;
            newsItemsToDisplay = allNewsFetched;
        }
        
        // Сортировка, если API не гарантирует порядок (хотя обычно order by на бэке)
        // newsItemsToDisplay.sort((a,b) => new Date(b.publicationDate!).getTime() - new Date(a.publicationDate!).getTime());


        return {
            newsItems: newsItemsToDisplay,
            currentPage: page,
            hasNextPage: hasNextPage,
            // totalNews и totalPages теперь неизвестны без доп. информации от API
            newsType: changeNotes ? 'change-notes' : 'general' // Для заголовка и логики на странице
        };
    } catch (e: any) {
        console.error("Error loading general news:", e);
        throw error(e.status || 500, e.message || 'Не удалось загрузить новости.');
    }
};