/* ------------------------------------------------------------------ */
/*  src/routes/+layout.ts (только в браузере)                         */
/* ------------------------------------------------------------------ */
import type { LayoutLoad } from './$types';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import { redirect } from '@sveltejs/kit';

import { CurrentUser } from '$lib/entities/user/model/modal';
import { loadNotifications } from '$lib/entities/notifications/modal';
import { loadTheme } from '$lib/shared/ui/theme';
import { UserEntityType, type UserEntity } from 'flsurf-client';

export const ssr = false;
export const prerender = false;

export const load: LayoutLoad = async ({ data, url }) => {
	/* 1. синхронизируем стор с server-data */
	const user = (data.currentUser ?? undefined) as UserEntity | undefined;
	CurrentUser.set(user);

	/* 2. редиректы только в браузере */
	const { pathname } = url;

	// a) NonUser → complete-profile (если не на разрешённых страницах)
	if (user && user.type === UserEntityType.NonUser) {
		const allow = [
			'/auth/complete-profile',
			'/auth/login',
			'/auth/register',
			'/auth/forgot-password',
			'/auth/reset-password',
			'/auth/secret-phrase-confirmation'
		];
		const ok = allow.includes(pathname) || pathname.startsWith('/unauth/');
		if (!ok) throw redirect(307, '/auth/complete-profile');
	}

	// b) корневой «/» перенаправляем на дашборд роли
	if (pathname === '/' && user) {
		if (user.type === UserEntityType.Client)      throw redirect(302, '/client');
		if (user.type === UserEntityType.Freelancer)  throw redirect(302, '/freelancer');
	}

	/* 3. клиентские побочные эффекты */
	if (user) loadNotifications();
	loadTheme();

	return {user};
};
