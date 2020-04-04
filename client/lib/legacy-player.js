// Copyright 2020 Mehmet Baker
// 
// This file is part of galata-dergisi.
// 
// galata-dergisi is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// galata-dergisi is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with galata-dergisi. If not, see <https://www.gnu.org/licenses/>.

var timer1,                 //The Timer to Update Information While Playing
  current,                //Tracker (Played)
  audCnt,			   //HTML5 Audio Element
  nav,				   //Tracker Navigator
  pTimer,                 //Current Time (Play Time)
  bar,				   //Volume Bar
  inputs = new Array(),     //Hidden Inputs
  songs = new Array(),	   //Songs
  playableExt,
  selSong,			   //Selected Song
  mouseX,			   //X-Coordinates of the Mouse Relative to the Viewport
  mouseY,			   //Y-Coordinates of the Mouse Relative to the Viewport
  isChrome2,
  isFirefox,
  isSafari,
  isOpera,
  isIE;

$(document).mousemove(function (e) { //Mouse Position holded in mouseX and mouseY (everytime)
  mouseX = e.screenX - window.screenX;
  mouseY = e.screenY - window.screenY;
}).mouseover();

function initPlayer() {
  current = document.getElementById("tracker_current");
  audCnt = document.getElementById("player");
  nav = document.getElementById("player_navigator");
  pTimer = document.getElementById("player_time");
  bar = document.getElementById("volume_bar");
  inputs = document.getElementsByTagName("input");
  checkBrowser();
  loadSongs();
  setVolumeButton();
}

function getPlayableExt() {
  if (isChrome2) {
    if (audCnt.canPlayType("audio/mpeg") != "") {
      return "1";
    } else if (audCnt.canPlayType("audio/ogg") != "") {
      return "2";
    } else {
      noPlayable();
    }
  } else if (isOpera) {
    if (audCnt.canPlayType("audio/mpeg") != "") {
      return "1";
    } else if (audCnt.canPlayType("audio/ogg") != "") {
      return "2";
    } else {
      noPlayable();
    }
  } else if (isIE) {
    if (audCnt.canPlayType("audio/mpeg") != "") {
      return "1";
    } else if (audCnt.canPlayType("audio/ogg") != "") {
      return "2";
    } else {
      noPlayable();
    }
  } else {
    if (audCnt.canPlayType("audio/ogg") != "") {
      return "2";
    } else if (audCnt.canPlayType("audio/mpeg") != "") {
      return "1";
    } else {
      noPlayable();
    }
  }
}

function noPlayable() {
  document.getElementById("player_container").style.display = "none";
  alert("Tarayıcınız hiçbir müzik dosyasını oynatamadığı için Müzik Oynatıcısı gizlendi!");
}

function loadSongs() { //Initialise the Player   
  var each_song = new Array();
  playableExt = getPlayableExt();

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].name == "player_songs") {
      each_song = new Array();
      if (inputs[i].size == playableExt) {
        each_song.push(inputs[i].id, inputs[i].value, inputs[i].className);
        songs.push(each_song);
      }
    }
  }

  if (songs.length == 1) {
    hideNextPrev(); //Hide next and previous buttons if there is only one song
  }

  loadSong(0);
}

function loadSong(song) { //Change HTML5 Audio Element's Source
  var song_name = document.getElementById("song_name");
  var song_artist = document.getElementById("song_artist");

  song_name.innerHTML = songs[song][0];
  song_artist.innerHTML = songs[song][1];
  audCnt.src = songs[song][2];
  selSong = song;
}

function setPause() { //Pause the Player Before Next or Previous Song
  clearInterval(timer1);

  if (document.getElementById("player_play").className == "player_pause") {
    doPlay();
  }

  resetDOM(); //Set the player in initial position
}


function setVolumeButton() { //Set Initial Volume Button Image
  var obj = document.getElementById("volume_button");

  if (audCnt.volume <= 0.3) {
    obj.style.backgroundImage = "url(/images/legacy-player-icons/volume_min.png)";
  } else if (audCnt.volume > 0.3 && audCnt.volume < 0.7) {
    obj.style.backgroundImage = "url(/images/legacy-player-icons/volume_med.png)";
  } else if (audCnt.volume > 0.7) {
    obj.style.backgroundImage = "url(/images/legacy-player-icons/volume_max.png)";
  }
  
  bar.style.width = parseInt(audCnt.volume * 75) + "px";
}

