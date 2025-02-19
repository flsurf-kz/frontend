<script lang="ts">
    import { onDestroy } from "svelte";

    // Notification model interfaces
    interface NotificationModel {
        title: string;
        type: "cookie" | "admin" | "moderation" | "message";
        text: string;
        image?: ImageModel;
    }

    interface ImageModel {
        path: string;
        name: string;
    }

    // Array to hold incoming notifications
    let notifications: NotificationModel[] = [];

    // Establish WebSocket connection
    const websocket = new WebSocket("wss://your-websocket-url");

    // Handle incoming WebSocket messages
    websocket.onmessage = (event) => {
        const data: NotificationModel = JSON.parse(event.data);
        notifications = [...notifications, data];
    };

    // Clean up WebSocket connection on component destroy
    onDestroy(() => {
        websocket.close();
    });

    // Function to remove a notification
    function removeNotification(index: number) {
        notifications = notifications.filter((_, i) => i !== index);
    }
</script>

<style>
    .notifications-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        max-width: 300px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .notification {
        display: flex;
        align-items: flex-start;
        background-color: #333;
        color: #fff;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        font-size: 0.9rem;
        max-width: 100%;
        position: relative;
    }

    .notification-title {
        font-weight: bold;
        margin-bottom: 4px;
    }

    .notification-text {
        margin: 0;
        font-size: 0.85rem;
    }

    .notification-image {
        width: 40px;
        height: 40px;
        margin-right: 12px;
        border-radius: 4px;
        object-fit: cover;
    }

    .notification-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: #aaa;
        font-size: 1rem;
        cursor: pointer;
    }

    /* Different styles based on notification type */
    .cookie { background-color: #4b4b4b; }
    .admin { background-color: #007acc; }
    .moderation { background-color: #cc7000; }
    .message { background-color: #28a745; }
</style>

<div class="notifications-container">
    {#each notifications as notification, index}
        <div class="notification {notification.type}">
            {#if notification.image}
                <img src={notification.image.path} alt={notification.image.name} class="notification-image" />
            {/if}
            <div class="notification-content">
                <div class="notification-title">{notification.title}</div>
                <p class="notification-text">{notification.text}</p>
            </div>
            <button class="notification-close" on:click={() => removeNotification(index)}>×</button>
        </div>
    {/each}
</div>
