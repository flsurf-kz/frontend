<script lang="ts">
	import { onMount } from 'svelte';
	import { loadStripe } from '@stripe/stripe-js';
	import type { Stripe, StripeElements } from '@stripe/stripe-js';
	import { GlobalClient } from '$lib/shared/api';
	import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
	import { AddPaymentMethodCommand, PaymentMethodDto, TransactionProviderEntity } from 'flsurf-client';
	import { GlobalConfig } from '$lib/shared/config';
	import { showError } from '$lib/shared/ui/errors';

	export let data: {
		methods: PaymentMethodDto[];
		providers: TransactionProviderEntity[];
	};

	let stripe: Stripe | null = null;
	let elements: StripeElements | null = null;
	let clientSecret: string | null = null;
	let paymentElementDiv: HTMLDivElement;

	let selectedProviderId: string = data.providers[0]?.id ?? '';
	let selectedSystemId: string = data.providers[0]?.systems?.[0]?.id ?? '';

	onMount(async () => {
		try {
			GlobalClient.createPortfolioProject
			const { clientSecret: secret } = await GlobalClient.createSetupIntent({
				providerId: selectedProviderId,
				systemId: selectedSystemId
			});
			
			clientSecret = secret;

			stripe = await loadStripe(GlobalConfig.stripePublicKey);
			if (!stripe || !clientSecret) {
				showError("Stripe недоступен. Попробуйте позже.", true);
				return;
			}

			elements = stripe.elements({ clientSecret });
			const paymentElement = elements.create('payment');
			paymentElement.mount(paymentElementDiv);
		} catch (err) {
			showError("Не удалось инициализировать платёжную форму", true);
		}
	});

	async function handleSubmit() {
		if (!stripe || !elements) {
			showError("Stripe не загружен. Попробуйте позже.", true);
			return;
		}

		const result = await stripe.confirmSetup({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/user/settings/payment`
			},
			redirect: 'if_required'
		});

		if (result.error) {
			showError(result.error.message ?? "Ошибка подтверждения карты");
			return;
		}

		const token = result.setupIntent?.payment_method;
		if (!token) {
			showError("Stripe не вернул токен метода", true);
			return;
		}

		try {
			await GlobalClient.addPaymentMethod(new AddPaymentMethodCommand({
				providerId: selectedProviderId,
				paymentMethodToken: token.toString(),
				makeDefault: true
			}));

			location.reload();
		} catch (e) {
			showError("Ошибка при сохранении карты", true);
		}
	}
</script>

<h1 class="text-xl font-bold mb-4">Способы оплаты</h1>

<!-- Список существующих -->
{#if data.methods.length > 0}
	<ul class="mb-6 space-y-2">
		{#each data.methods as method}
			<li class="p-3 border rounded bg-base-100">
				{method.brand} ****{method.maskedPan} ({method.expMonth}/{method.expYear})
				{#if method.isDefault}
					<span class="text-xs text-success ml-2">(по умолчанию)</span>
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<p class="text-gray-500 text-sm mb-6">Нет сохранённых карт.</p>
{/if}

<!-- svelte-ignore a11y_label_has_associated_control -->
<!-- Выбор провайдера -->
<div class="mb-4">
	<label class="block font-medium mb-1 text-sm">Платёжный способ</label>
	<select class="select select-bordered w-full" bind:value={selectedProviderId}>
		{#each data.providers as p}
			<option value={p.id}>{p.name}</option>
		{/each}
	</select>

	{#if selectedProviderId}
		<label class="block font-medium mt-4 mb-1 text-sm">Платёжная система</label>
		<select class="select select-bordered w-full" bind:value={selectedSystemId}>
			{#each data.providers.find(p => p.id === selectedProviderId)?.systems ?? [] as sys}
				<option value={sys.id}>{sys.name}</option>
			{/each}
		</select>
	{/if}
</div>

<!-- Stripe Element -->
<div class="bg-white p-4 rounded border mb-4" bind:this={paymentElementDiv} />

<BaseButton className="success" onclick={handleSubmit}>Добавить карту</BaseButton>
