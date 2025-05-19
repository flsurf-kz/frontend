<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { loadStripe, type Stripe, type StripeElements, type StripePaymentElement } from '@stripe/stripe-js';
    import { GlobalClient } from '$lib/shared/api';
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
    import { InputField } from '$lib/shared/ui/inputs';
    import { 
        AddPaymentMethodCommand, 
        Money, 
        MoneyCurrency, // Используем MoneyCurrency из flsurf-client
        PaymentMethodDto, 
        StartPaymentFlowCommand, 
        StartPaymentFlowCommandFlow, 
        StartPaymentFlowCommandType, 
        TransactionProviderEntity,
        type WalletEntity // Импортируем тип WalletEntity
    } from 'flsurf-client';
    import { GlobalConfig } from '$lib/shared/config';
    import { showError } from '$lib/shared/ui/errors'; // Убедитесь, что showNotification тоже импортирована
    import { writable, get } from 'svelte/store';
    import { page } from '$app/stores'; // Для return_url
    import { goto } from '$app/navigation';
    // import { CurrencyEnum } from '$lib/entities/payment/enums/currency'; // Если MoneyCurrency из flsurf-client используется, этот локальный enum может быть не нужен или должен быть согласован

    // Импортируем тип данных страницы из сгенерированного SvelteKit $types
    import type { PageData } from './$types';

    export let data: PageData; // data теперь имеет тип PaymentPageData (WalletEntity | null, и т.д.)

    let stripeInstance: Stripe | null = null;
    let elements: StripeElements | null = null;
    let paymentElement: StripePaymentElement | null = null;
    let paymentElementDiv: HTMLDivElement;

    const isLoading = writable(false);
    const isStripeElementReady = writable(false);
    let currentClientSecret: string | null = null;
    let currentStripeIntentType: 'setupIntent' | 'paymentIntent' = 'setupIntent';
    let currentInternalTransactionId: string | null = null; // Для ID нашей транзакции
    let currentStripePaymentIntentId: string | null = null; // Для Stripe Payment Intent ID

    // Используем данные из props для инициализации
    let selectedProviderId: string = data.providers?.find(p => p.name?.toLowerCase().includes('stripe'))?.id ?? data.providers?.[0]?.id ?? '';
    let selectedSystemId: string = '';

    // Для пополнения баланса
    let topUpAmount: number = 1000;
    // Валюта берется из кошелька пользователя или KZT по умолчанию
    // Предполагаем, что WalletEntity.currency это enum, совместимый с MoneyCurrency
    let topUpCurrency: string = data.wallet?.currency?.toString() ?? "KZT"; // Используем строковое представление для select, потом преобразуем в MoneyCurrency

    // Реактивное обновление selectedSystemId и topUpCurrency
    $: {
        if (selectedProviderId && data.providers) {
            const provider = data.providers.find(p => p.id === selectedProviderId);
            if (provider?.systems?.length) {
                const currentSystemIsValid = provider.systems.some(s => s.id === selectedSystemId);
                if (!currentSystemIsValid || !selectedSystemId) {
                    selectedSystemId = provider.systems[0].id;
                }
            } else {
                selectedSystemId = '';
            }
        }
    }
    // Обновляем валюту пополнения, если изменился кошелек (например, после успешного пополнения и перезагрузки данных)
    $: topUpCurrency = data.wallet?.currency?.toString() ?? "KZT";

    async function initializeStripe(intentType: 'setupIntent' | 'paymentIntent') {
        if (!paymentElementDiv) {
            showError("Элемент для встраивания формы Stripe не найден. Пожалуйста, обновите страницу.", true);
            return;
        }
        if (!selectedProviderId) {
            showError("Пожалуйста, выберите платежного провайдера.", true);
            return;
        }
        
        currentStripeIntentType = intentType;
        isLoading.set(true);
        isStripeElementReady.set(false);
        if (paymentElement) paymentElement.destroy(); // Уничтожаем предыдущий элемент

        try {
            let serverResponse: any; // Для хранения ответа от бэкенда

            if (intentType === 'setupIntent') {
                serverResponse = await GlobalClient.createSetupIntent({
                    providerId: selectedProviderId,
                    systemId: selectedSystemId // Если ваш API его принимает
                });
                currentClientSecret = serverResponse.clientSecret;
            } else { // paymentIntent для пополнения
                if (topUpAmount <= 0) {
                    showError("Сумма пополнения должна быть больше нуля.", true);
                    isLoading.set(false);
                    return;
                }
                // Преобразование строковой валюты в enum MoneyCurrency
                const currencyKey = topUpCurrency.toUpperCase() as keyof typeof MoneyCurrency;
                const moneyCurrencyEnumValue = MoneyCurrency[currencyKey];

                if (moneyCurrencyEnumValue === undefined) {
                    showError(`Неподдерживаемая валюта: ${topUpCurrency}`, true);
                    isLoading.set(false);
                    return;
                }
                
                serverResponse = await GlobalClient.startPaymentFlow(
                    new StartPaymentFlowCommand ({
                        amount: new Money({ amount: topUpAmount, currency: moneyCurrencyEnumValue }),
                        flow: StartPaymentFlowCommandFlow.Incoming,
                        type: StartPaymentFlowCommandType.Deposit, // Используйте ваш TransactionType.TOP_UP если он так называется
                        providerId: selectedProviderId,
                        // systemId: selectedSystemId, // Передаем, если StartPaymentFlowCommand принимает
                    })
                );
                // Предполагаем, что StartPaymentFlowHandler возвращает структуру, совместимую с InitPaymentResult
                // и что CommandResult.data содержит этот объект.
                if (serverResponse.isSuccess && serverResponse.data?.clientSecret) {
                    currentClientSecret = serverResponse.data.clientSecret;
                    currentStripePaymentIntentId = serverResponse.data.providerPaymentId; // Stripe PaymentIntent ID
                    currentInternalTransactionId = serverResponse.data.internalTransactionId; // Ваш внутренний ID транзакции (ВАЖНО: бэкенд должен его вернуть!)
                                                                                                // Если ваш StartPaymentFlowHandler возвращает просто CommandResult<Guid> (ID транзакции), то:
                                                                                                // currentInternalTransactionId = serverResponse.data; (если data это ID)
                                                                                                // И clientSecret/providerPaymentId должны быть в другом поле, или нужно изменить ответ StartPaymentFlowHandler
                } else {
                    throw new Error(serverResponse.message || serverResponse.errorMessage || "Не удалось инициировать платеж на сервере.");
                }
            }

            if (!currentClientSecret) throw new Error("Client secret не получен от сервера.");

            if (!stripeInstance) stripeInstance = await loadStripe(GlobalConfig.stripePublicKey);
            if (!stripeInstance) throw new Error("Stripe.js не загружен.");

            elements = stripeInstance.elements({ clientSecret: currentClientSecret });
            paymentElement = elements.create('payment', {
                /* layout: 'tabs' */
            });
            paymentElement.mount(paymentElementDiv);
            isStripeElementReady.set(true);

        } catch (err: any) {
            showError(err.message || "Ошибка инициализации платежной формы.", true);
            console.error("Stripe Init Error:", err);
            isStripeElementReady.set(false);
            currentClientSecret = null; // Сбрасываем, чтобы можно было попробовать снова
        } finally {
            isLoading.set(false);
        }
    }
    
    async function handleAddCard() {
        if (!stripeInstance || !elements || !currentClientSecret || currentStripeIntentType !== 'setupIntent') {
            if (get(isLoading)) return; // Предотвратить двойной клик
            await initializeStripe('setupIntent'); // Попытка инициализации
            if (!stripeInstance || !elements || !currentClientSecret) { // Проверка после попытки
                 showError("Форма добавления карты не готова. Выберите провайдера и попробуйте снова.", true);
                 return;
            }
        }
        isLoading.set(true);
        const { error, setupIntent } = await stripeInstance.confirmSetup({
            elements,
            confirmParams: { return_url: `${window.location.origin}${$page.url.pathname}` },
            redirect: 'if_required'
        });

        if (error) {
            showError(error.message ?? "Ошибка подтверждения карты Stripe.");
        } else if (setupIntent?.status === 'succeeded') {
            const token = setupIntent.payment_method; // Это Stripe PaymentMethod ID (pm_...)
            if (!token) {
                showError("Stripe не вернул токен метода оплаты.", true);
                isLoading.set(false); return;
            }
            try {
                await GlobalClient.addPaymentMethod(new AddPaymentMethodCommand({
                    providerId: selectedProviderId,
                    paymentMethodToken: typeof token === 'string' ? token : token.id, // Stripe возвращает объект или строку
                    makeDefault: (data.methods?.length || 0) === 0
                }));
                showError("Карта успешно добавлена!");
                // Обновить список карт - либо перезагрузка страницы, либо вызов функции из +page.ts (invalidate)
                goto($page.url.pathname, { invalidateAll: true }); // Перезагрузит данные через load функцию
            } catch (e: any) {
                showError(e.message || "Ошибка сохранения карты на сервере.", true);
            }
        } else if (setupIntent) {
            showError(`Статус настройки карты: ${setupIntent.status}. Возможно, требуется дополнительное действие.`);
        }
        isLoading.set(false);
    }

    async function handleTopUp() {
        if (currentStripeIntentType !== 'paymentIntent' || !currentClientSecret || !stripeInstance || !elements) {
            if (get(isLoading)) return;
            await initializeStripe('paymentIntent');
            if (!stripeInstance || !elements || !currentClientSecret) {
                 showError("Форма пополнения не готова. Введите сумму, выберите провайдера и попробуйте снова.", true);
                 return;
            }
        }
        if (topUpAmount <= 0) {
             showError("Сумма пополнения должна быть положительной.");
             return;
        }
        isLoading.set(true);

        // Убедитесь, что currentInternalTransactionId и currentStripePaymentIntentId были установлены в initializeStripe
        if (!currentInternalTransactionId || !currentStripePaymentIntentId) {
            showError("Ошибка: Отсутствуют необходимые идентификаторы для завершения платежа. Попробуйте инициализировать форму снова.");
            isLoading.set(false);
            return;
        }

        const returnUrl = `${window.location.origin}/wallet/payment-status?internal_transaction_id=${currentInternalTransactionId}&payment_intent_id=${currentStripePaymentIntentId}&payment_intent_client_secret=${currentClientSecret}`;

        const { error, paymentIntent } = await stripeInstance.confirmPayment({
            elements,
            confirmParams: { return_url: returnUrl },
            redirect: 'if_required'
        });

        if (error) {
            showError(error.message ?? "Ошибка при обработке пополнения.");
        } else if (paymentIntent) {
            // Если redirect: 'if_required' и не было редиректа, значит либо успех, либо другой статус
            // Окончательный статус лучше всего обрабатывать на странице return_url и через вебхуки.
            if (paymentIntent.status === 'succeeded') {
                showError("Платеж успешно инициирован! Средства будут зачислены после подтверждения сервером.");
                window.location.href = returnUrl; // Или goto(returnUrl)
            } else if (paymentIntent.status === 'processing') {
                 showError("Платеж обрабатывается...");
                 window.location.href = returnUrl;
            } else if (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'requires_confirmation') {
                 showError("Карта отклонена или требует дополнительного подтверждения. Попробуйте другую карту или проверьте данные.");
            } else {
                showError(`Статус платежа: ${paymentIntent.status}. Вы будете перенаправлены...`);
                window.location.href = returnUrl;
            }
        }
        isLoading.set(false);
    }
    
    onMount(async () => {
        if (data.error) {
            showError(data.error, true);
        }
        if (!GlobalConfig.stripePublicKey) {
            showError("Публичный ключ Stripe не настроен. Платежи не будут работать.", true);
            return;
        }
        // Загружаем Stripe.js один раз при монтировании компонента
        if (!stripeInstance) {
            try {
                stripeInstance = await loadStripe(GlobalConfig.stripePublicKey);
            } catch (e) {
                showError("Не удалось загрузить Stripe.js. Платежные функции могут быть недоступны.", true);
                console.error("Stripe load error:", e);
            }
        }
    });

    onDestroy(() => {
        if (paymentElement) paymentElement.destroy();
    });

    // Для работы select с CurrencyEnum
    // Предположим, что CurrencyEnum в flsurf-client это что-то вроде:
    // export enum MoneyCurrency { KZT = "KZT", USD = "USD", RUB = "RUB" }
    // или ваш локальный CurrencyEnum. Для простоты будем использовать строки напрямую, если MoneyCurrency это числовой enum.
    // Если MoneyCurrency это строковый enum, то все должно быть хорошо.
    // Если это числовой enum, вам понадобится маппинг или другой подход для select.
    // В данном коде предполагается, что topUpCurrency (string) будет преобразован в enum при вызове API.
    const currencyOptions = Object.values(MoneyCurrency).filter(value => typeof value === 'string'); // Для строковых enum

