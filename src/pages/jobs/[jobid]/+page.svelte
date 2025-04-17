<script lang="ts">
	import ClientProfileCard from "$lib/entities/client/ui/client-profile-card.svelte";
	import JobCard from "$lib/widgets/job-card/ui/job-card.svelte";
	import type { JobDetails, JobEntity } from "flsurf-client";


	let { job, rawJob }: { job: JobDetails, rawJob: JobEntity } = $props();
</script>

<div class="grid md:grid-cols-3 gap-6">
	<div class="md:col-span-2 space-y-6">
		<JobCard job={rawJob} />
	</div>

	<div>
		<ClientProfileCard job={job} />
	</div>
</div>