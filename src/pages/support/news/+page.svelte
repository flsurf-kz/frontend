<script lang="ts">
    import type { NewsEntity } from 'flsurf-client';
    import { MetaTags } from '$lib/shared/ui/meta-tags';
    import { page as pageStore } from '$app/stores';
    import { goto } from '$app/navigation';

    let { data } = $props(); 
    let { newsItems, currentPage, hasNextPage, newsType } = $derived(data);

    const totalPages = $derived(Math.ceil(newsItems.length / currentPage * 10));
    // svelte-ignore state_referenced_locally
    const pageTitle = newsType === 'change-notes' ? "Технические обновления (Change Notes)" : "Новости и обновления FlSurf";

    const formatDate = (dateStr: string | Date | undefined) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
    };


    function handlePageChange(newPage: number) {
        // Мы не можем перейти на страницу > currentPage + 1, если не знаем, существует ли она.
        // И не можем перейти на страницу < 1.
        if (newPage < 1) return;
        if (!hasNextPage && newPage > currentPage) return; // Нельзя перейти дальше, если нет следующей страницы

        const searchParams = new URLSearchParams($pageStore.url.searchParams); // pageStore из $app/stores
        searchParams.set('page', newPage.toString());
        goto(`?${searchParams.toString()}`, { keepFocus: true }); // invalidateAll не всегда нужен если только query param меняется и load перевыполняется
    }
</script>

<MetaTags title={pageTitle} description="Последние новости, обновления платформы и важные объявления от команды FlSurf." />

<div class="container mx-auto px-4 py-8 md:py-12">
    <h1 class="text-3xl font-bold mb-8 text-center">{pageTitle}</h1>

    {#if newsItems.length > 0}
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each newsItems as item (item.id)}
                <a href={`/news/${item.id}`} class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out group">
                    <div class="card-body">
                        {#if item.attachments !== undefined && item.attachments.length > 0} <figure class="mb-4 h-40 overflow-hidden rounded-md">
                                <img src={item.attachments[0].filePath} alt={item.title ?? 'News image'} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </figure>
                        {/if}
                        <h2 class="card-title text-lg group-hover:text-primary transition-colors">{item.title}</h2>
                        <p class="text-xs text-gray-500 mb-2">Опубликовано: {formatDate(item.createdAt)}</p>
                        <p class="text-sm text-base-content/80 line-clamp-3">{item.text.substring(0, 150) + '...'}</p>
                        <div class="card-actions justify-end mt-4">
                            <span class="btn btn-sm btn-ghost btn-primary group-hover:btn-active">Читать далее &rarr;</span>
                        </div>
                    </div>
                </a>
            {/each}
        </div>

        {#if totalPages > 1}
            <div class="flex justify-center items-center space-x-2 mt-10">
                <button class="btn btn-sm btn-outline" onclick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&laquo; Назад</button>
                <span class="text-sm">Стр. {currentPage} из {totalPages}</span>
                <button class="btn btn-sm btn-outline" onclick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Вперед &raquo;</button>
            </div>
        {/if}
    {:else}
         <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h.008v.008H8.25v-.008zm0 3h.008v.008H8.25v-.008zm0-3h.008v.008H8.25v-.008zm0-3h.008v.008H8.25v-.008zM12 6.375h3.375m-3.375 3.375h3.375m-3.375 3.375h3.375M12 15.75h3.375M6 6l.25-1.5H4.5m0 0l-.25 1.5M4.5 6h1.5m0 0l.25 1.5M4.5 9h1.5m0 0l.25 1.5M4.5 12h1.5m0 0l.25 1.5M4.5 15h1.5m0 0l.25 1.5" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Новостей пока нет</h3>
            <p class="mt-1 text-sm text-gray-500">Загляните позже, чтобы узнать о последних обновлениях.</p>
        </div>
    {/if}
</div>