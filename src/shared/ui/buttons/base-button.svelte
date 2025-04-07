<script lang="ts">
    export let type: "button" | "submit" | "reset" | null | undefined = 'button';
    export let variant: string = 'primary'; // primary, secondary, etc.
    export let disabled: boolean = false;
    export let loading: boolean = false;
  </script>
  
<button
    class="btn btn-{variant} {loading ? 'loading' : ''}"
    type={type}
    disabled={disabled || loading}
>
<slot />
</button>
  