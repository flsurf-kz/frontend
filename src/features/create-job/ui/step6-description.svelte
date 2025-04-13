<script lang="ts">
    import { goto } from '$app/navigation';
	import { createJobStore } from '../modal';
  
    // Дополнительное описание
    let additionalInfo = "";
  
    function handleNext() {
      createJobStore.update(data => ({
        ...data,
        additionalInfo: additionalInfo.trim() !== "" ? additionalInfo : undefined
      }));
      goto("/job/create/overview");
    }
  </script>
  
  <div class="space-y-4">
    <h1 class="text-2xl font-bold mb-4">Дополнительная информация</h1>
    <div class="form-control">
      <label class="label">Уточнения, дополнительные условия</label>
      <textarea bind:value={additionalInfo} placeholder="Введите дополнительные сведения" class="textarea textarea-bordered w-full" rows="4"></textarea>
    </div>
    <div class="flex justify-end mt-6">
      <button class="btn btn-success" on:click={handleNext}>Далее</button>
    </div>
  </div>
  