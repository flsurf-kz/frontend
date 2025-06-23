<script lang="ts">
    import type { PageData } from './$types';
    import { MetaTags } from '$lib/shared/ui/meta-tags'; // Предполагаем наличие
    // Для Markdown (если newsItem.text в Markdown):
    // import { marcado } from 'marcado'; // или 'marked'
    // import DOMPurify from 'dompurify'; // Для HTML

    export let data: PageData;
    const { newsItem } = data;

    const formatDate = (dateStr: string | Date | undefined) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Обработка основного текста новости.
    // Если newsItem.text это HTML, его нужно санитайзировать.
    // Если это Markdown, его нужно конвертировать в HTML.
    // Если это простой текст с переносами строк, можно заменить \n на <br />.
    // Для примера, предположим, что это простой текст или безопасный HTML.
    // В реальном приложении определитесь с форматом и используйте DOMPurify для HTML
    // или marcado/marked для Markdown.
    let contentHtml = '';
    if (newsItem && newsItem.text) {
        // Простейший вариант для текста с переносами строк:
        contentHtml = newsItem.text.replace(/\n/g, '<br />');
        // Если это HTML, который вы доверяете или санитайзируете на бэкенде:
        // contentHtml = newsItem.text;
        // Если это HTML от пользователя, который нужно санитайзировать:
        // if (typeof window !== 'undefined') { // DOMPurify работает только в браузере
        //     contentHtml = DOMPurify.sanitize(newsItem.text);
        // } else { // SSR - можно оставить как есть или использовать другую либу
        //     contentHtml = newsItem.text; // Осторожно!
        // }
        // Если это Markdown:
        // contentHtml = marcado(newsItem.text);
    }

    const backLinkPath = newsItem.changeNotes ? '/updates/change-notes' : '/news';
    const backLinkText = newsItem.changeNotes ? 'К списку технических обновлений' : 'Ко всем новостям';
</script>

<MetaTags
    title={newsItem.title ?? 'Новость FlSurf'}
    description={newsItem.text?.substring(0, 160) + (newsItem.text && newsItem.text.length > 160 ? '...' : '')}
/>

<div class="container mx-auto px-4 py-8 md:py-12">
    <div class="max-w-3xl mx-auto">
        <article class="card bg-base-100 shadow-xl">
            <div class="card-body">
                <a href={backLinkPath} class="text-sm link link-hover text-primary mb-4 inline-block">
                    &larr; {backLinkText}
                </a>
                <h1 class="text-3xl lg:text-4xl font-bold mb-3 leading-tight">{newsItem.title}</h1>
                <p class="text-xs text-base-content/70 mb-6">
                    Опубликовано: {formatDate(newsItem.publishTime ?? newsItem.createdAt)}
                    {#if newsItem.changeNotes}
                        <span class="badge badge-accent badge-outline badge-sm ml-2">Техническое обновление</span>
                    {/if}
                    {#if newsItem.isHidden}
                         <span class="badge badge-warning badge-outline badge-sm ml-2">Скрыто</span>
                    {/if}
                </p>

                <div class="prose prose-sm sm:prose-base max-w-none text-base-content/90 leading-relaxed">
                    {@html contentHtml}
                </div>

                {#if newsItem.attachments && newsItem.attachments.length > 0}
                    <div class="mt-8 pt-6 border-t border-base-300">
                        <h3 class="text-lg font-semibold mb-3">Прикрепленные файлы:</h3>
                        <ul class="list-disc list-inside space-y-2">
                            {#each newsItem.attachments as attachment (attachment.id)}
                                <li>
                                    <a href={attachment.filePath} target="_blank" rel="noopener noreferrer" class="link link-hover text-primary break-all">
                                        {attachment.fileName}
                                        {#if attachment.size}
                                            <span class="text-xs text-base-content/60 ml-1">({(attachment.size / 1024).toFixed(2)} MB)</span>
                                        {/if}
                                    </a>
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </div>
        </article>

         <div class="mt-10 text-center">
            <a href={backLinkPath} class="btn btn-outline btn-primary">
                {backLinkText}
            </a>
        </div>
    </div>
</div>

<style>
    /* Стили для .prose можно настроить в app.pcss или здесь, если нужно */
    .prose :global(strong) {
    }
    .prose :global(a) {
    }
    /* и т.д. для других элементов, если стандартные стили prose не подходят */
</style>