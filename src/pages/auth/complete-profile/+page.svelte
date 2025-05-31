<script lang="ts">
    import type { PageData } from './$types';
    import { GlobalClient } from '$lib/shared/api';
    import { CurrentUser } from '$lib/entities/user/model/modal';
    import {
        UserEntityType,
        CreateFreelancerProfileCommand,
        CreateClientProfileCommand,
        CreateClientProfileCommandEmployerType, // Предполагаем, что этот enum есть
        type CreateFileDto, // Для companyLogo
		UserEntity

    } from 'flsurf-client';
    import { goto, invalidateAll } from '$app/navigation';
    import { showNotification } from '$lib/shared/ui/errors/modal';
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
    import InputField from '$lib/shared/ui/inputs/input-field.svelte';
    import TextField from '$lib/shared/ui/inputs/text-field.svelte';
    import { Briefcase, UserCheck, UploadCloud, User } from 'lucide-svelte';

    export let data: PageData; // userId, userEmail, userName

    // --- Состояние выбора роли ---
    let selectedRole: UserEntityType.Freelancer | UserEntityType.Client | null = null;

    // --- Состояние форм ---
    let freelancerFormData = {
        experience: '',
        hourlyRate: 0 as number, // или 0
        resume: '' // Для простоты пока текстовое поле (ссылка/описание)
    };

    // Предполагаемые значения для CreateClientProfileCommandEmployerType
    // Должны соответствовать вашему enum в flsurf-client
    const employerTypeOptions = [
        { value: CreateClientProfileCommandEmployerType.Company, label: 'Компания' },
        { value: CreateClientProfileCommandEmployerType.Indivdual, label: 'Частное лицо / ИП' }
    ];

    let clientFormData = {
        companyName: '',
        companyDescription: '',
        companyWebsite: '',
        location: '',
        phoneNumber: '',
        employerType: CreateClientProfileCommandEmployerType.Company, // Значение по умолчанию
        // companyLogoFile: null as File | null // Для хранения выбранного файла логотипа
    };
    // let companyLogoFile: File | null = null; // Для хранения файла логотипа

    // --- Общее состояние ---
    let isLoading = false;
    let errorMessage: string | null = null;
    let currentStep: 'roleSelection' | 'profileForm' = 'roleSelection';


    function selectRole(role: UserEntityType.Freelancer | UserEntityType.Client) {
        selectedRole = role;
        currentStep = 'profileForm';
        errorMessage = null; // Сбросить ошибку при смене шага
    }

    async function handleCreateFreelancerProfile() {
        if ($CurrentUser === undefined) { 
            return; 
        }
        if (!data.userId) {
            errorMessage = "Ошибка: ID пользователя не найден.";
            return;
        }
        isLoading = true;
        errorMessage = null;
        try {
            const command = new CreateFreelancerProfileCommand({
                userId: data.userId,
                experience: freelancerFormData.experience,
                hourlyRate: freelancerFormData.hourlyRate ?? undefined, // Отправляем undefined если null или 0
                resume: freelancerFormData.resume // Если это ссылка или текст
            });
            const result = await GlobalClient.createFreelancerProfile(command);
            if (result.isSuccess) {
                showNotification("Профиль фрилансера успешно создан!", false);
                // Обновляем тип пользователя в сторе и редиректим
                $CurrentUser.type = UserEntityType.Freelancer; 
                // await invalidateAll(); // Чтобы layout мог перезагрузить данные пользователя
                goto('/freelancer'); // или на страницу редактирования профиля фрилансера
            } else {
                errorMessage = result.message || "Не удалось создать профиль фрилансера.";
                showNotification(errorMessage, true);
            }
        } catch (e: any) {
            errorMessage = e.message || "Произошла ошибка при создании профиля фрилансера.";
            showNotification(errorMessage ?? "", true);
        } finally {
            isLoading = false;
        }
    }

    async function handleCreateClientProfile() {
        if ($CurrentUser === undefined) { 
            return; 
        }
        if (!data.userId) {
            errorMessage = "Ошибка: ID пользователя не найден.";
            return;
        }
        if (!clientFormData.companyName.trim()) {
            errorMessage = "Название компании обязательно для заполнения.";
            return;
        }
        isLoading = true;
        errorMessage = null;

        // TODO: Логика загрузки файла companyLogoFile и получения CreateFileDto
        // let logoDto: CreateFileDto | undefined = undefined;
        // if (companyLogoFile) {
        //   /*
        //     const fileParam = { data: companyLogoFile, fileName: companyLogoFile.name };
        //     const uploadedFileEntity = await GlobalClient.uploadFile(fileParam);
        //     if (uploadedFileEntity && uploadedFileEntity.id) {
        //       logoDto = new CreateFileDto({ fileId: uploadedFileEntity.id, name: uploadedFileEntity.fileName });
        //     } else {
        //       errorMessage = "Не удалось загрузить логотип компании.";
        //       isLoading = false;
        //       return;
        //     }
        //   */
        //   showNotification("Загрузка логотипа - это заглушка. Используйте URL или реализуйте загрузку.", true);
        // }

        try {
            const command = new CreateClientProfileCommand({
                userId: data.userId,
                companyName: clientFormData.companyName,
                companyDescription: clientFormData.companyDescription || undefined,
                companyWebsite: clientFormData.companyWebsite || undefined,
                location: clientFormData.location || undefined,
                employerType: clientFormData.employerType,
                phoneNumber: clientFormData.phoneNumber || undefined,
                // companyLogo: logoDto
            });
            const result = await GlobalClient.createClientProfile(command);
            if (result.isSuccess) {
                showNotification("Профиль заказчика успешно создан!", false);
                $CurrentUser.type = UserEntityType.Client; 
                goto('/client'); // или на страницу редактирования профиля заказчика
            } else {
                errorMessage = result.message || "Не удалось создать профиль заказчика.";
                showNotification(errorMessage, true);
            }
        } catch (e: any) {
            errorMessage = e.message || "Произошла ошибка при создании профиля заказчика.";
            showNotification(errorMessage ?? "", true);
        } finally {
            isLoading = false;
        }
    }

    // function handleLogoFileSelect(event: Event) {
    //   const input = event.target as HTMLInputElement;
    //   if (input.files && input.files.length > 0) {
    //     companyLogoFile = input.files[0];
    //   } else {
    //     companyLogoFile = null;
    //   }
    // }

