// +layout.server.ts
import { redirect } from '@sveltejs/kit';
import { getServerCurrentUser } from '$lib/entities/user/model';   // ваша функция
import { UserEntityType } from 'flsurf-client';

/**
 * На сервере:
 * • читаем пользователя (cookie / jwt / session — как настроено в getCurrentUser)
 * • выполняем единственный «умный» редирект с корня
 * • прокидываем currentUser в data → клиент
 */
export const load = async (event: any) => {
	const currentUser = await getServerCurrentUser({
		fetch: event.fetch,
		cookies: event.cookies
	});

	// если нужно закинуть в hooks/endpoint — сохраните в locals
	event.locals.currentUser = currentUser;

	// корневые редиректы
	if (event.url.pathname === '/' && currentUser?.type === UserEntityType.Client) {
		throw redirect(302, '/client');
	}
	if (event.url.pathname === '/' && currentUser?.type === UserEntityType.Freelancer) {
		throw redirect(302, '/freelancer');
	}

	return { currentUser };
};
