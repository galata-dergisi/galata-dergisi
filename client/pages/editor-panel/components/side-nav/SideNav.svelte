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
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  let sidenav;

  function changeActiveListElement(anchor) {
    const allListElements = sidenav.querySelectorAll('.collapsible-body li');
    const anchorLi = anchor.closest('li');

    for (const li of allListElements) {
      if (li === anchorLi) {
        li.classList.add('active');
      } else {
        li.classList.remove('active');
      }
    }
  }

  function onAnchorClick(e) {
    const href = e.target.href.split('/').pop();
    dispatch('hrefchange', href);
    changeActiveListElement(e.target);
  }

  onMount(() => {
    const elems = sidenav.querySelectorAll('.collapsible');
    const instances = M.Collapsible.init(elems);
  });
</script>

<style>
  .sidenav .collapsible-accordion .collapsible-body li a {
    font-weight: 400;
  }
</style>

<ul class="sidenav sidenav-fixed" bind:this={sidenav}>
  <li class="no-padding">
    <ul class="collapsible collapsible-accordion">
      <li class="bold">
          <!-- svelte-ignore a11y-missing-attribute -->
          <a 
            class="collapsible-header waves-effect waves-teal" 
            on:click|preventDefault>Sayfalar</a>
          <div class="collapsible-body">
            <ul>
              <li>
                <a href="/add-page" on:click|preventDefault={onAnchorClick}>Yeni Sayfa Ekle</a>
              </li>

              <li>
                <a href="/all-pages" on:click|preventDefault={onAnchorClick}>Tüm Sayfalar</a>
              </li>
            </ul>
          </div>
      </li>
    </ul>
  </li>
</ul>
