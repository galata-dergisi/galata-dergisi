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
  export let index;
  export let publishDateText;
  export let thumbnailURL;
  export let numberOfPages;
  export let visible = true;
  export let carouselItem = false;

  // Just to suppress Svelte's warning
  export let tableOfContents;

  import Utils from '../lib/Utils.js';
  import { createEventDispatcher } from 'svelte';

  let anchorElement;
  const dispatch = createEventDispatcher();

  async function handleClick() {
    dispatch('loadmagazine', index);
  }

  export function fadeIn() {
    visible = true;
    Utils.once(anchorElement, 'animationend', () => {
      anchorElement.classList.remove('fade-in');
    });
    anchorElement.classList.add('fade-in');
  }

  export function fadeOut() {
    Utils.once(anchorElement, 'animationend', () => {
      visible = false;
      anchorElement.classList.remove('fade-out');
    });
    anchorElement.classList.add('fade-out');
  }
</script>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }

  a {
    display: block;
    width: 100px;
    height: 140px;
    margin: 0 auto;
    outline: none !important;
  }

  a.fade-in {
    animation: fade-in .3s ease;
  }

  a.fade-out {
    animation: fade-out .3s ease;
  }

  a.carousel-item {
    margin-right: 50px;
  }

  a.hidden {
    visibility: hidden;
  }

  div.thumbnail-container {
    background-size: 100%;
    width: 100px;
    height: 140px;
    box-shadow: 2px 2px 5px rgba(0,0,0,.6);
    transition: transform .1s;
  }

  div.thumbnail-container:hover {
    transform: scale(1.8);
  }
</style>

<a 
  href='/#'
  bind:this={anchorElement}
  class:fade-in={false}
  class:fade-out={false}
  class:hidden={!visible}
  class:carousel-item={carouselItem}
  title="{publishDateText} - Sayı {index}"
  on:click|preventDefault={handleClick}>
  <div class="thumbnail-container" style="background-image: url({thumbnailURL})" />
</a>
