<script lang="ts">
    import { page } from '$app/stores'; // Для получения текущего URL

    // --- Props ---
    /** Заголовок страницы (отображается во вкладке браузера и в поисковой выдаче) */
    export let title: string = 'FlSurf - Ваша фриланс биржа';

    /** Описание страницы для SEO и социальных сетей */
    export let description: string = 'FlSurf - находите заказы или исполнителей для ваших проектов. Быстро, удобно, безопасно.';

    /** URL канонической страницы (если отличается от текущей) */
    export let canonicalUrl: string | null = null;

    /** URL изображения для превью в социальных сетях (Open Graph, Twitter) */
    export let imageUrl: string | null = null; // Например, 'https://flsurf.com/og-image.png'

    /** Тип контента для Open Graph (например, 'website', 'article') */
    export let ogType: string = 'website';

    /** Запретить индексацию страницы поисковыми системами? (например, для админки, страниц авторизации) */
    export let noindex: boolean = false;

    /** Запретить поисковым роботам переходить по ссылкам на странице? */
    export let nofollow: boolean = false;

    // --- Derived values ---
    $: currentUrl = $page.url.href; // Получаем полный текущий URL
    $: effectiveCanonicalUrl = canonicalUrl || currentUrl;

    let robotsContent = '';
    $: {
        const directives = [];
        if (noindex) directives.push('noindex');
        if (nofollow) directives.push('nofollow');
        robotsContent = directives.join(', ');
    }
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
    {#if effectiveCanonicalUrl}
        <link rel="canonical" href={effectiveCanonicalUrl} />
    {/if}
    {#if robotsContent}
        <meta name="robots" content={robotsContent} />
    {/if}

    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={ogType} />
    <meta property="og:url" content={effectiveCanonicalUrl} />
    {#if imageUrl}
        <meta property="og:image" content={imageUrl} />
        {/if}
    <meta property="og:site_name" content="FlSurf" /> <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {#if imageUrl}
        <meta name="twitter:image" content={imageUrl} />
    {/if}

</svelte:head>