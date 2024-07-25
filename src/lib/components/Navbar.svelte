<script lang="ts">
	import { UserTypes } from '$lib/enums/UserTypes';
    import arrowDown from '$lib/images/ArrowDown.svg'

    export let userType: UserTypes; 
    export let isAuthorized: boolean; 
</script>

<header class="navbar"> 
    <div class="navbar-logo">
        <h4>Flsurf</h4>
    </div>
    <nav class="navbar-left">
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

    .navbar-dropdown  {
        display: none;
        position: absolute;
        background-color: #f9f9f9;
        min-width: 160px;
        box-shadow: 0px 4px 8px 0px rgba(0,0,0,0.2);
        z-index: 1;
        padding: 10px 0; 
        margin-top: 10px; 
        border-radius: 5px;
    }


    .navbar-dropdown:before {
        content: "";
        display: block;
        position: absolute;
        top: -15px;
        left: 28px;
        border: 8px solid rgb(219, 219, 219);
        border-color: rgb(219, 219, 219) transparent transparent transparent;
        transform: translateX(-50%) rotate(135deg);
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
    }

    .navbar-dropdown a { 
        color: black;
        padding: 5px 15px;
        text-decoration: none;
        display: block;
    }

    .arrow-down { 
        height: 13px;
        width: 13px;
    }

    .navbar-element { 
        position: relative;
        display: inline-block;
    }
</style>