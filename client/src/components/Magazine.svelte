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
  export let tableOfContents;

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
        class: "page " + (page % 2 === 0 ? 'even' : 'odd'),
        id: "page-" + page,
      }).html('<div class="loader"><div></div><div></div><div></div><div></div></div>');

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
      width: 1000,
      height: 700,
      disable3d: true,
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
    magazineInstance.turn('page', pageNum);
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
    height: 720px;
    padding-top: 20px;
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
  }

  .magazine.move-left {
    transform: translateX(-250px) !important;
    box-shadow: none;
  }

  .magazine :global(.page) {
    width:500px;
	  height:700px;
	  background:white;

	  -webkit-box-shadow: 0 0 5px rgba(0,0,0,0.2);
	  -moz-box-shadow: 0 0 5px rgba(0,0,0,0.2);
	  -ms-box-shadow: 0 0 5px rgba(0,0,0,0.2);
	  -o-box-shadow: 0 0 5px rgba(0,0,0,0.2);
	  box-shadow: 0 0 5px rgba(0,0,0,0.2);
  }

  .magazine :global(.odd .gradient) {
    position:absolute;
  	top:0;
  	left:0;
  	width:100%;
  	height:100%;
  	z-index:0;
  	background:-webkit-gradient(linear, right top, left top, color-stop(0.95, rgba(0,0,0,0)), color-stop(1, rgba(0,0,0,0.15)));
  	background-image:-webkit-linear-gradient(right,rgba(0,0,0,0) 95%, rgba(0,0,0,0.15) 100%);
  	background-image:-moz-linear-gradient(right, rgba(0,0,0,0) 95%, rgba(0,0,0,0.15) 100%);
  	background-image:-ms-linear-gradient(right, rgba(0,0,0,0) 95%, rgba(0,0,0,0.15) 100%);
  	background-image:-o-linear-gradient(right, rgba(0,0,0,0) 95%, rgba(0,0,0,0.15) 100%);
  	background-image:linear-gradient(right, rgba(0,0,0,0) 95%, rgba(0,0,0,0.15) 100%);
  }

  .magazine :global(.even .gradient) {
  	position:absolute;
  	top:0;
  	left:0;
  	width:100%;
  	height:100%;
  	z-index:0;
  	background:-webkit-gradient(linear, left top, right top, color-stop(0.95, rgba(0,0,0,0)), color-stop(1, rgba(0,0,0,0.2)));
  	background-image:-webkit-linear-gradient(left,rgba(0,0,0,0) 95%, rgba(0,0,0,0.2) 100%);
  	background-image:-moz-linear-gradient(left, rgba(0,0,0,0) 95%, rgba(0,0,0,0.2) 100%);
  	background-image:-ms-linear-gradient(left, rgba(0,0,0,0) 95%, rgba(0,0,0,0.2) 100%);
  	background-image:-o-linear-gradient(left, rgba(0,0,0,0) 95%, rgba(0,0,0,0.2) 100%);
  	background-image:linear-gradient(left, rgba(0,0,0,0) 95%, rgba(0,0,0,0.2) 100%);
  }

  .magazine :global(.shadow) {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    width: 1000px;
    height: 700px;
    box-shadow: 0 0 20px #ccc;
  }

  .magazine :global(.shadow).partial-hidden.first, .magazine :global(.shadow).partial-hidden.left {
    left: 500px;
    width: 500px;
  }

  .magazine :global(.shadow).partial-hidden.right, .magazine :global(.shadow).partial-hidden.last {
    width: 500px;
  }

  .magazine :global(.zoom-in .gradient) {
    display: none;
  }

  .magazine :global(.zoom-in .next-button, .zoom-in .previous-button) {
    display: none;
  }

  .previous-button,.next-button {
  	width: 22px;
  	height: 700px;
  	position: absolute;
  	top: 0;
  }

  .next-button {
  	right:-22px;
  	-webkit-border-radius:0 15px 15px 0;
  	-moz-border-radius:0 15px 15px 0;
  	-ms-border-radius:0 15px 15px 0;
  	-o-border-radius:0 15px 15px 0;
  	border-radius:0 15px 15px 0;
  }

  .previous-button {
  	left:-22px;
  	-webkit-border-radius:15px 0 0 15px;
  	-moz-border-radius:15px 0 0 15px;
  	-ms-border-radius:15px 0 0 15px;
  	-o-border-radius:15px 0 0 15px;
  	border-radius:15px 0 0 15px;
  }

  .next-button:hover, .previous-button:hover {
    background-color:rgba(0,0,0, 0.2);
  }
</style>

<div class="toolbar">
  <a
    href="/#"
    title="İçindekiler"
    on:click|preventDefault={() => goToPage(tableOfContents)}>
    <i class="material-icons">list</i>
  </a>

  <a href="/#" title="Kapat" on:click|preventDefault={close}>
    <i class="material-icons">cancel</i>
  </a>
</div>

<div
  class="container"
  in:fly={{ duration: 1000, y: -750 }}
  out:fly={{ duration: 1000, y: -750 }}
  on:outroend
  bind:this={containerElement}>
  <div class="center">
    <div bind:this={magazine} class:move-left={moveLeft} class="magazine">
      <img
        src={thumbnailURL.replace('thumbnail', 'front')}
        alt="{publishDateText} Ön Kapak" />
    </div>
  </div>
</div>
