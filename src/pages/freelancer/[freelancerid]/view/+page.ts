// routes/freelancers/[id]/+page.ts
import { error } from '@sveltejs/kit';
import { GlobalClient } from '$lib/shared/api';
import { GetJobsListQuery } from 'flsurf-client';

export async function load({ params }) {
	const userId = params.freelancerid;

	try {
		const [profile, projects, jobs] = await Promise.all([
			GlobalClient.getFreelancerProfile(userId),
			GlobalClient.getPortfolioProjects(userId),
			GlobalClient.getJobsList(new GetJobsListQuery({ freelancerId: userId }))
		]);

		return {
			userId,
			profile,
			projects,
			jobs
		};
	} catch (e) {
		throw error(404, 'Фрилансер не найден');
	}
}
