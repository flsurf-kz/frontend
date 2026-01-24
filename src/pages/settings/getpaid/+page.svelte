<script lang="ts">
    import { onMount, onDestroy, tick } from 'svelte';
    import { loadStripe, type Stripe, type StripeElements, type StripePaymentElement } from '@stripe/stripe-js';
    import { GlobalClient } from '$lib/shared/api';

    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
    import { InputField } from '$lib/shared/ui/inputs';

    import {
        AddPaymentMethodCommand,
        BalanceOperationCommand,
        CreateSetupIntentCommand,
        Money,
        MoneyCurrency,
        PaymentMethodDto,
        RemovePaymentMethodCommand,
        StartPaymentFlowCommand,
        StartPaymentFlowCommandFlow,
        StartPaymentFlowCommandType
    } from 'flsurf-client';

    import { GlobalConfig } from '$lib/shared/config';
    import { showError } from '$lib/shared/ui/errors';

    import { writable, get } from 'svelte/store';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    import type { PageData } from './$types';
    import { Trash } from 'lucide-svelte';
	import { Logger } from 'sass';
	import ModalBase from '$lib/shared/ui/modal/modal-base.svelte';
	import { CurrentUser } from '$lib/entities/user/model/modal';

    /* ---------- props ---------- */
    export let data: PageData;

    /* ---------- Stripe state ---------- */
    let stripeInstance: Stripe | null           = null;
    let elements:        StripeElements | null  = null;
    let paymentElement:  StripePaymentElement | null = null;
    let paymentElementDiv: HTMLDivElement;

    /* ---------- UI-stores ---------- */
    const cardComplete          = writable(false);
    const removing              = writable<string | null>(null);
    const isLoading             = writable(false);
    const isStripeElementReady  = writable(false);
    const withdrawing           = writable(false);

    /* ---------- runtime vars ---------- */
    let currentStripeIntentType: 'setupIntent' | 'paymentIntent' = 'setupIntent';
    let currentClientSecret:          string | null = null;
    let currentInternalTransactionId: string | undefined = undefined;
    let currentStripePaymentIntentId: string | undefined = undefined;

    /* ---------- selections ---------- */
    let selectedProviderId: string =
        data.providers?.find(p => p.name?.toLowerCase().includes('stripe'))?.id
        ?? data.providers?.[0]?.id
        ?? '';

    let selectedSystemId = '';

    /* ---------- amounts ---------- */
    let topUpAmount  = 1000;
    let withdrawAmount = 1000;

    /* ---------- currency ---------- */
    let topUpCurrency: string = data.wallet?.currency?.toString() ?? 'KZT';
    const currencyOptions = Object
        .values(MoneyCurrency)
        .filter(v => typeof v === 'string') as string[];

    /* ---------- withdraw target ---------- */
    let withdrawMethodId: string | null = null;

    /* ================================================
       reactive helpers
    ================================================= */
    $: {
        if (selectedProviderId && data.providers) {
            const provider = data.providers.find(p => p.id === selectedProviderId);
            if (provider?.systems?.length) {
                if (!provider.systems.some(s => s.id === selectedSystemId)) {
                    selectedSystemId = provider.systems[0].id;
                }
            } else selectedSystemId = '';
        }
    }

    /* ---------- новые сторы для модалок ---------- */
  const showTopUpModal     = writable(false);
  const showWithdrawModal  = writable(false);
  const cards              = writable<PaymentMethodDto[]>([]);
  const chosenCardId       = writable<string | null>(null);

  /* ---------- helpers ---------- */
  async function fetchCards() {
    const list = await GlobalClient.getPaymentMethods();
    cards.set(list);
    const def = list.find(m => m.isDefault);
    chosenCardId.set(def?.id ?? list[0]?.id ?? null);
  }

  /* ---------- открыть модалки ---------- */
  function openTopUpModal() {
    if (topUpAmount <= 0) { showError('Введите сумму'); return; }
    fetchCards().then(() => showTopUpModal.set(true));
  }

  function openWithdrawModal() {
    if (withdrawAmount <= 0) { showError('Сумма вывода должна быть положительной'); return; }
    fetchCards().then(() => showWithdrawModal.set(true));
  }

  /* ---------- выполнить действие через BalanceOperation ---------- */
  async function confirmTopUp() {
    const id = get(chosenCardId);
    if (!id) { showError('Выберите карту'); return; }

    await GlobalClient.balanceOperation({
      walletId: data.wallet?.id,
      balance: new Money({
        amount:   topUpAmount,
        currency: MoneyCurrency[topUpCurrency as keyof typeof MoneyCurrency]
      }),
      balanceOperationType: 'Deposit'
    } as BalanceOperationCommand);

    showTopUpModal.set(false);
    goto($page.url.pathname, { invalidateAll: true });
  }

  async function confirmWithdraw() {
    const id = get(chosenCardId);
    if (!id) { showError('Выберите карту'); return; }

    await GlobalClient.balanceOperation({
      walletId: data.wallet?.id,
      balance: new Money({
        amount:   withdrawAmount,
        currency: MoneyCurrency[topUpCurrency as keyof typeof MoneyCurrency]
      }),
      balanceOperationType: 'Withdrawl'
    } as BalanceOperationCommand);

    showWithdrawModal.set(false);
    goto($page.url.pathname, { invalidateAll: true });
  }

    $: topUpCurrency = data.wallet?.currency?.toString() ?? 'KZT';

    /* ================================================
       stripe init
    ================================================= */
    async function initializeStripe(intentType: 'setupIntent' | 'paymentIntent') {
        if (!selectedProviderId) {
            showError('Пожалуйста, выберите платежного провайдера.', true);
            return;
        }

        currentStripeIntentType = intentType;
        isLoading.set(true);
        isStripeElementReady.set(false);
        if (paymentElement) paymentElement.destroy();

        try {
            let serverResponse: any;

            /* ---------- setupIntent (добавление карты) ---------- */
            if (intentType === 'setupIntent') {
                serverResponse = await GlobalClient.createSetupIntent(
                    new CreateSetupIntentCommand({
                        providerId: selectedProviderId,
                        systemId:   selectedSystemId,
                        returnUrl:  ''
                    })
                );
                console.log(serverResponse)
                currentClientSecret = serverResponse.clientSecretForWidget;
            }

            /* ---------- paymentIntent (депозит) ---------- */
            else {
                if (topUpAmount <= 0) {
                    showError('Сумма пополнения должна быть больше нуля.', true);
                    isLoading.set(false);
                    return;
                }

                const moneyCurrencyEnumValue =
                    MoneyCurrency[topUpCurrency.toUpperCase() as keyof typeof MoneyCurrency];

                let serverResponse = await GlobalClient.startPaymentFlow(
                    new StartPaymentFlowCommand({
                        amount:     new Money({ amount: topUpAmount, currency: moneyCurrencyEnumValue }),
                        flow:       StartPaymentFlowCommandFlow.Incoming,
                        type:       StartPaymentFlowCommandType.Deposit,
                        providerId: selectedProviderId
                    })
                );
                if (serverResponse.clientSecret) {
                    /* Stripe виджет */
                    currentClientSecret          = serverResponse.clientSecret;
                    currentStripePaymentIntentId = serverResponse.providerPaymentId;
                    currentInternalTransactionId = serverResponse.internalTransactionId;
                } else if (serverResponse.redirectUrl) {
                    /* провайдер с редиректом */
                    window.location.href = serverResponse.redirectUrl;
                    return; // ничего монтировать не надо
                } else {
                    throw new Error('Провайдер не вернул данных для оплаты.');
                }
            }

            if (!currentClientSecret) throw new Error('Client secret не получен от сервера.');

            if (!stripeInstance) stripeInstance = await loadStripe(GlobalConfig.stripePublicKey);
            if (!stripeInstance) throw new Error('Stripe.js не загружен.');

            elements = stripeInstance.elements({ clientSecret: currentClientSecret });
            paymentElement = elements.create('payment');

            paymentElement.on('change', (e: any) => cardComplete.set(!!e.complete));
            isStripeElementReady.set(true);
            await tick();
            paymentElement.mount(paymentElementDiv);
        } catch (err: any) {
            showError(err.message || 'Ошибка инициализации платежной формы.', true);
            isStripeElementReady.set(false);
            currentClientSecret = null;
            throw err; 
        } finally {
            isLoading.set(false);
        }
    }

    /* ================================================
       stripe confirm: add card
    ================================================= */
    async function handleAddCard() {
        /* ленивый init */
        if (!stripeInstance || !elements || !currentClientSecret || currentStripeIntentType !== 'setupIntent') {
            if (get(isLoading)) return;
            await initializeStripe('setupIntent');
            if (!stripeInstance || !elements || !currentClientSecret) {
                showError('Форма добавления карты не готова.', true);
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
            showError(error.message ?? 'Ошибка подтверждения карты.');
        } else if (setupIntent?.status === 'succeeded') {
            const token = typeof setupIntent.payment_method === 'string'
                ? setupIntent.payment_method
                : setupIntent.payment_method?.id;

            if (!token) {
                showError('Stripe не вернул токен метода оплаты.', true);
            } else {
                try {
                    await GlobalClient.addPaymentMethod(new AddPaymentMethodCommand({
                        providerId: selectedProviderId,
                        paymentMethodToken: token,
                        makeDefault: (data.methods?.length || 0) === 0
                    }));
                    showError('Карта успешно добавлена!');
                    goto($page.url.pathname, { invalidateAll: true });
                } catch (e: any) {
                    showError(e.message || 'Ошибка сохранения карты.', true);
                }
            }
        }
        isLoading.set(false);
    }

    /* ================================================
       stripe confirm: top-up
    ================================================= */
    async function handleTopUp() {
        /* ленивый init */
        if (currentStripeIntentType !== 'paymentIntent' || !currentClientSecret || !stripeInstance || !elements) {
            if (get(isLoading)) return;
            await initializeStripe('paymentIntent');
            console.log('ready-flag before tick', $isStripeElementReady);
            if (!stripeInstance || !elements || !currentClientSecret) {
                showError('Форма пополнения не готова.', true);
                return;
            }
        }

        if (topUpAmount <= 0) {
            showError('Сумма пополнения должна быть положительной.');
            return;
        }

        if (!currentInternalTransactionId || !currentStripePaymentIntentId) {
            showError('Не хватает идентификаторов для завершения платежа.');
            return;
        }

        isLoading.set(true);

        const returnUrl =
            `${window.location.origin}/wallet/payment-status` +
            `?internal_transaction_id=${currentInternalTransactionId}` +
            `&payment_intent_id=${currentStripePaymentIntentId}` +
            `&payment_intent_client_secret=${currentClientSecret}`;

        const { error, paymentIntent } = await stripeInstance.confirmPayment({
            elements,
            confirmParams: { return_url: returnUrl },
            redirect: 'if_required'
        });

        if (error) {
            showError(error.message ?? 'Ошибка при обработке пополнения.');
        } else if (paymentIntent) {
            /* при redirect: 'if_required' редирект произойдёт сам,
               но если он не нужен, обрабатываем статусы локально */
            switch (paymentIntent.status) {
                case 'succeeded':
                    showError('Платёж успешно инициирован. Средства будут зачислены после подтверждения.');
                    window.location.href = returnUrl;
                    break;
                case 'processing':
                    showError('Платёж обрабатывается…');
                    window.location.href = returnUrl;
                    break;
                case 'requires_payment_method':
                case 'requires_confirmation':
                    showError('Карта отклонена или требует подтверждения.');
                    break;
                default:
                    window.location.href = returnUrl;
            }
        }

        isLoading.set(false);
    }

    async function deleteMethod(id: string) {
        if (!confirm('Удалить эту карту?')) return;
        removing.set(id);
        try {
            await GlobalClient.removePaymentMethod(new RemovePaymentMethodCommand({ methId: id }));
            showError('Карта удалена');
            goto($page.url.pathname, { invalidateAll: true });
        } catch (e: any) {
            showError(e.message ?? 'Ошибка удаления карты', true);
        } finally {
            removing.set(null);
        }
    }

    /* ================================================
       withdraw
    ================================================= */
    async function handleWithdraw() {
        if (withdrawAmount <= 0)               { showError('Сумма вывода должна быть положительной'); return; }
        if (!withdrawMethodId)                 { showError('Выберите карту, на которую вывести средства'); return; }

        withdrawing.set(true);
        try {
            // все ровно вызывает ошибку если не 200 204 
            const res = await GlobalClient.startPaymentFlow(
                new StartPaymentFlowCommand({
                    amount: new Money({
                        amount:   withdrawAmount,
                        currency: MoneyCurrency[topUpCurrency as keyof typeof MoneyCurrency]
                    }),
                    flow:            StartPaymentFlowCommandFlow.Outgoing,
                    type:            StartPaymentFlowCommandType.Withdrawal,
                    providerId:      selectedProviderId,
                    paymentMethodId: withdrawMethodId
                })
            );

            showError('Запрос на вывод принят. Ожидайте подтверждения.', false);
            goto($page.url.pathname, { invalidateAll: true });
        } catch (e: any) {
            showError(e.message ?? 'Ошибка вывода средств', true);
        } finally {
            withdrawing.set(false);
        }
    }

    /* ================================================
       misc lifecycle
    ================================================= */
    onMount(async () => {
        if (data.error) showError(data.error, true);

        if (!GlobalConfig.stripePublicKey) {
            showError('Публичный ключ Stripe не настроен.', true);
            return;
        }

        try {
            stripeInstance = await loadStripe(GlobalConfig.stripePublicKey);
        } catch (e) {
            showError('Не удалось загрузить Stripe.js.', true);
            console.error(e);
        }
    });

    onDestroy(() => {
        if (paymentElement) paymentElement.destroy();
    });

    async function startTopUpFlow() {
        await initializeStripe('paymentIntent');   // Ждём, пока всё сделается
    }
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

<div class="mb-4 form-control w-full md:max-w-md">
    <label class="label" for="provider-select-addcard"><span class="label-text">Платёжный провайдер</span></label>
    <select id="provider-select-addcard" class="select select-bordered" bind:value={selectedProviderId} on:change={() => {isStripeElementReady.set(false); if(paymentElement) paymentElement.destroy();}}>
        {#if !data.providers || data.providers.length === 0} <option disabled selected value="">Нет доступных провайдеров</option> {/if}
        {#each data.providers as p (p.id)}
            <option value={p.id}>{p.name}</option>
        {/each}
    </select>
</div>

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

    <!-- сумма и валюта -->
    <div class="form-control w-full md:max-w-sm">
      <InputField
        label="Сумма пополнения"
        inputType="number"
        name="topUpAmount"
        bind:value={topUpAmount}
        min="100"
        step="100"
        required />
    </div>

    <div class="form-control w-full md:max-w-sm mt-4">
      <label class="label" for="topup-currency-select"><span class="label-text">Валюта</span></label>
      <select id="topup-currency-select" class="select select-bordered" bind:value={topUpCurrency}>
        {#each currencyOptions as curr (curr)}
          <option value={curr}>{curr}</option>
        {/each}
      </select>
    </div>

    <!-- кнопка запуска инициализации -->
    <BaseButton
      className="secondary mt-6 w-full md:w-auto"
      onclick={openTopUpModal}
      disabled={topUpAmount <= 0}>
      Продолжить к оплате
    </BaseButton>

    {#if currentStripeIntentType === 'paymentIntent' && $isStripeElementReady}
      <div
        class="p-3 border border-base-300 rounded-md bg-base-100 mt-6"
        bind:this={paymentElementDiv}>
      </div>

      <div class="flex justify-end mt-4">
        <BaseButton
          className="primary"
          onclick={handleTopUp}
          disabled={$isLoading || topUpAmount <= 0}>
          {$isLoading ? 'Обработка…' : `Оплатить ${topUpAmount} ${topUpCurrency}`}
        </BaseButton>
      </div>
    {/if}
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
                                <button class="btn btn-xs btn-error"
                                    disabled={$removing === method.id}
                                    on:click={() => deleteMethod(method.id ?? "")}>
                                {#if $removing === method.id}
                                    …
                                {:else}
                                    <Trash size={14}/>
                                {/if}
                            </button>
                            </div>
                        </li>
                    {/each}
                </ul>
            {:else if !data.error}
                <p class="text-gray-500 text-sm mb-6">У вас нет сохранённых способов оплаты.</p>
            {/if}

            <div class="divider mt-6 mb-4">Добавить новую карту</div>

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
                disabled={$isLoading || !selectedProviderId}>
                Ввести данные новой карты
            </BaseButton>
        </div>
    </section>

    {#if $isStripeElementReady}
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
                    {#if !paymentElement && $isLoading && currentClientSecret }
                        <div class="text-center"><span class="loading loading-ring loading-lg text-primary"></span><p>Загрузка формы оплаты...</p></div>
                    {/if}
                </div>
                <div class="card-actions justify-end mt-6">
                    {#if currentStripeIntentType === 'setupIntent'}
                        <BaseButton className="primary btn-md" onclick={() => $isStripeElementReady = false}>
                            Отмена
                        </BaseButton>
                        <BaseButton className="primary btn-md"
                                    onclick={handleAddCard}
                                    disabled={!$cardComplete || $isLoading}>   <!-- ③ -->
                            {$isLoading ? 'Сохранение…' : 'Сохранить карту'}
                        </BaseButton>
                    {:else if currentStripeIntentType === 'paymentIntent'}
                         <BaseButton className="primary btn-md" onclick={handleTopUp} disabled={$isLoading || topUpAmount <= 0}>
                            {$isLoading ? 'Обработка...' : `Оплатить ${topUpAmount} ${topUpCurrency}`}
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
    
    <section class="card bg-base-100 shadow-xl mt-10">
      <div class="card-body">
        <h2 class="card-title">Вывод средств</h2>

        <div class="form-control w-full md:max-w-sm">
          <InputField label="Сумма вывода"
                      inputType="number"
                      name="withdrawAmount"
                      bind:value={withdrawAmount}
                      min="100"
                      step="100"
                      required />
        </div>

        {#if data.methods && data.methods.length > 0}
          <div class="form-control w-full md:max-w-sm mt-4">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label class="label"><span class="label-text">Куда вывести</span></label>
            <select class="select select-bordered" bind:value={withdrawMethodId}>
              <option disabled selected value={null}>-- выберите карту --</option>
              {#each data.methods as m}
                <option value={m.id}>{m.brand} ****{m.maskedPan}</option>
              {/each}
            </select>
          </div>
        {:else}
          <p class="text-gray-500 mt-4">Сохранённых карт нет – сначала добавьте карту.</p>
        {/if}

        <BaseButton
          className="primary mt-6 w-full md:w-auto"
          onclick={openWithdrawModal}
          disabled={withdrawAmount <= 0}>
          Вывести средства
        </BaseButton>
      </div>
    </section>
</div>

<ModalBase bind:open={$showTopUpModal} title="С какой карты списать средства?">
  {#if $cards.length === 0}
    <p class="text-sm text-gray-500">Карт нет — добавьте карту в разделе выше.</p>
  {:else}
    <select class="select select-bordered w-full" bind:value={$chosenCardId}>
      {#each $cards as m}
        <option value={m.id}>{m.brand} ****{m.maskedPan}</option>
      {/each}
    </select>

    <div class="flex justify-end gap-4 mt-6">
      <BaseButton className="secondary" onclick={() => showTopUpModal.set(false)}>Отмена</BaseButton>
      <BaseButton className="primary" onclick={confirmTopUp}>
        Пополнить на {topUpAmount} {topUpCurrency}
      </BaseButton>
    </div>
  {/if}
</ModalBase>

<!-- ===== Модалка вывода ===== -->
<ModalBase bind:open={$showWithdrawModal} title="Куда вывести средства?">
  {#if $cards.length === 0}
    <p class="text-sm text-gray-500">Карт нет — добавьте карту в разделе выше.</p>
  {:else}
    <select class="select select-bordered w-full" bind:value={$chosenCardId}>
      {#each $cards as m}
        <option value={m.id}>{m.brand} ****{m.maskedPan}</option>
      {/each}
    </select>

    <div class="flex justify-end gap-4 mt-6">
      <BaseButton className="secondary" onclick={() => showWithdrawModal.set(false)}>Отмена</BaseButton>
      <BaseButton className="primary" onclick={confirmWithdraw}>
        Вывести {withdrawAmount} {topUpCurrency}
      </BaseButton>
    </div>
  {/if}
</ModalBase>