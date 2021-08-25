<!--
  Copyright 2020 Mehmet Baker
  Copyright 2021 Zeynep Kazu

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
  import Utils from '../../../lib/Utils.js';

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
          content = `<div class="mMargin">${content}</div>`;
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
      window.history.replaceState({}, `Sayı ${index} | Galata Dergisi`, href);
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
            window.history.replaceState({}, `Sayı ${index} | Galata Dergisi`, `/dergiler/sayi${index}/${page}`);
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
        return;
      }

      window.history.replaceState({}, `Sayı ${index} | Galata Dergisi`, `/dergiler/sayi${index}/${landingPage}`);
    } catch (ex) {
      console.trace(ex);
      alert('Dergi yüklenirken bir hata oluştu!');
    }
  });

  export function goToPage(pageNum) {
    pageNum = Number(pageNum);
    ensureRange(pageNum);
    magazineInstance.turn('page', pageNum);
    window.history.replaceState({}, `Sayı ${index} | Galata Dergisi`, `/dergiler/sayi${index}/${pageNum}`);
  }

  export function goToNextPage() {
    goToPage(nextPage);
  }

  export function goToPreviousPage() {
    goToPage(prevPage);
  }

  function close() {
    dispatch("unloadmagazine");
    window.history.replaceState({}, 'Galata Dergisi', '/');
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

<style lang="scss">
  .container {
    position: absolute !important;
    top: 90px;
    z-index: 2;
    height: 750px;
    width: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
  }

  .center {
    position: absolute;
    height: 720px;
    padding-top: 20px;
  }

  .toolbar {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    height: 70px;

    .top {
      width: 500px;
      margin: 0 auto;
      height: 32px;
      display: flex;

      > a, > span {
        color: #7f7f7f;
        flex: 1;
        text-align: center;
      }

      > a.disabled {
        color: #ccc;
        pointer-events: none;
      }

      @media (prefers-reduced-motion: no-preference) {
        a.next-button, a.prev-button {
          transition: transform .15s ease-in-out;
        }
      }

      a.next-button.move {
        transform: translateX(250px);
      }

      a.prev-button.move {
        transform: translateX(-250px);
      }
    }

    i {
      font-size: 32px;

      &:hover {
        color: #4d4f53;
      }

      &.fa-facebook-f {
        width: 32px;
        text-align: center;
        
        &:hover {
          color: #4267B2;
        }
      }  

      &.fa-twitter {

        &:hover {
          color: #1DA1F2;
        }
      }  

      &.fa-times-circle {

        &:hover {
          color: #fd5c63;
        }
      }
    }

    span {
      display: inline-block;
      cursor: pointer;
    }
  }

  .magazine {
    width: 960px;
    height: 700px;

    :global(.shadow) {
      position: absolute;
      top: 0;
      left: 0;
      overflow: hidden;
      width: 1000px;
      height: 700px;
      box-shadow: 0 0 20px #ccc;
    }

    &.move-left {
      transform: translateX(-250px) !important;
      box-shadow: none;

      :global(.shadow) {
        box-shadow: none;
      }

      &.last-page {
        transform: translateX(250px) !important;
      }
    }

    :global(.page) {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      width: 500px;
      height: 700px;
      background:white;
      box-shadow: 0 0 5px rgba(0,0,0,0.2);
    }

    :global(.odd .gradient) {
      position:absolute;
      top:0;
      left:0;
      width:100%;
      height:100%;
      z-index:0;
      background:-webkit-gradient(linear, right top, left top, color-stop(0.95, rgba(0,0,0,0)), color-stop(1, rgba(0,0,0,0.15)));
      background-image: linear-gradient(right, rgba(0,0,0,0) 95%, rgba(0,0,0,0.15) 100%);
    }

    :global(.even .gradient) {
      position:absolute;
      top:0;
      left:0;
      width:100%;
      height:100%;
      z-index:0;
      background:-webkit-gradient(linear, left top, right top, color-stop(0.95, rgba(0,0,0,0)), color-stop(1, rgba(0,0,0,0.2)));
      background-image:linear-gradient(left, rgba(0,0,0,0) 95%, rgba(0,0,0,0.2) 100%);
    }

    :global(.zoom-in .gradient) {
      display: none;
    }

    :global(.zoom-in .next-button),
    :global(.zoom-in .previous-button) {
      display: none;
    }
  }
</style>

<div
  in:fly={{ duration: 300, y: -90, delay: 550 }}
  out:fly={{ duration: 300, y: -90 }}
  class="toolbar">
  <div class="top">
    <a
      class="prev-button"
      class:disabled={currentPage === 1}
      class:move={!moveLeft}
      on:click|preventDefault={() => {
        goToPage(prevPage);
      }}
      href="/dergiler/sayi{index}/{prevPage}"
      title="Önceki Sayfa">
      <i class="fas fa-arrow-alt-circle-left" />
    </a>

    <a
      href="/dergiler/sayi{index}/{tableOfContents}"
      title="İçindekiler"
      on:click|preventDefault={() => {
        goToPage(tableOfContents);
      }}>
      <i class="fas fa-list-alt"></i>
    </a>

    <span
      role="button"
      on:click={shareOnFacebook}
      title="Facebook'ta Paylaş"
      class="fb-icon"
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

    <a
      class="next-button"
      class:disabled={nextPage === currentPage}
      class:move={!moveLeft}
      on:click|preventDefault={() => {
        goToPage(nextPage);
      }}
      href="/dergiler/sayi{index}/{nextPage}"
      title="Sonraki Sayfa">
      <i class="fas fa-arrow-alt-circle-right" />
    </a>
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
    </div>
  </div>
</div>
