<script lang="ts">
    import SvgWrapper from "./SvgWrapper.svelte";

    export let width: string = "24";
    export let height: string = "24";
    export let style: string = "";
    export let className = ''
</script>

<SvgWrapper {className} {style} {width} {height} viewBox="0 0 24 24">
    <path d="m0 0h24v24h-24z" fill="#fff" opacity="0" transform="matrix(-1 0 0 -1 24 24)"/>
    <path d="m19 11h-6v-6a1 1 0 0 0 -2 0v6h-6a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2z" fill="#231f20"/>
</SvgWrapper>