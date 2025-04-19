
import { GlobalClient } from '$lib/shared/api';
import { redirect } from '@sveltejs/kit';
import { GetContractsListQuery, GetJobsListQuery, GetWorkSessionListQuery, UserEntityType } from 'flsurf-client';

export const load: PageLoad = async () => {
	const currentUser = await GlobalClient.getMe();

	if (currentUser.type === UserEntityType.Client) {
		throw redirect(302, '/finance/transactions');
	}

	const wallet = await GlobalClient.getMyWallet();
	const pendingJobs = await GlobalClient.getJobsList(new GetJobsListQuery({freelancerId: currentUser.id}));
	const activeContracts = await GlobalClient.getContractsList(new GetContractsListQuery({userId: currentUser.id}));
	const workSessions = await GlobalClient.getSessionList(new GetWorkSessionListQuery({userId: currentUser.id}));

	return {
		user: currentUser,
		wallet,
		pendingJobs,
		activeContracts,
		workSessions
	};
};
