// src/routes/contracts/[contractId]/freelancer-cancel-confirm-action/+page.ts
import { GlobalClient, FreelancerCancelContractCommand, ContractEntityStatus } from '$lib/shared/api';
import { redirect, error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { showNotification } from '$lib/shared/ui/errors/modal';

export const load: PageLoad = async ({ params, url, parent }) => {
    const { contractId } = params;
    const { currentUser } = await parent() as { currentUser: any };

    if (!currentUser) {
        throw redirect(303, `/auth/login?redirectTo=/contracts/${contractId}`);
    }

    const phraseConfirmed = url.searchParams.get('phraseConfirmed');
    const reason = url.searchParams.get('reason') || undefined;
    const finalRedirectAfterAction = url.searchParams.get('finalRedirectAfterAction');

    if (phraseConfirmed !== 'true') {
        showNotification('Подтверждение действия недействительно или истекло. Пожалуйста, начните процесс отказа заново.', true);
        throw redirect(303, `/contracts/${contractId}`);
    }

    try {
        const contract = await GlobalClient.getContract(contractId);
        if (contract.freelancerId !== currentUser.id) {
            throw error(403, 'Действие запрещено: вы не являетесь исполнителем по этому контракту.');
        }
        if (contract.status !== ContractEntityStatus.Active && contract.status !== ContractEntityStatus.Paused) {
             showNotification(`Контракт уже в статусе "${ContractEntityStatus[contract.status!]}" и не может быть отменен таким образом.`, false);
             throw redirect(303, finalRedirectAfterAction || `/contracts/${contractId}`);
        }

        const command = new FreelancerCancelContractCommand({ contractId, reason });
        await GlobalClient.freelancerCancelContract(command);

        showNotification('Вы успешно отказались от выполнения контракта.', false);
    } catch (e: any) {
        console.error("Error in freelancer-cancel-confirm-action:", e);
        const errorMsg = e.response?.data?.message || e.message || 'Ошибка при отказе от контракта.';
        showNotification(errorMsg, true);
    } finally {
        throw redirect(303, finalRedirectAfterAction || `/contracts/${contractId}`);
    }
    return {};
};