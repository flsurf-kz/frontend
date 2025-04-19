<script lang="ts">
	import { TransactionsTable } from "$lib/widgets/transactions";
	import type { Money, TransactionEntity } from "flsurf-client";

    let { transactions, balance }: { transactions: TransactionEntity[], balance: Money } = $props();     
</script>

<TransactionsTable {transactions} balance={balance.amount}/> 