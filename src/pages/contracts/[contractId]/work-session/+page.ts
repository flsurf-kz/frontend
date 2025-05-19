// src/routes/contracts/[contractId]/work-sessions/+page.ts
import { GlobalClient } from '$lib/shared/api';
import { CurrentUser } from '$lib/entities/user/model/modal'; // Assuming this is a Svelte store
import { get } from 'svelte/store';
import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { type ContractEntity, type WorkSessionEntity, type UserEntity, GetWorkSessionListQuery, UserEntityType } from 'flsurf-client';

export const load: PageLoad = async ({ params, parent }) => {
    const { contractId } = params;
    const { currentUser } = await parent() as { currentUser: UserEntity | undefined }; // Get from root layout

    if (!currentUser) {
        throw redirect(303, `/auth/login?redirectTo=/contracts/${contractId}/work-sessions`);
    }

    try {
        const contract = await GlobalClient.getContract(contractId);

        if (!contract) {
            throw error(404, 'Контракт не найден');
        }

        // Ensure the contract is hourly, otherwise this page might not make sense
        if (contract.budgetType !== 'Hourly') {
            // Or show a message on the page itself
            throw error(400, 'Страница рабочих сессий применима только для контрактов с почасовой оплатой.');
        }

        let userRole: 'client' | 'freelancer' | 'staff' | 'other' = 'other';
        if (contract.employerId === currentUser.id) {
            userRole = 'client';
        } else if (contract.freelancerId === currentUser.id) {
            userRole = 'freelancer';
        } else if (currentUser.type === UserEntityType.Staff) { // Example staff check
            userRole = 'staff';
        } else {
            throw error(403, 'У вас нет доступа к рабочим сессиям этого контракта.');
        }

        // Fetch work sessions specifically for this contract
        // Using a query allows for pagination or specific filtering if needed in the future
        const workSessionQuery = new GetWorkSessionListQuery({
            contractId: contract.id,
            // pageNumber: 1, // Example for pagination
            // pageSize: 50,  // Example for pagination
            // orderBy: "startTime_desc" // Example sorting
        });
        const workSessions = await GlobalClient.getSessionList(workSessionQuery);

        return {
            contract,
            workSessions: workSessions.sort((a,b) => new Date(b.startDate!).getTime() - new Date(a.startDate!).getTime()), // Ensure latest first
            userRole,
            currentUser // Pass current user for any specific display logic or checks
        };

    } catch (e: any) {
        console.error("Error loading contract work sessions page:", e);
        if (e.status && e.body) { // Re-throw SvelteKit errors
            throw e;
        }
        const statusCode = e.response?.data?.status || e.response?.status || 500;
        const message = e.response?.data?.message || e.message || 'Не удалось загрузить данные о рабочих сессиях.';

        if (statusCode === 401) {
            throw redirect(303, `/auth/login?redirectTo=/contracts/${contractId}/work-sessions`);
        }
        throw error(statusCode, message);
    }
};