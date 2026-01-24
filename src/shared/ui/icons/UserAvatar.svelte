<script lang="ts">
    import { FileEntity } from "flsurf-client";
    // SvgWrapper is not used in this version of the component, can be removed if not needed elsewhere
    // import SvgWrapper from "./SvgWrapper.svelte"; 

    export let width = '16px';      // Default HTML attribute width
    export let height = '16px';     // Default HTML attribute height
    export let style = '';          // Additional inline styles
    export let className = '';      // Classes for the img tag
    export let avatarFile: FileEntity | undefined = undefined;
    export let altText: string = 'Avatar'; // Added altText prop with a default
    export let imageUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
</script>

{#if avatarFile !== undefined}
    <img 
        width={width} 
        height={height} 
        src={avatarFile.filePath} 
        class="{className} rounded-full" alt={altText} 
        style={style}
    >
{:else}
    <img 
        width={width} 
        height={height} 
        src={imageUrl} 
        class="{className} rounded-full" alt={altText} 
        style={style}
    >
{/if}