<script lang="ts">
	import { FileEntity } from "flsurf-client";
	import SvgWrapper from "./SvgWrapper.svelte";

    export let width = '16';  // Ширина по умолчанию
    export let height = '16'; // Высота по умолчанию
    export let style = '';    // Дополнительные стили
    export let className = ''; 
    export let avatarFile: FileEntity | undefined = undefined 
    export let imageUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'; 
</script>
  
{#if avatarFile !== undefined} 
    <img width={width} height={height} src={avatarFile.filePath} class={className + " rounded-full"} alt="" style={style}>
{:else}
    <img width={width} height={height} src={imageUrl} class={className + " rounded-full"} alt="" style={style}>    
{/if} 