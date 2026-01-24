<script lang="ts">
	import JobCardHeader from '$lib/entities/job/ui/job-card-header.svelte';
	import { CurrentUser } from '$lib/entities/user/model/modal';
	import JobCardFooterClient from '$lib/features/job/get-job/ui/job-card-footer-client.svelte';
	import JobCardFooterFreelancer from '$lib/features/job/get-job/ui/job-card-footer-freelancer.svelte';
	import JobCardFooterUnauth from '$lib/features/job/get-job/ui/job-card-footer-unauth.svelte';
	import type { JobDetails, JobEntity } from 'flsurf-client';
	let { job, jobDetails }: { job: JobEntity, jobDetails: JobDetails } = $props();
</script>

<div class="bg-white rounded-xl border shadow-sm p-6">
	<JobCardHeader job={job} jobDetails={jobDetails}/>

	{#if $CurrentUser === undefined}
		<JobCardFooterUnauth />
	{:else if $CurrentUser?.id === job.employerId}
		<JobCardFooterClient {job} />
	{:else}
		<JobCardFooterFreelancer {job} />
	{/if}
</div>
