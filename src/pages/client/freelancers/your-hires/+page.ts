import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api'; // Ваш API клиент
import { GetFreelancerProfileListQuery, FreelancerProfileEntity } from 'flsurf-client'; // Предполагаемый тип из вашего flsurf-client
import { showError } from '$lib/shared/ui/errors'; // Ваша функция для отображения ошибок
import { CurrentUser } from '$lib/entities/user/model/modal';
import { get } from 'svelte/store';

// Определяем интерфейс для данных, возвращаемых функцией load
export interface YourHiresPageData {
    hiredProfiles: FreelancerProfileEntity[];
    error?: string;
}

export const load: PageLoad<YourHiresPageData> = async ({ parent }) => {
    // Убеждаемся, что пользователь авторизован (через родительский layout)
    if (get(CurrentUser)) {
        // Обработка случая, когда пользователь не авторизован (можно сделать редирект)
        // import { redirect } from '@sveltejs/kit';
        // throw redirect(307, '/login');
        return { hiredProfiles: [], error: "Пользователь не авторизован." };
    }

    try {
        // Загружаем список нанятых специалистов для текущего пользователя
        // Предполагается, что API эндпоинт сам определяет пользователя по сессии/токену
        const hiredProfiles = await GlobalClient.getFreelancerProfileList(new GetFreelancerProfileListQuery({
			yourHires: true, 
			start: 0, 
			ends: 10, 
		})); // Убедитесь, что такой метод есть

        return {
            hiredProfiles: hiredProfiles || [],
        };

    } catch (error: any) {
        console.error("Ошибка загрузки нанятых специалистов:", error);
        showError(error.message || "Не удалось загрузить список ваших нанятых специалистов.", true);
        return {
            hiredProfiles: [],
            error: error.message || "Не удалось загрузить список ваших нанятых специалистов."
        };
    }
};