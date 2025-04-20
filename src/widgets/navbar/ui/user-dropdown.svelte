<script lang="ts">
	import { goto } from "$app/navigation";
	import { logout } from "$lib/entities/user/model";
	import { UserAvatar } from "$lib/shared/ui/icons";
  import ArrowDown from "$lib/shared/ui/icons/ArrowDown.svelte";
  // Пример пропса
  export let user: {
    name: string;
    avatarUrl?: string;
    online?: boolean;
  } | null = null;

  // Функция выхода (можем брать из store напрямую)
  function handleLogout() {
    logout();
    goto("/")
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="dropdown dropdown-end">
  <label tabindex="0" class="btn btn-ghost btn-circle avatar flex items-center gap-2">
    {#if user?.avatarUrl}
      <div class="w-8 rounded-full">
        <img src={user.avatarUrl} alt="avatar" />
      </div>
    {:else}
      <UserAvatar className="w-8 h-8" />
    {/if}
  </label>

  <ul tabindex="0" class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
    <!-- Статус онлайн -->
    <li class="flex items-center justify-between">
      <span class="text-sm">Online for messages</span>
      <input type="checkbox" checked={user?.online} class="toggle toggle-success" />
    </li>

    <li><a href="/profile">{user?.name || "Your profile"}</a></li>
    <li><a href="/stats">Статистика</a></li>
    <li><a href="/membership">Премиум</a></li>
    <li><a href="/connects">Коннекты</a></li>
    <li><a href="/apps">Офферы</a></li>

    <li tabindex="0">
      <a href="/" class="justify-between">
        Theme: Light
        <ArrowDown className="w-4 h-4" />
      </a>
      <ul class="p-2 bg-base-100">
        <li><p>Light</p></li>
        <li><p>Dark</p></li>
      </ul>
    </li>

    <li><a href="/settings">Account settings</a></li>
    <li><a href="/" onclick={handleLogout}>Log out</a></li>
  </ul>
</div>
