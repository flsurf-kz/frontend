<script lang="ts">
    import SvgWrapper from "./SvgWrapper.svelte";

    export let width: string = "24";
    export let height: string = "24";
    export let style: string = "";
    export let className = ''
</script>

<SvgWrapper {width} {height} {style} {className}>
    <path d="m18 13.04-1.99-1.992v-8.031h1v-2h-10v2h1v8.023h-.009l-2.001 2v2h5.01l-.01 6.96h2l.01-6.96h4.99z"/>
</SvgWrapper> 