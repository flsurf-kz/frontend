import { GlobalClient } from "$lib/shared/api";
import { UserEntity } from "flsurf-client";
import { writable } from "svelte/store";

export let CurrentUser = writable<UserEntity>(); 

export async function getCurrentUser(): Promise<UserEntity | undefined> {  
    try { 
        let curUser = await GlobalClient.getMe(); 

        CurrentUser.set(curUser);
        return curUser; 
    } catch (error) { 
        console.error(error); 

        return undefined; 
    }
}
