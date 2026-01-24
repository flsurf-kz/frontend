<script lang="ts">
    import SvgWrapper from "$lib/shared/ui/icons/SvgWrapper.svelte";
    
    export let width: string = "24";
    export let height: string = "24";
    export let style: string = "";
</script>

<SvgWrapper {width} {height} {style}>
    <path d="M10 15L15.2 12L10 9V15ZM22 12C22 12 22 8.5 21.4 6.9C21 5.8 20.2 5 19 4.6C17.3 4 12 4 12 4C12 4 6.7 4 5 4.6C3.8 5 3 5.8 2.6 6.9C2 8.5 2 12 2 12C2 12 2 15.5 2.6 17.1C3 18.2 3.8 19 5 19.4C6.7 20 12 20 12 20C12 20 17.3 20 19 19.4C20.2 19 21 18.2 21.4 17.1C22 15.5 22 12 22 12Z"/>
</SvgWrapper> 