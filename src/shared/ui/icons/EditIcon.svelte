<script lang="ts">
    import SvgWrapper from "./SvgWrapper.svelte";

    export let width: string = "24";
    export let height: string = "24";
    export let style: string = "";
    export let className: string = ""
</script>

<SvgWrapper {width} {height} {style} {className} viewBox="0 0 8 8">
    <path xmlns="http://www.w3.org/2000/svg" d="m6 0-1 1 2 2 1-1zm-2 2-4 4v2h2l4-4z"/>
</SvgWrapper> 