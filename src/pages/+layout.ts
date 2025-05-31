// +layout.ts (работает ТОЛЬКО в браузере из-за ssr=false)
import type { LayoutLoad } from './$types';
import { CurrentUser } from '$lib/entities/user/model/modal'; // writable-store
import { loadNotifications } from '$lib/entities/notifications/modal';
import { loadTheme } from '$lib/shared/ui/theme';
import { UserEntity, UserEntityType } from 'flsurf-client';
import { redirect } from '@sveltejs/kit';

/** делаем страницу полностью клиентской – т.к. внутри localStorage */
export const ssr = false;

export const load: LayoutLoad = async ({ url, data }) => { // `data` здесь приходит из `+layout.server.ts`
    const serverUser = data.currentUser as UserEntity | undefined; // Пользователь, загруженный на сервере

    // 1. Инициализируем стор CurrentUser данными с сервера (или null, если их нет)
    CurrentUser.set(serverUser);

    // 2. Загружаем клиентские вещи
    if (serverUser) { // Только если пользователь существует (был загружен сервером)
        loadNotifications(); // использует fetch() в браузере
    }
    loadTheme(); // Загрузка темы может быть не связана с пользователем

    // 3. Логика редиректа для NonUser (выполняется на клиенте)
    const allowedPathsForNonUser = [
        '/auth/complete-profile',
        '/auth/login',
        '/auth/register',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/secret-phrase-confirmation', // Если это часть процесса для NonUser
    ];

    const isCurrentlyOnAllowedPath =
        allowedPathsForNonUser.some(allowedPath => 
            url.pathname === allowedPath || 
            (allowedPath !== '/' && url.pathname.startsWith(allowedPath))
        ) ||
        url.pathname.startsWith('/unauth/');

    if (serverUser && serverUser.type === UserEntityType.NonUser && !isCurrentlyOnAllowedPath) {
        console.log(`[LayoutLoad Client] User (${serverUser.email}) is NonUser, redirecting from "${url.pathname}" to "/auth/complete-profile"`);
        throw redirect(307, '/auth/complete-profile');
    }

    // getCurrentUser() на клиенте больше не нужен здесь, если сервер уже предоставляет currentUser.
    // Если getCurrentUser() - это дополнительная клиентская проверка или обновление,
    // ее следует вызывать очень осторожно, чтобы не вызвать циклы с серверными данными.
    // Обычно, после установки CurrentUser.set(serverUser), дальнейшие проверки идут через стор.

    return {}; // Данные для дочерних страниц теперь будут браться из сторов или data от +page.server.ts / +page.ts
};