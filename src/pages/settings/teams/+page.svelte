<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, get } from 'svelte/store';

	import {
		FreelancerTeamEntity,
		KickFreelancerFromGroupCommand
	} from 'flsurf-client';

	import { CurrentUser } from '$lib/entities/user/model/modal';
	import { GlobalClient } from '$lib/shared/api';
	import { showError } from '$lib/shared/ui/errors';

	/* ------------ хранилище команд ------------- */
	const teams = writable<FreelancerTeamEntity[]>([]);
	const loading = writable(true);

	onMount(loadTeams);

	async function loadTeams() {
		try {
			loading.set(true);
			const data = await GlobalClient.getFreelancerTeams();
			teams.set(data);
		} catch (e:any) {
			showError('Не удалось получить список команд: ' + e.message, true);
		} finally {
			loading.set(false);
		}
	}

	/* ------------ кик участника --------------- */
	async function kick(teamId: string, userId: string) {
		try {
			await GlobalClient.kickFreelancerMember(
				new KickFreelancerFromGroupCommand({ teamId, userId })
			);
			// локально убираем участника
			teams.update(list =>
				list.map(t => t.id === teamId
					? new FreelancerTeamEntity({ ...t, participants: t.participants?.filter(p => p.id !== userId) })
					: t));
			showError('Пользователь исключён из команды');
		} catch (e:any) {
			showError('Ошибка исключения: ' + e.message, true);
		}
	}
</script>

<h1 class="title">Мои команды фрилансеров</h1>

{#if $loading}
	<p>Загрузка…</p>
{:else if $teams.length === 0}
	<p class="text-gray-500">У вас пока нет команд.</p>
{:else}
	{#each $teams as team (team.id)}
		<section class="team">
			<header class="team__header">
				<h2>{team.name ?? 'Без названия'}</h2>
				<span class="badge">Участников: {team.participants?.length ?? 0}</span>
			</header>

			<!-- список участников -->
			<ul class="members">
				{#each team.participants ?? [] as member (member.id)}
					<li class="member">
						<div class="info">
							<img src={member.avatar?.filePath ?? '/default-avatar.svg'} alt="ava" class="ava"/>
							<div>
								<p class="name">{member.fullname}</p>
								<p class="email">{member.email}</p>
							</div>
						</div>

						{#if member.id !== team.ownerId}
							<!-- кнопка кика -->
							<button class="btn danger"
							        on:click={() => kick(team.id, member.id)}>
								Выгнать
							</button>
						{:else}
							<span class="badge owner">Владелец</span>
						{/if}
					</li>
				{/each}

				{#if (team.participants?.length ?? 0) === 0}
					<li class="text-gray-500 px-2 py-1">В команде пока никого.</li>
				{/if}
			</ul>
		</section>
	{/each}
{/if}

<style>
	.title { font-size:1.5rem; font-weight:600; margin-bottom:1rem; }

	.team {
		border:1px solid #e5e7eb; border-radius:6px; margin-bottom:1.25rem;
		background:#fff; padding:1rem 1.25rem;
	}
	.team__header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; }
	.badge { background:#f3f4f6; border-radius:9999px; padding:.15rem .6rem; font-size:.75rem; }

	.members { display:flex; flex-direction:column; gap:.5rem; }
	.member  { display:flex; justify-content:space-between; align-items:center; padding:.25rem 0; border-top:1px solid #f3f4f6; }
	.member:first-child { border-top:none; }

	.info   { display:flex; gap:.5rem; align-items:center; }
	.ava    { width:32px; height:32px; border-radius:50%; object-fit:cover; }
	.name   { font-size:.875rem; font-weight:500; }
	.email  { font-size:.75rem; color:#6b7280; }

	.btn      { padding:.25rem .75rem; border-radius:4px; font-size:.8125rem; }
	.btn.danger { background:#dc2626; color:#fff; }
	.badge.owner { background:#2563eb; color:#fff; }
</style>
