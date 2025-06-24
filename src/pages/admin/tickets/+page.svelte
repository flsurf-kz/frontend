<script lang="ts">
    import { goto } from '$app/navigation';
    import type { TicketEntity } from 'flsurf-client';
    export let data:{ todo:TicketEntity[]; active:TicketEntity[] };
</script>

<div class="container mx-auto px-4 py-8 space-y-8">
    <h1 class="text-2xl font-semibold">Центр жалоб</h1>

    <!-- НЕОБРАБОТАННЫЕ -->
    <section>
        <h2 class="text-lg font-medium mb-2">Необработанные</h2>
        {#if data.todo.length === 0}
            <p class="text-gray-500">Очередь пуста.</p>
        {:else}
            <ul class="divide-y">
                {#each data.todo as t}
                    <li class="py-3 cursor-pointer hover:bg-base-200"
                        on:click={() => goto(`/staff/ticket/${t.id}`)}>
                        <p class="font-medium">{t.subject}</p>
                        <p class="text-sm text-gray-500">
                            от {t.createdBy?.fullname} • {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <!-- В РАБОТЕ -->
    <section>
        <h2 class="text-lg font-medium mb-2">Принятые</h2>
        {#if data.active.length === 0}
            <p class="text-gray-500">Нет активных тикетов.</p>
        {:else}
            <ul class="divide-y">
                {#each data.active as t}
                    <li class="py-3 cursor-pointer hover:bg-base-200"
                        on:click={() => goto(`/staff/ticket/${t.id}`)}>
                        <p class="font-medium">{t.subject}</p>
                        <p class="text-sm text-gray-500">
                            модератор: {t.assignedUser?.fullname ?? '—'}
                            • {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                    </li>
                {/each}
            </ul>
        {/if}
    </section>
</div>
