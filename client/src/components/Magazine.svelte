<script>
  export let index;
  export let publishDateText;
  export let numberOfPages;
  export let thumbnailURL;

  function handleClick() {
    console.log('clicked');
  }
</script>

<style>
  a {
    display: block;
    width: 100px;
    height: 140px;
    margin: 0 auto;
  }

  div {
    background-size: 100%;
    width: 100px;
    height: 140px;
    box-shadow: 2px 2px 5px rgba(0,0,0,.6);
    transition: transform .1s;
  }

  div:hover {
    transform: scale(1.5);
  }
</style>

<a 
  href='/#'
  title="{publishDateText} - Sayı {index}"
  on:click|preventDefault={handleClick}>
  <div style="background-image: url({thumbnailURL})" />
</a>