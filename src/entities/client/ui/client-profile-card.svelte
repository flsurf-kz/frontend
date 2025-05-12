<script lang="ts">
	import { format } from 'date-fns';
	import { ru } from 'date-fns/locale';
    import { JobDetails, JobEntity } from 'flsurf-client'

	let { job, rawJob }: { job: JobDetails, rawJob: JobEntity } = $props();

	const formatDate = (date: Date | string | undefined) =>
		date ? format(new Date(date), 'dd MMMM yyyy', { locale: ru }) : '—';
</script>

<div class="bg-white rounded-xl border shadow-md p-4 space-y-6 max-w-sm">
	<!-- 🔹 Header -->
	<div class="flex items-center gap-4">
		<img src={rawJob.employer?.avatar?.filePath} alt="avatar" class="w-16 h-16 rounded-full object-cover" />
		<div>
			<p class="text-lg font-semibold">{job.clientName}</p>
			<p class="text-sm text-gray-500 flex items-center gap-1">
				<span>Заказчик</span>
				{#if job.isClientVerified}
					<span class="text-green-600">✔</span>
				{/if}
			</p>
		</div>
	</div>

	<!-- 📊 Статистика -->
	<div>
		<h3 class="text-md font-semibold mb-2">Статистика заказчика</h3>
		<ul class="text-sm space-y-1 text-gray-700">
			<li>Зарегистрирован: <span class="text-green-600">{formatDate(job.createdAt)}</span></li>
			<li>Заказ размещён: <span class="text-green-600">{formatDate(job.createdAt)}</span></li>
			<li>Срок сдачи: <span class="text-green-600">{formatDate(job.deadline)}</span></li>
			<li>Статус: <span class="text-blue-600">{job.status}</span></li>
		</ul>
	</div>

	<!-- 🛡️ Верификация -->
	<div>
		<h3 class="text-md font-semibold mb-2">Верификация</h3>
		<p class="text-sm text-gray-700">
			{job.isClientVerified
				? 'Пользователь верифицирован, имеет Премиум'
				: 'Не верифицирован'}
		</p>
	</div>

	<!-- 📈 Активность -->
	<div>
		<h3 class="text-md font-semibold mb-2">Активность на заказе</h3>
		<ul class="text-sm space-y-1 text-gray-700">
			<li>Отклики: {job.responsesRangeMin}–{job.responsesRangeMax}</li>
			<li>Отклики за день: {job.dailyResponsesMin}–{job.dailyResponsesMax}</li>
			<li>Подтверждено: {job.confirmedResponses}</li>
		</ul>
	</div>
</div>
