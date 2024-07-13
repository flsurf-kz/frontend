import { error } from '@sveltejs/kit';

export function load({ params }) {
	error(404, 'Not found');
}