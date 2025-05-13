<script lang="ts">
  import { CurrentUser } from "$lib/entities/user/model/modal"; // Глобальный store

  import ArrowDown from "$lib/shared/ui/icons/ArrowDown.svelte";
	import type { NotificationEntity } from "flsurf-client";

  import NavbarSearch from "./navbar-search.svelte";
  import NotificationDropdown from "./notification-dropdown.svelte";
  import UserDropdown from "./user-dropdown.svelte";

  // Реактивно получаем текущего пользователя
  $: user = $CurrentUser;
  $: isAuthorized = !!user;
  $: userType = user?.type;

  // Локальный массив результатов поиска (заглушка)
  let searchResults: { title: string; url: string }[] = [];

  // Функция поиска
  function handleSearch(query: string) {
    // Пример: вызываем searchBy(query, userType) => пока заполняем заглушкой
    searchResults = [
      { title: `Результат 1 для «${query}»`, url: "#" },
      { title: `Результат 2 для «${query}»`, url: "#" }
    ];
  }
</script>
  
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <header class="navbar bg-base-100 shadow px-4 text-sm">
    <div class="flex-1 items-center">
      <!-- ЛОГО -->
      <a href="/" class="btn btn-ghost btn-sm text-sm text-green-600">
        Flsurf.kz
      </a>
  
      <!-- НЕ авторизован -->
      {#if !isAuthorized}
        <a href="/unauth/whyus" class="btn btn-ghost btn-sm">Почему мы?</a>
  
        <div class="dropdown dropdown-hover mx-2">
          <label tabindex="0" class="btn btn-ghost btn-sm">
            Клиентам
            <ArrowDown className="h-4 ml-1" />
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
            <li><a href="/auth/register?type=Client">Разместить вакансию</a></li>
            <li><a href="/unauth/clients">Разместить заказ</a></li>
          </ul>
        </div>
  
        <div class="dropdown dropdown-hover mx-2">
          <label tabindex="0" class="btn btn-ghost btn-sm">
            Фрилансерам
            <ArrowDown className="h-4 ml-1" />
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
            <li><a href="/unauth/freelancers">Для Фрилансеров</a></li>
            <li><a href="/unauth/freelancers/how-it-works">Как это работает</a></li>
            <li><a href="/unauth/freelancers/success-stories">Успешные истории</a></li>
            <li><a href="/unauth/freelancers/faq">FAQ</a></li>
            <li><a href="/unauth/freelancers/resources">Ресурсы и советы</a></li>
          </ul>
        </div>
      {/if}
  
      <!-- Авторизован: Фрилансер -->
      {#if isAuthorized && userType === 'Freelancer'}
        <div class="dropdown dropdown-hover mx-2">
          <label tabindex="0" class="btn btn-ghost btn-sm text-base-content">
            Найти работу
            <ArrowDown className="h-4 ml-1" />
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
            <li><a href="/jobs">Найти заказ</a></li>
            <li><a href="/jobs/bookmarked">Сохранённые работы</a></li>
            <li><a href="/jobs/proposals">Ваши ставки</a></li>
          </ul>
        </div>
  
        <div class="dropdown dropdown-hover mx-2">
          <label tabindex="0" class="btn btn-ghost btn-sm text-base-content">
            Моя работа
            <ArrowDown className="h-4 ml-1" />
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
            <li><a href="/jobs/active">Активная работа</a></li>
            <li><a href="/jobs/history">История клиентов</a></li>
          </ul>
        </div>
  
        <div class="dropdown dropdown-hover mx-2">
          <label tabindex="0" class="btn btn-ghost btn-sm text-base-content">
            Финансы
            <ArrowDown className="h-4 ml-1" />
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
            <li><a href="/finances/summary">Обзор финансов</a></li>
            <li><a href="/finances/reports">Финансовые отчёты</a></li>
            <li><a href="/finances/transactions">Транзакции</a></li>
            <li><a href="/settings/getpaid">Выплаты</a></li>
            <li><a href="/finances/wallet">Кошелек</a></li>
          </ul>
        </div>
      {/if}
  
      <!-- Авторизован: Клиент -->
      {#if isAuthorized && userType === 'Client'}
        <div class="dropdown dropdown-hover mx-2">
          <label tabindex="0" class="btn btn-ghost btn-sm text-base-content">
            Работы
            <ArrowDown className="h-4 ml-1" height={'5'}/>
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
            <li><a href="/jobs/create">Опубликовать работу</a></li>
            <li><a href="/jobs/all">Все опубликованные</a></li>
            <li><a href="/contracts">Все контракты</a></li>
            <li><a href="/dashboard/client">Панель клиента</a></li>
          </ul>
        </div>
  
        <div class="dropdown dropdown-hover mx-2">
          <label tabindex="0" class="btn btn-ghost btn-sm text-base-content">
            Финансы
            <ArrowDown className="h-4 ml-1" />
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
            <li><a href="/finances/summary">Обзор финансов</a></li>
            <li><a href="/finances/reports">Финансовые отчёты</a></li>
            <li><a href="/finances/transactions">Транзакции</a></li>
            <li><a href="/user/settings/getpaid">Выплаты</a></li>
          </ul>
        </div>
      {/if}
  
      <!-- Сообщения -->
      {#if isAuthorized}
        <a href="/messaging" class="btn btn-ghost btn-sm normal-case text-base-content">Сообщения</a>
      {/if}
    </div>
  
    <!-- Правая часть -->
    <div class="flex gap-2 items-center">
      <!-- Виджет поиска -->
      <NavbarSearch
        onSearch={handleSearch}
        searchResults={searchResults}
      />

      <!-- svelte-ignore a11y_label_has_associated_control -->
      <!-- Help Dropdown -->
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="text-green-500 cursor-pointer text-lg px-1">?</label>
        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-56">
          <li><a href="/help">Поддержка</a></li>
          <li><a href="/support/requests">Ваши тикеты к поддержке</a></li>
          <li><a href="/updates">Обновления flsurf</a></li>
          <li><a href="/release-notes">Измнения</a></li>
        </ul>
      </div>
  
      <!-- Уведомления -->
      {#if isAuthorized}
        <NotificationDropdown />
      {/if}
  
      <!-- Дропдаун пользователя или кнопки авторизации -->
      {#if isAuthorized && user}
        <UserDropdown />
      {:else}
        <div class="hidden sm:flex gap-2">
          <a href="/auth/login" class="btn btn-sm btn-ghost">Войти</a>
          <a href="/auth/register" class="btn btn-sm btn-success">Регистрация</a>
        </div>
      {/if}
    </div>
  </header>
  
  <style lang="postcss">
  .navbar {
    font-size: 0.875rem; /* text-sm по умолчанию */
  }
  
  /* Можно подправить размеры dropdown, если слишком большие */
  .dropdown-content.menu {
    font-size: 0.875rem; /* text-sm */
  }
  
  /* Размер кнопок */
  .btn.btn-sm {
    padding: 0.25rem 0.5rem;
    min-height: unset;
    height: auto;
  }
  
  /* Можно ещё уменьшить аватар, иконки и т.д. */
  </style>
  