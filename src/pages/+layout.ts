import { getCurrentUser } from "$lib/entities/user/model";
import type { LayoutLoad } from "./$types";

export const ssr = false;

export const load: LayoutLoad = async () => { 
    var currentUser = await getCurrentUser(); 

    return { 
        currentUser
    }
}
