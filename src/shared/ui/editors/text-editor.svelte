<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let content: string = '';
    export let label: string = '';
    const dispatch = createEventDispatcher();
  
    function onInput(event: Event) {
      const target = event.target as HTMLTextAreaElement;
      dispatch('change', target.value);
    }
</script>
  
<div class="form-control w-full">
    {#if label}
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">
        <span class="label-text">{label}</span>
      </label>
    {/if}
    <textarea
      class="textarea textarea-bordered"
      rows="6"
      bind:value={content}
      on:input={onInput}
    />
</div>
  