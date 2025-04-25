<script lang="ts">
    import { onMount } from 'svelte';
    import { Chart } from 'flowbite-svelte';
  	import { BaseButton } from '$lib/shared/ui/buttons';
  	import { GlobalClient } from '$lib/shared/api';
	import type { FreelancerStatsDto } from 'flsurf-client';
  
    export let userId!: string;
  
    let stats: FreelancerStatsDto | null = null;
    let loading = true;
  
    // ─── GET DATA ─────────────────────────────────────────────
    onMount(async () => {
      try {
        stats = await GlobalClient.getFreelancerStats(userId);
      } catch (e) {
        console.error('Failed to load stats', e);
      } finally {
        loading = false;
      }
    });
  
    // ─── Job Success Score (radialBar) ────────────────────────
    $: jssOptions = {
      series: [stats?.jobSuccessScore ?? 0],
      chart: { type: 'radialBar', height: 180, sparkline: { enabled: true } },
      plotOptions: {
        radialBar: {
          hollow: { size: '65%' },
          dataLabels: {
            value: { formatter: (v) => {`${v}%`}, fontSize: '24px' }
          }
        }
      },
      labels: ['JSS']
    };
  
    // ─── Profile Views (line) ─────────────────────────────────
    $: viewsOptions = {
      series: stats
        ? [{ name: 'Views', data: stats.profileViews.map(p => [Date.parse(p.date), p.count]) }]
        : [],
      chart: { type: 'line', height: 200, toolbar: { show: false } },
      stroke: { curve: 'smooth', width: 2 },
      xaxis: { type: 'datetime', labels: { datetimeFormatter: { year: 'yyyy', month: 'MMM dd' } } },
      yaxis: { show: false }
    };
  
    // ─── Proposals (horizontal bar) ───────────────────────────
    $: proposalsOptions = {
      series: stats
        ? [{ name: 'Proposals', data: [
            stats.proposals.sent,
            stats.proposals.viewed,
            stats.proposals.interviews,
            stats.proposals.hires
          ] }]
        : [{ data: [0, 0, 0, 0] }],
      chart: { type: 'bar', height: 150 },
      plotOptions: { bar: { horizontal: true, barHeight: '55%' } },
      dataLabels: { enabled: true },
      xaxis: { categories: ['Sent', 'Viewed', 'Interviews', 'Hires'] },
      yaxis: { show: false }
    };
  
    // ─── Client Relationships (donut) ─────────────────────────
    $: clientsOptions = {
      series: stats ? [stats.longTermClients, stats.shortTermClients] : [0, 0],
      chart: { type: 'donut', height: 180, sparkline: { enabled: true } },
      labels: ['> 90 days', '≤ 90 days'],
      legend: { show: false }
    };
  </script>
  
  <section class="grid gap-6 p-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <!-- 12-month earnings -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h2 class="card-title">12-month earnings</h2>
        {#if loading}
          <span class="skeleton h-8 w-24"/>
        {:else}
          <p class="text-3xl font-semibold">
            ${stats?.earningsLast12Months?.toLocaleString()}
          </p>
        {/if}
        <BaseButton className="btn-link mt-2" onclick={() => {}}>Transaction history</BaseButton>
      </div>
    </div>
  
    <!-- Job Success Score -->
    <div class="card bg-base-100 shadow">
      <div class="card-body items-center text-center">
        <h2 class="card-title">Job Success Score</h2>
        {#if loading}
          <span class="skeleton h-40 w-full"/>
        {:else}
          <Chart options={jssOptions} class="w-full"/>
        {/if}
        <BaseButton className="btn-outline btn-sm mt-2" onclick={() => {}}>View insights</BaseButton>
      </div>
    </div>
  
    <!-- Proposals -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <div class="flex justify-between items-center">
          <h2 class="card-title">Proposals</h2>
          <select class="select select-bordered select-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>All time</option>
          </select>
        </div>
        {#if loading}
          <span class="skeleton h-32 w-full"/>
        {:else}
          <Chart options={proposalsOptions} class="w-full"/>
        {/if}
      </div>
    </div>
  
    <!-- Profile metrics (views) -->
    <div class="card bg-base-100 shadow md:col-span-2 lg:col-span-2">
      <div class="card-body">
        <div class="flex justify-between items-center">
          <h2 class="card-title">Profile metrics</h2>
          <select class="select select-bordered select-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>90 days</option>
          </select>
        </div>
        {#if loading}
          <span class="skeleton h-40 w-full"/>
        {:else}
          <Chart options={viewsOptions} class="w-full"/>
        {/if}
      </div>
    </div>
  
    <!-- Client relationships -->
    <div class="card bg-base-100 shadow">
      <div class="card-body items-center text-center">
        <h2 class="card-title">Client relationships</h2>
        {#if loading}
          <span class="skeleton h-40 w-full"/>
        {:else}
          <Chart options={clientsOptions} class="w-full"/>
        {/if}
        <BaseButton class="btn-link mt-2">Explore how it works</BaseButton>
      </div>
    </div>
  
  </section>
  
  <style>
    /* на мобильных — одна колонка */
    @media (max-width: 640px) {
      section { grid-template-columns: 1fr; }
    }
  </style>
  