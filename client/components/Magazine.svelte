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

  export let publishDateText;
  export let tableOfContents;

  // The page which is going to be shown when magazine loads
  export let landingPage = 1;

  import { onMount, createEventDispatcher, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import Utils from '../lib/Utils.js';

  let magazine;
  let containerElement;

  let magazinePageContents = null;
  let magazinePageElements = null;
  let numberOfPages = null;

  let isLoaded = false;

  // First page is shown, apply margin-left in order to align center
  let moveLeft = landingPage === 1;

  let currentPage;
  let nextPage;
  let prevPage;
  $: setNextAndPrevPage(currentPage);

  // jquery element
  let magazineInstance = null;

  const dispatch = createEventDispatcher();

  // Adds the pages that the book will need
  function addPage(page) {
    // 	First check if the page is already in the book
    if (!magazineInstance.turn("hasPage", page)) {
      // Create an element for this page
      const element = jQuery("<div />", {
        class: "page " + (page % 2 === 0 ? 'even' : 'odd'),
        id: "page-" + page,
      }).html('<div class="loader"><div></div><div></div><div></div><div></div></div>');

      // If not then add the page
      magazineInstance.turn("addPage", element, page);

      let content = magazinePageContents[page];

      if (page !== 1 && page !== numberOfPages) {
        if (Utils.isVisibleContent(content)) {
          content += `<div class="mPageNum"><div class="pageNumLeft"></div><div class="pageNum">${page}</div><div class="pageNumRight"></div></div>`;
        }

        content = `<div class="gradient">${content}</div>`;
      }

      element.html(content);

      // Bind a clicks to event handler
      const anchors = element[0].querySelectorAll('a');

      for (let i = 0; i < anchors.length; ++i) {
        anchors[i].addEventListener('click', onAnchorClick);
      }
    }
  }

  function setNextAndPrevPage(currentPage) {
    if (typeof currentPage !== 'number') return;

    // currentPage is even
    if (currentPage % 2 === 0) {
      nextPage = Math.min(numberOfPages, currentPage + 2);
      prevPage = Math.max(1, currentPage - 1);
    } else {
      // currentPage is odd
      nextPage = Math.min(numberOfPages, currentPage + 1);
      prevPage = Math.max(1, currentPage - 2);
    }
  }

  async function getMagazinePages() {
    const response = await fetch(`/magazines/${index}/pages`);      
    const result = await response.json();

    if (result.success === true) {
      return result.pages;
    }

    throw new Error(result.message);      
  }

  function onAnchorClick(e) {
    let { target } = e;

    if (target.nodeName !== 'A') {
      target = target.closest('a');
    }

    if (!target) {
      return;
    }

    const { href } = target;
    const indexAndPage = Utils.getMagazineIndexAndPageFromURL(href);

    // `href` is a magazine URL
    if (indexAndPage !== null) {
      e.preventDefault();
      e.stopPropagation();
      dispatch('loadmagazine', indexAndPage);
      window.history.pushState({}, `Sayı ${index} | Galata Dergisi`, href);
    }
  }

  /**
   * Makes sure that `page` is ready in turn.js
   * An attempt to workaround the issue in turn.js:1626
   */
  function ensureRange(page) {
    if (!magazineInstance) return;

    // Gets the range of pages that the magazine needs right now
    const range = magazineInstance.turn("range", page);
    currentPage = page;

    // Check if each page is within the book
    for (page = range[0]; page <= range[1]; page++) {
      addPage(page);
    }
  }

  onDestroy(() => {
    const anchors = magazineInstance[0].querySelectorAll('a');

    for (let i = 0; i < anchors.length; ++i) {
      anchors[i].removeEventListener('click', onAnchorClick);
    }
  });

  onMount(async () => {
    try {
      magazineInstance = jQuery(magazine);

      magazinePageContents = await getMagazinePages();
      numberOfPages = Object.keys(magazinePageContents).length;

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
            ensureRange(page);
          },
          turned: function(e, page) {
            if (isLoaded) {
              moveLeft = page === 1 || page === numberOfPages;
            }

            isLoaded = true;
          },
        },
      });

      if (landingPage !== 1) {
        goToPage(landingPage);
      }
    } catch (ex) {
      console.trace(ex);
      alert('Dergi yüklenirken bir hata oluştu!');
    }
  });

  export function goToPage(pageNum) {
    pageNum = Number(pageNum);
    ensureRange(pageNum);
    magazineInstance.turn('page', pageNum);
  }

  function close() {
    dispatch("unloadmagazine");
    window.history.pushState({}, 'Galata Dergisi', '/');
  }

  function shareOnFacebook() {
    window.open('https://www.facebook.com/sharer.php?' +
      'u=' + encodeURIComponent(`https://galatadergisi.org/dergiler/sayi${index}/${currentPage}`) +
      '&t=' + encodeURIComponent(`Galata Dergisi - Sayı ${index} (${publishDateText})`));
  }

  function shareOnTwitter() {
    const url = encodeURIComponent(`https://galatadergisi.org/dergiler/sayi${index}/${currentPage}`);
    const shareText = encodeURIComponent(`Galata Dergisi - Sayı ${index} (${publishDateText})`);

    window.open(`https://twitter.com/intent/tweet?original_referer=${url}&url=${url}&text=${shareText}`);
  }
