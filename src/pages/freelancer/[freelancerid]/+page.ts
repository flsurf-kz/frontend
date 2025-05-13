// +page.ts
import { error } from '@sveltejs/kit';
import { GlobalClient } from '$lib/shared/api';
import { GetJobsListQuery } from 'flsurf-client';
import type { PageLoad } from './$types';

/**
 * ─────────────────────────────────────────────────────────────
 *  Loads freelancer data **once** for the profile page
 * ─────────────────────────────────────────────────────────────
 *
 * • `viewMode` query‑param forces "public" mode for the owner
 *   ─ /freelancers/123?viewMode=public
 * •  Everything else is the same JSON bundle the old page used
 */
export const load: PageLoad = async ({ params, url }) => {
	/** id из маршрута /freelancers/[id] */
	const freelancerId = params.freelancerid;

	/** 'public' | null – если владелец открыл «See public view» */
	const forcedView   = url.searchParams.get('viewMode');

	try {
		/* ── параллельные запросы ──────────────────────────────── */
		const [profile, projects, jobs] = await Promise.all([
			GlobalClient.getFreelancerProfile(freelancerId),
			GlobalClient.getPortfolioProjects(freelancerId),
			GlobalClient.getJobsList(
				new GetJobsListQuery({ freelancerId })
			)
		]);

		return {
			freelancerId,
			profile,
			projects,
			jobs,
			/** передаём наверх: на клиенте сравним с $CurrentUser.id */
			forcedView                          // undefined | 'public'
		};
	} catch (e) {
		throw error(404, 'Freelancer not found');
	}
};
