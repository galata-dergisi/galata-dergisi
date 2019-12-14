<script>
  export let index;
  export let publishDateText;
  export let numberOfPages;
  export let thumbnailURL;
  export let visible = true;
  export let carouselItem = false;

  import { once } from '../lib/utils.js';
  import { createEventDispatcher, tick } from 'svelte';

  let magazine;
  let anchorElement;
  let loadMagazine = false;
  const dispatch = createEventDispatcher();

  	// Adds the pages that the book will need
	function addPage(page, book) {
		// 	First check if the page is already in the book
		if (!book.turn('hasPage', page)) {
			// Create an element for this page
			const element = jQuery('<div />', {'class': 'page '+((page%2==0) ? 'odd' : 'even'), 'id': 'page-'+page}).html('<i class="loader"></i>');
			// If not then add the page
			book.turn('addPage', element, page);
			// Let's assum that the data is comming from the server and the request takes 1s.
			setTimeout(function(){
					element.html('<div class="data">Data for page '+page+'</div>');
			}, 1000);
		}
	}

  async function handleClick() {
    dispatch('beforeloadmagazine', index);
    console.log('clicked', index);

    loadMagazine = true;
    await tick();

    jQuery(magazine).turn({
      acceleration: true,
			pages: numberOfPages,
			elevation: 50,
			gradients: !jQuery.isTouch,
			when: {
				turning: function(e, page, view) {
					// Gets the range of pages that the book needs right now
					const range = jQuery(this).turn('range', page);
					// Check if each page is within the book
					for (page = range[0]; page<=range[1]; page++) 
						addPage(page, jQuery(this));
				},
			}
		});
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

{#if loadMagazine}
  <div class="magazine" bind:this={magazine}>
    <img src="{thumbnailURL.replace('thumbnail', 'front')}" alt="{publishDateText} Ön Kapak" />
  </div>
{/if}