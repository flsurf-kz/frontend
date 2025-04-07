import { Client } from 'flsurf-client';
import { GlobalConfig } from '$lib/shared/config';
import { authFetch } from './customFetch';

const backendHost = GlobalConfig.apiUrl || "http://localhost:8000"; 

export const GlobalClient: Client = new Client(backendHost, { fetch: authFetch }); 
