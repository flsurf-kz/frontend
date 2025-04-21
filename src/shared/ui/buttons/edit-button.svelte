<script lang="ts">
	import { EditIcon } from "$lib/shared/ui/icons";

    type Props = {
      onclick: () => void;
      size?: string;
      color?: string;
    };
  
    let { onclick, size = "24px", color = "currentColor" }: Props = $props();
  </script>
  
<button
    type="button"
    style="background: none; border: none; padding: 0.5rem; cursor: pointer;"
    onclick={onclick}
>
    <EditIcon width={size} height={size} style={`color: ${color}`} />
</button>
  