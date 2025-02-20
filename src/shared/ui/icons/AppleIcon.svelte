<script lang="ts">
    import SvgWrapper from "./SvgWrapper.svelte";

    export let width: string = "24";
    export let height: string = "24";
    export let style: string = "";
</script>

<SvgWrapper {width} {height} {style}>
    <path d="M16.5 2C15.6 2.1 14.4 2.8 13.7 3.7C13 4.6 12.4 5.9 12.6 7C13.7 7 15 6.3 15.7 5.4C16.5 4.6 17 3.4 16.5 2ZM18.9 13.1C18.8 11.2 19.8 10 20.3 9.4C19.3 8 17.7 7.2 16.2 7.2C14.4 7.1 13.3 8.2 12.3 8.2C11.2 8.2 10.2 7.2 8.6 7.2C6.7 7.2 4.8 8.4 3.8 10.3C1.8 14.3 4.2 19.7 6.2 22.2C7.2 23.5 8.3 24.9 9.7 24.9C11.1 24.9 11.6 24 13.3 24C15 24 15.4 24.9 16.8 24.9C18.2 24.9 19.3 23.6 20.3 22.3C21.6 20.6 22.1 19 22.1 19C22.1 19 18.9 17.9 18.9 13.1Z"/>
</SvgWrapper> 