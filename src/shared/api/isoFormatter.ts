import { parseISO } from "date-fns";

export function fixIso(timeString: string | Date): Date {
  // Если пришёл уже объект Date — просто вернём его
  if (timeString instanceof Date) return timeString;

  // + 1) отделяем дробную часть            → ".1495165Z"
  // + 2) обрезаем до первых 3 символов     → ".149Z"
  // + 3) собираем обратно
  const normalized = timeString.replace(
    /\.(\d{3})\d*(Z|[+\-]\d{2}:\d{2})$/,
    '.$1$2'
  );

  return parseISO(normalized);             // гарантировано валидно
}