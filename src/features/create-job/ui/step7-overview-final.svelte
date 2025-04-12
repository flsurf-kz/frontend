<script lang="ts">
    import { get } from "svelte/store";
    import { GlobalClient } from "$lib/shared/api";
    import { goto } from "$app/navigation";
	import { createJobStore } from "../modal";
  
    let loading = false;
    let error: string | null = null;
  
    async function handleSubmit() {
      error = null;
      loading = true;
      try {
        const command = get(createJobStore);
        await GlobalClient.createJob(command);
        alert("Работа успешно создана!");
        goto("/jobs");
      } catch (e) {
        console.error(e);
        error = "Ошибка создания работы. Попробуйте ещё раз.";
      }
      loading = false;
    }
  </script>
  
  <div class="space-y-4">
    <h1 class="text-2xl font-bold mb-4">Подтверждение</h1>
    <!-- Вывод итоговых данных для проверки -->
    <pre class="p-4 bg-base-200 rounded">
      {JSON.stringify($createJobStore, null, 2)}
    </pre>
    {#if error}
      <p class="text-red-500 text-sm">{error}</p>
    {/if}
    <div class="flex justify-end mt-6">
      <button class="btn btn-success" on:click={handleSubmit} disabled={loading}>
        {loading ? "Отправка..." : "Создать работу"}
      </button>
    </div>
  </div>
  