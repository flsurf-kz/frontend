import { persistent } from "$lib/shared/api/persistent";
import type { ICreateJobCommand } from "flsurf-client";
import { writable } from "svelte/store";

export const createJobStore = persistent<ICreateJobCommand>("draftJob", {});

// Глобальный стор для ключа текущего шага
export const currentJobCreationStepKey = writable<string | undefined>(undefined);
