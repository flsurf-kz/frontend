import { GlobalClient } from "$lib/shared/api";
import { LoginUserSchema, RegisterUserSchema, SwaggerException, UserEntity, type IRegisterUserSchema } from "flsurf-client";
import type { Exception } from "sass";
import { writable } from "svelte/store";

export let CurrentUser = writable<UserEntity | undefined>(); 

export async function getCurrentUser(): Promise<UserEntity | undefined> {  
    try { 
        let curUser = await GlobalClient.getMe(); 

        CurrentUser.set(curUser);
        return curUser; 
    } catch (error: any) { 
        console.error("Пользватель не авторизован", error.status); 

        return undefined; 
    }
}

export async function logout() {
    // здесь, возможно, вызов бекенда /logout
    // потом обнуляем Store
    GlobalClient.logout(); 
	CurrentUser.set(undefined)
	
}

export async function registerUser(payload: RegisterUserSchema): Promise<void> {
	try {
		await GlobalClient.register(payload);
		getCurrentUser(); 
		
		console.log("Пользватель зарегистрирован")
	} catch (e) {
		console.error("Ошибка регистрации", e);
		throw e;
	}
}

export async function loginUser(payload: LoginUserSchema): Promise<void> {
	try {
		await GlobalClient.login(payload);
		getCurrentUser(); 

		console.log("Пользватель авторизован")
	} catch (e) {
		console.error("Ошибка регистрации", e);
		throw e;
	}
}

