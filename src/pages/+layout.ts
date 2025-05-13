// +layout.ts     (работает ТОЛЬКО в браузере)
import type { LayoutLoad } from './$types';

import { CurrentUser }  from '$lib/entities/user/model/modal';   // writable‑store
import { loadNotifications } from '$lib/entities/notifications/modal';
import { loadTheme }         from '$lib/shared/ui/theme';

/** делаем страницу полностью клиентской – т.к. внутри localStorage */
export const ssr = false;

/**
 * На клиенте:
 * • кладём currentUser в store
 * • загружаем уведомления
 * • восстанавливаем тему из localStorage
 */
export const load: LayoutLoad = async ({ data }: { data: any }) => {
	CurrentUser.set(data.currentUser);   // <— store сразу готов

	await loadNotifications();           // использует fetch() в браузере
	loadTheme();                         // читает localStorage

	return {};                           // дочерние страницы получат всё через store
};