</script>

<div class="container mx-auto px-4 py-10 space-y-10">
    <h1 class="text-3xl font-bold text-gray-800">Управление Платежами и Кошелек</h1>

    {#if data.error}
        <div class="alert alert-error shadow-lg">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Ошибка загрузки данных: {data.error}</span>
            </div>
        </div>
    {/if}

    <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">Мой Кошелек</h2>
            {#if data.wallet}
                <p class="text-lg">
                    Текущий баланс: 
                    <span class="font-bold text-primary">
                        {data.wallet.availableBalance?.amount ?? '0.00'} 
                        {data.wallet.currency?.toString() ?? ''}
                    </span>
                </p>
                {#if data.wallet.frozen?.amount != null && data.wallet.frozen.amount > 0}
                <p class="text-sm text-gray-500">
                    Заморожено: {data.wallet.frozen.amount} {data.wallet.currency?.toString()}
                </p>
                {/if}
            {:else if !data.error} 
                <p class="text-gray-500">Кошелек не найден или еще не создан.</p>
            {/if}

            <div class="divider mt-6 mb-4">Пополнить баланс</div>
            
            <div class="form-control w-full md:max-w-sm">
                <InputField label="Сумма пополнения" inputType="number" name="topUpAmount" bind:value={topUpAmount} min="100" step="100" required={true} />
            </div>
            <div class="form-control w-full md:max-w-sm mt-4">
                <label class="label" for="topup-currency-select"><span class="label-text">Валюта</span></label>
                <select id="topup-currency-select" class="select select-bordered" bind:value={topUpCurrency}>
                    {#each currencyOptions as curr (curr)} 
                        <option value={curr}>{curr}</option> 
                    {/each}
                </select>
            </div>
<!--             
            {# Для пополнения всегда выбираем Stripe (или единственный настроенный провайдер) #}
            {# Логика выбора провайдера здесь упрощена для пополнения, т.к. обычно это Stripe #}
            {# Если нужно выбирать, раскомментируйте и адаптируйте select-ы провайдера/системы как для добавления карты #} -->

            <BaseButton 
                className="secondary mt-6 w-full md:w-auto" 
                onclick={() => initializeStripe('paymentIntent')} 
                disabled={get(isLoading) || topUpAmount <= 0 || !selectedProviderId}> 
                <!-- {# selectedProviderId должен быть установлен для Stripe #} -->
                Продолжить к оплате
            </BaseButton>
        </div>
    </section>

    <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">Мои Способы Оплаты</h2>
            {#if data.methods && data.methods.length > 0}
                <ul class="mb-6 space-y-3">
                    {#each data.methods as method (method.id)}
                        <li class="p-4 border rounded-lg bg-base-200 flex justify-between items-center">
                            <div>
                                <span class="font-semibold">{method.brand}</span> <span class="text-gray-600">**** {method.maskedPan}</span>
                                <span class="text-sm text-gray-500 ml-2">({method.expMonth}/{method.expYear})</span>
                            </div>
                            <div>
                                {#if method.isDefault}
                                    <span class="badge badge-success badge-sm">Основная</span>
                                {/if}
                                </div>
                        </li>
                    {/each}
                </ul>
            {:else if !data.error}
                <p class="text-gray-500 text-sm mb-6">У вас нет сохранённых способов оплаты.</p>
            {/if}

            <div class="divider mt-6 mb-4">Добавить новую карту</div>

            <div class="mb-4 form-control w-full md:max-w-md">
                <label class="label" for="provider-select-addcard"><span class="label-text">Платёжный провайдер</span></label>
                <select id="provider-select-addcard" class="select select-bordered" bind:value={selectedProviderId} on:change={() => {isStripeElementReady.set(false); if(paymentElement) paymentElement.destroy();}}>
                    {#if !data.providers || data.providers.length === 0} <option disabled selected value="">Нет доступных провайдеров</option> {/if}
                    {#each data.providers as p (p.id)}
                        <option value={p.id}>{p.name}</option>
                    {/each}
                </select>
            </div>
            {#if selectedProviderId && (data.providers.find(p => p.id === selectedProviderId)?.systems?.length ?? 0) > 0}
                <div class="mb-4 form-control w-full md:max-w-md">
                    <label class="label" for="system-select-addcard"><span class="label-text">Платёжная система</span></label>
                    <select id="system-select-addcard" class="select select-bordered" bind:value={selectedSystemId} on:change={() => {isStripeElementReady.set(false); if(paymentElement) paymentElement.destroy();}}>
                        {#if !(data.providers.find(p => p.id === selectedProviderId)?.systems) || data.providers.find(p => p.id === selectedProviderId)?.systems.length === 0}
                             <option disabled selected value="">Нет систем для этого провайдера</option>
                        {/if}
                        {#each data.providers.find(p => p.id === selectedProviderId)?.systems ?? [] as sys (sys.id)}
                            <option value={sys.id}>{sys.name}</option>
                        {/each}
                    </select>
                </div>
            {/if}
            
            <BaseButton 
                className="secondary mt-2 w-full md:w-auto" 
                onclick={() => initializeStripe('setupIntent')} 
                disabled={get(isLoading) || !selectedProviderId}>
                Ввести данные новой карты
            </BaseButton>
        </div>
    </section>

    {#if get(isStripeElementReady)}
        <section class="card bg-base-100 shadow-xl">
            <div class="card-body">
                <h3 class="card-title mb-4 text-lg">
                    {#if currentStripeIntentType === 'setupIntent'}
                        Заполните данные новой карты
                    {:else if currentStripeIntentType === 'paymentIntent'}
                        Оплата пополнения на {topUpAmount} {topUpCurrency}
                    {:else}
                        Платёжная информация
                    {/if}
                </h3>
                <div class="p-3 border border-base-300 rounded-md bg-base-100 min-h-[200px] flex flex-col justify-center" bind:this={paymentElementDiv}>
                    <!-- {# Payment Element монтируется сюда. Можно добавить плейсхолдер загрузки, если paymentElementDiv уже есть, а сам элемент еще нет #} -->
                    {#if !paymentElement && get(isLoading) && currentClientSecret }
                        <div class="text-center"><span class="loading loading-ring loading-lg text-primary"></span><p>Загрузка формы оплаты...</p></div>
                    {/if}
                </div>
                <div class="card-actions justify-end mt-6">
                    {#if currentStripeIntentType === 'setupIntent'}
                        <BaseButton className="primary btn-md" onclick={handleAddCard} disabled={get(isLoading)}>
                            {get(isLoading) ? 'Сохранение...' : 'Сохранить карту'}
                        </BaseButton>
                    {:else if currentStripeIntentType === 'paymentIntent'}
                         <BaseButton className="primary btn-md" onclick={handleTopUp} disabled={get(isLoading) || topUpAmount <= 0}>
                            {get(isLoading) ? 'Обработка...' : `Оплатить ${topUpAmount} ${topUpCurrency}`}
                        </BaseButton>
                    {/if}
                </div>
                 <div id="payment-error-message-stripe" class="text-center text-error text-sm mt-2">
                     <!-- {# Ошибки от Stripe Payment Element будут отображаться внутри него самого #}
                     {# Это поле можно использовать для кастомных ошибок, не связанных напрямую с полями Stripe #} -->
                 </div>
            </div>
        </section>
    {/if}
    
    <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">Вывод средств</h2>
            <p class="text-gray-500">В данный момент функционал вывода средств находится в разработке и будет доступен позже.</p>
        </div>
    </section>
</div>