import { GlobalClient } from "$lib/shared/api";


export async function load() {
  const [methods, providers] = await Promise.all([
    GlobalClient.getPaymentMethods(),
    GlobalClient.getTransactionProviders()
  ]);

  return {
    methods,
    providers
  };
}
