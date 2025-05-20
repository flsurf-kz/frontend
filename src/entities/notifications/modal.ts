import { get, writable } from "svelte/store";
import { CurrentUser } from "../user/model/modal";
import { GlobalClient } from "$lib/shared/api";
import { NotificationEntity } from "flsurf-client";

export let CurrentNotifications = writable<NotificationEntity[] | undefined>(); 

export async function loadNotifications(): Promise<NotificationEntity[] | undefined> { 
    let user = get(CurrentUser)
    
    if (user === undefined) 
        return undefined;  

    let userId = user.id; 
    let notifications = await GlobalClient.getNotifications(userId, 0, 10); 

    CurrentNotifications.set(notifications)

    return notifications; 
}