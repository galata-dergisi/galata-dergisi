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
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import Utils from './lib/Utils.js';
  import Footer from './components/Footer.svelte';
  import Carousel from './components/Carousel.svelte';
  import Magazine from './components/Magazine.svelte';
  import MagazineThumbnail from './components/MagazineThumbnail.svelte';

  const allMagazines = [];
  let latestMagazine = null;
  let carouselInstance;

  let landingPage;
  let loadedMagazine = null;
  let loadedMagazineSvelteInstance = null;


  async function getMagazines() {
    try {
      const result = await Utils.httpGet('/magazines', { json: true });

      if (!result.success) throw new Error(`Couldn't get the magazines.`);

      allMagazines.push(...result.magazines);
      result.magazines.sort((a, b) => b.index - a.index);
      latestMagazine = result.magazines[0];
      const carouselMagazines = result.magazines.slice(1);
      carouselInstance.setCarouselItems(carouselMagazines);
    } catch (ex) {
      //TODO: Show a modal box to the client.
      console.trace(ex);
    }
  }

  function unloadMagazine() {
    if (!loadedMagazineSvelteInstance) return;

    return new Promise((resolve) => {
      const removeListener = loadedMagazineSvelteInstance.$on('outroend', () => {
        loadedMagazineSvelteInstance = null;

        removeListener();
        resolve();
      });

      loadedMagazine = null;
    });
  }

  function onLoadMagazine(event) {
    const { index, page } = event.detail;
    loadMagazine(index, page);
  }

  async function loadMagazine(index, page = 1) {
    if (loadedMagazine && loadedMagazine.index === index) {
      loadedMagazineSvelteInstance.goToPage(page);
      return;
    }

    await unloadMagazine();

    landingPage = page;
    loadedMagazine = allMagazines.find((magazine) => magazine.index === index);
  }

  onMount(async () => {
    // Retrieve list of magazines from server
    await getMagazines();

    // Check if the URL is targeting a magazine
    const res = Utils.getMagazineIndexAndPageFromURL(location.href);

    if (res) {
      loadMagazine(res.index, res.page);
    }
  });

  window.gotoMagazinePage = function (magazineIndex, page) {
    loadMagazine(Number(magazineIndex), Number(page));
  }
</script>

<style>
  .container {
    width: 100%;
    height: 100%;
    transition: opacity 1s ease;
    opacity: 1;
  }

  .container.hidden {
    opacity: 0;
  }

  .row {
    background-repeat: no-repeat;
    background-position: bottom;
    background-size: 100%;
    height: 210px;
    width: 426px;
    margin: 70px auto 0 auto;
    padding-top: 15px;
  }

  .row-1 {
    background-image: url(/images/first-shelf.png);
  }

  .row-2 {
    background-image: url(/images/wall-bookshelf.png);
    position: relative;
  }

  main {
    width: 100%;
    height: 850px;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 1);
    background: -moz-linear-gradient(
      top,
      rgba(255, 255, 255, 1) 0%,
      rgba(254, 254, 254, 1) 50%,
      rgba(242, 242, 242, 1) 71%,
      rgba(217, 217, 217, 1) 100%
    );
    background: -webkit-gradient(
      left top,
      left bottom,
      color-stop(0%, rgba(255, 255, 255, 1)),
      color-stop(50%, rgba(254, 254, 254, 1)),
      color-stop(71%, rgba(242, 242, 242, 1)),
      color-stop(100%, rgba(217, 217, 217, 1))
    );
    background: -webkit-linear-gradient(
      top,
      rgba(255, 255, 255, 1) 0%,
      rgba(254, 254, 254, 1) 50%,
      rgba(242, 242, 242, 1) 71%,
      rgba(217, 217, 217, 1) 100%
    );
    background: -o-linear-gradient(
      top,
      rgba(255, 255, 255, 1) 0%,
      rgba(254, 254, 254, 1) 50%,
      rgba(242, 242, 242, 1) 71%,
      rgba(217, 217, 217, 1) 100%
    );
    background: -ms-linear-gradient(
      top,
      rgba(255, 255, 255, 1) 0%,
      rgba(254, 254, 254, 1) 50%,
      rgba(242, 242, 242, 1) 71%,
      rgba(217, 217, 217, 1) 100%
    );
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 1) 0%,
      rgba(254, 254, 254, 1) 50%,
      rgba(242, 242, 242, 1) 71%,
      rgba(217, 217, 217, 1) 100%
    );
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#d9d9d9', GradientType=0 );
  }

  .logo {
    width: 567px;
    height: 220px;
    margin: 0 auto;
    background: url(/images/header-logo.jpg);
    background-position-x: -13px;
  }
</style>

<main>
  {#if !loadedMagazine}
    <div 
      class="logo"
      out:fly="{{ duration: 1000, y: -220 }}"
      in:fly="{{ duration: 1000, y: -220, delay: 200 }}"></div>
  {/if}

  <div class="container" class:hidden={loadedMagazine}>
    <div class="row row-1">
      {#if latestMagazine}
        <MagazineThumbnail 
          on:loadmagazine={onLoadMagazine}
          {...latestMagazine} />
      {/if}
    </div>
    <div class="row row-2">
      <Carousel 
        on:loadmagazine={onLoadMagazine}
        bind:this={carouselInstance} />
    </div>
  </div>
</main>

<Footer />

{#if loadedMagazine}
  <Magazine 
    {...loadedMagazine} 
    {landingPage}
    on:loadmagazine={onLoadMagazine}
    on:unloadmagazine={unloadMagazine}
    bind:this={loadedMagazineSvelteInstance} />
{/if}
