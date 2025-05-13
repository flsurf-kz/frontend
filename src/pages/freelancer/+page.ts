import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api';
import { GetJobsListQuery, GetWorkSessionListQuery } from 'flsurf-client';
import { CurrentUser } from '$lib/entities/user/model/modal';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';

/** за сколько дней брать «недавние» */
const DAYS = 7;

export const load: PageLoad = async () => {
    let currentUser = get(CurrentUser)

    if (currentUser === undefined || currentUser === null) { 
        goto("/")
        return { }
    }

	const [
		stats,
		notifications,
		recommendedJobs,
		recentSessions
	] = await Promise.all([
		GlobalClient.getMyFreelancerStats(),

		/* только 5 последних уведомлений */
		GlobalClient.getNotifications(currentUser.id, 0, 5),

		/* рекомендации — подбираем по skills фрилансера */
		GlobalClient.getJobsList(new GetJobsListQuery({ start: 0, ends: 5, recommended: true })),

		/* сессии за последние DAYS */
		GlobalClient.getSessionList(new GetWorkSessionListQuery({
            startDate: new Date(Date.now()), 
			endDate: new Date(Date.now() - DAYS*864e5),
			start: 0, 
            ends: 5, 
		}))
	]);

	return { stats, notifications, recommendedJobs, recentSessions };
};
