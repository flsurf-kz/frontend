import { GlobalClient } from '$lib/shared/api/client.js';

export function load({params}) { 
    let job = GlobalClient.getJob(params.jobid); 

    return { 
        job
    }
}