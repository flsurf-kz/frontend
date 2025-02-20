<script lang="ts">
    export let width: string = "24";
    export let height: string = "24";
    export let style: string = "";
    export let viewBox: string = "0 0 24 24";
</script>

<svg 
    width={width} 
    height={height} 
    style={style} 
    viewBox={viewBox} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="currentColor"
>
    <slot />
</svg>