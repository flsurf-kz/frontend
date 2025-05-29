<script lang="ts">
	import { JobEditForm } from "$lib/features/job/edit-job";
	import { CategoryEntity, JobEntity } from "flsurf-client";

	let { data } = $props()
    let { job, categories }: { job: JobEntity, categories: CategoryEntity[] } = data; 
</script>

<JobEditForm job={job} categories={categories}/>