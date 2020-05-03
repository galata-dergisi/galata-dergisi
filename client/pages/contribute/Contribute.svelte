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
  import { onMount, tick } from 'svelte';

  let assetType;

  // DOM Elements
  let form;
  let submitButton;

  function onButtonClick() {
    form.reportValidity();

    if (form.checkValidity()) {
      console.log('submit form');
    }

    console.log('don\'t submit form');
  }

  onMount(M.AutoInit);
</script>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .container {
    min-height: 100vh;
    padding-top: 24px;
    padding-bottom: 20px;
  }

  @media only screen and (min-width: 768px) {
    .container {
      box-shadow: 0 0 5px 0px #888;
    }
  }

  h3 {
    margin-top: 0;
  }

  input[type=submit] {
    visibility: hidden;
  }
</style>

<div class="container grey lighten-3">
  <h3 class="center-align">Katkıda Bulunun</h3>

  <div class="row">
    <form class="col s12" on:submit|preventDefault bind:this={form}>
      <div class="row">
        <div class="input-field col s12">
          <input type="text" id="name" maxlength="40" class="validate" required />
          <label for="name">İsminiz</label>
          <span class="helper-text" data-error="Lütfen isminizi giriniz.">
            Buraya yazdığınız isim "Katkıda Bulunanlar" sayfasında kullanılacaktır.
          </span>
        </div>
      </div>

      <div class="row">
        <div class="input-field col s12">
          <input type="email" id="email" maxlength="100" class="validate" required />
          <label for="email">Eposta Adresiniz</label>
          <span class="helper-text" data-error="Lütfen geçerli bir eposta adresi giriniz.">
            Editörlerimiz sizinle bu adresten iletişime geçecek.
          </span>
        </div>
      </div>

      <div class="row">
        <div class="input-field col s12">
          <input type="text" id="title" maxlength="120" class="validate" required />
          <label for="title">Başlık</label>
          <span class="helper-text" data-error="Lütfen bir başlık giriniz.">
            Buraya yazdığınız başlık "Katkıda Bulunanlar" sayfasında kullanılacaktır.
          </span>
        </div>
      </div>

      <div class="row">
        <div class="input-field col s12">
          <select bind:value={assetType}>
            <option value="" disabled="disabled" selected="selected">Seçiniz...</option>
            <option value="siir">Şiir</option>
            <option value="oyku">Öykü</option>
            <option value="deneme">Deneme</option>
            <option value="roportaj">Röportaj</option>
            <option value="elestiri">Eleştiri, İnceleme</option>
            <option value="resim">Resim</option>
            <option value="ses">Ses</option>
            <option value="video">Video</option>
          </select>
          <label>Eser Türü</label>
        </div>
      </div>

      {#if assetType === 'video'}
        <div class="row">
          <div class="input-field col s12">
            <input type="text" id="videoLink" maxlength="100" pattern="url" class="validate" required />
            <label for="videoLink">YouTube Linki</label>
            <span class="helper-text" data-error="Lütfen geçerli bir video adresi giriniz."></span>
          </div>
        </div>
      {/if}

      <div class="row">
        <div class="input-field col s12">
          <textarea id="mesaj" class="materialize-textarea" maxlength="5000"></textarea>
          <label for="mesaj">Mesajınız</label>
          <span class="helper-text">
            Mesajınız katkınızla birlikte editörlerimize ulaştırılacaktır.
          </span>
        </div>
      </div>

      {#if assetType !== 'video'}
        <div class="row">
          <div class="file-field input-field col s12">
            <div class="btn">
              <span>Dosya</span>
              <input type="file" required accept="text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.text,application/rtf, audio/*,.txt,.pdf,.doc,.docx,.odt,.rtf" />
            </div>
            <div class="file-path-wrapper">
              <input class="file-path validate" type="text" placeholder="Dosya seçiniz." />
            </div>
          </div>
        </div>
      {/if}

      <button type="button" class="btn waves-effect waves-light" on:click={onButtonClick}>Gönder</button>

      <input type="submit" bind:this={submitButton} />
    </form>
  </div>
</div>