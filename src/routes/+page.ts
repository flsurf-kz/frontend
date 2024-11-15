// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true;

type UserInfo = { 
    Id: number 
}

export async function load({ params }) { 
    return { 
        "orders": [ 
            { 
                "id": "31321", 
                "name": "Ok", 
                "title": "dasda"
            },
            { 
                "id": "3123", 
                "name": "jdsadsa"
            }
        ]
    }
}
