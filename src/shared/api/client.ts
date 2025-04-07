import { Client } from 'flsurf-client';
import { GlobalConfig } from '$lib/shared/config';

const backendHost = GlobalConfig.apiUrl; 

export const GlobalClient: Client = new Client(backendHost); 
