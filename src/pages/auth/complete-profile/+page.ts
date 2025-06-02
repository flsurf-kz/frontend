// src/routes/auth/complete-profile/+page.ts
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { CurrentUser } from '$lib/entities/user/model/modal'; // Укажите правильный путь
import { UserEntityType } from 'flsurf-client';

export const load: PageLoad = async () => {
    const currentUser = get(CurrentUser);
    console.log(currentUser)

    if (!currentUser || !currentUser.id) {
        console.warn('complete-profile: User not authenticated, redirecting to login.');
    }

    // if (currentUser.type && currentUser.type !== UserEntityType.NonUser) {
    //     console.warn(`complete-profile: User already has type ${currentUser.type}, redirecting.`);
    //     if (currentUser.type === UserEntityType.Freelancer) {
    //         throw redirect(307, '/freelancer');
    //     } else if (currentUser.type === UserEntityType.Client) {
    //         throw redirect(307, '/client');
    //     } else {
    //         throw redirect(307, '/');
    //     }
    // }

    return {
        userId: currentUser?.id, // Передаем ID для использования в командах
        userEmail: currentUser?.email,
        userName: currentUser?.fullname || currentUser?.name
    };
};