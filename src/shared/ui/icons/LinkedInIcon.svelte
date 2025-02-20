<script lang="ts">
    import SvgWrapper from "./SvgWrapper.svelte";

    export let width: string = "24";
    export let height: string = "24";
    export let style: string = "";
</script>

<SvgWrapper {width} {height} {style}>
    <path d="M4 3C4 4.1 3.1 5 2 5C0.9 5 0 4.1 0 3C0 1.9 0.9 1 2 1C3.1 1 4 1.9 4 3ZM0 23H4V7H0V23ZM8 7V23H12V14C12 12.3 12.3 11 14 11C15.7 11 16 12.3 16 14V23H20V13C20 9.1 18.4 7 14.7 7C12.9 7 11.5 7.9 10.8 9H10V7H8Z"/>
</SvgWrapper> 