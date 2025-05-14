<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { writable, get } from 'svelte/store';

  /* ---------- публичные пропсы ---------- */
  export let open        = false;
  let onClose: () => void = () => { open = false };
  export let title       = '';

  /* ---------- глобальный счётчик модалок ---------- */
  const modalCounter = writable(0);   // 0 .. N

  /*  z‑index для текущего экземпляра  */
  let myZ = 0;
  let ownsBackdrop = false;

  onMount(() => {
    // увеличиваем счётчик
    modalCounter.update(n => {
      myZ = 50 + n + 1;          // 51, 52, …
      ownsBackdrop = n === 0;    // первая модалка создаёт фон
      return n + 1;
    });
  });

  onDestroy(() => {
    modalCounter.update(n => n - 1);
  });
</script>
{#if open}
  {#if ownsBackdrop}
    <!-- ЕДИНСТВЕННЫЙ фон‑оверлей -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <div
      class="fixed inset-0 bg-black/60 z-40"
      on:click={onClose}
    />
  {/if}

  <!-- pointer-events: none; пропускаем клики сквозь контейнер -->
  <div
    class="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
    style="z-index:{myZ}"
    aria-modal="true" role="dialog"
  >
    <!-- окно снова принимает события -->
    <div
      class="relative bg-base-100 text-base-content
             rounded-xl shadow-xl w-full max-w-lg
             border border-base-300 pointer-events-auto"
    >
      <button
        class="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
        aria-label="Close" on:click={onClose}
      >✕</button>

      {#if title}
        <h2 class="text-lg font-semibold px-6 pt-6">{title}</h2>
      {/if}

      <div class="p-6 space-y-4">
        <slot />
      </div>
    </div>
  </div>
{/if}