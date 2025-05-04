import { GlobalClient } from "$lib/shared/api"

export const load = async ({params}) => { 
    let job = await GlobalClient.getJob(params.jobid)
    
    return { job }
}