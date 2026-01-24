<script lang="ts">
    import { goto }                    from '$app/navigation';
    import { page }                    from '$app/stores';
    import { writable }                from 'svelte/store';

    import ModalBase                   from '$lib/shared/ui/modal/modal-base.svelte';
    import { BaseButton }              from '$lib/shared/ui/buttons';
    import { PagePagination }          from '$lib/shared/ui/navigation';

    import { GlobalClient }            from '$lib/shared/api';
    import {
	AcceptDisputeCommand,
        type ContractEntity,
        ResolveDisputeCommand,
        ResolveDisputeCommandStrategy,
    } from 'flsurf-client';
	import { showNotification } from '$lib/shared/ui/errors/modal';

    /* ───────── данные от +page.ts ───────── */
    export let data:{
        contracts:   ContractEntity[];
        page:        number;
        limit:       number;
        status:      string | null;
        disputeOnly: boolean;
        hasNext:     boolean;
    };

    /* ───────── reactive state ───────── */
    const detailsModalVisible  = writable(false);
    const resolveModalVisible  = writable(false);
    const selectedContract     = writable<ContractEntity | null>(null);

    /* поля формы решения спора */
    let resolutionStrategy: ResolveDisputeCommandStrategy =
        ResolveDisputeCommandStrategy.RefundClient;
    let resolutionComment       = '';
    let blockFreelancerWallet   = false;
    let blockClientWallet       = false;

    /* ───────── helpers ───────── */
    function updateParam(key:string, value:string): void {
        const params = new URLSearchParams($page.url.searchParams);
        value ? params.set(key, value) : params.delete(key);
        goto(`${$page.url.pathname}?${params.toString()}`, { keepFocus:true });
    }

    async function acceptDispute(disputeId: string): Promise<void> {
        try {
            await GlobalClient.acceptDispute(new AcceptDisputeCommand({ disputeId }));
            showNotification('Спор закреплён за вами');
            goto($page.url.href, { invalidateAll: true });
        } catch (exc: any) {
            showNotification('Ошибка: ' + exc.message, true);
        }
    }

    function resetResolutionForm(): void {
        resolutionStrategy      = ResolveDisputeCommandStrategy.RefundClient;
        resolutionComment       = '';
        blockFreelancerWallet   = false;
        blockClientWallet       = false;
    }

    async function submitResolution(): Promise<void> {
        const contract = $selectedContract;
        if (!contract || !contract.disputeId) return;

        try {
            await GlobalClient.resolveDispute(
                new ResolveDisputeCommand({
                    disputeId:             contract.disputeId,
                    strategy:              resolutionStrategy,
                    moderatorComment:      resolutionComment,
                    blockFreelancerWallet: blockFreelancerWallet,
                    blockClientWallet:     blockClientWallet
                })
            );
            showNotification('Спор закрыт');
            resolveModalVisible.set(false);
            detailsModalVisible.set(false);
            goto($page.url.href, { invalidateAll: true });
        } catch (exc: any) {
            showNotification('Ошибка: ' + exc.message, true);
        }
    }
</script>

