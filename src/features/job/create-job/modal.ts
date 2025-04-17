import type { ICreateJobCommand } from "flsurf-client";
import { writable } from "svelte/store";

export const createJobStore = writable<ICreateJobCommand>({});
