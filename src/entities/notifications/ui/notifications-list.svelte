<script lang="ts">
	import "$lib/shared/styles/texts.scss"
	import { asFilesBlobOrUrl } from "$lib/entities/files/lib/asFileUrl";
	import type { NotificationEntity } from "../models/notification";

    export let notifications: NotificationEntity[]; 
</script>

<div class="notification-list">
	{#each notifications as notif} 
		<div class="notif-one">
			<div class="notif-logo">
				<img src={asFilesBlobOrUrl(notif.icon)} alt="">
			</div>
			<div class="notif-text typography-text">
				{notif.text}
			</div>
			<a href="/user/notifications" class="notif-all-link typography-text">
				Посмотреть другие увдомления
			</a>
		</div>
	{/each}
</div>