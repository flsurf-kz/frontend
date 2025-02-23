import type { FileEntity } from "$lib/entities/files/models/file";

export interface MessageEntity {
    id: string;
    senderId: string;
    text: string;
    isDeleted: boolean;
    chatId: string;
    sentDate: Date;
    isPinned: boolean;
    files?: FileEntity[];
}