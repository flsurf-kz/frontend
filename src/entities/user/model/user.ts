import type { FileEntity } from "$lib/entities/files/models/file";
import type { UserRoles } from "../enums/user-roles";

export interface UserEntity {
    id: string;
    name: string;
    surname: string;
    fullname: string; 
    email: string;
    role: UserRoles;
    image?: FileEntity | null;
    isOnline: boolean;
    phone?: string | null;
    telegramId?: string | null;
    blocked: boolean;
    isSuperadmin: boolean;
}
