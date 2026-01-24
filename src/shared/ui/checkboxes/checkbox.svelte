<script lang="ts">
    type Props = {
      value: boolean;
      onChange: (newValue: boolean) => void;
      disabled?: boolean;
      label?: string;
    };
  
    let { value, onChange, disabled = false, label = "" }: Props = $props();
  
    function handleChange(e: Event) {
      const checked = (e.currentTarget as HTMLInputElement).checked;
      onChange(checked);
    }
  </script>
  
<label class="flex items-center cursor-pointer select-none">
    <input
      type="checkbox"
      class="form-checkbox"
      disabled={disabled}
      checked={value}
      onchange={handleChange}
    />
    {#if label}
      <span class="ml-2">{label}</span>
    {/if}
</label>
  