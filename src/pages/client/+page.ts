import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api';
import {
    type ContractEntity,
    JobEntityStatus,
    type TransactionEntity,
    type JobEntity,
    type WorkSessionEntity,
    type UserEntity, // Для currentUser
    GetJobsListQuery, // Для запроса вакансий
    type ClientProfileEntity,
    GetContractsListQuery,
    Statuses,
    GetTransactionsListQuery,
    GetWorkSessionListQuery,
    WorkSessionEntityStatus,
    GetWorkSessionListQueryStatus, // Для фильтра вакансий
} from 'flsurf-client';
// showError будет использоваться в +page.svelte, но можно и здесь для логирования
// import { showError } from '$lib/shared/ui/errors'; 
import { redirect } from '@sveltejs/kit';
import { CurrentUser } from '$lib/entities/user/model/modal';
import { get } from 'svelte/store';

export interface ClientDashboardPageData {
    clientProfile?: ClientProfileEntity;
    recentContracts: ContractEntity[];
    pendingWorkSessions: WorkSessionEntity[]; // Только те, что ожидают утверждения
    recentTransactions: TransactionEntity[];
    activeJobs: JobEntity[];
    currentUser?: UserEntity; // Передаем текущего пользователя, если он есть
    error?: string;
}

export const load: PageLoad<ClientDashboardPageData> = async ({ }) => {
    // const { userSession } = await parent();
    // const currentUser = userSession?.user;

    let currentUser = get(CurrentUser)

    if (!currentUser?.id) {
        console.warn("Пользователь не аутентифицирован в +page.ts для дашборда клиента.");
        throw redirect(307, '/auth/login'); // Или ваша страница входа
    }
    // Дополнительная проверка, что это клиент, если есть поле role/type
    if (currentUser.role?.toString().toLowerCase() !== 'client' && currentUser.type?.toString().toLowerCase() !== 'client') {
        console.warn(`Пользователь ${currentUser.id} не является клиентом.`);
        // throw redirect(307, '/'); // Редирект на главную или страницу ошибки доступа
        // Для отладки пока пропустим редирект, но в продакшене он нужен
    }

    const defaultData: ClientDashboardPageData = {
        recentContracts: [],
        pendingWorkSessions: [],
        recentTransactions: [],
        activeJobs: [],
        currentUser: currentUser,
    };

    try {
        const clientProfilePromise = GlobalClient.getMyProfileInfo();

        const contractsQuery: GetContractsListQuery = new GetContractsListQuery({ 
            userId: currentUser.id, // Фильтр по ID клиента
            start: 0,
            ends: 3,  
        });
        const recentContractsPromise = GlobalClient.getContractsList(contractsQuery);
        
        const activeJobsQuery: GetJobsListQuery = new GetJobsListQuery({
            clientId: currentUser.id, // Фильтр по ID клиента
            statuses: [Statuses.Open, /* JobEntityStatus.InProgress - если есть такой */], // Только активные
            start: 0, 
            ends: 3, 
        });
        const activeJobsPromise = GlobalClient.getJobsList(activeJobsQuery).then(res => res); // Адаптируем под структуру ответа

        const recentTransactionsPromise = GlobalClient.getTransactionsList(new GetTransactionsListQuery({ start: 0, ends: 5 }));


        // Сначала получаем контракты, чтобы потом запросить сессии для них
        const clientProfile = await clientProfilePromise.catch(err => {
            console.error("Ошибка загрузки профиля клиента:", err);
            return undefined;
        });
        
        let recentContracts = await recentContractsPromise.catch(err => {
            console.error("Ошибка загрузки контрактов клиента:", err);
            return [];
        });
        // Убедимся, что recentContracts это массив
        if (!Array.isArray(recentContracts)) recentContracts = [];


        let pendingWorkSessions: WorkSessionEntity[] = [];
        if (recentContracts.length > 0) {
            const workSessionPromises = recentContracts.slice(0, 3).map(contract => {
                if (!contract.id) return Promise.resolve([]); // Пропускаем если нет ID контракта
                const wsQuery: GetWorkSessionListQuery = new GetWorkSessionListQuery(
                    { contractId: contract.id, status: GetWorkSessionListQueryStatus.Pending });
                return GlobalClient.getSessionList(wsQuery).catch(err => {
                    console.error(`Ошибка загрузки рабочих сессий для контракта ${contract.id}:`, err);
                    return []; // Возвращаем пустой массив в случае ошибки для одного контракта
                });
            });

            const results = await Promise.allSettled(workSessionPromises);
            results.forEach(result => {
                if (result.status === 'fulfilled' && Array.isArray(result.value)) {
                    pendingWorkSessions.push(...result.value);
                }
            });
            // Дополнительно отфильтруем на клиенте, если API вернул не только PendingApproval
            pendingWorkSessions = pendingWorkSessions.filter(ws => ws.status === WorkSessionEntityStatus.Pending);
        }

        // Остальные запросы можно выполнить параллельно с профилем и контрактами, если они не зависят
        const [
            activeJobs,
            recentTransactions,
        ] = await Promise.allSettled([
            activeJobsPromise,
            recentTransactionsPromise
        ]);

        const getSettledResult = <T>(promiseResult: PromiseSettledResult<T>, defaultValue: T): T => {
            if (promiseResult.status === 'fulfilled') {
                return promiseResult.value ?? defaultValue;
            }
            console.error("Ошибка загрузки части данных для дашборда:", (promiseResult as PromiseRejectedResult).reason);
            return defaultValue;
        };

        return {
            clientProfile: clientProfile,
            recentContracts: recentContracts,
            pendingWorkSessions: pendingWorkSessions.slice(0, 5), // Ограничим количество для отображения
            activeJobs: getSettledResult(activeJobs, []),
            recentTransactions: getSettledResult(recentTransactions, []),
            currentUser: currentUser,
        };

    } catch (error: any) {
        console.error("Критическая ошибка загрузки дашборда клиента:", error);
        // showError не будет работать в +page.ts, т.к. это UI функция
        // Вместо этого передаем ошибку в data
        return {
            ...defaultData,
            currentUser: currentUser,
            error: error.message || "Не удалось загрузить данные для дашборда."
        };
    }
};