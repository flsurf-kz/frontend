import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api';
import {
    type JobEntity,
    GetJobsListQuery,
    type UserEntity,
} from 'flsurf-client';
import { redirect } from '@sveltejs/kit';
import { CurrentUser } from '$lib/entities/user/model/modal';
import { get } from 'svelte/store';

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

export const load: PageLoad<MyFreelancerJobsPageData> = async ({ url }) => {
    const currentUser = get(CurrentUser)

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

    const queryParams: GetJobsListQuery = new GetJobsListQuery({
        start: start,
        ends: pageSize, 
        freelancerId: currentUser.id, 
        search: currentFilters.searchTerm || undefined,
    });

    try {
        const response = await GlobalClient.getJobsList(queryParams); 
        
        const jobs = response; 
        const totalJobs = response.length
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