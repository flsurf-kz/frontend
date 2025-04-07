import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  const userType = cookies.get('userType');
  if (userType === 'client') {
    throw redirect(302, '/client');
  }
  if (userType === 'freelancer') {
    throw redirect(302, '/freelancer');
  }
  return {};
};
