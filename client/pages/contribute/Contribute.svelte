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

  // 50 MB
  const MAX_FILE_SIZE = 1024 * 1024 * 50;

  let assetType;
  let darkMode = false;

  // DOM Elements
  let form;
  let fileInput;
  let fileInputText;
  let submitButton;
  let assetTypeInput;

  const MIME_TYPES = {
    text: 'text/plain, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.oasis.opendocument.text, application/rtf, .txt, .pdf, .doc, .docx, .odt, .rtf',
    image: 'image/*, .png, .jpg, .jpeg, .bmp, .tiff, .tif',
    audio: 'audio/*, .mp3, .ogg',
  };

  const ASSET_MIMES = {
    siir: 'text',
    oyku: 'text',
    deneme: 'text',
    roportaj: 'text',
    elestiri: 'text',
    resim: 'image',
    ses: 'audio',
  };

  async function onButtonClick() {
    form.reportValidity();

    if (form.checkValidity()) {
      const formData = new FormData(form);

      if (!formData.get('assetType')) {
        const { input } = M.FormSelect.getInstance(assetTypeInput);
        input.readOnly = false;
        input.setCustomValidity('Lütfen Eser Türü seçimi yapınız.');
        input.reportValidity();
        input.readOnly = true;
        return;
      }

      if (formData.get('g-recaptcha-response') === '') {
        M.toast({
          html: 'Lütfen güvenlik doğrulamasını tamamlayınız.',
          classes: 'yellow darken-4',
        });
        return;
      }

      try {
        const response = await fetch('/katkida-bulunun', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();

        if (!result.success) {
          M.toast({
            html: result.error,
            classes: 'red darken-3',
          });
          return;
        }

        M.toast({
          html: 'Gönderi tamamlandı, katkınız için teşekkür ederiz.',
          classes: 'teal darken-3',
        });

        form.reset();
      } catch (ex) {
        console.trace(ex);
        M.toast({
          html: 'Beklenmedik bir hata oluştu, lütfen sayfayı yenileyip tekrar deneyin.',
          classes: 'red darken-3',
        });
      }
    }
  }

  function ensureFileMimeMatchesAssetType() {
    const assetTypeEmpty = !assetType;
    const videoAsset = assetType === 'video';
    let fileMimeMatchesAssetMime = false;

    if (!videoAsset && fileInput.files.length) {
      const fileMime = fileInput.files[0].type;
      const regexpString = MIME_TYPES[ASSET_MIMES[assetType]]
        .replace(/\s/g, '')
        .split(',')
        .map((assetMime) => {
          if (/^\./.test(assetMime)) {
            assetMime += '$';
          }

          return assetMime
            .replace('*', '.+')
            .replace('.', '\\.')
            .replace('/', '\\/');
        })
        .join('|');

      const regexp = new RegExp(regexpString);
      fileMimeMatchesAssetMime = regexp.test(fileMime);
    }

    if (assetTypeEmpty || videoAsset || !fileMimeMatchesAssetMime) {
      fileInput.value = '';
      fileInputText.value = '';
      fileInputText.classList.remove('valid');
      return;
    }
  }

  function onAssetTypeChange() {
    if (assetTypeInput.value) {
      const { input } = M.FormSelect.getInstance(assetTypeInput);
      input.setCustomValidity('');
    }

    ensureFileMimeMatchesAssetType();
  }

  if (window.matchMedia) {
    darkMode = matchMedia('(prefers-color-scheme: dark').matches;
  }

  onMount(M.AutoInit);
</script>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
  }

  :global(body) {
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

  .page-container {
    width: 100%;
    height: 100%;
    background: #bdbdbd;
  }

  .container {
    background: #eee;
  }

  @media (prefers-color-scheme: dark) {
    .page-container {
      background: #222;
    }

    .container {
      background: #424242;
      box-shadow:  0 5px 0px #1e1e1e;
    }

    h3 {
      color: #8e8e8e;
    }

    .helper-text {
      color: #b5b5b5 !important;
    }

    :global(input, .dropdown-content li:not(.disabled) span, textarea) {
      color: #bbb !important;
    }

    :global(svg.caret) {
      fill: #bbb !important;
    }

    :global(.dropdown-content li.disabled span) {
      color: #868686;
    }

    :global(.dropdown-content) {
      background: #4d4d4d !important;
    }

    :global(input:not(.browser-default).invalid ~ .helper-text[data-error]) {
      color: transparent !important;
    }

    :global(input:not(.browser-default).invalid ~ .helper-text::after),
    :global(input:not(.browser-default).invalid:focus ~ label) {
      color: #d9bb45 !important;
    }

    :global(input.invalid:not(.browser-default)) {
      border-bottom: 1px solid #d9bb45 !important;
      box-shadow: 0 1px 0 0 #d9bb45 !important;
    }
  }
</style>

<div class="page-container">
  <div class="container">
    <h3 class="center-align">Katkıda Bulunun</h3>

    <div class="row">
      <form class="col s12" on:submit|preventDefault bind:this={form}>
        <div class="row">
          <div class="input-field col s12">
            <input type="text" id="name" name="name" maxlength="40" class="validate" required />
            <label for="name">İsminiz</label>
            <span class="helper-text" data-error="Lütfen isminizi giriniz.">
              Buraya yazdığınız isim "Katkıda Bulunanlar" sayfasında kullanılacaktır.
            </span>
          </div>
        </div>

        <div class="row">
          <div class="input-field col s12">
            <input type="email" id="email" name="email" maxlength="100" class="validate" required />
            <label for="email">Eposta Adresiniz</label>
            <span class="helper-text" data-error="Lütfen geçerli bir eposta adresi giriniz.">
              Editörlerimiz sizinle bu adresten iletişime geçecek.
            </span>
          </div>
        </div>

        <div class="row">
          <div class="input-field col s12">
            <input type="text" id="title" name="title" maxlength="120" class="validate" required />
            <label for="title">Başlık</label>
            <span class="helper-text" data-error="Lütfen bir başlık giriniz.">
              Buraya yazdığınız başlık "Katkıda Bulunanlar" sayfasında kullanılacaktır.
            </span>
          </div>
        </div>

        <div class="row">
          <div class="input-field col s12">
            <select
              bind:value={assetType}
              bind:this={assetTypeInput}
              name="assetType"
              id="assetType"
              on:change={onAssetTypeChange}
              >
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
            <label for="assetType">Eser Türü</label>
          </div>
        </div>

        {#if assetType === 'video'}
          <div class="row">
            <div class="input-field col s12">
              <input type="url" id="videoLink" name="videoLink" maxlength="255" class="validate" required />
              <label for="videoLink">YouTube Linki</label>
              <span class="helper-text" data-error="Lütfen geçerli bir video adresi giriniz."></span>
            </div>
          </div>
        {/if}

        <div class="row">
          <div class="input-field col s12">
            <textarea id="message" name="message" class="materialize-textarea" maxlength="5000"></textarea>
            <label for="message">Mesajınız</label>
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
                <input
                  bind:this={fileInput}
                  on:change={(e) => {
                    if (e.target.files.length && e.target.files[0].size >= MAX_FILE_SIZE) {
                      e.target.setCustomValidity("Lütfen 100 MB'den küçük bir dosya seçiniz.");
                      e.target.reportValidty();
                    } else {
                      e.target.setCustomValidity('');
                    }
                  }}
                  type="file"
                  name="file"
                  required="required"
                  accept={assetType === 'video' ? '' : MIME_TYPES[ASSET_MIMES[assetType]]} />
              </div>
              <div class="file-path-wrapper">
                <input bind:this={fileInputText} class="file-path validate" type="text" placeholder="Dosya seçiniz." />
              </div>
            </div>
          </div>
        {/if}

        <div
          class="g-recaptcha"
          data-theme="{darkMode ? 'dark' : 'light'}"
          data-sitekey="6LcNcPYSAAAAACo24ipu3YWTwaLflO1gUDSg4ld1"
        ></div>

        <br />

        <button type="button" class="btn waves-effect waves-light" on:click={onButtonClick}>Gönder</button>

        <input type="submit" bind:this={submitButton} />
      </form>
    </div>
  </div>
</div>
