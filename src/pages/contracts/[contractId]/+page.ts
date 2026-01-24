import { GlobalClient } from '$lib/shared/api/client.js'

export let load = async ({ params }) => { 
    let contract = await GlobalClient.getContract(params.contractId); 
    
    return { contract }
}