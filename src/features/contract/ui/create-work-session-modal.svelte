<script lang="ts">

    // Компонент CreateWorkSessionModal {
    //     prop contractId: string;
    //     event close;
    //     event submit: {
    //         contractId: string;
    //         startTime: Date;
    //         endTime: Date;
    //         description: string;
    //         // screenshots?: FileParameter[];
    //     };
    // }


	import { showNotification } from '$lib/shared/ui/errors/modal';
    import { createEventDispatcher } from 'svelte';
    // import type { FileParameter } from 'flsurf-client';

    export let contractId: string; 

    const dispatch = createEventDispatcher<{
        close: void;
        submit: { contractId: string; startTime: Date; endTime: Date; description: string; /* screenshots?: FileParameter[]; */ };
    }>();

    let startTimeStr = '';
    let endTimeStr = '';
    let description = '';
    // let screenshotsInput: HTMLInputElement | null = $state(null);


    function handleSubmitData() {
        if (!startTimeStr || !endTimeStr || !description.trim()) {
            showNotification('Пожалуйста, заполните все обязательные поля: время начала, время окончания и описание.', true); // Assuming showNotification is global or passed
            return;
        }
        const startTime = new Date(startTimeStr);
        const endTime = new Date(endTimeStr);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
             showNotification('Пожалуйста, введите корректные даты и время.', true);
            return;
        }

        if (endTime <= startTime) {
            showNotification('Время окончания должно быть после времени начала.', true);
            return;
        }

        // let screenshotFiles: FileParameter[] = [];
        // if (screenshotsInput?.files) {
        //     for (let i = 0; i < screenshotsInput.files.length; i++) {
        //         const file = screenshotsInput.files[i];
        //         screenshotFiles.push({ data: file, fileName: file.name });
        //     }
        // }

        dispatch('submit', {
            contractId,
            startTime,
            endTime,
            description,
            // screenshots: screenshotFiles.length > 0 ? screenshotFiles : undefined
        });
    }
</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-lg">
        <h3 class="font-bold text-lg">Добавить сессию вручную</h3>
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onclick={() => dispatch('close')}>✕</button>

        <div class="form-control mt-4">
            <label class="label" for="ws-start-time"><span class="label-text">Время начала</span></label>
            <input type="datetime-local" id="ws-start-time" class="input input-bordered input-sm" bind:value={startTimeStr} />
        </div>
        <div class="form-control mt-2">
            <label class="label" for="ws-end-time"><span class="label-text">Время окончания</span></label>
            <input type="datetime-local" id="ws-end-time" class="input input-bordered input-sm" bind:value={endTimeStr} />
        </div>
        <div class="form-control mt-2">
            <label class="label" for="ws-description"><span class="label-text">Описание проделанной работы</span></label>
            <textarea id="ws-description" class="textarea textarea-bordered h-24" bind:value={description} placeholder="Опишите, что было сделано..."></textarea>
        </div>
        <div class="modal-action mt-6">
            <button class="btn btn-primary" onclick={handleSubmitData}>Отправить на проверку</button>
            <button class="btn btn-ghost" onclick={() => dispatch('close')}>Отмена</button>
        </div>
    </div>
</div>
