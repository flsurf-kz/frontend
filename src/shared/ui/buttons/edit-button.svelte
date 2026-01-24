<script lang="ts">
	import { EditIcon } from "$lib/shared/ui/icons";

    type Props = {
      onclick: () => void;
      size?: string;
      color?: string;
      className?: string; 
    };
  
    let { onclick, size = "24px", color = "currentColor", className = "" }: Props = $props();
  </script>
  
<button
    type="button"
    style="border: 1px solid #13fc03; border-radius: 10rem; padding: 0.5rem; cursor: pointer; "
    onclick={onclick}
    class={className + " bg-base-100"} 
>
    <EditIcon width={size} height={size} style={`color: ${color}`} />
</button>
  