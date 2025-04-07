<script lang="ts">
    import { UserTypes } from "$lib/entities/user/enums/user-types";
    import { CurrentUser } from "$lib/entities/user/model/modal"; // Глобальный store
    import { get } from 'svelte/store';
  
    import ArrowDown from "$lib/shared/ui/icons/ArrowDown.svelte";
    import BellIcon from "$lib/shared/ui/icons/BellIcon.svelte";
  
    import NavbarSearch from "./navbar-search.svelte";
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
        <a href="/why-us" class="btn btn-ghost btn-sm text-gray-700">Почему мы?</a>
  
        <div class="dropdown dropdown-hover mx-2">
          <label tabindex="0" class="btn btn-ghost btn-sm text-gray-700">
            Клиентам
            <ArrowDown className="w-4 h-4 ml-1" />
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
            <li><a href="/signup?role=client">Разместить вакансию</a></li>
            <li><a href="/pages/clients">Разместить заказ</a></li>
          </ul>
        </div>
  
        <div class="dropdown dropdown-hover mx-2">
          <label tabindex="0" class="btn btn-ghost btn-sm text-gray-700">
            Фрилансерам
            <ArrowDown className="w-4 h-4 ml-1" />
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
            <li><a href="/freelancers">Для Фрилансеров</a></li>
            <li><a href="/freelancers/how-it-works">Как это работает</a></li>
            <li><a href="/freelancers/success-stories">Успешные истории</a></li>
            <li><a href="/freelancers/faq">FAQ</a></li>
            <li><a href="/freelancers/resources">Ресурсы и советы</a></li>
          </ul>
        </div>
      {/if}
  
      <!-- Авторизован: Фрилансер -->
      {#if isAuthorized && userType === 'Freelancer'}
        <div class="dropdown dropdown-hover mx-2">
          <label tabindex="0" class="btn btn-ghost btn-sm text-gray-700">
            Найти работу
            <ArrowDown className="w-4 h-4 ml-1" />
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
            <li><a href="/jobs">Найти заказ</a></li>
            <li><a href="/jobs/saved">Сохранённые работы</a></li>
            <li><a href="/jobs/user">Ваши ставки</a></li>
          </ul>
        </div>
  
        <div class="dropdown dropdown-hover mx-2">
          <label tabindex="0" class="btn btn-ghost btn-sm text-gray-700">
            Моя работа
            <ArrowDown className="w-4 h-4 ml-1" />
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
            <li><a href="/jobs/active">Активная работа</a></li>
            <li><a href="/jobs/history">История клиентов</a></li>
          </ul>
        </div>
  
        <div class="dropdown dropdown-hover mx-2">
          <label tabindex="0" class="btn btn-ghost btn-sm text-gray-700">
            Финансы
            <ArrowDown className="w-4 h-4 ml-1" />
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
            <li><a href="/finances/summary">Обзор финансов</a></li>
            <li><a href="/finances/reports">Финансовые отчёты</a></li>
            <li><a href="/finances/transactions">Транзакции</a></li>
            <li><a href="/user/settings/getpaid">Выплаты</a></li>
          </ul>
        </div>
      {/if}
  
      <!-- Авторизован: Клиент -->
      {#if isAuthorized && userType === 'Client'}
        <div class="dropdown dropdown-hover mx-2">
          <label tabindex="0" class="btn btn-ghost btn-sm text-gray-700">
            Работы
            <ArrowDown className=" h-4 ml-1" height={'5'}/>
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
            <li><a href="/jobs/create">Опубликовать работу</a></li>
            <li><a href="/jobs/all">Все опубликованные</a></li>
            <li><a href="/contracts">Все контракты</a></li>
            <li><a href="/dashboard/client">Панель клиента</a></li>
          </ul>
        </div>
  
        <div class="dropdown dropdown-hover mx-2">
          <label tabindex="0" class="btn btn-ghost btn-sm text-gray-700">
            Финансы
            <ArrowDown className=" h-4 ml-1" />
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
        <a href="/messages" class="btn btn-ghost btn-sm normal-case text-gray-700">Сообщения</a>
      {/if}
    </div>
  
    <!-- Правая часть -->
    <div class="flex gap-2 items-center">
      <!-- Виджет поиска -->
      <NavbarSearch
        onSearch={handleSearch}
        searchResults={searchResults}
      />
  
      <!-- Уведомления -->
      {#if isAuthorized}
        <button class="btn btn-ghost btn-circle btn-sm text-gray-700">
          <div class="indicator">
            <BellIcon className="w-5 h-5" />
            <span class="badge badge-xs indicator-item">3</span>
          </div>
        </button>
      {/if}
  
      <!-- Дропдаун пользователя или кнопки авторизации -->
      {#if isAuthorized && user}
        <UserDropdown user={user} />
      {:else}
        <div class="hidden sm:flex gap-2">
          <a href="/login" class="btn btn-sm btn-ghost text-gray-700">Войти</a>
          <a href="/signup" class="btn btn-sm btn-success text-white">Регистрация</a>
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
  