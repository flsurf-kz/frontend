<script>
	import SvgWrapper from "./SvgWrapper.svelte";

    export let width = '19';  // Ширина по умолчанию
    export let height = '19'; // Высота по умолчанию
    export let style = '';    // Дополнительные стили
    export let className = ''; 
    export let imageUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'; 
</script>
  
<SvgWrapper {width} {height} {style} className={className}>
    <img src={imageUrl} alt="">    
</SvgWrapper>   