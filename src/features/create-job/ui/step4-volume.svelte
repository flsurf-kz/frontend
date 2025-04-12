<script lang="ts">
    import { goto } from '$app/navigation';
	import { createJobStore } from '../modal';
    
    let expirationDate = "";
  
    function handleNext() {
      createJobStore.update(data => ({
        ...data,
        expirationDate: expirationDate ? new Date(expirationDate) : undefined
      }));
      goto("/job/create/step5");
    }
  </script>
  
 <!-- svelte-ignore a11y_label_has_associated_control -->
  <div class="space-y-4">
    <h1 class="text-2xl font-bold mb-4">Срок выполнения заказа</h1>
    <div>
      <label class="label">Дата окончания</label>
      <input type="date" bind:value={expirationDate} class="input input-bordered w-full" required />
    </div>
    <div class="flex justify-end mt-6">
      <button class="btn btn-success" on:click={handleNext}>Далее</button>
    </div>
  </div>
  