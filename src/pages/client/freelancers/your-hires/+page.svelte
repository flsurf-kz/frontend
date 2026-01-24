<script lang="ts">
    import { BaseButton } from '$lib/shared/ui/buttons';
	import { UserAvatar } from '$lib/shared/ui/icons';
import type { PageData } from './$types';

    export let data: PageData;

    // $: console.log(data.hiredProfiles);
</script>

<div class="bg-gray-800 text-white min-h-screen p-4 md:p-8"> 
    <div class="max-w-5xl mx-auto">
        <header class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-3xl font-bold">Ваши исполнители</h1>
                <p class="text-gray-400 text-sm">Список людей, с которыми вы успешно работали.</p>
            </div>
            <BaseButton onclick={()=>{}} className="bg-gray-700 secondary hover:bg-gray-600 text-sm">
                Поделиться списком
            </BaseButton>
        </header>

        {#if data.error}
            <div class="alert alert-error shadow-lg">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{data.error}</span>
                </div>
            </div>
        {:else if data.hiredProfiles && data.hiredProfiles.length > 0}
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {#each data.hiredProfiles as profile (profile.id)}
                    <a href={`/freelancer/${profile.userId}`} class="block bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:bg-gray-600 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <div class="flex flex-col items-center text-center">
                            <div class="avatar placeholder mb-4">
                                <div class="bg-primary text-primary-content rounded-full w-20 h-20 ring ring-primary ring-offset-base-100 ring-offset-2">
                                    <UserAvatar imageUrl={profile.user?.avatar?.filePath}/>
                                </div>
                            </div>
                            <h3 class="text-lg font-semibold text-white mb-1">{profile.user?.fullname}</h3>
                            <p class="text-gray-400 text-sm">Да</p>
                        </div>
                    </a>
                {/each}
            </div>
        {:else}
            <div class="text-center py-16">
                <svg class="mx-auto h-20 w-20 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h2 class="text-xl font-semibold text-gray-300 mb-2">Вы пока никого не наняли.</h2>
                <p class="text-gray-500 mb-6">Начните поиск подходящего исполнителя для вашего следующего проекта.</p>
                <a href="/browse-freelancers" class="primary">Найти фрилансеров</a> 
            </div>
        {/if}
    </div>
</div>