</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-base-200 px-4 py-12">
    <div class="card w-full max-w-xl bg-base-100 shadow-xl transition-all duration-500 ease-in-out">
        <div class="card-body space-y-6">
            <div class="text-center">
                <h1 class="text-2xl font-bold text-base-content">Завершение регистрации на <span class="text-green-500">Flsurf.kz</span></h1>
                {#if data.userName}
                    <p class="text-md text-base-content/80 mt-1">Добро пожаловать, {data.userName} ({data.userEmail})!</p>
                {/if}
            </div>

            {#if currentStep === 'roleSelection'}
                <div class="animate-fadeIn">
                    <p class="text-base-content/70 text-center mb-6">
                        Чтобы мы могли подобрать для вас наилучшие возможности, пожалуйста, укажите, кем вы являетесь на платформе.
                    </p>
                    <div class="form-control w-full space-y-4">
                        <button
                            class="btn btn-lg btn-outline {selectedRole === UserEntityType.Freelancer ? 'btn-primary ring-2 ring-primary ring-offset-base-100 ring-offset-2' : 'border-base-300'} transition-all duration-200 ease-in-out w-full transform hover:scale-102"
                            on:click={() => selectRole(UserEntityType.Freelancer)}
                        >
                            <UserCheck class="w-7 h-7 mr-3 text-primary" />
                            <div>
                                <span class="font-semibold text-lg">Я Фрилансер</span>
                                <p class="text-xs font-normal normal-case opacity-70">Хочу выполнять заказы и зарабатывать</p>
                            </div>
                        </button>
                        <button
                            class="btn w-full btn-lg btn-outline {selectedRole === UserEntityType.Client ? 'btn-primary ring-2 ring-primary ring-offset-base-100 ring-offset-2' : 'border-base-300'} transition-all duration-200 ease-in-out transform hover:scale-102"
                            on:click={() => selectRole(UserEntityType.Client)}
                        >
                            <Briefcase class="w-7 h-7 mr-3 text-primary" />
                            <div>
                                <span class="font-semibold text-lg">Я Заказчик</span>
                                <p class="text-xs font-normal normal-case opacity-70">Хочу нанимать исполнителей и проекты, и искать талантов</p>
                            </div>
                        </button>
                    </div>
                </div>
            {/if}

            {#if currentStep === 'profileForm'}
                <div class="animate-fadeIn">
                    <button class="btn btn-sm btn-ghost mb-4 text-primary" on:click={() => { currentStep = 'roleSelection'; selectedRole = null; errorMessage = null; }}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                        Назад к выбору роли
                    </button>

                    {#if selectedRole === UserEntityType.Freelancer}
                        <h2 class="text-xl font-semibold mb-4 text-center">Заполните профиль Фрилансера</h2>
                        <form on:submit|preventDefault={handleCreateFreelancerProfile} class="space-y-4">
                            <TextField label="Расскажите о своем опыте (ключевые навыки, специализация)" bind:value={freelancerFormData.experience} rows={5} placeholder="Например, Frontend-разработчик с 5-летним опытом в React, TypeScript..." />
                            <InputField label="Желаемая почасовая ставка (опционально, в ₸)" inputType="number" bind:value={freelancerFormData.hourlyRate} placeholder="5000" min="0" />
                            <TextField label="Резюме или ссылка на портфолио (опционально)" bind:value={freelancerFormData.resume} rows={3} placeholder="Ссылка на ваше резюме, Behance, GitHub, LinkedIn..." />
                            <BaseButton type="submit" className="btn-primary w-full mt-6" onclick={() => {}} disabled={isLoading}>
                                {isLoading ? 'Сохранение...' : 'Сохранить профиль фрилансера'}
                            </BaseButton>
                        </form>
                    {/if}

                    {#if selectedRole === UserEntityType.Client}
                        <h2 class="text-xl font-semibold mb-4 text-center">Заполните профиль Заказчика</h2>
                        <form on:submit|preventDefault={handleCreateClientProfile} class="space-y-4">
                            <InputField label="Название компании или Ваше ФИО (если частное лицо)" bind:value={clientFormData.companyName} required placeholder="ТОО 'Рога и Копыта' или Иванов И.И."/>
                            <div>
                                <label class="label" for="employerType"><span class="label-text">Тип работодателя</span></label>
                                <select id="employerType" class="select select-bordered w-full" bind:value={clientFormData.employerType}>
                                    {#each employerTypeOptions as typeOpt}
                                        <option value={typeOpt.value}>{typeOpt.label}</option>
                                    {/each}
                                </select>
                            </div>
                            <TextField label="Описание компании (опционально)" bind:value={clientFormData.companyDescription} rows={4} placeholder="Кратко о вашей компании или деятельности..." />
                            <InputField label="Веб-сайт компании (опционально)" inputType="url" bind:value={clientFormData.companyWebsite} placeholder="https://example.com" />
                            <InputField label="Местоположение (город, страна)" bind:value={clientFormData.location} placeholder="Алматы, Казахстан" />
                            <InputField label="Контактный телефон (опционально)" inputType="phone" bind:value={clientFormData.phoneNumber} placeholder="+7 (XXX) XXX-XX-XX" />
                            <BaseButton type="submit" className="btn-primary w-full mt-6" onclick={() => {}} disabled={isLoading}>
                                {isLoading ? 'Сохранение...' : 'Сохранить профиль заказчика'}
                            </BaseButton>
                        </form>
                    {/if}
                </div>
            {/if}

            {#if errorMessage && currentStep === 'profileForm'} <div class="alert alert-error text-sm mt-4">
                     <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{errorMessage}</span>
                </div>
            {/if}

        </div>
    </div>
    {#if currentStep === 'roleSelection'}
    <p class="text-center text-sm text-base-content/60 mt-8">
        Вы всегда сможете дополнить свой профиль позже и, при необходимости, <br/> переключаться между ролями заказчика и исполнителя.
    </p>
    {/if}
</div>

<style>
/* Анимация для плавного появления форм */
.animate-fadeIn {
    animation: fadeIn 0.5s ease-in-out forwards;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.btn-lg { /* Убедитесь, что этот класс есть в DaisyUI или определите его */
    min-height: 4.5rem; /* Примерно 72px */
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: flex-start; /* Для иконки слева */
}
.btn-lg > div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    flex-grow: 1; /* Чтобы текст занимал доступное место */
}
</style>