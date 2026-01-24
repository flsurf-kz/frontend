<script lang="ts">
    import { goto }                                   from '$app/navigation';
    import { page }                                   from '$app/stores';
    import { onMount }                                from 'svelte';
    import {
        createJobStore,
        currentJobCreationStepKey
    }                                                 from '../modal';
    import { showNotification }                       from '$lib/shared/ui/errors/modal';

    /***** local state ********************************************************/
    $: expirationDate = $createJobStore.expirationDate;

    /***** helpers ************************************************************/
    const MS_PER_DAY   = 86_400_000;
    const MAX_YEARS    = 2;

    function isValidExpiration(dateStr: Date | undefined): boolean {
        if (!dateStr) return false;
        const picked  = new Date(dateStr);
        const today   = new Date();
        const maxDate = new Date(today.getTime() + MAX_YEARS * 365 * MS_PER_DAY);
        return picked > today && picked <= maxDate;
    }

    function handleNext(): void {
        if (!isValidExpiration(expirationDate)) {
            showNotification(
                `Укажите дату в диапазоне от завтра до ${MAX_YEARS} лет вперёд.`,
                false,
            );
            return;
        }
        goto('/jobs/post/budget');
    }

    /***** keep step bar in sync **********************************************/
    onMount(() => {
        const key = $page.params.stepKey;
        if (key) currentJobCreationStepKey.set(key);
    });
</script>

<!-- =============================== MARK-UP ================================-->
<div class="space-y-4">
    <h1 class="text-2xl font-bold mb-4">Когда заказ будет закрыт</h1>

    <div>
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="label">Дата окончания</label>
        <input
            type="date"
            bind:value={expirationDate}
            class="input input-bordered w-full"
            min={new Date(Date.now() + MS_PER_DAY).toISOString().split('T')[0]}
            max={new Date(Date.now() + MAX_YEARS * 365 * MS_PER_DAY).toISOString().split('T')[0]}
            required
        />
        <p class="text-xs mt-1 opacity-70">
            Дата должна быть в пределах ближайших {MAX_YEARS} лет.
        </p>
    </div>

    <div class="flex justify-end mt-6">
        <button class="btn btn-success" on:click={handleNext}>Далее</button>
    </div>
</div>
