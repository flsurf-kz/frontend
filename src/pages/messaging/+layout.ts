import { getChats } from "$lib/shared/api/chat/queries";

export const load  = async () => {
    const chats = await getChats(); // Загружаем данные юзера
    return chats;
};