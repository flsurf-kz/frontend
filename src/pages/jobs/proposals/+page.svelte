<script lang="ts">
    import ProposalCard from '$lib/entities/job/ui/proposal-card.svelte'; // Correct path
    import { Section } from '$lib/shared/ui/sections'; // Correct path
    import { writable } from 'svelte/store';

    export let data;

    type Tab = 'active' | 'referrals' | 'archived'; // Keep your existing tab logic
    const tab = writable<Tab>('active');
    const referrals = []; // Mock
</script>

<div class="max-w-5xl py-6 px-4 space-y-6 mx-auto">
    <h1 class="text-3xl font-bold">Мои ставки</h1>

    <div class="tabs tabs-lifted">
        <button class="tab" class:tab-active={$tab === 'active'}    on:click={() => tab.set('active')}>Активные</button>
        <button class="tab" class:tab-active={$tab === 'archived'}  on:click={() => tab.set('archived')}>Архивные</button>
    </div>

    {#if $tab === 'active'}
        <Section title="Принятые клиентом" count={data.accepted.length}>
            {#each data.accepted as item (item.proposal.id)}
                <ProposalCard proposal={item.proposal} job={item.job} />
            {/each}
        </Section>

        <Section title="Отправленные (на рассмотрении)" count={data.pending.length}>
            {#each data.pending as item (item.proposal.id)}
                <ProposalCard proposal={item.proposal} job={item.job} />
            {/each}
        </Section>
    {/if}

    {#if $tab === 'archived'}
        <Section title="Архивные ставки (Скрытые/Отклоненные)" count={data.hidden.length}>
            {#each data.hidden as item (item.proposal.id)}
                <ProposalCard proposal={item.proposal} job={item.job} />
            {/each}
            </Section>
    {/if}
</div>