 <!-- 
   Copyright 2020 Mehmet Baker
 
   This file is part of galata-dergisi.
 
   galata-dergisi is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   
   galata-dergisi is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with galata-dergisi. If not, see <https://www.gnu.org/licenses/>.
  -->

<script>
  import SideNav from './components/side-nav/SideNav.svelte';
  import AddPage from './components/add-page/AddPage.svelte';

  const menus = {
    'add-page': AddPage,
  }

  let activeMenu = null;

  function onHrefChange(e) {
    activeMenu = e.detail;
  }
</script>

<style>
  .container {
    padding-left: 50px;
    padding-top: 30px;
  }
</style>

<SideNav on:hrefchange={onHrefChange} />

{#if menus[activeMenu]}
  <div class="container">
    <svelte:component this={menus[activeMenu]}></svelte:component>
  </div>
{/if}
