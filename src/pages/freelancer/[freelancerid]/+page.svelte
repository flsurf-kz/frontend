<script lang="ts">
  import { page } from '$app/stores';
  import { goto }  from '$app/navigation';

  import { CurrentUser } from '$lib/entities/user/model/modal';
  import MoneyEditModal from '$lib/widgets/freelancer-profile/ui/money-edit-modal.svelte';
  import JobShortCard   from '$lib/entities/job/ui/job-short-card.svelte';
  import { UserAvatar } from '$lib/shared/ui/icons';
  import { EditButton } from '$lib/shared/ui/buttons';
  import { GlobalClient } from '$lib/shared/api';

  import {
    type FreelancerProfileEntity,
    type PortfolioProjectEntity,
    type JobEntity,
    UpdateFreelancerProfileCommand
  } from 'flsurf-client';
	import TextEditModal from '$lib/widgets/freelancer-profile/ui/TextEditModal.svelte';

  export let data: {
    id:       string;
    view:     'public' | 'private';
    profile:  FreelancerProfileEntity;
    projects: PortfolioProjectEntity[];
    jobs:     JobEntity[];
  };

  /* ──────────── вычисления режима ──────────── */
  $: isOwner    = $CurrentUser?.id === data.profile.userId;
  $: publicMode = !isOwner || data.view === 'public';

  function toggleView() {
    const qp = new URLSearchParams($page.url.searchParams);
    publicMode ? qp.delete('view') : qp.set('view', 'public');
    goto('?' + qp.toString(), { keepFocus:true, invalidateAll:false });
  }

  /* ──────────── модалки ──────────── */
  let showRateModal  = false;
  let showAboutModal = false;
  let tempRate       = data.profile.costPerHour ?? 0;

  async function saveRate(e: CustomEvent<number>) {
    tempRate = e.detail;
    await GlobalClient.updateFreelancerProfile(
      new UpdateFreelancerProfileCommand({ hourlyRate: tempRate })
    );
    data.profile.costPerHour = tempRate;  // локально обновляем/UI
  }
</script>

<!-- ╔═════════════ HEADER ACTIONS ═════════════╗ -->
{#if isOwner}
  <div class="flex justify-end mb-4 gap-2">
    <button class="btn btn-xs btn-outline" on:click={toggleView}>
      {publicMode ? 'Owner view' : 'Public view'}
    </button>

    <a href="/settings" class="btn btn-xs btn-success">Profile settings</a>
  </div>
{/if}

<!-- ╔═════════════ GRID LAYOUT ═════════════╗ -->
<div class="grid lg:grid-cols-[280px_1fr] gap-6">

  <!-- ░░░ LEFT SIDEBAR ░░░ -->
  <aside class="space-y-4">

    <!-- promote / availability … просто заглушка -->
    <section class="bg-base-100 border border-base-300 rounded-lg p-4">
      <h3 class="font-semibold mb-2">Promote with ads</h3>
      <p class="text-sm opacity-70">Availability badge • Boost your profile</p>
    </section>

    <!-- connects (заглушка) -->
    <section class="bg-base-100 border border-base-300 rounded-lg p-4">
      <h3 class="font-semibold mb-1">Connects <span class="opacity-60">(mock)</span></h3>
      <p class="text-sm">137</p>
    </section>

    <!-- неподдержанные блоки -->
    {#each [
      'Languages','Verifications','Licenses',
      'Education','Linked accounts',
      'Testimonials','Certifications',
      'Employment history','Other experiences'
    ] as stub}
      <section class="bg-base-100 border border-base-300 rounded-lg p-4">
        <div class="flex justify-between items-center">
          <h3 class="font-semibold">{stub}</h3>
          {#if isOwner && !publicMode}
            <EditButton onclick={() => {/* открывать TextEditModal */}}/>
          {/if}
        </div>
        <p class="text-sm opacity-60">Not filled yet</p>
      </section>
    {/each}
  </aside>

  <!-- ░░░ MAIN CONTENT ░░░ -->
  <main class="space-y-6">

    <!-- TOP CARD (аватар + overview + rate) -->
    <section class="bg-base-100 border border-base-300 rounded-lg p-6 relative">

      <!-- кнопка редактирования overview -->
      {#if isOwner && !publicMode}
        <EditButton className="absolute right-4 top-4" onclick={() => showAboutModal = true}/>
      {/if}

      <div class="flex gap-4">
        <UserAvatar
          imageUrl={data.profile.user?.avatar?.filePath}
          className="w-20 h-20 shrink-0 rounded-full"
        />
        <div class="flex-1">
          <h2 class="text-2xl font-bold">{data.profile.user?.fullname}</h2>
          <p class="opacity-70">
            {data.profile.user?.location}
          </p>

          <h3 class="text-lg font-medium mt-4">{data.profile.user?.fullname}</h3>
          <p class="text-sm whitespace-pre-line mt-1">
            {data.profile.experience ?? 'No description yet.'}
          </p>
        </div>

        <!-- ставка -->
        {#if data.profile.costPerHour}
          <div class="text-right">
            <p class="font-semibold text-success text-xl">
              ₸{data.profile.costPerHour}/hr
            </p>
            {#if isOwner && !publicMode}
              <EditButton onclick={() => showRateModal = true}/>
            {/if}
          </div>
        {/if}
      </div>
    </section>

    <!-- PORTFOLIO -->
    {#if data.projects.length}
      <section class="bg-base-100 border border-base-300 rounded-lg p-6">
        <h3 class="text-lg font-bold mb-4">Portfolio</h3>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          {#each data.projects as p}
            <figure class="rounded-lg overflow-hidden border border-base-300">
              {#if p.images?.length}
                <img
                  src={p.images[0].filePath}
                  alt={p.name}
                  class="w-full h-28 object-cover"
                />
              {:else}
                <div class="w-full h-28 flex items-center justify-center bg-base-200 text-sm">
                  no image
                </div>
              {/if}
              <figcaption class="p-2 text-center text-xs line-clamp-2">{p.name}</figcaption>
            </figure>
          {/each}
        </div>
      </section>
    {/if}

    <!-- SKILLS -->
    {#if data.profile.skills?.length}
      <section class="bg-base-100 border border-base-300 rounded-lg p-6">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-bold">Skills</h3>
          {#if isOwner && !publicMode}
            <EditButton onclick={() => {/* open skills modal */}}/>
          {/if}
        </div>

        <div class="flex flex-wrap gap-2">
          {#each data.profile.skills as s}
            <span class="badge badge-outline">{s.name}</span>
          {/each}
        </div>
      </section>
    {/if}

    <!-- WORK HISTORY -->
    <section class="bg-base-100 border border-base-300 rounded-lg p-6">
      <h3 class="text-lg font-bold mb-4">Work history</h3>

      {#if data.jobs.length}
        <div class="space-y-4">
          {#each data.jobs as job}<JobShortCard {job} />{/each}
        </div>
      {:else}
        <p class="opacity-60">No items</p>
      {/if}
    </section>

  </main>
</div>

<!-- ╔═════════════ MODALS ═════════════╗ -->
<MoneyEditModal
  bind:open={showRateModal}
  currentRate={tempRate}
  on:save={saveRate}
/>

<TextEditModal
  bind:open={showAboutModal}
  title="Edit profile overview"
  initialText={data.profile.experience}
  on:save={(e: any) => (data.profile.experience = e.detail)}
/>
