import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api';

/* helpers --------------------------------------------------------- */
const DEF_SIZE = 10;

export const load: PageLoad = async ({ url, depends }) => {
	/* заставляем SvelteKit инвалидацию по изменению query */
	depends('app:bookmarks');

	const page     = Number(url.searchParams.get('page')     ?? 1);
	const pageSize = Number(url.searchParams.get('pageSize') ?? DEF_SIZE);

	const start = (page - 1) * pageSize;
	const end   = start + pageSize;

	/* основной список */
	const list = await GlobalClient.getBookmarksList(start, end);

	/* берём +1 запись, чтобы понять «есть ещё» */
	const hasMore = list.length === pageSize &&
	                (await GlobalClient.getBookmarksList(end, end + 1)).length > 0;

	return {
		list,
		page,
		pageSize,
		totalPages: hasMore ? page + 1 : page          // «на глаз», без отдельного count‑API
	};
};
