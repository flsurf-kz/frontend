import { GlobalClient } from "$lib/shared/api";
import { SwaggerException, UserEntity } from "flsurf-client";
import type { Exception } from "sass";
import { writable } from "svelte/store";

export let CurrentUser = writable<UserEntity>(); 

export async function getCurrentUser(): Promise<UserEntity | undefined> {  
    try { 
        let curUser = await GlobalClient.getMe(); 

        CurrentUser.set(curUser);
        return curUser; 
    } catch (error) { 
        console.error("Пользватель не авторизован", error.status); 

        return undefined; 
    }
}

export async function logout() {
    // здесь, возможно, вызов бекенда /logout
    // потом обнуляем Store
    GlobalClient.logout(); 
}
