import { writable } from 'svelte/store';

export type ErrorMessage = {
	id: number;
	message: string;
	critical: boolean;
};

// Глобальный store для ошибок
export const errorMessages = writable<ErrorMessage[]>([]);

/**
 * Регистрирует новое сообщение об ошибке.
 * @param message Текст ошибки
 * @param critical Если true, ошибка считается критической и вызывает "краш" (оверлей)
 */
export function showError(message: string, critical: boolean = false): void {
	errorMessages.update(errors => [
		...errors,
		{ id: Date.now(), message, critical }
	]);
}

/**
 * Удаляет сообщение об ошибке по идентификатору.
 * @param id Идентификатор ошибки
 */
export function clearError(id: number): void {
	errorMessages.update(errors => errors.filter(e => e.id !== id));
}
