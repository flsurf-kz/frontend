<script lang="ts">
	import { FileEntity } from "flsurf-client";
	import SvgWrapper from "./SvgWrapper.svelte";
    import { GlobalConfig } from "$lib/shared/config";

    export let width = '19';  // Ширина по умолчанию
    export let height = '19'; // Высота по умолчанию
    export let style = '';    // Дополнительные стили
    export let className = ''; 
    export let avatarFile: FileEntity | undefined = undefined 
    export let imageUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'; 
</script>
  
<SvgWrapper {width} {height} {style} className={className}>
    {#if avatarFile !== undefined} 
        <img src={GlobalConfig.baseFilesUrl + avatarFile.filePath} alt="">
    {:else}
        <img src={imageUrl} alt="">    
    {/if}
</SvgWrapper>   