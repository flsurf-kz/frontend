// src/routes/contracts/[contractId]/approve-completion/+page.ts
import { GlobalClient } from '$lib/shared/api';
import { CurrentUser } from '$lib/entities/user/model/modal';
import { get } from 'svelte/store';
import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { ContractEntity, UserEntity, ContractEntityStatus, JobEntity } from 'flsurf-client'; // Assuming JobEntity is available

export const load: PageLoad = async ({ params, parent }) => {
    const { contractId } = params;
    const { currentUser } = await parent() as { currentUser: UserEntity | undefined };

    if (!currentUser) {
        throw redirect(303, `/auth/login?redirectTo=/contracts/${contractId}/approve-completion`);
    }

    try {
        const contract = await GlobalClient.getContract(contractId); // Fetches full contract
        if (!contract) {
            throw error(404, 'Контракт не найден.');
        }

        if (contract.employerId !== currentUser.id) {
            throw error(403, 'Вы не являетесь заказчиком по этому контракту.');
        }

        if (contract.status !== ContractEntityStatus.PendingFinishApproval) {
            // If already completed or in a different state, redirect or show info
            showNotification('Этот контракт не ожидает вашего подтверждения о завершении.', false); // Use a store or alert
            throw redirect(303, `/contracts/${contract.id}`);
        }

        // Fetch minimal job details if not fully populated in contract.job
        let jobSummary: Partial<JobEntity> = contract.job ?? {};
        if (contract.jobId && !contract.job?.title) {
            try {
                 // Assuming getRawJob or a similar endpoint for basic job info
                const rawJob = await GlobalClient.getRawJob(contract.jobId);
                jobSummary = { id: rawJob.id, title: rawJob.title };
            } catch (jobError) {
                console.warn("Could not fetch job summary for approval page:", jobError);
            }
        }


        // Calculate total payable (backend should ideally provide this on contract or via a specific API call)
        // This is a simplified client-side calculation. For accuracy, backend should be the source of truth.
        let totalPayableToFreelancer = 0;
        if (contract.budgetType === ContractEntityStatus.Fixed) {
            totalPayableToFreelancer = contract.budget?.amount ?? 0;
        } else if (contract.budgetType === ContractEntityStatus.Hourly) {
            totalPayableToFreelancer = (contract.workSessions ?? [])
                .filter(ws => ws.status === 'Approved' || ws.status === 'Paid') // Or just sum all 'Approved'
                .reduce((sum, ws) => sum + (ws.amountBilled?.amount ?? 0), 0);
        }
        // Add bonuses (assuming bonusesList is part of contract or fetched separately)
        // For simplicity, assuming contract.totalBonusesAwarded might be a field
        // totalPayableToFreelancer += (contract.totalBonusesAwarded?.amount ?? 0);

        // Better: ContractEntity has a field like `finalPayoutAmountForApproval: Money` calculated by backend

        return {
            contract,
            jobSummary, // Minimal job info
            // totalPayableToFreelancer, // Pass calculated or backend-provided amount
            freelancer: contract.freelancer, // Assuming freelancer details are populated
            currentUser
        };

    } catch (e: any) {
        console.error("Error loading contract approval page:", e);
        if (e.status && e.body) throw e; // SvelteKit errors
        if (e instanceof Response && e.status === 303) throw e; // Redirects

        const statusCode = e.response?.data?.status || e.response?.status || 500;
        const message = e.response?.data?.message || e.message || 'Не удалось загрузить страницу подтверждения.';
        if (statusCode === 401) throw redirect(303, `/auth/login?redirectTo=/contracts/${contractId}/approve-completion`);
        throw error(statusCode, message);
    }
};