function loadStatus() { //Update Tracker Bar and the Current Time
  var buffered;
  var duration = parseInt(audCnt.duration);			 //Song Duration
  var curr = parseInt(audCnt.currentTime);			 //Current Time of the Song

  try {
    buffered = audCnt.buffered.end(audCnt.buffered); //Get Buffer Info
  } catch (err) {
    buffered = duration;
  }

  const loaderElement = document.getElementById("tracker_loaded");

  if (!loaderElement) return;

  loaderElement.style.width = parseInt(buffered / duration * 230) + "px";
  current.style.width = (curr / duration * 230) + "px";
  nav.style.left = (curr / duration * 210) + "px";
  pTimer.innerHTML = timeConvert(audCnt.currentTime);

  if (audCnt.currentTime == audCnt.duration) { //End of Song?
    endOfSong();
  }
}

function endOfSong() { //Advance Next Song
  clearInterval(timer1);
  audCnt.pause();
  replaceClass(document.getElementById("player_play"), "player_play");

  if ((selSong + 1) != songs.length) { //Check if the played song wasn't the last in the playlist
    nextSong();
    setTimeout(doPlay);
  }
}

function hideNextPrev() { //Hide Buttons
  document.getElementById("pNextButton").style.display = "none";
  document.getElementById("pPrevButton").style.display = "none";
}

function timeConvert(secs) { //Convert Seconds to MM:SS
  var int_secs = parseInt(secs);
  var mins = "00";
  var rem_secs = "00";

  var mins = ((int_secs - int_secs % 60) / 60) + "";
  var rem_secs = (int_secs % 60) + "";

  if (mins.length == 1) {
    mins = '0' + mins;
  }

  if (rem_secs.length == 1) {
    rem_secs = '0' + rem_secs;
  }

  return mins + ":" + rem_secs;
}

function resetDOM() { //Set the player in initial position
  document.getElementById("tracker_loaded").style.width = "0px";
  current.style.width = "0px";
  nav.style.left = "0px";
  pTimer.innerHTML = "00:00";
}

function replaceClass(obj, newClass) { //Replace an Object's Class
  obj.className = "";
  obj.className = newClass;
}

function getOffset(el) { //Get a DOM Object's Offset
  return el.getBoundingClientRect();
}

function checkBrowser() {
  // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
  isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

  isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+

  // At least Safari 3+: "[object HTMLElementConstructor]"
  isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;

  isChrome2 = !!window.chrome && !isOpera;              // Chrome 1+
  isIE = /*@cc_on!@*/false || !!document.documentMode;   // At least IE6
}

//FUNCTIONS CALLED BY DOM OBJECTS

function nextSong() { //Next Button
  setPause();  //Prepare the Player for the Next Song

  if (songs.length > selSong + 1) {
    loadSong(selSong + 1);
  } else {
    loadSong(0);
  }
}

function prevSong() { //Previous Button	
  setPause();  //Prepare the Player for the Previous Song	

  if (selSong - 1 >= 0) {
    loadSong(selSong - 1);
  } else {
    loadSong(songs.length - 1);
  }
}

function showTime() { //Tracker onMouseMove
  var trackElement = document.getElementById('player_tracker');
  var magazineContainer = trackElement.closest('.magazine');
  var trackRect = getOffset(trackElement);
  var magazineRect = getOffset(magazineContainer);

  var posy = trackRect.top - magazineRect.top - 19;
  var posx = mouseX - magazineRect.left - 12;
  var obj = document.getElementById("show_time");
  var the_time = posx + 12 - (trackRect.left - magazineRect.left);

  obj.style.display = "inline";
  obj.style.position = "fixed";
  obj.style.top = posy + "px";
  obj.style.left = posx + "px";
  obj.style.zIndex = '9999';
  the_time = (the_time * audCnt.duration) / 230;
  document.getElementById("put_time").innerHTML = timeConvert(the_time);
}

function hideTime() { //Tracker onMouseOut
  document.getElementById("show_time").style.display = "none";
}

function seek(obj) {  //Tracker onClick
  var pos = mouseX - getOffset(document.getElementById("player_tracker")).left;
  var curr = pos / 230 * audCnt.duration;

  audCnt.currentTime = curr;
  loadStatus(); //updating the tracker...
}

function toggleMute(obj) { //Volume Button
  if (audCnt.muted) {
    audCnt.muted = false;
    setVolumeButton();
  } else {
    audCnt.muted = true;
    obj.style.backgroundImage = "url(/images/legacy-player-icons/volume_mute.png)";
  }
}

function doPlay() {	//Play-Pause Button
  var obj = document.getElementById("player_play");

  bar.style.width = parseInt(audCnt.volume * 75) + "px";

  if (obj.className == "player_play") {
    audCnt.play();
    replaceClass(obj, "player_pause");
    timer1 = setInterval("loadStatus()", 1000);
  } else {
    audCnt.pause();
    replaceClass(obj, "player_play");
    clearInterval(timer1);
  }
}

function setVolume() { //Volume Bar
  var pos = mouseX - getOffset(document.getElementById("volume_bar")).left;

  audCnt.volume = pos / 75;
  setVolumeButton();
}
