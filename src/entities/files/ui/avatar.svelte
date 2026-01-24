<script lang="ts">
	import type { FileEntity } from "../models/file";

    export let image: FileEntity
    export let imageDefault: string; 
    export let width: string = "auto"; 
    export let height: string = "auto"; 
    export let style: string = ""
</script>

<div class="image-container" style="width: {width}; height: {height}; {style}">
    <img src={image.filePath !== "" || image.filePath != null ? image.filePath : imageDefault} alt="" class="image-itself">
</div>

<style>
    .image-itself { 
        align-items: center;
        background-color: var(--avatar-bg);
        border: 0;
        border: var(--hc-border, 0);
        border-radius: 50%;
        border-radius: var(--avatar-radius);
        color: var(--avatar-text);
        display: inline-flex;
        flex: none;
        font-size: var(--avatar-font-size);
        height: 32px;
        height: var(--avatar-size);
        justify-content: center;
        max-height: 32px;
        max-height: var(--avatar-size);
        max-width: 32px;
        max-width: var(--avatar-size);
        -o-object-fit: cover;
        object-fit: cover;
        overflow: hidden;
        vertical-align: middle;
        width: 32px;
        width: var(--avatar-size);
    }
</style>