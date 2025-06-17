import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api';
import { GetJobsListQuery, Statuses, type JobEntity } from 'flsurf-client';
import { get } from 'svelte/store';
import { CurrentUser } from '$lib/entities/user/model/modal';

export const load: PageLoad = async ({ url }) => {
    // получаем текущего пользователя из родительского layout
    const currentUser = get(CurrentUser);
    if (!currentUser) {
        throw error(401, 'Неавторизован');
    }

    // читаем query-параметры
    const search = url.searchParams.get('search') ?? '';
    const page   = parseInt(url.searchParams.get('page')   ?? '1', 10);
    const limit  = parseInt(url.searchParams.get('limit')  ?? '10', 10);
    const sort   = url.searchParams.get('sort') ?? '';

    // формируем запрос
    const q: GetJobsListQuery = new GetJobsListQuery({
        freelancerId: currentUser.id,
        statuses:     [Statuses.Open, Statuses.Accepted],
        search:       search || undefined,
        // если понадобится – можно добавить sortType/sortOption
    });
    // пагинация
    q.start = (page - 1) * limit;
    q.ends  = page * limit;

    let jobs: JobEntity[] = [];
    try {
        jobs = await GlobalClient.getJobsList(q);
    } catch (e: any) {
        console.error('Ошибка загрузки вакансий', e);
        throw error(500, 'Не удалось загрузить вакансии');
    }

    return {
        jobs,
        filters: { search, page, limit, sort }
    };
};
