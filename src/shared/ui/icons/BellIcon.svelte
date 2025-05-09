<script lang="ts">
    import SvgWrapper from "./SvgWrapper.svelte";

    export let width: string = "24";
    export let height: string = "24";
    export let style: string = "";
    export let className = ''
</script>

<SvgWrapper {width} {height} {style} {className}>
    <path vector-effect="non-scaling-stroke" stroke="var(--icon-color, #001e00)" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="M19.273 17.564l-1.359-2.209c-.08-.082-.08-.245-.08-.327v-4.99c0-2.946-2.397-5.4-5.274-5.4h-.72c-2.877 0-5.274 2.372-5.274 5.4v5.072c0 .163 0 .245-.08.327l-1.359 2.045c-.32.41 0 1.064.56 1.064h13.027c.559.082.879-.491.559-.982z" clip-rule="evenodd"></path>    <path vector-effect="non-scaling-stroke" stroke="var(--icon-color, #001e00)" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="M12.16 4.636V3M9.842 18.628c0 1.308 1.04 2.372 2.318 2.372 1.279 0 2.318-1.064 2.318-2.372"></path>
    <path vector-effect="non-scaling-stroke" stroke="var(--icon-color, #001e00)" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="M12.16 4.636V3M9.842 18.628c0 1.308 1.04 2.372 2.318 2.372 1.279 0 2.318-1.064 2.318-2.372"></path>
</SvgWrapper> 