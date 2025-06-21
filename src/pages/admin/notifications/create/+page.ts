import type { PageLoad } from './$types';
import {
    CreateNotificationCommandRole,
    CreateNotificationCommandType
} from 'flsurf-client';

export const load: PageLoad = async () => {
    /* Отдаём значения перечислений в шаблон */
    return {
        roles:  Object.values(CreateNotificationCommandRole),
        types:  Object.values(CreateNotificationCommandType)
    };
};
