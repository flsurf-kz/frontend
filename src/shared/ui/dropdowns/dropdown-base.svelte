<script lang="ts">
    import { onClickOutside } from './onClickOutside';
  
    export let label: string = "Dropdown";
    export let position: "bottom" | "right" | "left" = "bottom"; // Allow only these values
  
    let dropdown: HTMLElement | null = null;
    let isOpen: boolean = false;
  
    function toggleDropdown() {
      isOpen = !isOpen;
    }
  
    function closeDropdown() {
      isOpen = false;
    }
</script>
  
<style>
    .dropdown {
      position: relative;
      display: inline-block;
    }
  
    .dropdown-button {
      background: #222;
      color: white;
      border: none;
      padding: 10px 15px;
      cursor: pointer;
    }
  
    .dropdown-menu {
      position: absolute;
      min-width: 200px;
      background: #111;
      color: white;
      border-radius: 8px;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
      padding: 10px 0;
      display: none;
    }
  
    .dropdown-menu.show {
      display: block;
    }
  
    .bottom { top: 100%; left: 0; }
 </style>
  
<div class="dropdown" bind:this={dropdown} use:onClickOutside={closeDropdown}>
    <button class="dropdown-button" on:click={toggleDropdown}>
      {label}
    </button>

    {#if isOpen}
      <div class="dropdown-menu {position}">
        <slot />
      </div>
    {/if}
</div>
  