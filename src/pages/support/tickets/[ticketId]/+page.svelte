<script lang="ts">
    import type { PageData } from './$types';
    import { MetaTags } from '$lib/shared/ui/meta-tags';
    import { GlobalClient } from '$lib/shared/api'; // Adjust DTOs
    import { showNotification } from '$lib/shared/ui/errors/modal';
    import { CurrentUser } from '$lib/entities/user/model/modal'; // For current user ID
    import { get } from 'svelte/store';
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
    import { invalidateAll } from '$app/navigation';


    let { data } = $props();
    let ticket = $state(data.ticket); // Make it reactive
    const { isStaffViewing } = data; // To know if staff is viewing someone else's ticket

    let newMessageText = $state('');
    let isSendingMessage = $state(false);
    let isClosingTicket = $state(false);

    const currentUser = get(CurrentUser);

    const formatDate = (dateStr: string | Date | undefined) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
    };

    // Copy from list page or make global
    const ticketStatusText: Record<TicketStatus, string> = {
        [TicketStatus.Open]: 'Открыт',
        [TicketStatus.PendingUserResponse]: 'Ожидает вашего ответа',
        [TicketStatus.PendingStaffResponse]: 'Ожидает ответа поддержки',
        [TicketStatus.Resolved]: 'Решен',
        [TicketStatus.Closed]: 'Закрыт',
        [TicketStatus.OnHold]: 'На удержании',
    };
     const ticketStatusClass: Record<TicketStatus, string> = {
        [TicketStatus.Open]: 'badge-info',
        [TicketStatus.PendingUserResponse]: 'badge-warning',
        [TicketStatus.PendingStaffResponse]: 'badge-accent',
        [TicketStatus.Resolved]: 'badge-success',
        [TicketStatus.Closed]: 'badge-ghost',
        [TicketStatus.OnHold]: 'badge-neutral',
    };


    async function handleAddMessage() {
        if (!newMessageText.trim()) {
            showNotification('Сообщение не может быть пустым.', true);
            return;
        }
        isSendingMessage = true;
        try {
            const command = new AddMessageToTicketCommand({ // Ensure this command DTO is correct
                ticketId: ticket.id,
                text: newMessageText.trim(),
                // Backend determines if it's from staff or user based on auth
            });
            // Assuming addMessageToTicket returns the new message or updated ticket
            const updatedTicketOrMessage = await GlobalClient.addMessageToTicket(command); // Adjust API call

            newMessageText = '';
            showNotification('Ваше сообщение добавлено.', false);
            // Refresh ticket data to get all new messages and status updates
            const refreshedTicket = await GlobalClient.getTicket(ticket.id!);
            if (refreshedTicket.messages) {
               refreshedTicket.messages.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
            }
            ticket = refreshedTicket;

        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || 'Не удалось добавить сообщение.';
            showNotification(errorMsg, true);
        } finally {
            isSendingMessage = false;
        }
    }

    async function handleCloseTicket() {
        if (!confirm('Вы уверены, что хотите закрыть этот тикет? Если проблема не решена, вы всегда можете создать новый.')) {
            return;
        }
        isClosingTicket = true;
        try {
            const command = new CloseTicketCommand({ ticketId: ticket.id }); // Ensure correct command
            await GlobalClient.closeTicket(command); // Adjust API call for user closing ticket

            showNotification('Тикет успешно закрыт.', false);
            const refreshedTicket = await GlobalClient.getTicket(ticket.id!);
            ticket = refreshedTicket; // Update status
            // invalidateAll(); // Or just update local state
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || 'Не удалось закрыть тикет.';
            showNotification(errorMsg, true);
        } finally {
            isClosingTicket = false;
        }
    }

    // For staff actions (example, real staff actions would be more complex)
    async function handleStaffResolveTicket() {
        if (!isStaffViewing && ticket.userId !== currentUser?.id ) return; // Basic check
        // const command = new ResolveTicketByStaffCommand({ ticketId: ticket.id, resolutionNotes: "..."});
        // await GlobalClient.resolveTicketByStaff(command);
        alert("Функционал решения тикета для персонала еще не реализован.");
    }

