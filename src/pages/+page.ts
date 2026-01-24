import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { CurrentUser } from '$lib/entities/user/model/modal';
import { UserEntity, UserEntityType } from 'flsurf-client';
import { redirect } from '@sveltejs/kit';


export const load: PageLoad = async ({ parent, url }) => {
	// данные приходят из корневого +layout.server.ts
	const user = get(CurrentUser)

	// редиректим ТОЛЬКО авторизованных NonRoot-пользователей
	if (url.pathname === '/' && user) {
		if (user.type === UserEntityType.Client)
			throw redirect(302, '/client');

		if (user.type === UserEntityType.Freelancer)
			throw redirect(302, '/freelancer');
	}

	return {};
};