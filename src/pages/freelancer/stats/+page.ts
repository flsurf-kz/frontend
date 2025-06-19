import { error } from '@sveltejs/kit';
import { get }   from 'svelte/store';

import { CurrentUser }          from '$lib/entities/user/model/modal';
import { GlobalClient }         from '$lib/shared/api';
import {
    GetJobsListQuery,
    Statuses,
    type JobEntity,
    type FreelancerStatsDto
} from 'flsurf-client';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
    /* ── текущий пользователь ───────────────────────── */
    const user = get(CurrentUser);
    if (!user) {
        throw error(401, 'Неавторизован');
    }

    /* ── статистика фрилансера ──────────────────────── */
    let stats: FreelancerStatsDto | null = null;
    try {
        stats = await GlobalClient.getFreelancerStats(user.id);
    } catch (e) {
        console.error('stats error', e);
        throw error(500, 'Ошибка получения статистики');
    }

    /* ── список выполненных заказов для «Подробнее» ─── */
    const page     = parseInt(url.searchParams.get('jobsPage')  ?? '1', 10);
    const pageSize = parseInt(url.searchParams.get('limit')     ?? '10', 10);
    const proposalDays = parseInt(url.searchParams.get('proposalDays') ?? '30', 10);

    const jobsQuery = new GetJobsListQuery({
        freelancerId: user.id,
        statuses:     [Statuses.Completed, Statuses.Closed],
        start:        (page - 1) * pageSize,
        ends:         page * pageSize
    });

    let jobs: JobEntity[] = [];
    try {
        jobs = await GlobalClient.getJobsList(jobsQuery);
    } catch (e) {
        console.error('jobs error', e);
        throw error(500, 'Ошибка получения списка заказов');
    }

    return {
        stats,
        jobs,
        pagination: {
            page,
            pageSize,
            // если API не отдаёт total, ориентируемся на «есть ли следующая страница»
            hasNext: jobs.length === pageSize
        }, 
        proposalDays
    };
};
