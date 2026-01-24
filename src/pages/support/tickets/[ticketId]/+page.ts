// src/routes/support/tickets/[ticketId]/+page.ts
import { GlobalClient } from '$lib/shared/api';
import { CurrentUser } from '$lib/entities/user/model/modal';
import { get } from 'svelte/store';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ params, parent }: { params: any, parent: any }) => {
    const { ticketId } = params;
    const { currentUser } = await parent() as { currentUser: any };

    if (!currentUser) {
        throw redirect(303, `/auth/login?redirectTo=/support/tickets/${ticketId}`);
    }

    try {
        const ticket = await GlobalClient.getTicket(ticketId); // Assumes this returns TicketEntity with messages

        if (!ticket) {
            throw error(404, 'Тикет не найден.');
        }

        // Security check: Ensure current user is the owner of the ticket or staff
        const staffRoles = ['Admin', 'Moderator', 'Staff'];
        const isStaff = currentUser.roles?.some((role: any) => staffRoles.includes(role.name ?? ''));

        if (ticket.createdById !== currentUser.id && !isStaff) {
            throw error(403, 'У вас нет доступа к этому тикету.');
        }
        
        // Sort messages by date, assuming messages are part of TicketEntity
        if (ticket.comments) {
            ticket.comments.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
        }

        return {
            ticket,
            isStaffViewing: isStaff && ticket.createdById !== currentUser.id
        };
    } catch (e: any) {
        console.error(`Error loading ticket ${ticketId}:`, e);
        throw error(e.status || 500, e.message || 'Не удалось загрузить данные тикета.');
    }
};