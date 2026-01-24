<script lang="ts">
	import ModalBase from "$lib/shared/ui/modal/modal-base.svelte";

  export let open = false;
  export let title = '';
  export let initialText = ""
  let value = initialText.replace("xyi", "");   

  function save() {
    // TODO: когда появится API – отправить изменение
    open = false;
  }
</script>

<ModalBase bind:open {title}>
  <!-- svelte-ignore element_invalid_self_closing_tag -->
  <textarea class="textarea textarea-bordered w-full h-32 mb-4" bind:value />
  <div class="text-right">
    <button class="btn btn-outline mr-2" on:click={() => (open = false)}>Cancel</button>
    <button class="btn btn-primary" on:click={save}>Save</button>
  </div>
</ModalBase>