<div class="container mx-auto px-4 py-8 space-y-6">
    <h1 class="text-2xl font-semibold">Контракты</h1>

    <!-- ░░░ фильтры ░░░ -->
    <div class="flex flex-wrap gap-4">
        <select class="select select-bordered"
                on:change={(e)=>updateParam('status',
                        (e.currentTarget as HTMLSelectElement).value)}>
            <option value="">Все статусы</option>
            <option value="Active"    selected={data.status==='Active'}>Active</option>
            <option value="Finished"  selected={data.status==='Finished'}>Finished</option>
            <option value="Cancelled" selected={data.status==='Cancelled'}>Cancelled</option>
        </select>

        <label class="flex items-center gap-2">
            <input type="checkbox" class="checkbox checkbox-sm"
                   checked={data.disputeOnly}
                   on:change={(e)=>updateParam('dispute',
                          (e.currentTarget as HTMLInputElement).checked ? '1' : '')}/>
            Только со спором
        </label>
    </div>

    <!-- ░░░ таблица ░░░ -->
    <div class="overflow-x-auto border rounded">
        <table class="table w-full">
            <thead>
                <tr>
                    <th>ID</th><th>Job</th><th>Фрилансер</th><th>Клиент</th>
                    <th>Статус</th><th>Спор</th><th></th>
                </tr>
            </thead>
            <tbody>
                {#each data.contracts as contract (contract.id)}
                    <tr class="hover">
                        <td class="whitespace-nowrap">{contract.id.slice(0,8)}…</td>
                        <td>{contract.job?.title}</td>
                        <td>{contract.freelancer?.fullname}</td>
                        <td>{contract.employer?.fullname}</td>
                        <td>{contract.status}</td>
                        <td>{contract.disputeId ? '⚠️' : ''}</td>
                        <td>
                            <BaseButton className="btn-xs btn-outline"
                                onclick={()=>{
                                    selectedContract.set(contract);
                                    detailsModalVisible.set(true);
                                }}>
                                Открыть
                            </BaseButton>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <PagePagination
        currentPage={data.page}
        pageSize={data.limit}
        on:pageChange={(e)=>updateParam('page', String(e.detail))}/>
</div>

<!-- ───────────────── 1-я Модалка: детали контракта ───────────────── -->
<ModalBase bind:open={$detailsModalVisible} title="Контракт">
    {#if $selectedContract}
        <div class="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
            <p><span class="font-medium">Job:</span> {$selectedContract.job?.title}</p>
            <p><span class="font-medium">Начало:</span>
               {new Date($selectedContract?.startDate ?? new Date()).toLocaleDateString()}</p>
            <p><span class="font-medium">Бюджет:</span>
               {$selectedContract.budget?.amount} {$selectedContract.budget?.currency}</p>
            <p><span class="font-medium">Остаток:</span>
               {$selectedContract.remainingBudget?.amount ?? '—'}</p>
            <p><span class="font-medium">Всего часов:</span>
               {$selectedContract.totalHoursWorked ?? 0}</p>
            <p><span class="font-medium">Tasks:</span>
               {$selectedContract.tasks?.length ?? 0}</p>
            <p><span class="font-medium">Work-sessions:</span>
               {$selectedContract.totalWorkSessions ?? 0}</p>
            <p><span class="font-medium">Бонусы:</span>
               {$selectedContract.bonuses?.length ?? 0}</p>

            {#if $selectedContract.disputeId}
                <div class="mt-4 p-3 border rounded bg-base-200 space-y-2">
                    <p class="font-medium">Спор • ID {$selectedContract.disputeId}</p>

                    {#if !$selectedContract.disputeId}
                        <BaseButton className="btn-warning btn-sm"
                            onclick={() => acceptDispute($selectedContract.disputeId!)}>
                            Взять спор
                        </BaseButton>
                    {/if}

                    {#if $selectedContract.disputeId}
                        <BaseButton className="btn-primary btn-sm"
                            onclick={() => {
                                resolveModalVisible.set(true);
                                resetResolutionForm();
                            }}>
                            Решить спор
                        </BaseButton>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}
</ModalBase>

<!-- ────────────────── 2-я Модалка: решение спора ────────────────── -->
<ModalBase bind:open={$resolveModalVisible} title="Решить спор">
    <div class="space-y-3">
        <select class="select select-bordered w-full"
                bind:value={resolutionStrategy}>
            <option value="RefundClient">Возврат клиенту</option>
            <option value="ReleaseToFreelancer">Оплатить фрилансеру</option>
            <option value="SplitHalf">Разделить 50/50</option>
        </select>

        <textarea class="textarea textarea-bordered w-full h-24"
                  placeholder="Комментарий модератора"
                  bind:value={resolutionComment}/>

        <label class="label gap-2 cursor-pointer">
            <input type="checkbox" class="checkbox"
                   bind:checked={blockFreelancerWallet}/>
            Блокировать кошелёк фрилансера
        </label>

        <label class="label gap-2 cursor-pointer">
            <input type="checkbox" class="checkbox"
                   bind:checked={blockClientWallet}/>
            Блокировать кошелёк клиента
        </label>

        <div class="flex justify-end gap-2 pt-2">
            <BaseButton className="btn-outline btn-sm"
                        onclick={() => resolveModalVisible.set(false)}>
                Отмена
            </BaseButton>

            <BaseButton className="btn-primary btn-sm"
                        onclick={submitResolution}>
                Подтвердить
            </BaseButton>
        </div>
    </div>
</ModalBase>

<style>
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.85rem; }
    .btn-xs { padding: 0.25rem 0.6rem; font-size: 0.75rem; }
</style>
