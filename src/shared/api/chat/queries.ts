import { ChatTypes } from "$lib/entities/messanging/enums/chat-types";
import type { ChatEntity } from "$lib/entities/messanging/models/chat";
import { UserRoles } from "$lib/entities/user/enums/user-roles";

const dummyUser = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "Placeholder",
    surname: "User",
    fullname: "User Placeholder",
    hashedPassword: "",
    role: UserRoles.Admin,
    email: "placeholder@example.com",
    isOnline: false,
    blocked: false,
    isSuperadmin: false,
    warnings: [],
}

export async function getChats(userId: string): Promise<ChatEntity[]> { 
    return [ 
        {
            id: "00000000-0000-0000-0000-000000000000", // Пустой UUID
            ownerId: "00000000-0000-0000-0000-000000000000",
            owner: dummyUser, 
            participants: [],
            name: "Untitled Chat",
            type: ChatTypes.Private, // Или другой дефолтный тип
            isArchived: false,
            isTextingAllowed: true,
            finishedAt: null,
            inspectors: [],
            notificationDisabled: false,
            bookmarked: false,
        }
    ]
}