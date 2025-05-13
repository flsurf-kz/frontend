import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api';
import { Status } from 'flsurf-client';

export const load: PageLoad = async () => {
	/* три запроса сразу – параллельно */
	const [pending, accepted, hidden] = await Promise.all([
		GlobalClient.getProposalsList(undefined, Status.Pending),
		GlobalClient.getProposalsList(undefined, Status.Accepted ),
		GlobalClient.getProposalsList(undefined, Status.Hidden )
	]);

	return {
		pending,    // Submitted / Active
		accepted,   // Offers (контракт подписан)
		hidden      // Archived
	};
};
