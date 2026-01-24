<script lang="ts">
	import { CurrentNotifications } from '$lib/entities/notifications/modal';
	import { BellIcon } from '$lib/shared/ui/icons';
	import type { NotificationEntity } from 'flsurf-client';
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  
    $: notifications = $CurrentNotifications; 
    
    const dispatch = createEventDispatcher();
    let open = false;
    let wrapper: HTMLElement;
  
    // Подсчёт непрочитанных
    $: unreadCount = notifications?.filter(n => !n.lastModifiedAt).length ?? 0;
  
    function toggle(evt: MouseEvent) {
      evt.stopPropagation();
      open = !open;
      if (open) dispatch('opened');
    }
  
    function handleClickOutside(e: MouseEvent) {
      if (wrapper && !wrapper.contains(e.target as Node)) {
        open = false;
      }
    }
  
    onMount(() => {
      document.addEventListener('click', handleClickOutside);
    });
    onDestroy(() => {
      document.removeEventListener('click', handleClickOutside);
    });
  </script>
  
  {#if notifications !== undefined}
  <div
    class="dropdown dropdown-end"
    class:dropdown-open={open}
    bind:this={wrapper}
  >
    <button
      class="btn btn-ghost btn-circle btn-sm text-base-content"
      on:click|stopPropagation={toggle}
    >
      <div class="indicator">
        <BellIcon className="w-7 h-7" />
        {#if unreadCount > 0}
          <span class="badge badge-xs indicator-item">{unreadCount}</span>
        {/if}
      </div>
    </button>
  
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <ul
      tabindex="0"
      class="dropdown-content menu shadow bg-base-100 rounded-box w-80 mt-2 overflow-y-auto"
      style="max-height:24rem"
    >
      {#if notifications.length}
        {#each notifications as n (n.id)}
          <li>
            <a
              href={n.data ?? '#'}
              class="flex items-start gap-2 p-2 hover:bg-base-200"
            >
              {#if n.icon?.filePath}
                <img src={n.icon.filePath} alt="" class="w-6 h-6 rounded" />
              {:else}
                <span class="w-6 h-6 bg-base-300 mask mask-circle"></span>
              {/if}
              <div class="flex-1 text-sm">
                <p class="font-semibold">{n.title}</p>
                <p class="truncate">{n.text}</p>
                <p class="text-xs opacity-50">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {#if !n.lastModifiedAt}
                <span class="badge badge-error badge-xs self-start"></span>
              {/if}
            </a>
          </li>
        {/each}
      {:else}
        <li class="p-4 text-center opacity-60">Нету уведомлений</li>
      {/if}
  
      <li class="p-2 text-center">
        <a href="/notifications" class="text-sm text-primary">
          Просмотр всех уведомлений
        </a>
      </li>
    </ul>
  </div>
  {/if}  