</script>

<MetaTags title={`Тикет #${ticket.id?.substring(0,8)}: ${ticket.title} - FlSurf`} />

<div class="container mx-auto px-4 py-8 md:py-12">
    <div class="max-w-3xl mx-auto">
        <a href="/support/tickets" class="text-sm link link-hover text-primary mb-4 inline-block">&larr; К списку моих тикетов</a>
        
        <div class="card bg-base-100 shadow-xl mb-6">
            <div class="card-body">
                <div class="flex justify-between items-start">
                    <h1 class="card-title text-2xl">{ticket.title}</h1>
                    <span class="badge {ticketStatusClass[ticket.status!]} mt-1">{ticketStatusText[ticket.status!] ?? ticket.status}</span>
                </div>
                <p class="text-xs text-gray-500">
                    ID: {ticket.id} | Создан: {formatDate(ticket.createdAt)} | Обновлен: {formatDate(ticket.lastUpdatedAt)}
                </p>
                {#if ticket.category} <p class="text-sm"><strong>Категория:</strong> {ticket.category}</p>{/if}
                {#if ticket.priority} <p class="text-sm"><strong>Приоритет:</strong> {ticket.priority}</p>{/if}
                
                <div class="mt-4 prose prose-sm max-w-none">
                    <h3 class="font-semibold">Первоначальное обращение:</h3>
                    <p>{ticket.description}</p>
                </div>
            </div>
        </div>

        <h2 class="text-xl font-semibold mb-4">История переписки:</h2>
        <div class="space-y-4 mb-8">
            {#if ticket.messages && ticket.messages.length > 0}
                {#each ticket.messages as message (message.id)}
                    {@const isCurrentUserMessage = message.userId === currentUser?.id}
                    <div class="chat {isCurrentUserMessage ? 'chat-end' : 'chat-start'}">
                        <div class="chat-header text-xs opacity-70 mb-1">
                            {message.userFullname ?? (message.isFromStaff ? 'Поддержка FlSurf' : 'Пользователь')}
                            <time class="ml-1">{formatDate(message.createdAt)}</time>
                        </div>
                        <div class="chat-bubble {isCurrentUserMessage ? 'chat-bubble-primary' : 'chat-bubble-secondary'} text-sm whitespace-pre-wrap">
                            {message.text}
                        </div>
                    </div>
                {/each}
            {:else}
                <p class="text-sm text-gray-500 italic">Сообщений по этому тикету пока нет, кроме первоначального описания.</p>
            {/if}
        </div>

        {#if ticket.status !== TicketStatus.Closed && ticket.status !== TicketStatus.Resolved}
            <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title text-lg">Ваш ответ:</h2>
                    <form on:submit|preventDefault={handleAddMessage} class="space-y-3">
                        <textarea class="textarea textarea-bordered w-full h-28" bind:value={newMessageText} placeholder="Введите ваше сообщение..." required></textarea>
                        <div class="card-actions justify-between items-center">
                             {#if (ticket.userId === currentUser?.id && !isStaffViewing) || (isStaffViewing && ticket.userId !== currentUser?.id)} <BaseButton type="submit" className="btn-primary btn-sm" isLoading={isSendingMessage} disabled={isSendingMessage || !newMessageText.trim()}>
                                    {isSendingMessage ? 'Отправка...' : 'Отправить сообщение'}
                                </BaseButton>
                             {/if}

                            {#if ticket.userId === currentUser?.id && !isStaffViewing } <BaseButton className="btn-outline btn-sm btn-warning" onclick={handleCloseTicket} isLoading={isClosingTicket} disabled={isClosingTicket}>
                                    {isClosingTicket ? 'Закрытие...' : 'Закрыть тикет (если решен)'}
                                </BaseButton>
                            {/if}
                            {#if isStaffViewing } <BaseButton className="btn-outline btn-sm btn-success" onclick={handleStaffResolveTicket}>
                                    Пометить как "Решен" (Staff)
                                </BaseButton>
                            {/if}
                        </div>
                    </form>
                </div>
            </div>
        {/if}
    </div>
</div>