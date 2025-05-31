import { CurrentUser } from '$lib/entities/user/model/modal';
import { GlobalClient } from '$lib/shared/api';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const jobId = params.jobid;

	// 🔹 Получение основной информации о заказе
	const jobDetails = await GlobalClient.getJob(jobId);

	const rawJob = await GlobalClient.getRawJob(jobId); 

	// 🔹 Получение ставок (если отдельно нужно)
	const proposals = rawJob.proposals ?? [];

	// Проверим, является ли он заказчиком
	const isClient = get(CurrentUser)?.id === rawJob.employer?.id;
	const isAuthenticated = !!get(CurrentUser);

	return {
		job: jobDetails,
		rawJob: rawJob, 
		isClient,
		isAuthenticated
	};
};