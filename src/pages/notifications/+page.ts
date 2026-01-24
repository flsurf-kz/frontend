import { CurrentUser } from "$lib/entities/user/model/modal";
import { GlobalClient } from "$lib/shared/api";
import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";

export const ssr = false;

export async function load({ url }) { 
	const type = url.searchParams.get('type') ?? 'all';
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const pageSize = parseInt(url.searchParams.get('limit') ?? '10');

    let user = get(CurrentUser)
    if (user === undefined)
       throw redirect(302, "/")
    let notifications = await GlobalClient.getNotifications(user.id, page * (pageSize - 1), page * pageSize)
    
    return { 
        notifications, 
        meta: {
			total: notifications.length,
			currentPage: page,
			pageSize,
			type
		}
     }
}