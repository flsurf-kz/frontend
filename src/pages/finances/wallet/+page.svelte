<script lang="ts">
    import { WalletFreelancerView } from '$lib/widgets/wallet';
    export let data;          /* приходит из load */
</script>

<WalletFreelancerView
    available       ={data.balance.available}
    frozen          ={data.balance.frozen}
    pendingReview   ={data.balance.pendingReview}
    pendingJobs     ={data.pendingJobs}
    activeContracts ={data.activeContracts}
    workSessions    ={data.workSessions}
/>
