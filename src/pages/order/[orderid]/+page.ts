import { error } from '@sveltejs/kit';

export function load({ params }) {
	params.orderid

	return {
		"kava": "kavazaki", 
	}

	error(404, 'Not found');
}