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
  import GithubIcon from './GithubIcon.svelte';
</script>

<style>
  footer {
    font-family: "Playfair Display", serif;
    font-size: 13px;
    font-style: normal;
    text-align: center;
    line-height: 30px;
  }

  a {
    color: #698145;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
</style>

<footer>
  <!--googleoff: snippet-->
  İletişim:
  <a href="mailto:bilgi@galatadergisi.org">bilgi@galatadergisi.org</a>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  İçerik göndererek katkıda bulunmak için <a href="/katkida-bulunun">tıklayın</a>.
  <br />
  Web sitesinin kodları bir özgür yazılım lisansı olan
    <a
      href="https://www.gnu.org/licenses/gpl-3.0.en.html"
      target="_blank"
      title="GNU Genel Kamu Lisansı">GNU Genel Kamu Lisansı
    </a> ile lisanslıdır.
  <a
    href="https://github.com/galata-dergisi/galata-dergisi"
    title="Galata Dergisi Kaynak Kodları için GitHub Sayfası"
    target="_blank"
    >
    <GithubIcon /> galata-dergisi
  </a>
  <br />
  &copy; 2020 Galata Dergisi. Dergilerdeki hiçbir içerik izinsiz kopyalanamaz.
  <!--googleon: snippet-->
</footer>
