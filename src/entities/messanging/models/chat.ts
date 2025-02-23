import type { UserEntity } from "$lib/entities/user/model/user";
import type { ChatTypes } from "../enums/chat-types";

export interface ChatEntity {
    id: string; // Аналог `Guid`
    ownerId: string;
    owner: UserEntity;
    participants: UserEntity[];
    name: string;
    type: ChatTypes;
    isArchived: boolean;
    isTextingAllowed: boolean;
    finishedAt?: string | null;
    inspectors: UserEntity[];
    notificationDisabled: boolean;
    bookmarked: boolean;  
    // contracts: ContractEntity[];
}