</script>

<style>
  .container {
    position: absolute !important;
    top: 90px;
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
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    text-align: center;
    height: 70px;
  }

  .toolbar .top {
    width: 1000px;
    margin: 0 auto;
    height: 32px;
  }

  .toolbar .top {
    padding-left: 85px;
  }

  .toolbar .bottom {
    position: absolute;
    width: 1000px;
    line-height: 38px;
    left: calc((100% - 960px) / 2);
    font-size: 32px;
  }

  .toolbar .bottom.hidden {
    display: none;
  }

  .toolbar .top > a, .toolbar .top > span {
    margin-right: 30px;
  }

  .toolbar .bottom .left {
    float: left;
    padding-left: 20px;
  }

  .toolbar .bottom .right {
    float: right;
    padding-right: 20px;
  }

  .toolbar i {
    color: #7f7f7f;
    font-size: 32px;
  }

  .toolbar .bottom .wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    top: -20px;
  }

  .toolbar i:hover {
    color: #525252;
  }

  .toolbar span {
    display: inline-block;
    width: 50px;
    cursor: pointer;
  }

  .magazine {
    width: 960px;
    height: 700px;
  }

  .magazine.move-left {
    transform: translateX(-250px) !important;
    box-shadow: none;
  }

  .magazine.move-left.last-page {
    transform: translateX(250px) !important;
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

  .magazine :global(.page) {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }

  .magazine :global(.zoom-in .gradient) {
    display: none;
  }

  .magazine :global(.zoom-in .next-button, .zoom-in .previous-button) {
    display: none;
  }
</style>

<div 
  in:fly={{ duration: 300, y: -90, delay: 550 }}
  out:fly={{ duration: 300, y: -90 }}
  class="toolbar">
  <div class="top">
    <a
      href="/dergiler/sayi{index}/{tableOfContents}"
      title="İçindekiler"
      on:click|preventDefault={() => {
        goToPage(tableOfContents);
        window.history.pushState({}, `Sayı ${index} | Galata Dergisi`, `/dergiler/sayi${index}/${tableOfContents}`);
      }}>
      <i class="fas fa-list-alt"></i>
    </a>

    <span
      role="button"
      on:click={shareOnFacebook}
      title="Facebook'ta Paylaş"
    >
      <i class="fab fa-facebook-f"></i>
    </span>

    <span
      role="button"
      on:click={shareOnTwitter}
      title="Twitter'ta Paylaş"
    >
      <i class="fab fa-twitter"></i>
    </span>

    <span 
      role="button"
      on:click={close}
      title="Kapat" 
    >
      <i class="fas fa-times-circle fa-2x"></i>
    </span>
  </div>

  <div class="bottom" class:hidden={moveLeft}>
    <div class="wrapper">
      <div class="left">
        <a 
          on:click|preventDefault={() => {
            window.history.pushState({}, `Sayı ${index} | Galata Dergisi`, `/dergiler/sayi${index}/${prevPage}`);
            goToPage(prevPage);
          }}
          href="/dergiler/sayi{index}/{prevPage}" 
          title="Önceki Sayfa">
          <i class="fas fa-arrow-alt-circle-left" />
        </a>
      </div>

      <div class="right">
        <a 
          on:click|preventDefault={() => {
            window.history.pushState({}, `Sayı ${index} | Galata Dergisi`, `/dergiler/sayi${index}/${nextPage}`);
            goToPage(nextPage);
          }}
          href="/dergiler/sayi{index}/{nextPage}" 
          title="Sonraki Sayfa">
          <i class="fas fa-arrow-alt-circle-right" />
        </a>
      </div>
    </div>
  </div>
</div>

<div
  class="container"
  in:fly={{ duration: 1000, y: -750 }}
  out:fly={{ duration: 1000, y: -750 }}
  on:outroend
  bind:this={containerElement}>
  <div class="center">
    <div 
      bind:this={magazine} 
      class:move-left={moveLeft} 
      class:last-page={currentPage === numberOfPages} 
      class="magazine">
      <img
        src={thumbnailURL.replace('thumbnail', 'front')}
        alt="{publishDateText} Ön Kapak" />
    </div>
  </div>
</div>
