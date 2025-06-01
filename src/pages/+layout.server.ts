// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import { getServerCurrentUser } from '$lib/entities/user/model'; // Ваша функция для получения пользователя на сервере
import { UserEntityType } from 'flsurf-client'; // Ваш enum
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
    const { url, fetch: eventFetch, cookies } = event; // Деструктурируем event для удобства

    const currentUser = await getServerCurrentUser({
        fetch: eventFetch, // Передаем fetch из event для API вызовов внутри getServerCurrentUser
        cookies: cookies
    });

    // Сохраняем в locals для возможного доступа в хуках или эндпоинтах на сервере
    event.locals.currentUser = currentUser;

    // 1. Корневые редиректы для уже определенных ролей
    if (url.pathname === '/' && currentUser) {
        if (currentUser.type === UserEntityType.Client) {
            console.log(`[SERVER LAYOUT] Root redirect for Client to /client`);
            throw redirect(302, '/client'); // Укажите ваш путь к дашборду клиента
        }
        if (currentUser.type === UserEntityType.Freelancer) {
            console.log(`[SERVER LAYOUT] Root redirect for Freelancer to /freelancer`);
            throw redirect(302, '/freelancer'); // Укажите ваш путь к дашборду фрилансера
        }
        // Если тип NonUser, но он на главной, дадим ему остаться (он попадет под проверку ниже, если пойдет дальше)
    }

    // 2. Логика редиректа для пользователей с типом NonUser
    const allowedPathsForNonUser = [
        '/auth/complete-profile', // Страница выбора роли (обязательно в списке)
        '/auth/login',
        '/auth/register',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/secret-phrase-confirmation', // Если это часть флоу для NonUser
        // API пути для выхода из системы также должны быть разрешены неявно или через хуки
        // '/api/auth/logout' - обычно обрабатывается эндпоинтом напрямую
    ];

    // Нормализуем текущий путь для сравнения (убираем возможный слэш в конце, если это не корень)
    let currentPathnameNormalized = url.pathname;
    if (currentPathnameNormalized.length > 1 && currentPathnameNormalized.endsWith('/')) {
        currentPathnameNormalized = currentPathnameNormalized.slice(0, -1);
    }
    
    const isCurrentlyOnAllowedPath =
        allowedPathsForNonUser.includes(currentPathnameNormalized) ||
        currentPathnameNormalized.startsWith('/unauth/'); // Разрешаем все публичные информационные страницы

    if (currentUser && currentUser.type === UserEntityType.NonUser && !isCurrentlyOnAllowedPath) {
        console.log(`[SERVER LAYOUT] User (${currentUser.email || currentUser.id}) is NonUser. Current path: "${url.pathname}". isAllowed: ${isCurrentlyOnAllowedPath}. Redirecting to "/auth/complete-profile"`);
        throw redirect(307, '/auth/complete-profile');
    }

    // Возвращаем currentUser, чтобы он был доступен в data для +layout.ts и дочерних +page.ts (через await parent())
    return {
        currentUser 
    };
};