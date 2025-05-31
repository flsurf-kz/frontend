import { goto } from '$app/navigation';
import { CurrentUser } from '$lib/entities/user/model/modal';
import { UserEntityType } from 'flsurf-client';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';

export const load: PageLoad = async () => {
    let currentUser = get(CurrentUser)
    
    if (currentUser === undefined)
        return 

    if (currentUser.type == UserEntityType.NonUser) { 
        goto("/auth/complete-profile")
    } 
};
