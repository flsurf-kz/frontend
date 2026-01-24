<script lang="ts">

	import DropdownBase from "$lib/shared/ui/dropdowns/dropdown-base.svelte";
	import BellIcon from "$lib/shared/ui/icons/BellIcon.svelte";
	import type { NotificationEntity } from "../models/notification";
	import NotificationsList from "./notifications-list.svelte";

    export let notifications: NotificationEntity[]; 
</script>

<DropdownBase position="bottom">
	<BellIcon slot="icon" width="20" height="20" style="fill: white;" />
    <NotificationsList notifications={notifications}/>
</DropdownBase>