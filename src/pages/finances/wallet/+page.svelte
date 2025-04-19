<script lang="ts">
	import { WalletFreelancerView } from '$lib/widgets/wallet';

	export let data;
</script>

<WalletFreelancerView
	available={data.wallet.availableBalance.amount}
	frozen={data.wallet.frozen.amount}
	pending={data.wallet.pendingIncome.amount}
	pendingJobs={data.pendingJobs}
	activeContracts={data.activeContracts}
	workSessions={data.workSessions}
/>