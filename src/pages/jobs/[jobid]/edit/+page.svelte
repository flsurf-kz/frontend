<script lang="ts">
	import { JobEditForm } from "$lib/features/job/edit-job";
	import { CategoryEntity, JobEntity } from "flsurf-client";

    let { job, categories }: { job: JobEntity, categories: CategoryEntity[] } = $props()
</script>

<JobEditForm job={job} categories={categories}/>