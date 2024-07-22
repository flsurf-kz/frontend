<script lang="ts">
	import { UserTypes } from '$lib/enums/UserTypes';
    import arrowDown from '$lib/images/ArrowDown.svg'

    export let userType: UserTypes; 
    export let isAuthorized: boolean; 
    let findworkDropdown: boolean = false; 
    let myworkDropdown: boolean = false; 
</script>

<header class="navbar"> 
    <div class="navbar-logo">
        <h5>Flsurf</h5>
    </div>
    <nav class="navbar-left">
        {#if userType == UserTypes.Client} 
            <div class="navbar-find-work navbar-element">
                Найти работу

                {#if findworkDropdown}
                <div class="navbar-dropdown">
                    <a href="/jobs" class="dropdown-li">Найти заказ</a>
                    <a href="/jobs/saved" class="dropdown-li">Сохраненные работы</a>
                    <a href="/jobs/user" class="dropdown-li">Ваши ставки</a>
                </div>
                {/if}

                <img src={arrowDown} alt=":P">
            </div>
            
            <div class="navbar-my-work navbar-element">
                Моя работа

                {#if myworkDropdown}
                <div class="navbar-dropdown">
                    <a href="/jobs/active" class="dropdown-li">Ваша активная работа</a>
                    <a href="/jobs/history" class="dropdown-li">История клиентов</a>
                </div>
                {/if}

                <img src={arrowDown} alt=":P">                    
            </div>

            <div class="navbar-element">
                Финансы
            
                <div class="navbar-dropdown">
                    <a href="/finances/summary" class="dropdown-li">Обзор финансов</a>
                    <a href="/finances/reports" class="dropdown-li">Финансовые отчеты</a>
                    <a href="/finances/transactions" class="dropdown-li">Транзакции</a>
                    <a href="/user/settings/getpaid" class="dropdown-li">Выплаты</a>                    
                </div>

                <img src={arrowDown} alt=":P">
            </div>

        {:else if userType == UserTypes.Freelancer}
            
        {/if}

        {#if isAuthorized}
            <a href="/messages" class="navbar-element">
                Сообщения
            </a>
        {/if}
    </nav>
</header>

<style>
    
</style>