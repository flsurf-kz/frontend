import type { LayoutServerLoad } from "./$types";
import { getUser } from "$lib/api/user";

export const load: LayoutServerLoad = async ({ locals }) => {
    const user = await getUser(locals.session); // Загружаем данные юзера
    return { user };
};