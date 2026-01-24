// src/routes/auth/secret-phrase-confirmation/+page.ts
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, parent }) => {
    const { currentUser } = await parent() as { currentUser: any }; // Assuming currentUser from root layout
    if (!currentUser) {
        throw redirect(303, `/auth/login?redirectTo=${url.pathname}${url.search}`);
    }

    const redirectAfterSuccess = url.searchParams.get('redirectAfterSuccess'); // This is the *actual action URL*
    const contractId = url.searchParams.get('contractId');
    const reason = url.searchParams.get('reason');
    const finalRedirectAfterAction = url.searchParams.get('finalRedirectAfterAction');

    if (!redirectAfterSuccess || !contractId || !finalRedirectAfterAction) {
        console.error("Secret phrase confirmation: Crucial parameters missing.");
        // Potentially show an error to the user before redirecting, or use showNotification store
        throw redirect(303, '/dashboard'); // Or a general error page
    }

    return {
        redirectAfterSuccess, // The URL that will perform the action (e.g., /contracts/[id]/client-cancel-confirm-action)
        contractId,
        reason,
        finalRedirectAfterAction // The URL to go to AFTER the action is successfully completed
    };
};