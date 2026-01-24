import { GlobalClient } from '$lib/shared/api/client.js';

export async function load({params}) { 
    let job = await GlobalClient.getRawJob(params.jobid); 
    let categories = await GlobalClient.getCategories(); 

    return { 
        job, 
        categories, 
    }
}