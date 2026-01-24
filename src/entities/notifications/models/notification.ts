import type { FileEntity } from "$lib/entities/files/models/file";
import type { NotificationTypes } from "../enums/notification-type";

export interface NotificationEntity {
    title: string;
    text: string;
    fromUserId?: string | null; // Может быть null
    toUserId: string;
    type: NotificationTypes;
    data?: string | null; // Может быть null
    icon?: FileEntity | null; // Может быть null
}