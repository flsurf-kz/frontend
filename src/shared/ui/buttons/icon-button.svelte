<script lang="ts">
    type Props = {
      onClick: () => void;
      size?: string;
      color?: string;
      ariaLabel?: string;
    };
  
    let {
      onClick,
      size = "24px",
      color = "currentColor",
      ariaLabel = "icon button"
    }: Props = $props();
</script>
  
<!-- svelte-ignore slot_element_deprecated -->
<button
    type="button"
    aria-label={ariaLabel}
    style="background: none; border: none; padding: 0.5rem; cursor: pointer;"
    onclick={onClick}
>
  <slot />
</button>
  