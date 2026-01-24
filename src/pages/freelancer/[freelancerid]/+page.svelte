<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  import { CurrentUser } from '$lib/entities/user/model/modal';
  import MoneyEditModal from '$lib/widgets/freelancer-profile/ui/money-edit-modal.svelte';
  import JobShortCard from '$lib/entities/job/ui/job-short-card.svelte';
  import { UserAvatar } from '$lib/shared/ui/icons';
  import { BaseButton, EditButton } from '$lib/shared/ui/buttons';
  import { GlobalClient } from '$lib/shared/api';

  import {
    type FreelancerProfileEntity,
    type PortfolioProjectEntity,
    type JobEntity,
    UpdateFreelancerProfileCommand
  } from 'flsurf-client';
  import TextEditModal from '$lib/widgets/freelancer-profile/ui/TextEditModal.svelte';

  export let data: {
    id: string;
    view: 'public' | 'private';
    profile: FreelancerProfileEntity;
    projects: PortfolioProjectEntity[];
    jobs: JobEntity[];
  };

  /* ──────────── вычисления режима ──────────── */
  $: isOwner = $CurrentUser?.id === data.profile.userId;
  $: publicMode = !isOwner || data.view === 'public';

  function toggleView() {
    const qp = new URLSearchParams($page.url.searchParams);
    publicMode ? qp.delete('view') : qp.set('view', 'public');
    goto('?' + qp.toString(), { keepFocus: true, invalidateAll: false });
  }

  /* ──────────── модалки ──────────── */
  let showRateModal = false;
  let showAboutModal = false;
  let tempRate = data.profile.costPerHour ?? 0;

  async function saveRate(e: CustomEvent<number>) {
    tempRate = e.detail;
    await GlobalClient.updateFreelancerProfile(
      new UpdateFreelancerProfileCommand({ hourlyRate: tempRate })
    );
    data.profile.costPerHour = tempRate; // локально обновляем/UI
  }
</script>

