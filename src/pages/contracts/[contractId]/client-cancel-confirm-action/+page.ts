// src/routes/contracts/[contractId]/client-cancel-confirm-action/+page.ts
import { GlobalClient, ClientCloseContractCommand, ContractEntityStatus } from '$lib/shared/api'; // Ensure ContractEntityStatus
import { redirect, error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { showNotification } from '$lib/shared/ui/errors/modal'; // Assuming global or through a service

export const load: PageLoad = async ({ params, url, parent }) => {
    const { contractId } = params; // contractId from path
    const { currentUser } = await parent() as { currentUser: any };

    if (!currentUser) {
        throw redirect(303, `/auth/login?redirectTo=/contracts/${contractId}`); // Redirect to contract page
    }

    // Get parameters passed from secret phrase confirmation
    const phraseConfirmed = url.searchParams.get('phraseConfirmed');
    // const confirmationToken = url.searchParams.get('confirmationToken'); // Use this in real app
    const reason = url.searchParams.get('reason') || undefined;
    const finalRedirectAfterAction = url.searchParams.get('finalRedirectAfterAction');

    // SECURITY: In a real app, validate the confirmationToken with the backend.
    // For diploma, phraseConfirmed='true' is a simplified flag.
    if (phraseConfirmed !== 'true' /* && !isValid(confirmationToken) */) {
        showNotification('Подтверждение действия недействительно или истекло. Пожалуйста, начните процесс отмены заново.', true);
        throw redirect(303, `/contracts/${contractId}`);
    }

    try {
        // Fetch contract again for final checks (status, ownership) - Backend should do this too!
        const contract = await GlobalClient.getContract(contractId);
        if (contract.employerId !== currentUser.id) {
            throw error(403, 'Действие запрещено: вы не являетесь заказчиком по этому контракту.');
        }
        if (contract.status !== ContractEntityStatus.Active && contract.status !== ContractEntityStatus.Paused) {
             showNotification(`Контракт уже в статусе "${ContractEntityStatus[contract.status!]}" и не может быть отменен таким образом.`, false);
             throw redirect(303, finalRedirectAfterAction || `/contracts/${contractId}`);
        }

        const command = new ClientCloseContractCommand({ contractId, reason });
        await GlobalClient.clientCloseContract(command);

        showNotification('Контракт успешно отменен по вашей инициативе.', false);
    } catch (e: any) {
        console.error("Error in client-cancel-confirm-action:", e);
        const errorMsg = e.response?.data?.message || e.message || 'Ошибка при отмене контракта.';
        showNotification(errorMsg, true);
    } finally {
        // Always redirect to the final destination (contract overview page)
        throw redirect(303, finalRedirectAfterAction || `/contracts/${contractId}`);
    }
    // This return is for SvelteKit, but the redirect in finally will always execute.
    return {};
};