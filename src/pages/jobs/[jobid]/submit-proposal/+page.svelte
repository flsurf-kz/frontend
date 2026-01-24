<script lang="ts">
    import { goto } from '$app/navigation';
    import { GlobalClient } from '$lib/shared/api';
    import BaseButton from '$lib/shared/ui/buttons/base-button.svelte';
    import { InputField } from '$lib/shared/ui/inputs';
    import TextField from '$lib/shared/ui/inputs/text-field.svelte';
    import { JobEntity, SubmitProposalCommand, CreateFileDto, SubmitProposalCommandBudgetType, type FileEntity } from 'flsurf-client';
    import ChoicesField from '$lib/shared/ui/inputs/choices-field.svelte';
    import type { SelectItem } from '$lib/shared/types';
    import { XCircle } from 'lucide-svelte';

    // Assuming FileParameter is something like this (typical for NSwag/OpenAPI generated clients)
    // You should verify its actual structure from your 'flsurf-client' or its generation source.
    interface FileParameter {
        data: File; // Or Blob
        fileName: string;
    }

    let { data } = $props();
    let { job }: { job: JobEntity } = data;

    let proposedRateInput = $state('');
    let coverLetter = $state('');
    let milestoneMode = $state(true);
    let milestones = $state([{ description: '', dueDate: '', amount: '' }]);
    let projectDuration = $state('');
    let isSubmitting = $state(false);
    let submissionError = $state('');
    let submitted = $state(false);
    let fileUploadMessage = $state('');

    interface ManagedFile {
        id: string;
        file: File;
    }
    let managedFiles = $state<ManagedFile[]>([]);

    const durationOptions: SelectItem[] = [
        { key: 'short', label: 'Менее недели' },
        { key: 'medium', label: '1-4 недели' },
        { key: 'long', label: '1-3 месяца' },
        { key: 'very_long', label: 'Более 3 месяцев' }
    ];

    function addMilestone() {
        milestones = [...milestones, { description: '', dueDate: '', amount: '' }];
    }

    function handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        submissionError = '';
        if (input.files) {
            const newFiles = Array.from(input.files);
            if (managedFiles.length + newFiles.length > 10) {
                submissionError = "Вы можете прикрепить не более 10 файлов.";
                input.value = '';
                return;
            }
            let currentTotalSize = managedFiles.reduce((sum, mf) => sum + mf.file.size, 0);
            const newFilesSize = newFiles.reduce((sum, f) => sum + f.size, 0);
            if (currentTotalSize + newFilesSize > 25 * 1024 * 1024) { // 25MB limit
                submissionError = "Общий размер файлов не должен превышать 25MB.";
                input.value = '';
                return;
            }
            const newManagedFiles: ManagedFile[] = newFiles.map(file => ({
                id: crypto.randomUUID(),
                file: file
            }));
            managedFiles = [...managedFiles, ...newManagedFiles];
            input.value = '';
        }
    }

    function removeFile(fileIdToRemove: string) {
        managedFiles = managedFiles.filter(mf => mf.id !== fileIdToRemove);
    }

    function mapDurationToDays(durationKey: string): number | undefined {
        switch (durationKey) {
            case 'short': return 7;
            case 'medium': return 28;
            case 'long': return 90;
            case 'very_long': return 180;
            default: return undefined;
        }
    }
    
    let totalMilestoneAmount = $derived(
        milestoneMode ? milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0) : 0
    );

    // fileToBase64 function is no longer needed

    async function submit() {
        isSubmitting = true;
        submissionError = '';
        fileUploadMessage = '';

        const finalProposedRate = milestoneMode ? totalMilestoneAmount : parseFloat(proposedRateInput);
        if (isNaN(finalProposedRate) || finalProposedRate <= 0) {
            submissionError = "Укажите корректную сумму ставки или этапов.";
            isSubmitting = false;
            return;
        }
        if (!coverLetter.trim()) {
            submissionError = "Сопроводительное письмо обязательно для заполнения.";
            isSubmitting = false;
            return;
        }
        if (!projectDuration) {
            submissionError = "Укажите предполагаемую длительность проекта.";
            isSubmitting = false;
            return;
        }

        const estimatedDays = mapDurationToDays(projectDuration);
        const uploadedFileReferences: CreateFileDto[] = [];

        if (managedFiles.length > 0) {
            for (let i = 0; i < managedFiles.length; i++) {
                const mf = managedFiles[i];
                fileUploadMessage = `Загрузка файла ${i + 1} из ${managedFiles.length}: ${mf.file.name}...`;
                try {
                    // Construct FileParameter based on its expected structure.
                    // Assuming FileParameter is { data: File, fileName: string }
                    const fileParam: FileParameter = {
                        data: mf.file,
                        fileName: mf.file.name
                    };
                    // If GlobalClient.uploadFile expects just the File object, it would be:
                    // const returnedFileEntity: FileEntity = await GlobalClient.uploadFile(mf.file);

                    const returnedFileEntity: FileEntity = await GlobalClient.uploadFile(fileParam);

                    const referenceDto = new CreateFileDto();
                    referenceDto.fileId = returnedFileEntity.id;
                    referenceDto.name = returnedFileEntity.fileName;
                    referenceDto.mimeType = returnedFileEntity.mimeType;
                    // referenceDto.downloadUrl = returnedFileEntity.filePath; // If needed by SubmitProposalCommand.files
                    uploadedFileReferences.push(referenceDto);

                } catch (uploadError: any) {
                    console.error(`Error uploading file ${mf.file.name}:`, uploadError);
                    submissionError = `Ошибка при загрузке файла "${mf.file.name}". ${uploadError.message || 'Попробуйте снова.'}`;
                    fileUploadMessage = '';
                    isSubmitting = false;
                    return; 
                }
            }
            fileUploadMessage = 'Все файлы успешно загружены.';
        }

        try {
            const command = new SubmitProposalCommand({
                jobId: job.id,
                proposedRate: finalProposedRate,
                coverLetter,
                budgetType: SubmitProposalCommandBudgetType.Fixed,
                estimatedDurationDays: estimatedDays,
                files: uploadedFileReferences.length > 0 ? uploadedFileReferences : undefined,
            });

            fileUploadMessage = 'Отправка предложения...';
            await GlobalClient.submitProposal(command);
            submitted = true;
            fileUploadMessage = '';
            setTimeout(() => {
                goto(`/jobs/${job.id}?proposal_submitted=true`);
            }, 1500);

        } catch (e: any) {
            console.error("Proposal submission error:", e);
            submissionError = e.message || 'Ошибка при отправке предложения. Проверьте данные и попробуйте позже.';
            fileUploadMessage = '';
        } finally {
            if (!submitted) {
                isSubmitting = false;
            }
        }
    }
