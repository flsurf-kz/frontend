// authFetch.ts
/**
 * Кастомная обёртка над fetch, которая:
 * - Всегда отправляет куки (credentials: 'include')
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const finalInit: RequestInit = {
      ...init,
      credentials: "include" // отправка куки при запросах
    };

    return await fetch(input, finalInit);
}
  