<script lang="ts">
    import SvgWrapper from "$lib/shared/ui/icons/SvgWrapper.svelte";

    export let width: string = "24";
    export let height: string = "24";
    export let style: string = "";
</script>

<SvgWrapper {width} {height} {style}>
    <path d="M17.6 2H21L13.7 10.6L22 22H15.7L10.5 14.8L4.4 22H1L9 13L1 2H7.5L12.3 8.5L17.6 2ZM16.5 20H18.3L7.2 4H5.2L16.5 20Z"/>
</SvgWrapper> 