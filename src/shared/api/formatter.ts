import { type Money, type JobEntityStatus, ContractEntityStatus, type UserEntity } from 'flsurf-client'; // Адаптируйте путь к вашим типам
import { formatDistanceToNowStrict } from 'date-fns';
import { ru } from 'date-fns/locale';

export function formatDate(dateInput?: Date | string | null, includeTime = false): string {
    if (!dateInput) return '–';
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(date.getTime())) return String(dateInput); // Возвращаем как есть, если не удалось распарсить
        
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return date.toLocaleDateString('ru-RU', options);
    } catch (e) {
        return String(dateInput); 
    }
}

export function formatRelativeTime(dateInput?: Date | string | null): string {
    if (!dateInput) return 'недавно';
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(date.getTime())) return String(dateInput);
        return formatDistanceToNowStrict(date, { addSuffix: true, locale: ru });
    } catch (e) {
        return String(dateInput);
    }
}

export function formatMoney(money?: Money | null, defaultCurrency = 'KZT'): string {
    if (!money || money.amount == null) return 'Не указана';
    return `${money.amount.toLocaleString('ru-RU', {minimumFractionDigits: 0, maximumFractionDigits: 2} )} ${money.currency?.toString() || defaultCurrency}`;
}

export function getInitials(name?: string | null): string {
    if (!name) return '??';
    const parts = name.split(' ').filter(Boolean); // Удаляем пустые строки, если они есть
    if (parts.length > 1) { // Иван Петров -> ИП
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 1) { // Иван -> ИВ
        return parts[0].substring(0, 2).toUpperCase();
    } else if (parts.length === 1 && parts[0].length === 1) { // И -> И
        return parts[0].toUpperCase();
    }
    return '??';
}

// Вы можете добавить сюда и другие хелперы для статусов, если они понадобятся в других местах
// Например, для FreelancerJobInvolvementStatus:
export function getContractStatusDisplay(status?: ContractEntityStatus): { text: string, className: string } {
    const s = status || "Unknown";
    let text = s.toString();
    let className = 'badge-ghost';

    switch (s) {
        case ContractEntityStatus.Active: text = 'Активен'; className = 'badge-success'; break;
        case ContractEntityStatus.PendingApproval: text = 'Ожидает утверждения'; className = 'badge-warning'; break;
        case ContractEntityStatus.PendingFinishApproval: text = 'Завершение на утверждении'; className = 'badge-info animate-pulse'; break;
        case ContractEntityStatus.Completed: text = 'Завершен'; className = 'badge-primary'; break;
        case ContractEntityStatus.Paused: text = 'На паузе'; className = 'badge-info opacity-70'; break;
        case ContractEntityStatus.Cancelled: text = 'Отменен'; className = 'badge-error opacity-70'; break;
        case ContractEntityStatus.Disputed: text = 'Спор'; className = 'badge-error'; break;
        case ContractEntityStatus.Expired: text = 'Просрочен'; className = 'badge-neutral opacity-70'; break;
        case ContractEntityStatus.Closed: text = 'Закрыт'; className = 'badge-outline'; break;
        default: text = s.toString().replace(/([A-Z])/g, ' $1').trim(); break;
    }
    return { text, className };
}