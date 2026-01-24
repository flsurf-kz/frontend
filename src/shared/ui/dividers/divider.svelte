<script lang="ts">
    type Props = {
      color?: string;
      thickness?: string;
      margin?: string;
    };
  
    // Извлекаем пропсы через $props() (Svelte 5)
    let {
      color = "#e5e7eb",  // светло-серый
      thickness = "1px",
      margin = "1rem 0"
    }: Props = $props();
</script>
  
<hr style="border: none; border-top: {thickness} solid {color}; margin: {margin};" />
