import { error } from '@sveltejs/kit';
import { GlobalClient } from '$lib/shared/api';
import { GetClientHistoryQuery, ClientHistoryDto } from 'flsurf-client';
import type { PageLoad } from './$types';
import { CurrentUser } from '$lib/entities/user/model/modal';
import { get } from 'svelte/store';

export const load: PageLoad = async ({ url }) => {
    const currentUser = get(CurrentUser);
    if (!currentUser) {
        throw error(401, 'Неавторизован');
    }

    // Читаем фильтры из query params
    const completedAfter  = url.searchParams.get('completedAfter');
    const completedBefore = url.searchParams.get('completedBefore');

    // Формируем запрос
    const query: GetClientHistoryQuery = new GetClientHistoryQuery({
        freelancerId: currentUser.id
    });
    if (completedAfter) {
        query.completedAfter = new Date(completedAfter);
    }
    if (completedBefore) {
        query.completedBefore = new Date(completedBefore);
    }

    let history: ClientHistoryDto[] = [];
    try {
        history = await GlobalClient.getClientHistory(query);
    } catch (e) {
        console.error('Error fetching client history', e);
        throw error(500, 'Ошибка получения истории клиентов');
    }

    return { history };
};
