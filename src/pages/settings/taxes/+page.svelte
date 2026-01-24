<script lang="ts">
	/* ---------- зависимости ---------- */
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { page } from '$app/stores';

	import {
		TaxInformation,
		UpdateTaxSettingsCommand,
		UpdateTaxSettingsCommandLegalStatus as LegalStatus,
		UpdateTaxSettingsCommandTaxRegime     as TaxRegime
	} from 'flsurf-client';

	import { GlobalClient }   from '$lib/shared/api';
	import { BaseButton }     from '$lib/shared/ui/buttons';
	import { CurrentUser }    from '$lib/entities/user/model/modal';
	import { showError } from '$lib/shared/ui/errors';
	import { InputField } from '$lib/shared/ui/inputs';

	/* ---------- начальные значения ---------- */
	let tax: TaxInformation = new TaxInformation();

	let cmd = new UpdateTaxSettingsCommand({
		userId: '',
		countryIso: '',
		localIdNumber: '',
		legalStatus:   LegalStatus.Individual,
		taxRegime:     TaxRegime.Simplified,
		vatRegistered: false,
		vatNumber:     '',
		bankBic: '',
		bankAccountNumber: '',
		bankName: ''
	});

	/* ---------- загрузка данных ---------- */
	onMount(async () => {
		const user = get(CurrentUser);
		if (!user) return;

		cmd.userId = user.id;

		try {
			// если taxInfo уже есть в CurrentUser – используем его
			tax = user.taxInfo ?? new TaxInformation();

			Object.assign(cmd, {
				countryIso:        tax.countryIso,
				localIdNumber:     tax.localIdNumber,
				legalStatus:       tax.legalStatus,
				taxRegime:         tax.taxRegime,
				vatRegistered:     tax.vatRegistered,
				vatNumber:         tax.vatNumber,
				bankBic:           tax.bankDetails?.bic,
				bankAccountNumber: tax.bankDetails?.accountNumber,
				bankName:          tax.bankDetails?.bankName
			});
		} catch (e:any) {
			showError('Не удалось загрузить налоговые данные: ' + e.message, true);
		}
	});

	/* ---------- сохранение ---------- */
	async function save() {
		try {
			await GlobalClient.updateTaxInfo(cmd.userId, cmd);
			showError('Налоговые данные обновлены');
			// можно обновить CurrentUser
		} catch (e:any) {
			showError('Ошибка сохранения: ' + (e.message ?? 'неизвестно'), true);
		}
	}

	/* ---------- enum-опции ---------- */
	const legalStatusOptions = [
		{ value: LegalStatus.Individual, label: 'Физическое лицо' },
		{ value: LegalStatus.SoleProprietor, label: 'ИП' },
		{ value: LegalStatus.Entity, label: 'Компания' }
	];

	const taxRegimeOptions = [
		{ value: TaxRegime.General,      label: 'Общий режим' },
		{ value: TaxRegime.Simplified,   label: 'Упрощённый (УСН)' },
		{ value: TaxRegime.Patent,       label: 'Патент' }
	];
</script>

<h1 class="title">Налоги и банковские реквизиты</h1>

<!-- svelte-ignore a11y_label_has_associated_control -->
<section class="card">
	<h2 class="card__title">Налоговая информация</h2>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<InputField label="Страна (ISO-код)"
		            bind:value={cmd.countryIso}
		            placeholder="KZ" />

		<InputField label="ИНН / РНН / BIN"
		            bind:value={cmd.localIdNumber} />

		<div>
			<label class="label-text">Правовой статус</label>
			<select class="select select-bordered w-full"
			        bind:value={cmd.legalStatus}>
				{#each legalStatusOptions as o}
					<option value={o.value}>{o.label}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="label-text">Налоговый режим</label>
			<select class="select select-bordered w-full"
			        bind:value={cmd.taxRegime}>
				{#each taxRegimeOptions as o}
					<option value={o.value}>{o.label}</option>
				{/each}
			</select>
		</div>

		<div class="col-span-1 md:col-span-2 flex items-center gap-2 mt-2">
			<input type="checkbox" class="checkbox"
			       bind:checked={cmd.vatRegistered} id="vatReg" />
			<label for="vatReg" class="label-text">Организация зарегистрирована как плательщик НДС</label>
		</div>

		{#if cmd.vatRegistered}
			<InputField label="Номер НДС"
			            bind:value={cmd.vatNumber}
			            className="md:col-span-2" />
		{/if}
	</div>
</section>

<section class="card">
	<h2 class="card__title">Банковские реквизиты</h2>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<InputField label="БИК банка"
		            bind:value={cmd.bankBic}
		            placeholder="KCJBKZKX" />

		<InputField label="Название банка"
		            bind:value={cmd.bankName} />

		<InputField label="Расчётный счёт / IBAN"
		            bind:value={cmd.bankAccountNumber}
		            className="md:col-span-2" />
	</div>
</section>

<div class="mt-6">
	<BaseButton className="primary" onclick={save}>Сохранить</BaseButton>
</div>

<style>
	.title { font-size:1.5rem; font-weight:600; margin-bottom:1rem; }

	.card {
		border:1px solid #e5e7eb; border-radius:6px;
		padding:1.25rem 1.5rem; background:#fff; margin-bottom:1.5rem;
	}

	.card__title { font-weight:600; margin-bottom:1rem; }

	.label-text { font-size:.875rem; color:#4b5563; margin-bottom:.25rem; display:block; }
</style>
