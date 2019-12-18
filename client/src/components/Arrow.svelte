 <!-- 
   Copyright 2019 Mehmet Baker
 
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
  export let direction = "left";
  export let disabled = false;
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<style>
  div {
    width: 80px;
    height: 80px;
  }

  div.right {
    transform: rotate(180deg);
  }

  polygon {
    fill: url(#normalGrad);
  }

  polygon:hover {
    cursor: pointer;
    fill: url(#hoverGrad);
  } 

  div.disabled polygon {
    fill: #d5d5d5;
  }

  div.disabled a {
    pointer-events: none;
  }
</style>

<div 
  class:disabled
  class:right={direction === 'right'}
  class:left={direction === 'left'}>
  <svg viewbox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="normalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#aaa;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#797979;stop-opacity:1" />
      </linearGradient>
      
      <linearGradient id="hoverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#aaa;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#515151;stop-opacity:1" />
      </linearGradient>
    </defs>
      <a 
        href="#!"
        title="Slide carousel to {direction}"
        on:click|preventDefault={() => dispatch('click')}
        >
          <polygon 
            points="200,0 200,200 0,100" />
        </a>
  </svg> 
</div>
