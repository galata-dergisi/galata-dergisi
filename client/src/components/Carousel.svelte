<script>
  import { onMount, onDestroy } from 'svelte';
  import Magazine from './Magazine.svelte';
  import Arrow from './Arrow.svelte';
  const magazineInstances = {};
  let carouselMagazines = [];
  let firstItemIndex = 0;
  let blockEvents = false;
  let itemsElement;
  $: leftArrowDisabled = firstItemIndex === 0;
  $: rightArrowDisabled = firstItemIndex + 3 >= carouselMagazines.length;

  function handleTransitionEnd() {
    blockEvents = false;
  }

  function handleLeftArrowClick() {
    if (blockEvents) return;

    blockEvents = true;
    magazineInstances[firstItemIndex + 2].fadeOut();

    if (firstItemIndex - 1 >= 0) {
      magazineInstances[firstItemIndex - 1].fadeIn();
    }

    --firstItemIndex;
  }

  function handleRightArrowClick() {
    if (blockEvents) return;

    blockEvents = true;
    magazineInstances[firstItemIndex].fadeOut();
    
    if (firstItemIndex + 3 < carouselMagazines.length) {
      magazineInstances[firstItemIndex + 3].fadeIn();
    }

    ++firstItemIndex;
  }

  export function setCarouselItems(items) {
    for (let i = 0; i < items.length; ++i) {
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
      <Magazine {...magazine}
        carouselItem={true} 
        bind:this={magazineInstances[i]} />
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