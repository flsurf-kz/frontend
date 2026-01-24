<script lang="ts">
    import SvgWrapper from "$lib/shared/ui/icons/SvgWrapper.svelte";

    export let width: string = "24";
    export let height: string = "24";
    export let style: string = "";
</script>

<SvgWrapper {width} {height} {style}>
    <path d="M7 2C4.2 2 2 4.2 2 7V17C2 19.8 4.2 22 7 22H17C19.8 22 22 19.8 22 17V7C22 4.2 19.8 2 17 2H7ZM18 4C18.6 4 19 4.4 19 5C19 5.6 18.6 6 18 6C17.4 6 17 5.6 17 5C17 4.4 17.4 4 18 4ZM12 6C15.3 6 18 8.7 18 12C18 15.3 15.3 18 12 18C8.7 18 6 15.3 6 12C6 8.7 8.7 6 12 6ZM12 8C9.8 8 8 9.8 8 12C8 14.2 9.8 16 12 16C14.2 16 16 14.2 16 12C16 9.8 14.2 8 12 8Z"/>
</SvgWrapper> 