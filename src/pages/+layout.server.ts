// src/routes/+layout.server.ts
import { getServerCurrentUser } from '$lib/entities/user/model'; // Ваша функция для получения пользователя на сервере
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const { fetch: eventFetch, cookies } = event;

	const currentUser =
		(await getServerCurrentUser({ fetch: eventFetch, cookies })) ?? undefined;

	// кладём в data → будет доступно в браузере
	return { currentUser };
};