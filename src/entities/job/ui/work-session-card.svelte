
<script lang="ts">
    // Компонент WorkSessionCard {
    //     prop session: WorkSessionEntity;
    //     prop userRole: 'client' | 'freelancer' | 'staff';
    //     prop formatDate: (dateString: string | Date | undefined, includeTime?: boolean) => string;
    //     event approve: string; // sessionId
    //     event reject: string;  // sessionId
    //     event view_details: string; // sessionId
    // }

    import { WorkSessionEntityStatus, type WorkSessionEntity } from 'flsurf-client';
    import { createEventDispatcher } from 'svelte';

    export let session: WorkSessionEntity;
    export let userRole: 'client' | 'freelancer' | 'staff';
    export let formatDate: (dateString: string | Date | undefined, includeTime?: boolean) => string;

    const dispatch = createEventDispatcher<{
        approve: string;
        reject: string;
        view_details: string;
    }>();

    function getStatusInfo(status: WorkSessionEntityStatus | undefined): { text: string; class: string } {
        switch (status) {
            case WorkSessionEntityStatus.Pending: return { text: 'Ожидает проверки', class: 'badge-warning' };
            case WorkSessionEntityStatus.Approved: return { text: 'Одобрена', class: 'badge-success' };
            case WorkSessionEntityStatus.Rejected: return { text: 'Отклонена', class: 'badge-error' };
            default: return { text: status ?? 'Неизвестен', class: 'badge-ghost' };
        }
    }

    const statusInfo = getStatusInfo(session.status)
</script>


<div class="card card-compact bordered bg-base-100 shadow hover:shadow-lg transition-shadow ease-in-out duration-150">
    <div class="card-body">
        <div class="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div class="flex-grow">
                <h3 class="font-semibold text-md">
                    Сессия: {formatDate(session.startDate)} - {session.endDate ? formatDate(session.endDate) : "Активна"}
                </h3>
                {#if userRole === 'client' && session.freelancer}
                        <p class="text-xs text-gray-500">Исполнитель: {session.freelancer.fullname ?? session.freelancerId}</p>
                {/if}
                <p class="text-sm text-gray-600 mt-1">Длительность: {'N/A'} мин.</p>
                <p class="text-xs text-gray-500 mt-1 truncate" title={session.comment}>Описание: 
                    {session.comment?.substring(0,70) ?? 'Нет описания'}
                    {session.comment && session.comment.length > 70 ? '...' : ''}
                </p>
            </div>
            <div class="flex-shrink-0 text-left sm:text-right">
                <div class="badge {statusInfo.class} badge-sm mt-1">{statusInfo.text}</div>
            </div>
        </div>
        {#if session.status === 'Rejected' && session.clientComment}
            <p class="text-xs text-error mt-1 p-1 bg-error/10 rounded">Причина отклонения: {session.clientComment}</p>
        {/if}
        <div class="card-actions justify-end mt-3">
            <button class="btn btn-xs btn-ghost text-primary" on:click={() => dispatch('view_details', session.id)}>Детали</button>
            {#if (userRole === 'client' || userRole === 'staff') && session.status === WorkSessionEntityStatus.Pending}
                <button class="btn btn-xs btn-success" on:click={() => dispatch('approve', session.id)}>Одобрить</button>
                <button class="btn btn-xs btn-error" on:click={() => dispatch('reject', session.id)}>Отклонить</button>
            {/if}
        </div>
    </div>
</div>
