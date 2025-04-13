import { CurrentUser } from "$lib/entities/user/model/modal";
import { redirect } from "@sveltejs/kit";
import { get } from 'svelte/store';

export async function load() { 
    if (get(CurrentUser) !== undefined) { 
        redirect(302, "/")
    }
}