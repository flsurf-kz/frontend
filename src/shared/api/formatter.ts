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

export interface ContractStatusInfo {
    label: string;
    description?: string;
    className?: string; // Для возможной цветовой индикации статуса
}

export function getContractStatusInfo(
    status: ContractEntityStatus | undefined,
    pauseReason?: string | undefined,
    isFreelancer?: boolean, // Чтобы кастомизировать описание для PendingApproval
    isClient?: boolean
): ContractStatusInfo {
    switch (status) {
        case ContractEntityStatus.PendingApproval:
            let pendingDesc = "Заказчик предложил условия контракта. ";
            if (isFreelancer) {
                pendingDesc += "Вам необходимо принять контракт, чтобы начать работу. Если вы не примете его в течение установленного срока, предложение может быть аннулировано.";
            } else if (isClient) {
                pendingDesc += "Ожидается принятие условий со стороны исполнителя. Если исполнитель не примет контракт, он будет аннулирован.";
            } else {
                pendingDesc += "Ожидается принятие условий одной из сторон.";
            }
            return {
                label: "Ожидает Принятия",
                description: pendingDesc,
                className: "text-warning-content bg-warning/20 border-warning" // Пример класса для цвета
            };
        case ContractEntityStatus.Active:
            let activeDesc = "Контракт активен. Идет выполнение работ согласно условиям.";
            if (isFreelancer) activeDesc += " Не забывайте своевременно сдавать работу или этапы.";
            if (isClient) activeDesc += " Вы можете отслеживать прогресс и ожидать результатов.";
            return {
                label: "Активен",
                description: activeDesc,
                className: "text-success-content bg-success/20 border-success"
            };
        case ContractEntityStatus.Paused:
            return {
                label: "Приостановлен",
                description: `Работа по контракту временно приостановлена. ${pauseReason ? `Причина: ${pauseReason}` : 'Причина не указана.'}`,
                className: "text-warning-content bg-warning/20 border-warning"
            };
        case ContractEntityStatus.Completed:
            return {
                label: "Завершен",
                description: "Все работы по контракту выполнены, приняты заказчиком, и произведены все расчеты.",
                className: "text-info-content bg-info/20 border-info"
            };
        case ContractEntityStatus.Disputed:
            return {
                label: "Открыт Спор",
                description: "По контракту возникли разногласия, и открыт спор. Ожидается его разрешение арбитражной службой FLSURF.KZ.",
                className: "text-error-content bg-error/20 border-error"
            };
        case ContractEntityStatus.Cancelled:
            return {
                label: "Отменен",
                description: "Контракт был отменен до его полного завершения по инициативе одной из сторон или по взаимному согласию.",
                className: "text-error-content bg-error/20 border-error"
            };
        case ContractEntityStatus.Expired:
            return {
                label: "Истек Срок",
                description: "Срок действия контракта истек. Если работы не были завершены, могут потребоваться дальнейшие действия.",
                className: "text-neutral-content bg-neutral/20 border-neutral"
            };
        case ContractEntityStatus.Closed:
            return {
                label: "Закрыт",
                description: "Контракт окончательно закрыт. Все взаимные обязательства выполнены или урегулированы.",
                className: "text-info-content bg-info/20 border-info"
            };
        case ContractEntityStatus.PendingFinishApproval:
            let pendingFinishDesc = "";
             if (isClient) {
                pendingFinishDesc = "Исполнитель сдал работу на проверку. Пожалуйста, рассмотрите и примите выполненную работу или запросите доработки.";
            } else if (isFreelancer) {
                pendingFinishDesc = "Ваша работа отправлена на проверку заказчику. Ожидайте его решения.";
            } else {
                pendingFinishDesc = "Работа сдана исполнителем и ожидает подтверждения завершения заказчиком.";
            }
            return {
                label: "Ожидает Подтверждения Завершения",
                description: pendingFinishDesc,
                className: "text-warning-content bg-warning/20 border-warning"
            };
        default:
            return {
                label: status ? String(status) : "Неизвестен",
                description: "Статус контракта не определен или является нестандартным.",
                className: "text-base-content bg-base-300/30 border-base-300"
            };
    }
}