</script>

{#if submitted}
    <div class="max-w-3xl text-center p-10">
        <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p class="text-xl font-semibold text-green-700">Ваше предложение успешно отправлено!</p>
        <p class="text-gray-600 mt-2">Вы будете перенаправлены на страницу заказа.</p>
        <BaseButton className="primary mt-6" onclick={() => goto(`/jobs/${job.id}`)}>Перейти к заказу</BaseButton>
    </div>
{:else}
    <div class="max-w-3xl flex-col justify-center p-4 sm:p-6 bg-base-100 rounded-lg shadow-xl space-y-6 min-w-50">
        <h1 class="text-2xl font-bold text-base-content">Отправить предложение</h1>

        <div class="bg-base-200 p-4 rounded-md border border-base-300 space-y-1.5">
            <p class="text-base-content"><strong>Название:</strong> {job.title}</p>
            <p class="text-sm text-base-content/80"><strong>Описание:</strong> {job.description || 'N/A'}</p>
            <p class="text-base-content"><strong>Бюджет:</strong> {job.payout?.amount?.toLocaleString() ?? '—'} {job.payout?.currency || '₸'}</p>
            <p class="text-base-content"><strong>Уровень:</strong> {job.level || 'N/A'}</p>
            <p class="text-base-content"><strong>Тип оплаты:</strong> {job.budgetType || 'N/A'}</p>
        </div>

        <div class="space-y-4">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label class="block font-medium text-base-content">Как вы хотите получать оплату?</label>
            <div class="flex flex-wrap gap-x-6 gap-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="paymentMode" class="radio radio-primary" bind:group={milestoneMode} value={true}/> По этапам
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="paymentMode" class="radio radio-primary" bind:group={milestoneMode} value={false}/> За проект
                </label>
            </div>

            {#if milestoneMode}
                <div class="space-y-3">
                    {#each milestones as milestone, index (index)}
                        <div class="p-3 border border-base-300 rounded-md space-y-2">
                            <p class="text-sm font-medium text-base-content">Этап {index + 1}</p>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                                <InputField className="col-span-1 sm:col-span-3" label="Описание этапа" bind:value={milestones[index].description} required={true}/>
                                <InputField label="Дата завершения" inputType="date" bind:value={milestones[index].dueDate} />
                                <InputField label="Сумма (₸)" inputType="number" bind:value={milestones[index].amount} required={true} min="0"/>
                            </div>
                        </div>
                    {/each}
                </div>
                <button type="button" class="btn btn-sm btn-outline btn-primary mt-2" onclick={addMilestone}>+ Добавить этап</button>
                <div class="mt-4 p-3 bg-primary/10 text-primary-content rounded-md">
                    <strong>Общая сумма по этапам: {totalMilestoneAmount.toLocaleString()} ₸</strong>
                </div>
            {:else}
                <InputField label="Общая сумма за проект (₸)" inputType="number" bind:value={proposedRateInput} required={true} min="0"/>
            {/if}
        </div>

        <ChoicesField
            label="Как долго, по вашей оценке, продлится проект?"
            bind:value={projectDuration}
            options={durationOptions}
            required={true}
        />

        <TextField
            label="Сопроводительное письмо"
            placeholder="Расскажите, почему вы отлично подходите для этого проекта, ваш опыт и как вы планируете выполнить работу."
            bind:value={coverLetter}
            rows={6}
            required={true}
        />

        <div>
            <label for="file_upload" class="block text-sm font-medium text-base-content mb-1">Прикрепить файлы (до 10, макс. 25MB)</label>
            <input id="file_upload" type="file" multiple class="file-input file-input-bordered file-input-primary w-full max-w-md" onchange={handleFileChange} accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" />
            
            {#if managedFiles.length > 0}
            <div class="mt-4 space-y-2">
                <p class="text-sm font-medium text-base-content">Прикрепленные файлы ({managedFiles.length}/10):</p>
                {#each managedFiles as mf (mf.id)}
                    <div class="flex justify-between items-center p-2.5 bg-base-200 rounded-md border border-base-300 text-sm">
                        <div class="flex items-center gap-2 overflow-hidden">
                            <span class="text-base-content truncate" title={mf.file.name}>{mf.file.name}</span>
                            <span class="text-base-content/60 text-xs flex-shrink-0">({ (mf.file.size / 1024).toFixed(1) } KB)</span>
                        </div>
                        <button type="button" onclick={() => removeFile(mf.id)} class="text-error hover:text-error-focus p-1" title="Удалить файл" disabled={isSubmitting}>
                            <XCircle class="w-5 h-5"/>
                        </button>
                    </div>
                {/each}
            </div>
            {/if}
        </div>
        
        {#if fileUploadMessage && isSubmitting}
            <div role="status" class="text-sm text-info p-2 bg-info/10 rounded-md">
                {fileUploadMessage}
            </div>
        {/if}

        {#if submissionError}
            <div role="alert" class="alert alert-error text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{submissionError}</span>
            </div>
        {/if}

        <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-base-300">
            <BaseButton type="button" className="btn-ghost" onclick={() => history.back()} disabled={isSubmitting}>Отмена</BaseButton>
            <BaseButton 
                type="submit" 
                className="btn-primary" 
                onclick={submit} 
                disabled={isSubmitting}
            >
                {#if isSubmitting && !fileUploadMessage} <span class="loading loading-spinner loading-xs mr-2"></span> Отправка...
                {:else if isSubmitting && fileUploadMessage}
                     <span class="loading loading-spinner loading-xs mr-2"></span> Обработка...
                {:else}
                    Отправить предложение
                {/if}
            </BaseButton>
        </div>
    </div>
{/if}

<style>
/* Styles can be added here if needed */
</style>