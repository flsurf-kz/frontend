<script lang="ts">
	import ModalBase from '$lib/shared/ui/modal/modal-base.svelte';
  import { createEventDispatcher } from 'svelte';

  /* ——— external props ——— */
  export let open          = false;     // 2‑way bound: <MoneyEditModal bind:open …>
  export let currentRate   = 0;         // текущее значение из профиля
  export let feePercent    = 10;        // «комиссия сервиса», можно переопределить

  /* ——— internal state ——— */
  const dispatch   = createEventDispatcher();
  let hourlyRate   = currentRate || 0;

  $: serviceFee    = +(hourlyRate * feePercent / 100).toFixed(2);
  $: youReceive    = +(hourlyRate - serviceFee).toFixed(2);

  function save() {
    dispatch('save', hourlyRate);   // родитель сам вызовет GlobalClient → PATCH профиля
    open = false;
  }
</script>

<!-- ╭── Modal wrapper ───────────────────────────────────────────────────╮ -->
<ModalBase bind:open title="Change hourly rate">
  <p class="mb-4 text-sm">
    Please note that your new hourly rate will only apply to new contracts.
  </p>

  <p class="mb-6 text-sm opacity-70">
    Your profile rate: <span class="font-medium">₸{currentRate}/hr</span>
  </p>

  <!-- ╭── GRID rows ─────────────────────────────────────────────────────╮ -->
  <div class="grid gap-6">

    <!-- Hourly rate input -->
    <div>
      <header class="font-semibold mb-1">Hourly Rate</header>
      <p class="text-xs opacity-60 mb-2">Total amount the client will see</p>

      <div class="flex items-center gap-2">
        <input
          type="number"
          min="0"
          step="0.01"
          bind:value={hourlyRate}
          class="input input-bordered w-32 text-right font-semibold"
        />
        <span>/hr</span>
      </div>
    </div>

    <!-- Service fee (disabled) -->
    <div>
      <header class="font-semibold mb-1">Upwork&nbsp;Service&nbsp;Fee</header>
      <p class="text-xs opacity-60 mb-2">
        Fees vary and are shown before contract acceptance
      </p>

      <div class="flex items-center gap-2">
        <input
          class="input input-bordered w-32 text-right opacity-50 pointer-events-none"
          value={`-${serviceFee.toFixed(2)}`}
          disabled
        />
        <span>/hr</span>
      </div>
    </div>

    <!-- You'll receive (disabled) -->
    <div>
      <header class="font-semibold mb-1">You'll Receive</header>
      <p class="text-xs opacity-60 mb-2">
        The estimated amount you’ll receive after service fees
      </p>

      <div class="flex items-center gap-2">
        <input
          class="input input-bordered w-32 text-right opacity-50 pointer-events-none"
          value={youReceive.toFixed(2)}
          disabled
        />
        <span>/hr</span>
      </div>
    </div>
  </div>

  <!-- ╭── Footer actions ────────────────────────────────────────────────╮ -->
  <div class="mt-8 flex justify-end gap-6">
    <button class="link link-hover" on:click={() => (open = false)}>Cancel</button>
    <button class="btn btn-success" on:click={save}>Save</button>
  </div>
</ModalBase>
