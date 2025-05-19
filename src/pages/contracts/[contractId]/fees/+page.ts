// src/routes/contracts/[contractId]/fees/+page.ts
import { GlobalClient } from '$lib/shared/api';
import { CurrentUser } from '$lib/entities/user/model/modal';
import { get } from 'svelte/store';
import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { ContractEntity, UserEntity, TransactionEntity, GetTransactionsListQuery } from 'flsurf-client'; // Assuming fees are a type of transaction

export const load: PageLoad = async ({ params, parent }) => {
    const { contractId } = params;
    const { currentUser } = await parent() as { currentUser: UserEntity | undefined };

    if (!currentUser) {
        throw redirect(303, `/auth/login?redirectTo=/contracts/${contractId}/fees`);
    }

    try {
        const contract = await GlobalClient.getContract(contractId);
        if (!contract) throw error(404, 'Контракт не найден');

        let userRole: 'client' | 'freelancer' | 'staff' | 'other' = 'other';
        if (contract.employerId === currentUser.id) userRole = 'client';
        else if (contract.freelancerId === currentUser.id) userRole = 'freelancer';
        else if (currentUser.roles?.some(r => ['Admin', 'Moderator'].includes(r.name!))) userRole = 'staff';
        else throw error(403, 'У вас нет доступа к этой странице.');

        // Fetch transactions that represent fees or penalties for this contract
        // You might have specific transaction types for 'ClientCancellationFee', 'FreelancerPenalty', etc.
        const feeTransactionsQuery = new GetTransactionsListQuery({
            contractId: contract.id,
            // transactionTypes: ['ClientCancellationFee', 'FreelancerPenalty', 'PlatformServiceFee'], // Example filter by type
            // pageSize: 50,
            // orderBy: "transactionDate_desc"
        });
        // For now, we'll fetch all and filter client-side, but backend filtering is better.
        const allTransactions = (await GlobalClient.getTransactionsList(feeTransactionsQuery))
                                .sort((a,b) => new Date(b.transactionDate!).getTime() - new Date(a.transactionDate!).getTime());

        const feeRelatedTransactions = allTransactions.filter(t =>
            t.type === 'CancellationFee' || // Generic cancellation fee
            t.type === 'ClientFine' ||     // Specific fine types
            t.type === 'FreelancerFine' ||
            t.type === 'PlatformCommission' // Platform fees if you show them here
            // Add any other transaction types that represent fees/penalties
        );


        return {
            contract,
            feeTransactions: feeRelatedTransactions,
            userRole,
            currentUser
        };

    } catch (e: any) {
        // ... (similar error handling as main contract page load) ...
        console.error("Error loading contract fees page:", e);
        if (e.status && e.body) throw e;
        const statusCode = e.response?.data?.status || e.response?.status || 500;
        const message = e.response?.data?.message || e.message || 'Не удалось загрузить данные о сборах.';
        if (statusCode === 401) throw redirect(303, `/auth/login?redirectTo=/contracts/${contractId}/fees`);
        throw error(statusCode, message);
    }
};