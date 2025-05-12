<script lang="ts">
	import { goto } from "$app/navigation";
	import BaseButton from "$lib/shared/ui/buttons/base-button.svelte";
	import { UserAvatar } from "$lib/shared/ui/icons";
	import type { JobEntity, ProposalEntity } from "flsurf-client";

    let { job }: { job: JobEntity } = $props();
</script>

<div class="mt-6">
    <div class="flex justify-between items-center w-full">
        <h1 class="text-2xl font-bold">Ставки</h1>
        <BaseButton type="submit" className="bg-green-400" onclick={() => {goto(`/jobs/${job.id}/submit-proposal/`)}}>
            Отправить ставку 
        </BaseButton>
    </div>
    <div>
        {#each (job.proposals ?? []) as proposal}
            <div class="flex items-center justify-between bg-white rounded-xl border shadow-sm p-6 mb-4">
                <div class="flex items-center gap-4">
                    <UserAvatar />
                    <div>
                        <h2 class="text-lg font-semibold">{proposal.freelancer?.name}</h2>
                    </div>
                </div>
            </div>  
        {/each}

        {#if (job.proposals ?? []).length === 0}
            <p class="text-sm text-gray-400 italic">Нет предложений</p>
        {/if}
    </div>
</div>