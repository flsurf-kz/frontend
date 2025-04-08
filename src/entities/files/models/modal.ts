import { GlobalClient } from '$lib/shared/api';
import type { FileParameter, FileEntity } from 'flsurf-client';

/**
 * Читает файл с использованием FileReader и возвращает данные в формате base64.
 */
export function readFileAsData(file: File): Promise<string | ArrayBuffer | null> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}

/**
 * Обрабатывает и загружает один файл:
 * - Проверяет размер
 * - Читает данные файла
 * - Формирует объект FileParameter и вызывает API uploadFile
 * Возвращает загруженный файл (FileEntity) или null при ошибке/превышении размера.
 */
export async function processAndUploadFile(file: File, maxFileSizeMB: number): Promise<FileEntity | null> {
	if (file.size > maxFileSizeMB * 1024 * 1024) {
		console.error(`Файл ${file.name} превышает допустимый размер.`);
		return null;
	}
	try {
		const data = await readFileAsData(file);
		const fileParameter: FileParameter = {
			data,
			fileName: file.name
		};
		const uploaded = await GlobalClient.uploadFile(fileParameter);
		return uploaded;
	} catch (error) {
		console.error("Ошибка загрузки файла:", error);
		return null;
	}
}

/**
 * Обрабатывает массив файлов и возвращает массив успешно загруженных файлов.
 */
export async function processAndUploadFiles(files: File[], maxFileSizeMB: number): Promise<FileEntity[]> {
	const results: FileEntity[] = [];
	for (const file of files) {
		const uploaded = await processAndUploadFile(file, maxFileSizeMB);
		if (uploaded) {
			results.push(uploaded);
		}
	}
	return results;
}
