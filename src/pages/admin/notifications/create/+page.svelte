<script lang="ts">
    import { goto } from '$app/navigation';
    import { BaseButton } from '$lib/shared/ui/buttons';

    import { GlobalClient } from '$lib/shared/api';
    import {
        CreateNotificationCommand,
        CreateNotificationCommandRole,
        CreateNotificationCommandType
    } from 'flsurf-client';
	import { showNotification } from '$lib/shared/ui/errors/modal';

    /* ---------- поля формы ---------- */
    let title  = '';
    let text   = '';
    let userId = '';

    let role: CreateNotificationCommandRole | '' = '';
    let type: CreateNotificationCommandType  | '' = '';

    let extra = '';           // JSON-объект { "key":"value" }

    /* ---------- списки enum-ов ---------- */
    const roles = Object.values(CreateNotificationCommandRole);
    const types = Object.values(CreateNotificationCommandType);

    /* ---------- отправка ---------- */
    async function submit() {
        if (!title.trim() || !text.trim()) {
            return showNotification('Заполните заголовок и текст');
        }

        let payload: Record<string, string> = {};
        if (extra.trim()) {
            try {
                payload = JSON.parse(extra);
            } catch {
                return showNotification('«Доп. данные» должны быть корректным JSON', true);
            }
        }

        const cmd = new CreateNotificationCommand({
            title,
            text,
            data:   payload,
            userId: userId || undefined,
            role:   role   || undefined,
            type:   type   || undefined
        });

        try {
            await GlobalClient.createNotification(cmd);
            showNotification('✅ Уведомление отправлено');
            goto('/admin/notifications');       // «очистить» форму
        } catch (e: any) {
            showNotification('Ошибка: ' + e.message, true);
        }
    }
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<!-- svelte-ignore element_invalid_self_closing_tag -->
<div class="container mx-auto max-w-2xl px-4 py-8 space-y-6">
    <h1 class="text-2xl font-semibold">Отправка уведомления</h1>

    <div class="space-y-4">

        <div class="flex flex-col">
            <label class="font-medium mb-1">Заголовок *</label>
            <input class="input input-bordered" bind:value={title}/>
        </div>

        <div class="flex flex-col">
            <label class="font-medium mb-1">Текст *</label>
            <textarea class="textarea textarea-bordered h-32"
                      bind:value={text}/>
        </div>

        <div class="flex flex-col">
            <label class="font-medium mb-1">User&nbsp;ID (опц.)</label>
            <input class="input input-bordered"
                   placeholder="если пусто — массовая рассылка"
                   bind:value={userId}/>
        </div>

        <div class="flex flex-col">
            <label class="font-medium mb-1">Роль (опц.)</label>
            <select class="select select-bordered" bind:value={role}>
                <option value="">— не выбрано —</option>
                {#each roles as r}<option value={r}>{r}</option>{/each}
            </select>
        </div>

        <div class="flex flex-col">
            <label class="font-medium mb-1">Тип (опц.)</label>
            <select class="select select-bordered" bind:value={type}>
                <option value="">— не выбрано —</option>
                {#each types as t}<option value={t}>{t}</option>{/each}
            </select>
        </div>

        <div class="flex flex-col">
            <label class="font-medium mb-1">
                Доп. данные <span class="text-xs text-gray-500">(JSON)</span>
            </label>
            <textarea class="textarea textarea-bordered h-20"
                      placeholder='{"url: '/orders/123'"}'
                      bind:value={extra}/>
        </div>

        <BaseButton className="btn-primary" onclick={submit}>
            Отправить
        </BaseButton>
    </div>
</div>
