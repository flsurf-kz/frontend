<script lang="ts">
    import { GlobalClient } from '$lib/shared/api'; // Убедитесь, что FileEntity тоже импортирован, если он нужен для avatar
    import { onMount, onDestroy } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import { debounce } from 'lodash-es'; // Используем debounce из lodash-es для tree-shaking
	import { GetUsersListQuery, type UserEntity } from 'flsurf-client';

    // --- Props ---
    /** Массив уже выбранных пользователей (двусторонний биндинг) */
    export let selectedUsers: UserEntity[] = [];
    /** Плейсхолдер для поля ввода */
    export let placeholder: string = 'Введите имя, фамилию или email...';
    /** Максимальное количество пользователей, которых можно выбрать (0 или undefined - без лимита) */
    export let maxSelected: number | undefined = undefined;
    /** Задержка перед отправкой поискового запроса (ms) */
    export let debounceDelay: number = 350;
    /** Ярлык для компонента (для доступности и заголовка над полем) */
    export let label: string = 'Выберите пользователей';
    /** Опциональный ID текущего пользователя, чтобы исключить его из поиска (если нужно) */
    export let currentUserIdToExclude: string | undefined = undefined;


    // --- Internal State ---
    let searchQuery = ('');
    let searchResults = <UserEntity[]>([]);
    let isLoading = (false);
    let isDropdownOpen = (false);
    let focusedIndex = (-1);
    let inputElement: HTMLInputElement | undefined = (undefined);
    let wrapperElement: HTMLDivElement | undefined = (undefined);


    const dispatch = createEventDispatcher<{
        change: UserEntity[];
    }>();

    // --- Functions ---
    const debouncedFetchUsers = debounce(async (query: string) => {
        if (!query.trim()) {
            searchResults = [];
            isDropdownOpen = false;
            isLoading = false;
            return;
        }
        isLoading = true;
        try {
            const usersFromApi = await GlobalClient.searchUsers(new GetUsersListQuery({searchTerm: query, start: 0, ends: 10}));
            const existingIds = new Set(selectedUsers.map(u => u.id));
            searchResults = usersFromApi.filter(u => !existingIds.has(u.id) && u.id !== currentUserIdToExclude);
        } catch (error) {
            console.error('Ошибка при поиске пользователей:', error);
            searchResults = [];
            // showNotification('Ошибка поиска пользователей', true);
        } finally {
            isLoading = false;
            // Открываем дропдаун только если есть результаты или все еще идет поиск по непустому запросу
            isDropdownOpen = searchResults.length > 0 || (isLoading && !!query.trim());
            focusedIndex = -1;
        }
    }, debounceDelay);

    function handleSearchQueryInput() {
        isDropdownOpen = !!searchQuery.trim(); // Открываем, если есть текст
        debouncedFetchUsers(searchQuery);
    }

    function selectUser(user: UserEntity) {
        if (maxSelected != null && maxSelected > 0 && selectedUsers.length >= maxSelected) {
            // showNotification(`Можно выбрать не более ${maxSelected} пользователей.`, true);
            return;
        }
        if (!selectedUsers.find(u => u.id === user.id)) {
            selectedUsers = [...selectedUsers, user];
            dispatch('change', selectedUsers);
        }
        searchQuery = '';
        searchResults = [];
        isDropdownOpen = false;
        inputElement?.focus();
    }

    function removeUser(userIdToRemove: string) {
        selectedUsers = selectedUsers.filter(user => user.id !== userIdToRemove);
        dispatch('change', selectedUsers);
        inputElement?.focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Backspace' && searchQuery === '' && selectedUsers.length > 0) {
            event.preventDefault();
            removeUser(selectedUsers[selectedUsers.length - 1].id);
            return;
        }

        if (!isDropdownOpen || searchResults.length === 0) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                focusedIndex = (focusedIndex + 1) % searchResults.length;
                scrollToFocused();
                break;
            case 'ArrowUp':
                event.preventDefault();
                focusedIndex = (focusedIndex - 1 + searchResults.length) % searchResults.length;
                scrollToFocused();
                break;
            case 'Enter':
                event.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < searchResults.length) {
                    selectUser(searchResults[focusedIndex]);
                }
                break;
            case 'Escape':
                isDropdownOpen = false;
                break;
        }
    }

    function scrollToFocused() {
        const listElement = wrapperElement?.querySelector('#user-search-results');
        const focusedOptionElement = listElement?.querySelector(`#user-option-${searchResults[focusedIndex]?.id}`);
        if (focusedOptionElement && listElement) {
            // Простое решение для прокрутки
            (focusedOptionElement as HTMLElement).scrollIntoView({ block: 'nearest' });
        }
    }


    function handleClickOutside(event: MouseEvent) {
        if (wrapperElement && !wrapperElement.contains(event.target as Node)) {
            isDropdownOpen = false;
        }
    }

    onMount(() => {
        document.addEventListener('click', handleClickOutside, true);
    });

    onDestroy(() => {
        document.removeEventListener('click', handleClickOutside, true);
        debouncedFetchUsers.cancel(); // Отменяем debounce при уничтожении компонента
    });

    // Для отображения имени
    function getUserDisplayName(user: UserEntity): string {
        return user.fullname || `${user.name} ${user.surname}`.trim() || user.email || user.id.substring(0, 8);
    }
    // Для отображения первой буквы в placeholder аватаре
    function getAvatarPlaceholder(user: UserEntity): string {
        return (user.name?.[0] ?? user.fullname?.[0] ?? user.email?.[0] ?? 'U').toUpperCase();
    }

