import { getCurrentUser } from "$lib/entities/user/model";
import { redirect } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import { UserEntityType } from "flsurf-client";
import { loadNotifications } from "$lib/entities/notifications/modal";
import { loadTheme } from "$lib/shared/ui/theme";

export const ssr = false; 

export const load: LayoutLoad = async ({ url, fetch }) => { 
    var currentUser = await getCurrentUser(); 
    if (url.pathname === '/' && currentUser?.type === UserEntityType.Client) {
		throw redirect(302, '/client');
	}

	if (url.pathname === '/' && currentUser?.type === UserEntityType.Freelancer) {
		throw redirect(302, '/freelancer');
	}
    await loadNotifications(); 
    loadTheme() 

    return { 
        currentUser
    }
}
