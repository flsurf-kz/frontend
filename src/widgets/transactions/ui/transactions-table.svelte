<script lang="ts">
	import type { TransactionEntity } from 'flsurf-client';
	import { goto } from '$app/navigation';
	import { format } from 'date-fns';
	import { ru } from 'date-fns/locale';
	import { ChoicesField } from '$lib/shared/ui/inputs';
	import { BaseButton } from '$lib/shared/ui/buttons';
	import { PagePagination } from '$lib/shared/ui/navigation';

	export let transactions: TransactionEntity[] = [];
	export let balance: number;

	let pageSize = 10;
	let currentPage = 1;
	$: totalPages = Math.ceil(transactions.length / pageSize);
	$: paged = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

	function updateQueryParam(name: string, value: string) {
		const params = new URLSearchParams(window.location.search);
		if (value === 'all') {
			params.delete(name);
		} else {
			params.set(name, value);
		}
		goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
	}

	function exportToCSV() {
		const csv = [
			['Дата', 'Тип', 'Описание', 'Сумма', 'ID', 'Платёжка'].join(','),
			...transactions.map(t =>
				[
					format(new Date(t.createdAt ?? ''), 'd MMM yyyy', { locale: ru }),
					t.type ?? '',
					t.comment ?? '',
					t.netAmount?.amount ?? '',
					t.id,
					t.props?.paymentGateway ?? '-'
				].join(',')
			)
		].join('\n');

		const blob = new Blob([csv], { type: 'text/csv' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = 'transactions.csv';
		link.click();
	}
</script>

<div class="space-y-4">
	<h1 class="text-2xl font-bold">Транзакции</h1>
	<p class="text-green-600 text-lg font-medium">Баланс: ₸{balance}</p>

	<div class="flex flex-wrap items-center gap-4">
		<ChoicesField
			label="Тип"
			options={[
				{ key: 'all', label: 'Все' },
				{ key: 'Deposit', label: 'Пополнение' },
				{ key: 'Withdrawal', label: 'Вывод' },
				{ key: 'Bonus', label: 'Бонус' }
			]}
			on:change={(e) => updateQueryParam('type', e.detail)}
		/>

		<ChoicesField
			label="Статус"
			options={[
				{ key: 'all', label: 'Все' },
				{ key: 'Pending', label: 'В ожидании' },
				{ key: 'Completed', label: 'Завершено' },
				{ key: 'Failed', label: 'Ошибка' }
			]}
			on:change={(e) => updateQueryParam('status', e.detail)}
		/>

		<ChoicesField
			label="Тип потока"
			options={[
				{ key: 'all', label: 'Все' },
				{ key: 'Incoming', label: 'Входящий' },
				{ key: 'Outgoing', label: 'Исходящий' },
				{ key: 'Internal', label: 'Внутренний' }
			]}
			on:change={(e) => updateQueryParam('flow', e.detail)}
		/>

		<BaseButton className="success" onclick={exportToCSV}>Экспорт в CSV</BaseButton>
	</div>

	<!-- Таблица -->
	<table class="table w-full">
		<thead>
			<tr>
				<th>Дата</th>
				<th>Тип</th>
				<th>Описание</th>
				<th>Сумма</th>
				<th>ID</th>
				<th>Платёжка</th>
			</tr>
		</thead>
		<tbody>
			{#each paged as tx}
				<tr>
					<td>{format(new Date(tx.createdAt ?? ''), 'd MMM yyyy', { locale: ru })}</td>
					<td>{tx.type}</td>
					<td>{tx.comment ?? '—'}</td>
					<td>₸{tx.netAmount?.amount}</td>
					<td class="text-blue-600 hover:underline cursor-pointer">{tx.id}</td>
					<td>{tx.props?.paymentGateway ?? '-'}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<PagePagination
		{currentPage}
		{totalPages}
		{pageSize}
		on:pageChange={(e) => currentPage = e.detail}
		on:pageSizeChange={(e) => pageSize = e.detail}
	/>
</div>