</script>

{#if label}
    <label for="user-multi-selector-input" class="block text-sm font-medium text-base-content/80 mb-1">{label}</label>
{/if}
<div bind:this={wrapperElement} class="user-multi-selector-wrapper relative w-full group">
    <!-- svelte-ignore a11y_role_has_required_aria_props -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        class="flex flex-wrap gap-x-2 gap-y-1 items-center p-2 border border-base-300 bg-base-100 rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary min-h-[42px] cursor-text transition-colors"
        onclick={() => inputElement?.focus()}
        role="combobox"
        aria-expanded={isDropdownOpen}
        aria-haspopup="listbox"
    >
        {#each selectedUsers as user (user.id)}
            <div class="badge badge-neutral gap-1.5 pl-1 pr-1.5 py-3 text-xs items-center">
                {#if user.avatar?.filePath}
                    <div class="avatar w-5 h-5 mr-1">
                        <img src={user.avatar.filePath} alt={getUserDisplayName(user)} class="rounded-full object-cover" />
                    </div>
                {:else}
                     <div class="avatar placeholder bg-primary/20 text-primary rounded-full w-5 h-5 text-xs flex-shrink-0 mr-1">
                        <span>{getAvatarPlaceholder(user)}</span>
                    </div>
                {/if}
                <span class="truncate max-w-[150px]">{getUserDisplayName(user)}</span>
                <button
                    type="button"
                    class="btn btn-xs btn-circle btn-ghost p-0 ml-0.5 opacity-70 hover:opacity-100"
                    aria-label="Удалить {getUserDisplayName(user)}"
                    onclick={() => removeUser(user.id)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        {/each}

        <input
            id="user-multi-selector-input"
            type="text"
            bind:this={inputElement}
            bind:value={searchQuery}
            oninput={handleSearchQueryInput}
            onkeydown={handleKeyDown}
            onfocus={() => { if (searchQuery.trim()) isDropdownOpen = true; }}
            class="input input-ghost input-xs flex-grow p-1 h-auto focus:outline-none focus:ring-0 border-none min-w-[120px]"
            placeholder={(selectedUsers.length > 0 && !searchQuery) ? '' : placeholder}
            aria-autocomplete="list"
            aria-controls="user-search-results-listbox"
            aria-activedescendant={focusedIndex > -1 && searchResults[focusedIndex] ? `user-option-${searchResults[focusedIndex]?.id}` : undefined}
            disabled={maxSelected != null && maxSelected > 0 && selectedUsers.length >= maxSelected}
        />
    </div>

    {#if isDropdownOpen && (searchResults.length > 0 || (isLoading && searchQuery.trim()))}
        <ul
            id="user-search-results-listbox"
            class="absolute z-20 w-full mt-1 bg-base-100 border border-base-300 rounded-md shadow-lg max-h-60 overflow-y-auto py-1"
            role="listbox"
        >
            {#if isLoading && searchResults.length === 0}
                <li class="px-3 py-2 text-sm text-base-content/60 italic flex items-center gap-2">
                    <span class="loading loading-spinner loading-xs"></span> Поиск...
                </li>
            {:else if searchResults.length === 0 && !isLoading && searchQuery.trim()}
                 <li class="px-3 py-2 text-sm text-base-content/60 italic">Пользователи не найдены.</li>
            {:else}
                {#each searchResults as user, index (user.id)}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <li
                        id={`user-option-${user.id}`}
                        role="option"
                        aria-selected={index === focusedIndex}
                        class="px-3 py-2 text-sm hover:bg-primary/10 cursor-pointer flex items-center gap-2.5"
                        class:bg-primary={index === focusedIndex}
                        class:text-primary-focus={index === focusedIndex}
                        onmouseenter={() => focusedIndex = index}
                        onclick={() => selectUser(user)}
                    >
                        {#if user.avatar?.filePath}
                             <div class="avatar w-7 h-7 flex-shrink-0">
                                <img src={user.avatar.filePath} alt={getUserDisplayName(user)} class="rounded-full object-cover"/>
                            </div>
                        {:else}
                            <div class="avatar placeholder bg-neutral-focus text-neutral-content rounded-full w-7 h-7 text-sm flex-shrink-0 items-center justify-center flex">
                                <span>{getAvatarPlaceholder(user)}</span>
                            </div>
                        {/if}
                        <div class="flex-grow overflow-hidden">
                            <p class="font-medium truncate">{getUserDisplayName(user)}</p>
                            {#if user.email}
                                <p class="text-xs opacity-70 truncate">{user.email}</p>
                            {/if}
                        </div>
                         {#if user.isOnline}
                            <div class="w-2 h-2 bg-success rounded-full flex-shrink-0" title="В сети"></div>
                         {/if}
                    </li>
                {/each}
            {/if}
        </ul>
    {/if}
</div>