// +layout.ts (работает ТОЛЬКО в браузере из-за ssr=false)
import type { LayoutLoad } from './$types';
import { CurrentUser } from '$lib/entities/user/model/modal'; // writable-store
import { loadNotifications } from '$lib/entities/notifications/modal';
import { loadTheme } from '$lib/shared/ui/theme';
import { UserEntity, UserEntityType } from 'flsurf-client';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { page } from '$app/state';
import { GlobalClient } from '$lib/shared/api';

/** делаем страницу полностью клиентской – т.к. внутри localStorage */
export const ssr = false;
export const prerender = false;

export const load: LayoutLoad = async ({ data }: { data: any }) => { // `data` здесь приходит из `+layout.server.ts`
    if (!data) {
        let user = await GlobalClient.getMe();
        if (!user) { 
            return { }
        } 
        data.currentUser = user; 
    }
    const serverUser = data.currentUser as UserEntity | undefined; // Пользователь, загруженный на сервере

    // 1. Инициализируем стор CurrentUser данными с сервера (или null, если их нет)
    CurrentUser.set(serverUser);

    // 2. Загружаем клиентские вещи
    if (serverUser) { // Только если пользователь существует (был загружен сервером)
        loadNotifications(); // использует fetch() в браузере
    }
    loadTheme(); // Загрузка темы может быть не связана с пользователем

    return {}; // Данные для дочерних страниц теперь будут браться из сторов или data от +page.server.ts / +page.ts
};