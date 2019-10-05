<script>
  import * as Utils from './lib/utils.js';
  import Footer from './components/Footer.svelte';
  let latestMagazine = null;
  let carouselMagazines = [];

  async function getMagazines() {
    try {
      const allMagazines = await Utils.httpGet('/magazines', { json: true });
      console.log(allMagazines);
    } catch (ex) {
      console.trace(ex);
    }
  }

  getMagazines();
</script>

<style>
  .container {
    width: 100%;
    height: 100%;
  }

  .row {
    background-repeat: no-repeat;
    background-position: bottom;
    background-size: 100%;
    height: 210px;
    width: 426px;
    margin: 70px auto 0 auto;
  }

  .row-1 {
    background-image: url(/images/wall-bookshelf-first.png);
  }

  .row-2 {
    background-image: url(/images/wall-bookshelf.png);
  }

  main {
    width: 100%;
    height: 800px;
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
  }
</style>

<main>
  <div class="logo"></div>

  <div class="container">
    <div class="row row-1">
      {#if latestMagazine}Deneme{/if}
    </div>
    <div class="row row-2">
      {#each carouselMagazines as magazine}Ikinci deneme{/each}
    </div>
  </div>

</main>

<Footer />
