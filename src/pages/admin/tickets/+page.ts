import { error, redirect } from '@sveltejs/kit';
import { GlobalClient }      from '$lib/shared/api';
import {
    GetTicketsDto,
    TicketEntityStatus,
    UserEntityRole,
    type TicketEntity
} from 'flsurf-client';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { CurrentUser } from '$lib/entities/user/model/modal';

export const load: PageLoad = async () => {
    const currentUser = get(CurrentUser)
    if (!currentUser || currentUser.role !== UserEntityRole.Moderator && currentUser.role !== UserEntityRole.Admin) {
        throw redirect(302, '/');
    }

    const dto = new GetTicketsDto({});
    let list: TicketEntity[] = [];
    try { list = await GlobalClient.getTickets(dto); }
    catch (e) { console.error(e); throw error(500,'Не удалось получить тикеты'); }

    return {
        todo:   list.filter(t => !t.assignedUserId && t.status === TicketEntityStatus.Open),
        active: list.filter(t =>  t.assignedUserId && t.status === TicketEntityStatus.Open)
    };
};
