<script lang="ts">
	import { UserTypes } from '$lib/enums/UserTypes';
    import arrowDown from '$lib/images/ArrowDown.svg'
    import NavSearchbar from './NavSearchbar.svelte';

    export let userType: UserTypes; 
    export let isAuthorized: boolean; 
</script>

<header class="navbar"> 
    <nav class="navbar-left">
        <div class="navbar-logo">
            <a href="/">Flsurf</a>
        </div>
        {#if userType == UserTypes.Freelancer} 
            <div class="navbar-find-work navbar-element">
                Найти работу

                <div class="navbar-dropdown">
                    <a href="/jobs" class="dropdown-li">Найти заказ</a>
                    <a href="/jobs/saved" class="dropdown-li">Сохраненные работы</a>
                    <a href="/jobs/user" class="dropdown-li">Ваши ставки</a>
                </div>

                <img class="arrow-down" src={arrowDown} alt=":P">
            </div>
            
            <div class="navbar-my-work navbar-element">
                Моя работа

                <div class="navbar-dropdown">
                    <a href="/jobs/active" class="dropdown-li">Ваша активная работа</a>
                    <a href="/jobs/history" class="dropdown-li">История клиентов</a>
                </div>

                <img class="arrow-down" src={arrowDown} alt=":P">                    
            </div>

            <div class="navbar-element">
                Финансы
            
                <div class="navbar-dropdown">
                    <a href="/finances/summary" class="dropdown-li">Обзор финансов</a>
                    <a href="/finances/reports" class="dropdown-li">Финансовые отчеты</a>
                    <a href="/finances/transactions" class="dropdown-li">Транзакции</a>
                    <a href="/user/settings/getpaid" class="dropdown-li">Выплаты</a>                    
                </div>

                <img class="arrow-down" src={arrowDown} alt=":P">
            </div>

        {:else if userType == UserTypes.Client}
            <div class="navbar-jobs navbar-element">
                Работы

                <div class="navbar-dropdown">
                    <a href="/jobs/create" class="dropdown-li">Опубликовать работу</a>
                    <a href="/jobs/create" class="dropdown-li">Все опубликованные работы</a>
                    <a href="/jobs/create" class="dropdown-li">Все контракты</a>
                    <a href="/jobs/create" class="dropdown-li">Ваша панель клиента</a>
                </div>
                
                <img class="arrow-down" src={arrowDown} alt=":P">
            </div>

            <div class="navbar-finances navbar-element">
                Финансы

                <div class="navbar-dropdown">
                    <a href="/finances/summary" class="dropdown-li">Обзор финансов</a>
                    <a href="/finances/reports" class="dropdown-li">Финансовые отчеты</a>
                    <a href="/finances/transactions" class="dropdown-li">Транзакции</a>
                    <a href="/user/settings/getpaid" class="dropdown-li">Выплаты</a>                    
                </div>
                
                <img class="arrow-down" src={arrowDown} alt=":P">
            </div>
        {/if}

        {#if isAuthorized}
            <a href="/messages" class="navbar-element">
                Сообщения
            </a>
        {/if}
    </nav>
    <nav class="navbar-right">
        <NavSearchbar />
    </nav>
</header>

<style>
    .navbar-logo * { 
        color: green; 
        font-size: large;
    }

    .navbar, .navbar-left, .navbar-element { 
        display: flex; 
        align-items: center;    
    }

    .navbar a { 
        text-decoration: none;
        color: black; 
    }

    .navbar-dropdown  {
        display: none;
        position: absolute;
        background-color: #f9f9f9;
        box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.2);
        z-index: 1;
        padding: 10px 0; 
        margin-top: 10px; 
        border-radius: 5px;
        background-clip: padding-box;
        min-width: 240px;
    }

    .navbar-dropdown:after {
        content: "";
        display: block;
        position: absolute;
        top: -15px;
        width: 100%;
        height: 15px;
        z-index: 0;
      }

    .navbar-dropdown:before {
        content: "";
        display: block;
        position: absolute;
        top: -15px;
        left: 28px;
        border: 8px solid rgb(219, 219, 219);
        border-color: rgb(255, 255, 255) transparent transparent transparent;
        transform: translateX(-50%) rotate(180deg);
        box-shadow: -2px 2px 3px -1px rgb(219, 219, 219);
    }

    .navbar-dropdown a:hover { 
        background-color: rgb(229, 229, 229);
    }

    .navbar-element:hover .navbar-dropdown {
        display: block;
    }

    .navbar-element { 
        cursor: pointer;
        margin: 0 15px; 
    }

    .navbar-logo { 
        margin-right: 15px;
    }

    .navbar-dropdown a { 
        color: black;
        padding: 5px 15px;
        text-decoration: none;
        display: block;
    }

    .arrow-down { 
        height: 10px;
        width: 13px;
        margin-left: 4px; 
    }

    .navbar-element { 
        position: relative;
        display: inline-block;
    }

    .navbar { 
        padding: 12px 24px;
        margin-left: auto;
        margin-right: auto;
        width: min(100%, 1600px);
        flex-wrap: wrap;
        justify-content: space-between;
        border-bottom: 1px solid rgba(189, 189, 189, 0.3); 
    }
</style>