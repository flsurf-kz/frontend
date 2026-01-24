<script lang="ts">
    import { goto } from '$app/navigation';
    import { PagePagination } from '$lib/shared/ui/navigation';
    import { BaseButton } from '$lib/shared/ui/buttons';

    import { GlobalClient } from '$lib/shared/api';
    import {
        ReactToSentJobCommand,
        ReactToSentJobCommandReaction,
        type JobEntity
    } from 'flsurf-client';
	import { showError } from '$lib/shared/ui/errors';
	import { showNotification } from '$lib/shared/ui/errors/modal';

    /* —- данные из load() -— */
    export let data:{
        jobs:        JobEntity[];
        pagination:  { page:number; pageSize:number; hasNext:boolean };
    };

    GlobalClient.createNotification

    async function react(jobId:string, reaction:ReactToSentJobCommandReaction) {
        try {
            await GlobalClient.reactToSentJob(
                new ReactToSentJobCommand({ jobId, reaction })
            );
            showNotification('OK');
            /* после действия — обновляем список */
            goto(location.pathname + location.search, { keepFocus:true });
        } catch (e:any) {
            showError('Ошибка: ' + e.message, true);
        }
    }

    function gotoPage(p:number) {
        const params = new URLSearchParams(location.search);
        params.set('page', String(p));
        goto(`${location.pathname}?${params.toString()}`, { keepFocus:true });
    }
</script>

<div class="container mx-auto px-4 py-6 space-y-6">
    <h1 class="text-2xl font-semibold">Заявки на одобрение</h1>

    {#if data.jobs.length === 0}
        <p class="text-gray-500">Новых заявок нет.</p>
    {:else}
        <ul class="space-y-4">
            {#each data.jobs as j (j.id)}
                <li class="border rounded p-4 shadow-sm">
                    <div class="flex justify-between items-start gap-4">
                        <div>
                            <p class="font-medium text-lg">{j.title}</p>
                            <p class="text-sm text-gray-500">
                                Автор: {j.employer?.fullname ?? j.employerId}
                                • {new Date(j.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <div class="flex flex-col gap-2 shrink-0">
                            <BaseButton className="btn-success btn-xs"
                                        onclick={() => react(j.id, ReactToSentJobCommandReaction.Approve)}>
                                Одобрить
                            </BaseButton>
                            <BaseButton className="btn-warning btn-xs"
                                        onclick={() => react(j.id, ReactToSentJobCommandReaction.Resubmit)}>
                                На&nbsp;доработку
                            </BaseButton>
                            <BaseButton className="btn-error btn-xs"
                                        onclick={() => react(j.id, ReactToSentJobCommandReaction.Delete)}>
                                Удалить
                            </BaseButton>
                        </div>
                    </div>
                </li>
            {/each}
        </ul>

        <div class="flex justify-center mt-6">
            <PagePagination
                currentPage={data.pagination.page}
                pageSize={data.pagination.pageSize}
                on:pageChange={(e)=>gotoPage(e.detail)}
            />
        </div>
    {/if}
</div>

<style>
    /* кнопка-ярлык */
    .btn-xs {
        padding: 0.25rem 0.6rem;
        font-size: 0.75rem;
        line-height: 1rem;
    }
</style>
