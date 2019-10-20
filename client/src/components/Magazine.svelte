<script>
  export let index;
  export let publishDateText;
  export let numberOfPages;
  export let thumbnailURL;
  export let visible = true;
  export let carouselItem = false;
  import { once } from '../lib/utils.js';
  let anchorElement;

  function handleClick() {
    console.log('clicked');
  }

  export function fadeIn() {
    visible = true;
    once(anchorElement, 'animationend', () => {
      anchorElement.classList.remove('fade-in');
    });
    anchorElement.classList.add('fade-in');
  }

  export function fadeOut() {
    once(anchorElement, 'animationend', () => {
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

  div {
    background-size: 100%;
    width: 100px;
    height: 140px;
    box-shadow: 2px 2px 5px rgba(0,0,0,.6);
    transition: transform .1s;
  }

  div:hover {
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
  <div style="background-image: url({thumbnailURL})" />
</a>