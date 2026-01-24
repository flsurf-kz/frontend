import { GlobalClient } from "$lib/shared/api";
import { GetTransactionsListQuery, type IGetTransactionsListQuery } from "flsurf-client";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url }: { url: any }) => {
	const filters: IGetTransactionsListQuery = {
		start: url.searchParams.get('start') ?? undefined,
		ends: url.searchParams.get('end') ?? undefined,
		operation: url.searchParams.get('operation') ?? undefined,
		status: url.searchParams.get('status') ?? undefined,
		flow: url.searchParams.get('flow') ?? undefined
	};

	const transactions = await GlobalClient.getTransactionsList(new GetTransactionsListQuery(filters));
	const wallet = await GlobalClient.getMyWallet();

	return {
		transactions,
		balance: wallet.availableBalance, 
	};
};
