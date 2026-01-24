<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  const categories = [
    { key:'smileys', icon:'😊', list:'😀😁😂🤣😃😄😅😆😉😊😋😎😍😘🥰😗😙😚🙂🤗🤩🥳😏😒😞😔😟😕🙁☹️😣😖' },
    { key:'animals', icon:'🐻', list:'🐶🐱🐭🐹🐰🦊🐻🐼🐻‍❄️🐨🐯🦁🐮🐷🐽🐸🐵🐒🐔🐧🐦🐤' },
    { key:'food',    icon:'🍔', list:'🍏🍎🍐🍊🍋🍌🍉🍇🍓🫐🍈🍒🍑🥭🍍🥥🥝🍅🍆🥑🥦🥬🥒🌶️🌽🥕' },
    { key:'sport',   icon:'⚽', list:'⚽🏀🏈⚾🥎🎾🏐🏉🥏🎱🏓🏸🥅🏒🏑🏏⛳🥌🛷' },
    { key:'travel',  icon:'🚗', list:'🚗🚕🚙🚌🚎🏎🚓🚑🚒🚐🚚🚛🚜🦯🦽🦼🛴🚲🛵🏍' },
    { key:'light',   icon:'💡', list:'💡🔦🏮🪔📯🎷🎸🎹🥁🪘🎺🎻🎼🎤🎧' },
    { key:'music',   icon:'🎵', list:'🎵🎶🎼🎹🥁🎷🎸🎺🎻' }
  ];

  export let className = '';
  const dispatch = createEventDispatcher();

  let active = 0;
</script>

<div class={`rounded-lg bg-base-100 p-2 w-72 ${className}`} style="--tw-shadow-color:var(--fallback-bc,rgba(0,0,0,.1));--tw-shadow:0 8px 16px -4px var(--tw-shadow-color);">
  <!-- tabs -->
  <div class="flex items-center justify-between pb-2 mb-2 border-b border-base-300">
    {#each categories as c,i}
      <button class="w-1/6 text-xl hover:opacity-70"
              class:text-green-600={active===i}
              on:click={() => active=i}>{c.icon}</button>
    {/each}
  </div>

  <!-- grid -->
  <div class="h-48 overflow-y-auto pr-1">
    <div class="grid grid-cols-8 gap-2 text-xl">
      {#each categories[active].list.split('') as em}
        <button class="hover:bg-base-300 rounded"
                on:click={() => dispatch('select', em)}>{em}</button>
      {/each}
    </div>
  </div>
</div>

<style>
  div::-webkit-scrollbar{width:6px}
  div::-webkit-scrollbar-thumb{background:var(--color-base-300)}
</style>
