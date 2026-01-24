// src/routes/dashboard/client/+page.ts
import { GlobalClient } from '$lib/shared/api';
import { get } from 'svelte/store';
import { CurrentUser } // Assuming CurrentUser store path, e.g., from '$lib/stores/user' or '$lib/entities/user/model/modal'
    from '$lib/entities/user/model/modal'; // Using the path from your previous examples for CurrentUser
import type {
    ClientProfileEntity,
    UserEntity,
    ClientJobInfo,
    JobEntity,
    ContractEntity,
    NotificationEntity,
    WalletEntity,
    FinanceSummaryDto,
    GetJobsListQuery,
    GetContractsListQuery,
    GetFinanceSummaryQuery,
    // Import enums if you plan to use them for status filtering, e.g.:
    // Statuses as JobStatusesEnum,
    // GetContractsListQueryStatus as ContractStatusEnum
} from 'flsurf-client';

export interface ClientDashboardData {
    currentUser: UserEntity | null | undefined; // From Svelte store
    clientProfile: ClientProfileEntity | null;
    clientJobInfo: ClientJobInfo | null;
    recentJobs: JobEntity[];
    activeContracts: ContractEntity[];
    unreadMessagesCount: number;
    recentNotifications: NotificationEntity[];
    wallet: WalletEntity | null;
    financeSummary: FinanceSummaryDto | null;
    fetchError?: string;
}

export async function load({ depends }): Promise<ClientDashboardData> {
    depends('app:client-dashboard');

    const currentUser = get(CurrentUser); // Get current user from Svelte store

    let clientProfile: ClientProfileEntity | null = null;
    let clientJobInfo: ClientJobInfo | null = null;
    let recentJobs: JobEntity[] = [];
    let activeContracts: ContractEntity[] = [];
    let unreadMessagesCount: number = 0;
    let recentNotifications: NotificationEntity[] = [];
    let wallet: WalletEntity | null = null;
    let financeSummary: FinanceSummaryDto | null = null;
    let fetchError: string | undefined = undefined;

    if (currentUser && currentUser.id) {
        const results = await Promise.allSettled([
            GlobalClient.getMyProfileInfo(),
            GlobalClient.getClientOrderInfo(currentUser.id),
            GlobalClient.getJobsList({
                clientId: currentUser.id,
                ends: 5, // For pageSize = 5, assuming start defaults to 0 or is handled
                // statuses: [JobStatusesEnum.Open, JobStatusesEnum.InProgress] // Example
            } as GetJobsListQuery),
            GlobalClient.getContractsList({
                userId: currentUser.id,
                isClient: true,
                ends: 5,
                // status: ContractStatusEnum.Active // Example
            } as GetContractsListQuery),
            GlobalClient.getUnreadCounter(),
            GlobalClient.getNotifications(currentUser.id, 0, 5),
            GlobalClient.getMyWallet(),
            GlobalClient.getUserFinancesSummary({ userId: currentUser.id, year: 2022, month: 12 } as GetFinanceSummaryQuery)
        ]);

        const getSettledValue = <T>(promiseResult: PromiseSettledResult<T>, defaultValue: T | null = null): T | null => {
            if (promiseResult.status === 'fulfilled') {
                return promiseResult.value;
            } else {
                console.error("API call failed:", promiseResult.reason);
                return defaultValue;
            }
        };

        clientProfile = getSettledValue<ClientProfileEntity>(results[0]);
        clientJobInfo = getSettledValue<ClientJobInfo>(results[1]);
        recentJobs = getSettledValue<JobEntity[]>(results[2], []) || [];
        activeContracts = getSettledValue<ContractEntity[]>(results[3], []) || [];
        unreadMessagesCount = getSettledValue<number>(results[4], 0) || 0;
        recentNotifications = getSettledValue<NotificationEntity[]>(results[5], []) || [];
        wallet = getSettledValue<WalletEntity>(results[6]);
        financeSummary = getSettledValue<FinanceSummaryDto>(results[7]);

        if (results.some(r => r.status === 'rejected')) {
            fetchError = "Не удалось загрузить часть данных для дашборда. Некоторые секции могут быть неполными.";
        }

    } else {
        fetchError = "Пользователь не авторизован. Невозможно загрузить данные дашборда.";
    }

    return {
        currentUser, // Pass the user from the store
        clientProfile,
        clientJobInfo,
        recentJobs: recentJobs.slice(0, 5), // Ensure only 5 are passed if API returns more
        activeContracts: activeContracts.slice(0, 5),
        unreadMessagesCount,
        recentNotifications,
        wallet,
        financeSummary,
        fetchError,
    };
}