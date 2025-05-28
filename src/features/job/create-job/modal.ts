import type { ICreateJobCommand } from "flsurf-client";
import { writable } from "svelte/store";

export const createJobStore = writable<ICreateJobCommand>({});

// Глобальный стор для ключа текущего шага
export const currentJobCreationStepKey = writable<string | undefined>(undefined);
