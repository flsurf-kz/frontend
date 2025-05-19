<script lang="ts">
	import { GlobalClient } from "$lib/shared/api";
	import type { MouseEventHandler } from "svelte/elements";

  export let type: "button" | "submit" | "reset" | null | undefined = 'button';
  export let variant: string = 'primary'; // primary, secondary, etc.
  export let disabled: boolean = false;
  export let className: string = ''; 
  export let loading: boolean = false;
  export let onclick: MouseEventHandler<EventTarget>
</script>
  
<button
    class="btn btn-{variant} {loading ? 'loading' : ''} {className}"
    type={type}
    disabled={disabled || loading}
    onclick={onclick}
>
<slot />
</button>
  