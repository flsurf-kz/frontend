<script lang="ts">
	import { TransactionsTable } from "$lib/widgets/transactions";
	import type { Money, TransactionEntity } from "flsurf-client";
	let { data } = $props(); 
    let { transactions, balance }: { transactions: TransactionEntity[], balance: Money } = data;     
</script>

<TransactionsTable {transactions} balance={balance.amount}/> 