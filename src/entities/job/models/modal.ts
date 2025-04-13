import { GlobalClient } from '$lib/shared/api';
import { GetJobsListQuery } from 'flsurf-client';
import type { JobEntity, IGetJobsListQuery } from 'flsurf-client';

type GetJobsPageParams = Omit<IGetJobsListQuery, 'queryId' | 'timestamp'> & {
	page?: number;
	limit?: number;
};

export async function getJobsPage(params: GetJobsPageParams): Promise<{ jobs: JobEntity[]; total?: number }> {
	const {
		page = 1,
		limit = 12,
		start,
		ends,
		...filters
	} = params;

	const query = new GetJobsListQuery({
		...filters,
		start: start ?? (page - 1) * limit,
		ends: ends ?? page * limit
	});

	const jobs = await GlobalClient.getJobsList(query);

	// если API возвращает total (или добавим его позже) — можно вернуть его:
	return {
		jobs,
		total: jobs.length // или jobsMeta.total если появится
	};
}