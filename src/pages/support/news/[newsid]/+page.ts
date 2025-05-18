// src/routes/news/[newsId]/+page.ts
import { GlobalClient } from '$lib/shared/api';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const { newsid } = params;
    try {
        const newsItem = await GlobalClient.getNewsById(newsid);
        if (!newsItem) {
            throw error(404, 'Новость или обновление не найдено.');
        }
        return {
            newsItem
        };
    } catch (e: any) {
        console.error(`Error loading news item ${newsid}:`, e);
        throw error(e.status || 500, e.message || 'Не удалось загрузить новость.');
    }
};