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
  export let thumbnailURL;
  export let numberOfPages;
  export let publishDateText;
  export let numTableOfContents;

  import { onMount, createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";

  let magazine;
  let containerElement;

  let magazinePageContents = downlaodPageContents();
  let magazinePageElements = null;

  // First page is shown, apply margin-left in order to align center
  let moveLeft = true;

  // jquery element
  let magazineInstance = null;

  const dispatch = createEventDispatcher();

  // Adds the pages that the book will need
  async function addPage(page) {
    // 	First check if the page is already in the book
    if (!magazineInstance.turn("hasPage", page)) {
      // Create an element for this page
      const element = jQuery("<div />", {
        class: "page " + (page % 2 == 0 ? "odd" : "even"),
        id: "page-" + page,
      }).html('<i class="loader"></i>');

      // If not then add the page
      magazineInstance.turn("addPage", element, page);

      try {
        const pages = await magazinePageContents;
        element.html(pages[page]);
      } catch (ex) {
        element.html(`<div class"load-error">Sayfa yüklenemedi</div>`);
        console.trace(ex);
      }
    }
  }

  async function downlaodPageContents() {
    const response = await fetch(`/magazines/${index}/pages`);      
    const result = await response.json();

    if (result.success === true) {
      return result.pages;
    }

    throw new Error(result.message);      
  }

  onMount(async () => {
    magazineInstance = jQuery(magazine);

    magazineInstance.turn({
      acceleration: true,
      pages: numberOfPages,
      elevation: 50,
      gradients: !jQuery.isTouch,
      when: {
        turning: function(e, page, view) {
          // Gets the range of pages that the magazine needs right now
          const range = magazineInstance.turn("range", page);
          // Check if each page is within the book
          for (page = range[0]; page <= range[1]; page++) {
            addPage(page);
          }
        },
        turned: function(e, page) {
          moveLeft = page === 1 || page === numberOfPages;
        },
      },
    });
  });

  function goToPage(pageNum) {

  }

  function close() {
    dispatch("unloadmagazine");
  }
</script>

<style>
  .container {
    position: absolute !important;
    top: 25px;
    z-index: 2;
    height: 750px;
    width: 100%;
    overflow: hidden;
  }

  .center {
    position: absolute;
    left: calc((100% - 960px) / 2);
  }

  .toolbar {
    text-align: center;
    height: 50px;
  }

  .material-icons {
    font-size: 36px;
  }

  .magazine {
    width: 960px;
    height: 700px;
    transition: transform 0.5s ease;
  }

  .magazine.move-left {
    transform: translateX(-250px) !important;
  }
</style>

<div
  class="container"
  in:fly={{ duration: 1000, y: -750 }}
  out:fly={{ duration: 1000, y: -750 }}
  on:outroend
  bind:this={containerElement}>
  <div class="center">
    <div class="toolbar">
      <a
        href="/#"
        title="İçindekiler"
        on:click|preventDefault={() => goToPage(numTableOfContents)}>
        <i class="material-icons">list</i>
      </a>

      <a href="/#" title="Kapat" on:click|preventDefault={close}>
        <i class="material-icons">cancel</i>
      </a>
    </div>

    <div bind:this={magazine} class:move-left={moveLeft} class="magazine">
      <img
        src={thumbnailURL.replace('thumbnail', 'front')}
        alt="{publishDateText} Ön Kapak" />
    </div>
  </div>
</div>
