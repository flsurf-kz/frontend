import { GlobalClient } from "$lib/shared/api"

export const load = async ({params}) => { 
    let job = await GlobalClient.getRawJob(params.jobid)
    
    return { job }
}