<script lang="ts">
    import type { PageData } from './$types';
    import { goto } from '$app/navigation';
    import { GlobalClient } from '$lib/shared/api';
    import { showNotification } from '$lib/shared/ui/errors/modal';
    import { BaseButton } from '$lib/shared/ui/buttons';
    import { MetaTags } from '$lib/shared/ui/meta-tags';

    let { data } = $props(); 
    // redirectAfterSuccess is the URL for the *next step* (the actual action handler page)
    const { redirectAfterSuccess, contractId, reason, finalRedirectAfterAction } = data;

    let secretPhrase = $state('');
    let isVerifying = $state(false);
    let errorMsg = $state('');

    async function handleVerifyPhrase() {
        if (!secretPhrase.trim()) {
            errorMsg = 'Пожалуйста, введите вашу секретную фразу.';
            return;
        }
        isVerifying = true;
        errorMsg = '';
        try {
            // Backend verifies the phrase against the logged-in user's stored phrase
            // This is a CRITICAL security step.
            // const command = new VerifySecretPhraseCommand({ phrase: secretPhrase });
            // const result = await GlobalClient.verifySecretPhrase(command); // UNCOMMENT AND IMPLEMENT

            // SIMULATING SUCCESS FOR DIPLOMA IF NO BACKEND FOR PHRASE VERIFICATION YET
            const result = { succeeded: true, message: "Simulated success", data: { oneTimeToken: "SIMULATED_OTP_TOKEN_123" } }; // Replace with actual API call

            if (result.succeeded) {
                const confirmedActionUrl = new URL(redirectAfterSuccess, window.location.origin);
                
                // Pass original parameters and the confirmation token/flag to the action URL
                if (contractId) confirmedActionUrl.searchParams.set('contractId', contractId); // Usually part of path
                if (reason) confirmedActionUrl.searchParams.set('reason', reason);
                if (finalRedirectAfterAction) confirmedActionUrl.searchParams.set('finalRedirectAfterAction', finalRedirectAfterAction);
                
                // IMPORTANT: In a real app, use a secure one-time token from the backend verification result
                // confirmedActionUrl.searchParams.set('confirmationToken', result.data.oneTimeToken);
                confirmedActionUrl.searchParams.set('phraseConfirmed', 'true'); // Simple flag for diploma

                showNotification('Секретная фраза подтверждена. Выполняется действие...', false);
                goto(confirmedActionUrl.toString());
            } else {
                errorMsg = result.message || 'Неверная секретная фраза. Пожалуйста, попробуйте снова.';
                showNotification(errorMsg, true);
            }
        } catch (e: any) {
            errorMsg = e.response?.data?.message || e.message || 'Ошибка при проверке секретной фразы.';
            showNotification(errorMsg, true);
        } finally {
            isVerifying = false;
        }
    }
</script>

<MetaTags title="Подтверждение секретной фразой - FlSurf" noindex={true} />

<div class="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 card bg-base-100 shadow-xl p-8">
        <div>
            <span class="text-green-600">FLSurf.kz</span>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-base-content">
                Подтверждение действия
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                Для продолжения операции с контрактом #{contractId?.substring(0,8)}..., пожалуйста, введите вашу секретную фразу.
            </p>
        </div>
        <form class="mt-8 space-y-6" on:submit|preventDefault={handleVerifyPhrase}>
            <div class="rounded-md shadow-sm -space-y-px">
                <div>
                    <label for="secret-phrase" class="sr-only">Секретная фраза</label>
                    <input id="secret-phrase" name="secretPhrase" type="password" bind:value={secretPhrase}
                           required class="input input-bordered w-full"
                           placeholder="Ваша секретная фраза">
                </div>
            </div>

            {#if errorMsg}
                <p class="text-xs text-center text-error p-2 bg-error/10 rounded-md">{errorMsg}</p>
            {/if}

            <div>
                <BaseButton type="submit" className="btn-primary w-full" onclick={() => {}} disabled={isVerifying}>
                    {isVerifying ? 'Проверка...' : 'Подтвердить'}
                </BaseButton>
            </div>
        </form>
         <div class="text-center mt-4">
            <a href={`/contracts/${contractId}`} class="text-sm link link-hover">Отменить и вернуться к контракту</a>
        </div>
    </div>
</div>