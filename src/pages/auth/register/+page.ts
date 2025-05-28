import { goto } from '$app/navigation';

export const load = async ({ data }) => {
	if (data !== null) {
		goto("/")
	}
	return {};
}