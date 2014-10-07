/*
 * Promises: http://www.html5rocks.com/en/tutorials/es6/promises/
 * AudioBuffer: https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
 * AudioContext: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
 * Web Audio lab: http://chimera.labs.oreilly.com/books/1234000001552/ch02.html#s02_2
 * styling html5 slider: http://brennaobrien.com/blog/2014/05/style-input-type-range-in-every-browser.html
 */
 var songs = [
  {
    url: 'static/music/QOTSA-Little_Sister.ogg',
    name: 'Little Sister',
    type: 'ogg',
    artist: 'Queest of the Stone Age'
  },
  {
    url: 'static/music/explosion.ogg',
    name: 'Explosion',
    type: 'ogg',
    artist : null
  }
 ];

var progressCallback = function(starttime, duration){
  var progress = document.getElementById('progress');
  progress.max = duration;
  progress.value=starttime;
  progressTimer = setInterval(function(){
    progress.value = parseFloat(progress.value) + .1;
  }, 100);

}, progressTimer;

document.addEventListener('DOMContentLoaded', function () {

  var player = new Player(songs);

  /**
   * EVENT LISTENERS 
   */
  document.getElementById('play').addEventListener('mousedown', function(){
    clearInterval(progressTimer);
    this.classList.toggle('pause') ?  player.play(progressCallback) : player.pause();
  }, false);

  document.getElementById('stop').addEventListener('mousedown', function(){
    document.getElementById('play').classList.remove('pause');
    player.stop();
    clearInterval(progressTimer);
  });

  document.getElementById('next').addEventListener('mousedown', function(){
    clearInterval(progressTimer);
    player.next();
  }, false);

  document.getElementById('previous').addEventListener('mousedown', function(){
    clearInterval(progressTimer);
    player.previous();
  }, false);

  document.getElementById('volume').addEventListener('input', function(){
    document.getElementById('volumeDisplay').value = this.value;
    player.volume(parseInt(this.value));
  }, false);
  document.getElementById('volume').dispatchEvent(new Event('input'))
});




var Player = function(songs){
  var context = new AudioContext(), // the AudioContext
    audioBuffer,                    // the buffer of the current playing
    source,                         // current playing source
    playlist = new Playlist(songs), // playlist
    startTime = 0,                  // internal start time for calculating the elapsedTime
    elapsedTime = 0,                // elapsed time playing (for pause / resume)
    gainNode = context.createGain(),// The master volume
  clear = function(){
    source = null;
    elapsedTime = startTime = 0;
  },
  next = function(){
    console.log('Next song');
    stop();
    clear();
    if (playlist.next()){
      play();
    }
  },
  pause = function(){
    source.stop(0);
    elapsedTime += context.currentTime - startTime;
    console.log('Pausing at ',elapsedTime,'of',audioBuffer.duration );
  },
  /**
   * Play the current file
   * @param callback executed when playing with params starttime, duration
   */
  play = function(callback) {
    // load new audio fragment
    if(!source){
      new Loader(playlist.current().url)
      .then(function(buffer, url){
        context.decodeAudioData(buffer, function(buffer) {
          audioBuffer = buffer;
          source = context.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(gainNode);
          source.loop = false;
          startTime = context.currentTime;
          source.start(0);
          if (typeof callback ==='function'){
            callback(0, audioBuffer.duration); 
          }
          console.log('Start playing');
        }, function(){
         console.log('Error encoding file ' + url);
        });
      });
    }
    else{
      source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gainNode);
      source.loop = false;
      startTime = context.currentTime;
      source.start(0, elapsedTime % audioBuffer.duration);
      if (typeof callback ==='function'){
        callback(elapsedTime % audioBuffer.duration, audioBuffer.duration); 
      }
      console.log('Resuming at ',elapsedTime,'of',audioBuffer.duration);
    }
  },
  previous = function(){
    console.log('Previous song');
    stop();
    clear();
    if (playlist.previous()){
      play();
    }
  },
  stop = function(){
    if (source){
      source.stop(0);
    }
    elapsedTime = startTime = 0;
    console.log('Stopped');
  },
  volume = function(gain){
    gainNode.gain.value = gain === 0 ? gain.toFixed(2) : (gain / 100).toFixed(2);
    console.log('setting volume to ',gain.toFixed(0));
  };

  // fix prefixing
  window.AudioContext = window.AudioContext  || window.webkitAudioContext;
  if (!window.AudioContext){console.error("Web Audio API is not supported by this browser.");}

  gainNode.connect(context.destination);

  return {
    next : next,
    pause : pause,
    play : play,
    playlist : function(){return playlist;},
    previous : previous,
    stop : stop,
    volume : volume
  }
};
var Loader = function (url) {
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest()
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function(){
      if (request.status == 200) {
        resolve(request.response, url);
      }
      else{
        reject(Error(request.statusText));
      }
    }
    // Handle network errors
    request.onerror = function() {
      reject(Error("Network Error"));
    };
    // Make the request
    request.send();  
  });
};
var Playlist = function(items){
  var index = 0,
  current = function(){
    return items[index];
  },
  next = function(){
    if (items.length > index + 1){
      return items[++index]
    }
    return null;
  },
  previous = function(){
    if (index > 0 ){
      return items[--index]
    }
    return null;
  }
  reset = function(){
    index = 0;
  },
  shuffle = function(){
    // TODO
  };

  return{
    current : current,
    next  : next,
    previous : previous,
    reset : reset,
    shuffle : shuffle
  }
};