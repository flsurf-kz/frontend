import type { PageLoad } from './$types';
import { GlobalClient } from '$lib/shared/api'; // Ваш API клиент
import type {
    PaymentMethodDto,
    TransactionProviderEntity,
    WalletEntity,
    // Если Money и CurrencyEnum не экспортируются отдельно, а являются частью WalletEntity,
    // то импорт WalletEntity будет достаточен.
    // Money, // Предполагаем, что Money и CurrencyEnum доступны или являются частью WalletEntity
    // WalletEntityCurrency // (или CurrencyEnum из вашего flsurf-client)
} from 'flsurf-client'; // Адаптируйте путь импорта, если необходимо

// Определим интерфейс для данных, возвращаемых функцией load
// Это обеспечит строгую типизацию в вашем +page.svelte
export interface PaymentPageData {
    methods: PaymentMethodDto[];
    providers: TransactionProviderEntity[];
    wallet: WalletEntity | null;
    stripePublicKey?: string; // Если вы решите передавать его так
    error?: string;
}

export const load: PageLoad<PaymentPageData> = async ({  }) => {
    // Можно дождаться загрузки данных из родительского layout, если там, например, сессия пользователя
    // await parent();
    // const { user } = await parent(); // Пример получения пользователя из родительского load
    // if (!user) { /* обработка неавторизованного пользователя */ }

    try {
        // Используем Promise.all для параллельной загрузки данных
        // ВАЖНО: Замените URL-адреса на ваши реальные API эндпоинты, если не используете GlobalClient напрямую
        // или убедитесь, что GlobalClient корректно работает в server-side context (использует event.fetch)

        // Вариант 1: Если GlobalClient настроен для работы в load функциях (предпочтительно)
        const methodsPromise = GlobalClient.getPaymentMethods();
        const providersPromise = GlobalClient.getTransactionProviders();
        const walletPromise = GlobalClient.getMyWallet().catch(err => {
            // Если getMyWallet может вернуть 404 (кошелек еще не создан), обрабатываем это как null
            if (err?.status === 404 || err?.response?.status === 404) {
                return null;
            }
            throw err; // Перебрасываем другие ошибки
        });

        const [methods, providers, wallet] = await Promise.all([
            methodsPromise,
            providersPromise,
            walletPromise
        ]);

        // Публичный ключ Stripe обычно безопасен для передачи на клиент
        // и часто хранится в переменных окружения, доступных на клиенте.
        // Если вы хотите передавать его из load, вы можете это сделать.
        // import { PUBLIC_STRIPE_KEY } from '$env/static/public';

        return {
            methods: methods || [], // Гарантируем, что это массив
            providers: providers || [], // Гарантируем, что это массив
            wallet: wallet, // Может быть null, если кошелек не найден или ошибка
            // stripePublicKey: PUBLIC_STRIPE_KEY // Если используете $env/static/public
        };

    } catch (error: any) {
        console.error("Ошибка загрузки данных для страницы оплаты:", error);
        // Возвращаем данные по умолчанию и сообщение об ошибке
        // Компонент +page.svelte должен будет обработать это состояние ошибки
        return {
            methods: [],
            providers: [],
            wallet: null,
            error: error.message || "Не удалось загрузить необходимые данные. Пожалуйста, попробуйте обновить страницу."
        };
    }
};