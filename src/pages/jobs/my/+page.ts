import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api';
import type {
    JobEntity,
    GetJobsListQuery,
    UserEntity,
    FreelancerJobInvolvementStatus // Убедитесь, что этот enum есть, если будете фильтровать по нему
} from 'flsurf-client';
import { showError } from '$lib/shared/ui/errors';
import { redirect } from '@sveltejs/kit';

export interface MyFreelancerJobsPageData {
    jobs: JobEntity[]; 
    totalJobs: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    currentFilters: { 
        searchTerm?: string | null;
        // involvementStatuses?: FreelancerJobInvolvementStatus[] | null; // Для фильтрации
    };
    currentUser?: UserEntity;
    error?: string;
}

const DEFAULT_PAGE_SIZE = 10;

export const load: PageLoad<MyFreelancerJobsPageData> = async ({ url, parent }) => {
    const { userSession } = await parent();
    // @ts-ignore
    const currentUser = userSession?.user as UserEntity | undefined;

    if (!currentUser?.id) {
        throw redirect(307, '/login');
    }
    // @ts-ignore
    if (currentUser.role?.toString().toLowerCase() !== 'freelancer' && currentUser.type?.toString().toLowerCase() !== 'freelancer') {
        throw redirect(307, '/'); 
    }

    const pageParam = url.searchParams.get('page') || '1';
    const pageSizeParam = url.searchParams.get('pageSize') || DEFAULT_PAGE_SIZE.toString();
    const searchTermParam = url.searchParams.get('q');
    // const involvementStatusParams = url.searchParams.getAll('involvement_status') as FreelancerJobInvolvementStatus[];

    const currentPage = parseInt(pageParam, 10) || 1;
    const pageSize = parseInt(pageSizeParam, 10) || DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;

    const currentFilters: MyFreelancerJobsPageData['currentFilters'] = {
        searchTerm: searchTermParam || null,
        // involvementStatuses: involvementStatusParams?.length ? involvementStatusParams : null,
    };

    const queryParams: GetJobsListQuery = {
        start: start,
        ends: pageSize, 
        freelancerId: currentUser.id, 
        search: currentFilters.searchTerm || undefined,
        // statuses: currentFilters.involvementStatuses, // Если DTO и API это поддерживают
        sortBy: "UpdatedAt", 
        sortOption: "Desc"
    };

    try {
        const response = await GlobalClient.getJobsList(queryParams); 
        
        const jobs = response.items || response; 
        const totalJobs = response.totalCount || (Array.isArray(jobs) ? jobs.length : 0);
        const totalPages = totalJobs > 0 ? Math.ceil(totalJobs / pageSize) : 0;

        return {
            jobs: Array.isArray(jobs) ? jobs : [],
            totalJobs,
            currentPage,
            pageSize,
            totalPages,
            currentFilters,
            currentUser,
        };

    } catch (error: any) {
        console.error("Ошибка загрузки работ фрилансера:", error);
        return {
            jobs: [],
            totalJobs: 0,
            currentPage: 1,
            pageSize,
            totalPages: 0,
            currentFilters,
            currentUser,
            error: error.message || "Не удалось загрузить список ваших работ."
        };
    }
};