{#if isOwner}
  <div class="flex justify-end mb-4 gap-2">
    <button class="btn btn-xs btn-outline" on:click={toggleView}>
      {publicMode ? 'Режим редактирования' : 'Как видят другие'}
    </button>

    <a href="/settings" class="btn btn-xs btn-success">Настройки профиля</a>
  </div>
{/if}

<div class="grid lg:grid-cols-[280px_1fr] gap-6">

  <aside class="space-y-4">

    <section class="bg-base-100 border border-base-300 rounded-lg p-4">
      <h3 class="font-semibold mb-2">Продвижение рекламой</h3>
      <p class="text-sm opacity-70">Значок доступности • Продвинуть профиль</p>
    </section>

    <section class="bg-base-100 border border-base-300 rounded-lg p-4">
      <h3 class="font-semibold mb-1">Коннекты <span class="opacity-60">(заглушка)</span></h3>
      <p class="text-sm">137</p>
    </section>

    {#each [
      { id: 'languages', title: 'Языки' },
      { id: 'verifications', title: 'Верификации' },
      { id: 'licenses', title: 'Лицензии' },
      { id: 'education', title: 'Образование' },
      { id: 'linked_accounts', title: 'Связанные аккаунты' },
      { id: 'testimonials', title: 'Отзывы' },
      { id: 'certifications', title: 'Сертификаты' },
      { id: 'employment_history', title: 'История трудоустройства' },
      { id: 'other_experiences', title: 'Другой опыт' }
    ] as stub (stub.id)}
      <section class="bg-base-100 border border-base-300 rounded-lg p-4">
        <div class="flex justify-between items-center">
          <h3 class="font-semibold">{stub.title}</h3>
          {#if isOwner && !publicMode}
            <EditButton onclick={() => { /* TODO: открывать TextEditModal или специализированную модалку для stub.id */ }} />
          {/if}
        </div>
        <p class="text-sm opacity-60">Еще не заполнено</p>
      </section>
    {/each}
  </aside>

  <main class="space-y-6">

    <section class="bg-base-100 border border-base-300 rounded-lg p-6 relative">

      {#if isOwner && !publicMode}
      
        <EditButton className="absolute right-1" onclick={() => showAboutModal = true} />
      {/if}

      <div class="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <UserAvatar
          avatarFile={data.profile.user?.avatar} altText={`Аватар ${data.profile.user?.fullname || 'пользователя'}`}
          className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full object-cover"
        />
        <div class="flex-1">
          <h2 class="text-2xl lg:text-3xl font-bold text-base-content">{data.profile.user?.fullname || 'Имя не указано'}</h2>
          {#if data.profile.user?.location}
            <p class="opacity-70 text-sm mt-1">
              {data.profile.user?.location.toString()} 
            </p>
          {/if}

          {#if data.profile.user?.fullname}
            <h3 class="text-lg font-medium mt-4 text-base-content">{data.profile.user.fullname}</h3>
          {/if}
          <p class="text-sm whitespace-pre-line mt-1 text-base-content/90 leading-relaxed">
            {data.profile.experience || 'Описание еще не добавлено.'}
          </p>
        </div>

        {#if data.profile.costPerHour !== undefined && data.profile.costPerHour !== null}
          <div class="text-left sm:text-right mt-4 sm:mt-0 flex-shrink-0">
            <p class="font-semibold text-success text-xl lg:text-2xl">
              ₸{data.profile.costPerHour}/час
            </p>
            {#if isOwner && !publicMode}
              <div class="mt-1">
                <EditButton onclick={() => showRateModal = true} />
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </section>

    {#if data.projects && data.projects.length > 0}
      <section class="bg-base-100 border border-base-300 rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-base-content">Портфолио</h3>
            {#if isOwner && !publicMode}
                <BaseButton className="btn-sm btn-outline btn-primary" onclick={() => goto('/freelancer/portfolio/manage')}>
                    Управлять портфолио
                </BaseButton>
            {/if}
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {#each data.projects as p (p.id)}
            <figure class="rounded-lg overflow-hidden border border-base-300 group relative">
                <a href={`/portfolio/${p.id}`} class="block">
                    {#if p.images?.length && p.images[0].filePath}
                        <img
                        src={p.images[0].filePath}
                        alt={p.name || 'Проект портфолио'}
                        class="w-full h-32 sm:h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        />
                    {:else}
                        <div class="w-full h-32 sm:h-40 flex items-center justify-center bg-base-200 text-sm text-base-content/50">
                        Нет изображения
                        </div>
                    {/if}
                    <!-- svelte-ignore a11y_figcaption_parent -->
                    <figcaption class="p-2.5 text-sm">
                      <p class="font-semibold text-base-content group-hover:text-primary line-clamp-2" title={p.name}>{p.name || 'Без названия'}</p>
                    </figcaption>
                </a>
            </figure>
          {/each}
        </div>
      </section>
    {/if}

    {#if data.profile.skills?.length}
      <section class="bg-base-100 border border-base-300 rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-base-content">Навыки</h3>
          {#if isOwner && !publicMode}
            <EditButton onclick={() => { /* TODO: open skills modal */ }} />
          {/if}
        </div>

        <div class="flex flex-wrap gap-2">
          {#each data.profile.skills as s (s.id)}
            <span class="badge badge-lg badge-outline">{s.name}</span>
          {/each}
        </div>
      </section>
    {/if}

    <section class="bg-base-100 border border-base-300 rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-base-content">История работ и отзывы</h3>
             </div>

      {#if data.jobs && data.jobs.length > 0}
        <div class="space-y-6">
          {#each data.jobs as job (job.id)}
            <JobShortCard {job} />
          {/each}
        </div>
      {:else}
        <p class="opacity-60 py-4 text-center">Нет записей о выполненных работах.</p>
      {/if}
    </section>

  </main>
</div>

<MoneyEditModal
  bind:open={showRateModal}
  currentRate={tempRate}
  on:save={saveRate}
/>

<TextEditModal
  bind:open={showAboutModal}
  title="Редактировать описание профиля"
  initialText={data.profile.experience}
  on:save={(e: CustomEvent<string>) => {
    data.profile.experience = e.detail;
    // TODO: Добавить вызов API для сохранения data.profile.experience
    // await GlobalClient.updateFreelancerProfile(new UpdateFreelancerProfileCommand({ experience: e.detail }));
    // console.log('Описание обновлено (локально):', e.detail);
  }}
/>