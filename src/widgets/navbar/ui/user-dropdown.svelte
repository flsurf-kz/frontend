<script lang="ts">
  import { goto } from "$app/navigation";
  import { logout } from "$lib/entities/user/model";
  import { CurrentUser } from "$lib/entities/user/model/modal";
  import { UserAvatar } from "$lib/shared/ui/icons";
  import ArrowDown from "$lib/shared/ui/icons/ArrowDown.svelte";
  import { setTheme } from "$lib/shared/ui/theme";
	import { UserEntityType } from "flsurf-client";

  async function handleLogout() {
    await logout();
    goto("/");
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- Меню пользователя -->
<div class="dropdown dropdown-end">
  <label tabindex="0" class="btn btn-ghost btn-circle">
      <UserAvatar avatarFile={$CurrentUser?.avatar} className="rounded-full" width="30" height="30"/>
  </label>

  <ul tabindex="0" class="dropdown-content mt-3 w-64 bg-base-100 rounded-box shadow-xl p-4 space-y-3">
    
    <!-- Имя и роль -->
    <li class="flex flex-col items-start">
      <a href={$CurrentUser?.type == UserEntityType.Freelancer ? `/freelancer/${$CurrentUser?.id}` : "/client"} class="flex items-center gap-3">
        <div class="avatar">
          <div class="w-8 rounded-full">
            <UserAvatar avatarFile={$CurrentUser?.avatar} />
          </div>
        </div>
        <div>
          <p class="font-semibold text-sm">{$CurrentUser?.fullname}</p>
          <p class="text-xs text-gray-500">{$CurrentUser?.type == UserEntityType.Client ? 'Клиент' : "Фрилансер"}</p>
        </div>
      </a>
    </li>

    <!-- Статус онлайн -->
    <li class="flex items-center justify-between">
      <span class="text-sm">Online for messages</span>
      <input type="checkbox" class="toggle toggle-success" checked={$CurrentUser?.isOnline} />
    </li>

    <!-- Профиль -->
    <li><a href="/profile" class="text-sm">Ваш профиль</a></li>

    <!-- Статистика -->
    <li><a href="/stats" class="text-sm">Статистика и тренды</a></li>

    <!-- Премиум -->
    <li><a href="/premium" class="text-sm font-medium">Премиум</a></li>

    <!-- Темы -->
    <li tabindex="0">
      <details>
        <summary class="flex justify-between items-center text-sm">
          Theme: Dark
          <ArrowDown className="w-4 h-4" />
        </summary>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <!-- svelte-ignore a11y_missing_attribute -->
        <ul class="p-1 bg-base-100 space-y-2">
          <li class="btn btn-sm btn-ghost w-full" onclick={() => setTheme("light")}>Светлый</li>
          <li class="btn btn-sm btn-ghost w-full" onclick={() => setTheme("dark")}>Тёмный</li>
        </ul>
      </details>
    </li>

    <!-- Настройки -->
    <li><a href="/settings/info" class="text-sm">Настройки аккаунта</a></li>

    <!-- Выход -->
    <li><button onclick={handleLogout} class="btn btn-sm btn-ghost text-error w-full text-left">Выход</button></li>
  </ul>
</div>
