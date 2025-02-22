<script lang="ts">
	import DropdownBase from "$lib/shared/ui/dropdowns/dropdown-base.svelte";
	import type { NotificationEntity } from "../models/notification";

    export let notifications: NotificationEntity[]; 
</script>

<DropdownBase label="🔔" position="bottom">
</DropdownBase>