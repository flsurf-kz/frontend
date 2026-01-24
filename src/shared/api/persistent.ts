// src/lib/stores/persistent.ts
import { writable, type Writable } from 'svelte/store';
import { browser }                from '$app/environment';

/**
 * Хранимый writable-store.
 * @param key      Ключ в localStorage / sessionStorage
 * @param initial  Начальное значение
 * @param useSession true → sessionStorage, иначе localStorage
 */
export function persistent<T>(
        key: string,
        initial: T,
        useSession = false): Writable<T> {

    const storage = useSession ? sessionStorage : localStorage;

    const store = writable<T>(initial, () => {
        /* init: читаем сохранённое */
        if (browser) {
            const saved = storage.getItem(key);
            if (saved != null) {
                try { store.set(JSON.parse(saved)); }
                catch { /* ignore broken json */ }
            }
        }

        /* subscribe: пишем при каждом изменении */
        if (browser) {
            const unsub: any = store.subscribe(v =>
                storage.setItem(key, JSON.stringify(v)));
            return unsub;                   // вызовется при destroy
        }
    });

    return store;
}
