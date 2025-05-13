<script lang="ts">
    import { onMount } from 'svelte';
    import {
      FinanceSummaryDto,
	    GetFinanceSummaryQuery
    } from 'flsurf-client';
  	import { GlobalClient } from '$lib/shared/api';
  	import { CurrentUser } from '$lib/entities/user/model/modal';
  
    export let data: {
      months: { label: string; value: number }[];
      years: number[];
      currentMonth: number;
      currentYear: number;
    };
  
    let month = data.currentMonth;
    let year  = data.currentYear;
  
    let summary: FinanceSummaryDto | null = null;
    let loading = false;
  
    async function loadSummary() {
      loading = true;
      try {
        summary = await GlobalClient.getUserFinancesSummary(
          new GetFinanceSummaryQuery({month, year, userId: $CurrentUser?.id})
        );
      } finally {
        loading = false;
      }
    }
  
    // initial load
    onMount(loadSummary);
  
    // reload when month/year change
    $: if (month && year) {
      loadSummary();
    }
  </script>
  
  <section class="p-6 space-y-8">
    <!-- Picker -->
    <div class="flex items-center gap-4">
      <h1 class="text-2xl font-semibold">Monthly Summary</h1>
  
      <select
        class="select select-bordered"
        bind:value={month}
      >
        {#each data.months as m}
          <option value={m.value}>{m.label}</option>
        {/each}
      </select>
  
      <select
        class="select select-bordered"
        bind:value={year}
      >
        {#each data.years as y}
          <option value={y}>{y}</option>
        {/each}
      </select>
    </div>
  
    {#if loading}
      <p>Loading…</p>
    {:else if summary}
      <!-- Totals / Top 5 cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Totals -->
        <div class="card bg-base-100 p-4 rounded-lg shadow">
          <h2 class="font-semibold mb-2">Totals</h2>
          <ul class="space-y-1 text-sm">
            <li>Hourly: {summary.totalEarn.hourlyAmount.toFixed(2)}₸</li>
            <li class="pl-4 text-xs">Manual time: {summary.totalEarn.manualAmount.toFixed(2)}₸</li>
            <li>Fixed & other: {summary.totalEarn.fixedAmount.toFixed(2)}₸</li>
          </ul>
          <div class="mt-2 text-lg font-bold">
            { (summary.totalEarn.hourlyAmount + summary.totalEarn.fixedAmount).toFixed(2) }₸
          </div>
        </div>
  
        <!-- Top 5 Contracts -->
        <div class="card bg-base-100 p-4 rounded-lg shadow">
          <h2 class="font-semibold mb-2">Top 5 contracts</h2>
          {#if summary.topContracts.length}
            <ol class="list-decimal list-inside space-y-1 text-sm">
              {#each summary.topContracts as c (c.contractId)}
                <li>{c.contractLabel} — {c.amount.toFixed(2)}₸</li>
              {/each}
            </ol>
          {:else}
            <p class="opacity-60">There is no data for the selected month</p>
          {/if}
        </div>
  
        <!-- Top 5 Activities -->
        <div class="card bg-base-100 p-4 rounded-lg shadow">
          <h2 class="font-semibold mb-2">Top 5 activities</h2>
          {#if summary.topActivities.length}
            <ol class="list-decimal list-inside space-y-1 text-sm">
              {#each summary.topActivities as a (a.activityId)}
                <li>{a.description} — {a.count}</li>
              {/each}
            </ol>
          {:else}
            <p class="opacity-60">There is no data for the selected month</p>
          {/if}
        </div>
      </div>
  
      <!-- Earnings Sections -->
      <div class="space-y-12">
        <!-- Fixed-price -->
        <section>
          <h3 class="text-xl font-semibold mb-4">Fixed price and other payments</h3>
          {#if summary.earnings.fixed.length}
            <table class="table w-full">
              <thead>
                <tr>
                  <th>Contract</th>
                  <th class="text-right">Amount (₸)</th>
                </tr>
              </thead>
              <tbody>
                {#each summary.earnings.fixed as f (f.contractId)}
                  <tr>
                    <td>{f.contractLabel}</td>
                    <td class="text-right">{f.amount.toFixed(2)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {:else}
            <div class="card bg-base-100 p-6 rounded-lg shadow text-center">
              <img src="/no-data.svg" alt="No data" class="mx-auto w-16 h-16 mb-4"/>
              <p class="font-semibold">No records to show</p>
              <p class="opacity-60 text-sm">
                There is no fixed-price data for the selected month
              </p>
            </div>
          {/if}
        </section>
  
        <!-- Hourly -->
        <section>
          <h3 class="text-xl font-semibold mb-4">Hourly</h3>
          {#if summary.earnings.hourly.length}
            <table class="table w-full">
              <thead>
                <tr>
                  <th>Session</th>
                  <th class="text-right">Hours</th>
                  <th class="text-right">Amount (₸)</th>
                </tr>
              </thead>
              <tbody>
                {#each summary.earnings.hourly as h (h.sessionId)}
                  <tr>
                    <td>{h.comment}</td>
                    <td class="text-right">{h.hours.toFixed(2)}</td>
                    <td class="text-right">{h.amount.toFixed(2)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {:else}
            <div class="card bg-base-100 p-6 rounded-lg shadow text-center">
              <img src="/no-data.svg" alt="No data" class="mx-auto w-16 h-16 mb-4"/>
              <p class="font-semibold">No records to show</p>
              <p class="opacity-60 text-sm">
                There is no hourly data for the selected month
              </p>
            </div>
          {/if}
        </section>
      </div>
    {/if}
  </section>
  