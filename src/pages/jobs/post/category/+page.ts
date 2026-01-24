// src/routes/your-path/+page.ts
import { GlobalClient } from '$lib/shared/api'; // Adjust path if necessary
import type { CategoryEntity } from 'flsurf-client';
import type { PageLoad } from './$types'; // Using PageLoad for universal load

export const load: PageLoad = async ({ url, depends }) => {

    const searchQuery = url.searchParams.get('q') || ""; // Get search query from URL

    try {
        const categories: CategoryEntity[] = await GlobalClient.getCategories(searchQuery);
        return {
            categories,
            initialSearchQuery: searchQuery, // Pass it to the page to sync UI
            error: null
        };
    } catch (err) {
        console.error("Error fetching categories in load:", err);
        return {
            categories: [],
            initialSearchQuery: searchQuery,
            error: "Не удалось загрузить категории. Пожалуйста, попробуйте позже."
        };
    }
};