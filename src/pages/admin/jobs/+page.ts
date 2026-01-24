import { error } from '@sveltejs/kit';
import { GlobalClient } from '$lib/shared/api';
import {
    GetJobsListQuery,
    Statuses,
    type JobEntity
} from 'flsurf-client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
    /* —- простейшая пагинация через query -— */
    const page     = parseInt(url.searchParams.get('page')  ?? '1', 10);
    const pageSize = parseInt(url.searchParams.get('limit') ?? '10', 10);

    /* —- только работы, требующие модерации -— */
    const q = new GetJobsListQuery({
        statuses: [Statuses.SentToModeration],     // при необходимости замените на свой enum
        start:    (page - 1) * pageSize,
        ends:     page * pageSize
    });

    let jobs: JobEntity[] = [];
    try {
        jobs = await GlobalClient.getJobsList(q);
    } catch (e) {
        console.error(e);
        throw error(500, 'Ошибка загрузки заявок');
    }

    return {
        jobs,
        pagination: {
            page,
            pageSize,
            hasNext: jobs.length === pageSize
        }
    };
};
