
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // build last 5 years
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // month labels in Russian (or English if you prefer)
  const months = [
    { label: 'Январь', value: 1 },
    { label: 'Февраль', value: 2 },
    { label: 'Март', value: 3 },
    { label: 'Апрель', value: 4 },
    { label: 'Май', value: 5 },
    { label: 'Июнь', value: 6 },
    { label: 'Июль', value: 7 },
    { label: 'Август', value: 8 },
    { label: 'Сентябрь', value: 9 },
    { label: 'Октябрь', value: 10 },
    { label: 'Ноябрь', value: 11 },
    { label: 'Декабрь', value: 12 }
  ];

  return { months, years, currentMonth, currentYear };
};