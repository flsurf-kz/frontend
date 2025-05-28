<script lang="ts">
	import { page } from '$app/stores';
	import { derived, writable } from 'svelte/store';
	import type { ProposalEntity } from 'flsurf-client';
	import ProposalCard from '$lib/entities/job/ui/proposal-card.svelte';
	import { Section } from '$lib/shared/ui/sections';

	/* данные из +page.ts */
	export let data: {
		pending: ProposalEntity[];
		accepted: ProposalEntity[];
		hidden: ProposalEntity[];
	};

	/* вкладки */
	type Tab = 'active' | 'referrals' | 'archived';
	const tab = writable<Tab>('active');

	/* для mock‑раздела Referrals пока пусто */
	const referrals: ProposalEntity[] = [];
</script>

<!-- ─────────────────────────────────────────────────────────────── -->
<div class="max-w-5xl py-6 px-4 space-y-6">

	<h1 class="text-3xl font-bold">Мои ставки</h1>

	<!-- вкладки -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_missing_attribute -->
	<div class="tabs">
		<a class="tab" class:tab-active={$tab === 'active'}    on:click={() => tab.set('active')}>Активные</a>
		<a class="tab" class:tab-active={$tab === 'referrals'} on:click={() => tab.set('referrals')}>Рефераллы</a>
		<a class="tab" class:tab-active={$tab === 'archived'}  on:click={() => tab.set('archived')}>Архивированные</a>
	</div>

	<!-- ========== ACTIVE ========== -->
	{#if $tab === 'active'}
		<!-- Offers -->
		<Section title="Принятые ставки" count={data.accepted.length}>
			{#each data.accepted as p}
				<ProposalCard proposal={p}/>
			{/each}
		</Section>

		<!-- Invitations -->
		<Section title="Приглашения на интервью (через мессенджер)" count={0}>
			<p class="text-sm opacity-60 px-4 py-3">Нету приглашений пока...</p>
		</Section>

		<!-- Active proposals (в работе – статус accepted со Contract?) -->
		<Section title="Активные ставки" count={0}>
			<p class="text-sm opacity-60 px-4 py-3">Нету активных ставок</p>
		</Section>

		<!-- Submitted (Pending) -->
		<Section title="Отправленные ставки" count={data.pending.length}>
			{#each data.pending as p}
				<ProposalCard proposal={p}/>
			{/each}
		</Section>
	{/if}

	<!-- ========== REFERRALS ========== -->
	{#if $tab === 'referrals'}
		<Section title="Рефераллы" count={referrals.length}>
			<p class="text-sm opacity-60 px-4 py-3">Пока что нету...</p>
		</Section>
	{/if}

	<!-- ========== ARCHIVED ========== -->
	{#if $tab === 'archived'}
		<Section title="Архирвированные ставки" count={data.hidden.length}>
			{#each data.hidden as p}
				<ProposalCard proposal={p}/>
			{/each}
		</Section>
	{/if}
</div>
