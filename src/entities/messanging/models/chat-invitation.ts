import type { UserEntity } from "$lib/entities/user/model/user";
import type { ChatInvitationStatus } from "../enums/chat-invitation-status";

export interface ChatInvitationEntity {
    id: string;
    text: string;
    chatId: string;
    invitedBy: UserEntity;
    user: UserEntity;
    status: ChatInvitationStatus;
}