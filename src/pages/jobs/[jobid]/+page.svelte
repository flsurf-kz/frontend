<script lang="ts">
	import ClientProfileCard from "$lib/entities/client/ui/client-profile-card.svelte";
	import JobCard from "$lib/widgets/job-card/ui/job-card.svelte";
	import { AcceptDisputeCommand, ResolveDisputeCommand, type JobDetails, type JobEntity } from "flsurf-client";

	export let data; 

	let { job, rawJob }: { 
		job: JobDetails,
		rawJob: JobEntity, 
	} = data; 
</script>

<div class="grid md:grid-cols-3 gap-6">
	<div class="md:col-span-2 space-y-6">
		<JobCard job={rawJob} jobDetails={job}/>
	</div>

	<div>
		<ClientProfileCard job={job} rawJob={rawJob}/>
	</div>
</div>