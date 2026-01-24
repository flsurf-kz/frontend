<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import type { ClientHistoryDto } from 'flsurf-client';

    // Данные из load()
    export let data: {
        history: ClientHistoryDto[];
    };

    // Локальные копии query params
    let completedAfter  = $page.url.searchParams.get('completedAfter')  ?? '';
    let completedBefore = $page.url.searchParams.get('completedBefore') ?? '';

    // При нажатии «Применить» меняем URL и перезапускаем load()
    function applyFilters() {
        const params = new URLSearchParams($page.url.searchParams);

        if (completedAfter) {
            params.set('completedAfter', completedAfter);
        } else {
            params.delete('completedAfter');
        }

        if (completedBefore) {
            params.set('completedBefore', completedBefore);
        } else {
            params.delete('completedBefore');
        }

        goto(`${$page.url.pathname}?${params.toString()}`, { keepFocus: true });
    }

    function fmtDate(d: Date | undefined) {
        if (!d) return '';
        return new Date(d).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
</script>

<div class="container mx-auto p-4 space-y-6">
    <h1 class="text-2xl font-semibold">История клиентов</h1>

    <!-- Фильтры по дате -->
    <div class="flex flex-wrap gap-4 items-end">
        <div class="flex flex-col">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label class="text-sm">Завершено после</label>
            <input type="date"
                   bind:value={completedAfter}
                   class="input input-bordered"/>
        </div>
        <div class="flex flex-col">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label class="text-sm">Завершено до</label>
            <input type="date"
                   bind:value={completedBefore}
                   class="input input-bordered"/>
        </div>
        <button class="btn btn-primary btn-sm"
                on:click={applyFilters}>
            Применить
        </button>
    </div>

    {#if data.history.length === 0}
        <p class="text-gray-500">Нет записей за выбранный период.</p>
    {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each data.history as entry (entry.contractId)}
                <div class="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center gap-3 mb-3">
                        <img src={entry.clientAvatar?.filePath ?? '/default-avatar.svg'}
                             alt="avatar"
                             class="w-10 h-10 rounded-full object-cover"/>
                        <div class="flex flex-col">
                            <span class="font-medium">
                                {entry.clientName}
                            </span>
                            <span class="text-xs text-gray-500">
                                {fmtDate(entry.completedAt)}
                            </span>
                        </div>
                    </div>
                    <h2 class="text-lg font-semibold mb-2">
                        {entry.jobTitle}
                    </h2>
                    <p class="text-sm mb-1">
                        Выплачено: <span class="font-medium">{entry.amountEarned?.toLocaleString()} ₸</span>
                    </p>
                    <button class="btn btn-outline btn-sm w-full"
                            on:click={() => goto(`/contract/${entry.contractId}`)}>
                        Перейти к контракту
                    </button>
                </div>
            {/each}
        </div>
    {/if}
</div>
