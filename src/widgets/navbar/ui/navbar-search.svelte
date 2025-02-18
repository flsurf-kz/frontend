<script lang="ts">
	import ArrowDown from "$lib/shared/ui/icons/ArrowDown.svelte";
	import SearchIcon from "$lib/shared/ui/icons/SearchIcon.svelte";


  let searchQuery = '';
  let showDropdown = false;

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }
</script>
  
  <style>
    .search-bar {
      display: flex;
      align-items: center;
      border: 2px solid #e9e9e9;
      border-radius: 20px;
      padding: 2px; 
      position: relative;
      max-width: 380px;
      transition: max-width .2s ease-in-out;
      background-color: #fff;
    }
  
    .search-bar input[type="text"] {
      border: none;
      outline: none;
      flex: 1;
      margin-left: 10px;
      padding: 5px;
    }
  
    .search-bar .dropdown {
      padding-left: 10px;
      color: #000;
    }

    .dropdown { 
      padding-right: 10px;
      border-left: 1px solid #BCBCBC; 
      background-color: initial;
      border-bottom: none;
      border-top: none; 
      border-right: none;
      cursor: pointer;
    }

    .search-input { 
      font-size: 14px; 
    }


    .dropdown-menu {
      display: none;
      position: absolute;
      top: 35px;
      right: 10px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      width: 100px;
      z-index: 1000;
    }

    .dropdown-menu.active {
      display: block;
    }

    .dropdown-menu ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .dropdown-menu li {
      padding: 10px;
      cursor: pointer;
    }

    .dropdown-menu li:hover {
      background-color: #f0f0f0;
    }
  </style>
  
  <div class="search-bar">
    <SearchIcon />
    <input type="text" placeholder="Search" bind:value={searchQuery} class="search-input"/>
    <button class="dropdown" on:click={toggleDropdown}>
      Талант
      
      <ArrowDown />
    </button>
    <div class="dropdown-menu {showDropdown ? 'active' : ''}">
      <ul>
        <li>Option 1</li>
        <li>Option 2</li>
        <li>Option 3</li>
      </ul>
    </div>
  </div>
  