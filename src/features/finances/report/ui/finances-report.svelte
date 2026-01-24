<script lang="ts">
	import { GlobalClient } from '$lib/shared/api';
	import { BaseButton } from '$lib/shared/ui/buttons';
	import { ChoicesField } from '$lib/shared/ui/inputs';
	import { formatISO, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

	let walletType = 'KZT'; // Или USD, EUR и т.п.
	let reports = [
		{ label: 'Итог за неделю', rangeLabel: 'Эта неделя', start: startOfWeek(new Date()) },
		{ label: 'Итог за месяц', rangeLabel: 'Этот месяц', start: startOfMonth(new Date()) },
		{ label: 'Итог за год', rangeLabel: 'Этот год', start: startOfYear(new Date()) }
	];

	async function exportReport(report: any) {
		const startDate = formatISO(report.start, { representation: 'date' });
		const endDate = formatISO(new Date(), { representation: 'date' });

		// const data = await GlobalClient.getFinancesReport(startDate, endDate);
        const data: any = []

		const csv = convertToCSV(data);
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `${report.label}.csv`;
		link.click();
	}

	function convertToCSV(data: any) {
		if (!Array.isArray(data)) return '';
		const keys = Object.keys(data[0] ?? {});
		const rows = data.map(d => keys.map(k => d[k]).join(','));
		return [keys.join(','), ...rows].join('\n');
	}
</script>

<div class="max-w-4xl px-4 py-6">
	<h1 class="text-2xl font-bold mb-6">Финансовая отчетность</h1>

	<div class="flex mb-4">
		<ChoicesField
			label="Тип кошелька"
			bind:value={walletType}
			options={[
				{ key: 'KZT', label: 'Тенге' },
				{ key: 'RUB', label: 'Рубль' },
				{ key: 'USD', label: 'Доллар' }
			]}
		/>
	</div>

	<table class="table w-full">
		<thead>
			<tr class="text-sm text-gray-500">
				<th class="text-left py-2">Отчет</th>
				<th class="text-left py-2">Диапазон дат</th>
				<th class="text-left py-2">Экспорт</th>
			</tr>
		</thead>
		<tbody>
			{#each reports as report}
				<tr class="border-t">
					<td class="py-2 text-green-600 font-medium cursor-pointer hover:underline">{report.label}</td>
					<td class="py-2 text-gray-600">{report.rangeLabel}</td>
					<td class="py-2">
						<BaseButton className="success sm" onclick={() => exportReport(report)}>
							Экспорт в CSV
						</BaseButton>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
