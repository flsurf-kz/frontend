// src/routes/my-bids/+page.ts (Example path)
import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api';
import { Status, type ProposalEntity, type JobEntity } from 'flsurf-client'; // Assuming Status is your enum for proposal statuses

// Define the expected structure for the page data
export interface MyBidsPageData {
    pending: { proposal: ProposalEntity, job?: JobEntity }[];
    accepted: { proposal: ProposalEntity, job?: JobEntity }[];
    hidden: { proposal: ProposalEntity, job?: JobEntity }[];
    error?: string;
}

export const load: PageLoad = async () => {
    try {
        // Fetch proposal lists for different statuses in parallel
        const [pendingProposals, acceptedProposals, hiddenProposals] = await Promise.all([
            GlobalClient.getProposalsList(undefined, Status.Pending),
            GlobalClient.getProposalsList(undefined, Status.Accepted),
            GlobalClient.getProposalsList(undefined, Status.Hidden)
        ]);

        // Helper function to fetch job details for a list of proposals
        const enrichProposalsWithJobs = async (proposals: ProposalEntity[]) => {
            if (!proposals) return [];
            return Promise.all(
                proposals.map(async (proposal) => {
                    let jobData: JobEntity | undefined = undefined;
                    if (proposal.jobId) {
                        try {
                            // Using getRawJob as it likely returns the basic JobEntity
                            // Adjust if getJob (returning JobDetails) is more appropriate and has the needed fields
                            jobData = await GlobalClient.getRawJob(proposal.jobId);
                        } catch (e) {
                            console.error(`Failed to fetch job ${proposal.jobId} for proposal ${proposal.id}:`, e);
                            // Keep proposal even if job fetch fails, job will be undefined
                        }
                    }
                    return { proposal, job: jobData };
                })
            );
        };

        // Enrich each list of proposals with job details
        const pendingWithJobs = await enrichProposalsWithJobs(pendingProposals);
        const acceptedWithJobs = await enrichProposalsWithJobs(acceptedProposals);
        const hiddenWithJobs = await enrichProposalsWithJobs(hiddenProposals);

        return {
            pending: pendingWithJobs,
            accepted: acceptedWithJobs,
            hidden: hiddenWithJobs,
        };

    } catch (err: any) {
        console.error("Error loading proposals for 'My Bids' page:", err);
        return {
            pending: [],
            accepted: [],
            hidden: [],
            error: "Не удалось загрузить ваши ставки. Пожалуйста, попробуйте позже."
        };
    }
};