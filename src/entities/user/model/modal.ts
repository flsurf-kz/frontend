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
	fetch: typeof fetch;
	cookies: Cookies;
}

export async function getServerCurrentUser({ fetch, cookies }: Options) {
  const authFetch = async (url: RequestInfo | URL, init: RequestInit = {}) => {
    const cookieHeader = cookies.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    if (cookieHeader) {
      init.headers = new Headers(init.headers ?? {});
      (init.headers as Headers).set('cookie', cookieHeader);
    } 
    init.credentials = 'include'; // Важно для передачи кук
    return fetch(url, init as RequestInit);
  };

  // Предполагается, что Client - это ваш NSwag/OpenAPI сгенерированный клиент
  // и backendHost - это URL вашего API, например "http://localhost:7000"
  const client = new Client(backendHost, { fetch: authFetch });

  try {
    const me = await client.getMe(); // Запрос к эндпоинту /api/me или аналогичному
    return structuredClone(me);       // ✨ главное изменение - глубокое клонирование
  } catch (e: any) {
    // Если /me возвращает 401 (Unauthorized) или 403 (Forbidden), 
    // это значит, что пользователь не аутентифицирован или не имеет прав.
    // В этом случае корректно вернуть undefined (или null), что означает "нет пользователя".
    if (e?.status === 401 || e?.status === 403) {
        console.log('[getServerCurrentUser] No authenticated user (401/403 from /me)');
        return undefined; // или null
    }
    // Если произошла другая ошибка (например, бэкенд недоступен),
    // то выбрасываем ее дальше, чтобы SvelteKit обработал как ошибку загрузки.
    console.error('[getServerCurrentUser] Error fetching current user:', e);
    throw e; 
  }
}

export async function getMeSafe(): Promise<UserEntity | undefined> {
	try {
		return await GlobalClient.getMe();       // ваш API-обёртка
	} catch (e: any) {
		if (e.status === 401) return null;       // просто гость
		throw e;                                // остальные ошибки наружу
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
		await getCurrentUser(); 
		
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

