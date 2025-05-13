import { GlobalClient } from "$lib/shared/api";
import { backendHost } from "$lib/shared/api/client";
import type { Cookies } from "@sveltejs/kit";
import { Client, LoginUserSchema, RegisterUserSchema, SwaggerException, UserEntity, type IRegisterUserSchema } from "flsurf-client";
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

interface Options {
	fetch: typeof globalThis.fetch;
	cookies: Cookies;
}

/**
 * Читает пользователя из /me.
 * Возвращает undefined, если сессии нет или токен протух.
 * Никаких Svelte‑store‑ов здесь нарочно нет — это чистая util‑ка.
 */
export async function getServerCurrentUser({ fetch, cookies }: Options) {
  const authFetch = async (url: RequestInfo | URL, init: RequestInit = {}) => {
    const cookieHeader = cookies.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    if (cookieHeader) {
      init.headers = new Headers(init.headers ?? {});
      (init.headers as Headers).set('cookie', cookieHeader);
    }
    init.credentials = 'include';
    return fetch(url, init);
  };

  const client = new Client(backendHost, { fetch: authFetch });

  try {
    const me = await client.getMe();
    return structuredClone(me);          // ✨ главное изменение
  } catch (e: any) {
    if (e?.status === 401 || e?.status === 403) return undefined;
    throw e;
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

