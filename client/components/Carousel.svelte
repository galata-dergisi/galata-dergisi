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
  import { onMount, onDestroy } from 'svelte';
  import MagazineThumbnail from './MagazineThumbnail.svelte';
  import Arrow from './Arrow.svelte';
  /**
   * Holds Svelte instances of MagazineThumbnail components
   * @type {object}
   */
  const magazineThumbnailInstances = {};

  /**
   * @typedef CarouselMagazine
   * @type {object}
   * @property {number} index Publish index.
   * @property {string} publishDateText Date text (e.g. Mart 2018)
   * @property {string} thumbnailURL Thumbnail URL
   * @property {boolean} visible Visibility flag.
   */ 

  /**
   * @type {CarouselMagazine[]}
   */
  let carouselMagazines = [];

  //Holds the array index of the left-most visible magazine.
  let firstItemIndex = 0;

  //A boolean flag. Arrow click handlers will stop working when set to true.
  let blockEvents = false;

  //items div will be bound to this variable.
  let itemsElement;
  $: leftArrowDisabled = firstItemIndex === 0;
  $: rightArrowDisabled = firstItemIndex + 3 >= carouselMagazines.length;

  function handleTransitionEnd() {
    //We are unblocking the arrow click handlers when slide transition is over.
    blockEvents = false;
  }

  function handleLeftArrowClick() {
    if (blockEvents) return;

    blockEvents = true;

    //Fade out the right-most visible magazine thumbnail.
    magazineThumbnailInstances[firstItemIndex + 2].fadeOut();

    //If there is an invisible mag on the left of left-most visible magazine, fade it in
    if (firstItemIndex - 1 >= 0) {
      magazineThumbnailInstances[firstItemIndex - 1].fadeIn();
    }

    //Svelte will update the translateX style and CSS transition will occur.
    --firstItemIndex;
  }

  function handleRightArrowClick() {
    if (blockEvents) return;

    blockEvents = true;
    //Fade out the left-most visible magazine thumbnail.
    magazineThumbnailInstances[firstItemIndex].fadeOut();
    
    //If there is an invisible mag on the right of right-most visible mag, fade it in
    if (firstItemIndex + 3 < carouselMagazines.length) {
      magazineThumbnailInstances[firstItemIndex + 3].fadeIn();
    }

    //Svelte will update the translateX style and CSS transition will occur.
    ++firstItemIndex;
  }

  export function setCarouselItems(items) {
    for (let i = 0; i < items.length; ++i) {
      //Only the first 3 items should be visible
      items[i].visible = i >= firstItemIndex && i <= firstItemIndex + 2;
    }

    carouselMagazines = items;
    leftArrowDisabled = true;
    rightArrowDisabled = false;
  }

  onMount(() => {
    itemsElement.addEventListener('transitionend', handleTransitionEnd);
  });

  onDestroy(() => {
    itemsElement.removeEventListener('transitionend', handleTransitionEnd);
  });
</script>


<div class="carousel">
  <div class="left-arrow">
    <Arrow
      disabled={leftArrowDisabled}
      on:click={handleLeftArrowClick}
     /> 
   </div>

  <div class="items" style="transform: translateX(-{firstItemIndex * 150}px" bind:this={itemsElement}>
    {#each carouselMagazines as magazine, i}
      <MagazineThumbnail {...magazine}
        carouselItem={true} 
        on:loadmagazine
        bind:this={magazineThumbnailInstances[i]} />
    {/each}
  </div>

  <div class="right-arrow">
    <Arrow
      direction="right"
      disabled={rightArrowDisabled}
      on:click={handleRightArrowClick} />
  </div>
</div>

<style>
  .carousel {
    width: 100%;
    height: 100%;
  }

  .items {
    display: flex;
    transition: transform .3s ease;
    padding-left: 12px;
  }

  .left-arrow, .right-arrow {
    position: absolute;
    top: 50px;
    z-index: 2;
  }

  .left-arrow {
    left: -120px;
  }

  .right-arrow {
    right: -120px;
  }
</style>
