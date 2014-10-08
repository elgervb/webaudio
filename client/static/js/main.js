/*
 * Promises: http://www.html5rocks.com/en/tutorials/es6/promises/
 * AudioBuffer: https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
 * AudioContext: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
 * Web Audio lab: http://chimera.labs.oreilly.com/books/1234000001552/ch02.html#s02_2
 * styling html5 slider: http://brennaobrien.com/blog/2014/05/style-input-type-range-in-every-browser.html
 * implement event model on custom object: http://stackoverflow.com/questions/15308371/custom-events-model-without-using-dom-events-in-javascript
 */
 var songs = [
   {
    url: 'static/music/explosion.ogg'
  },
  {
    url: 'static/music/QOTSA-Little_Sister.ogg'
  },
  {
    url: 'static/music/01 Mumford And Sons - Sigh No More.mp3'
  },
  {
    url: 'static/music/02 Mumford And Sons - The Cave.mp3'
  },
  {
    url: 'static/music/03 Mumford And Sons - Winter Winds.mp3'
  },
  {
    url: 'static/music/04 Mumford And Sons - Roll Away Your Stone.mp3'
  },
  {
    url: 'static/music/05 Mumford And Sons - White Blank Page.mp3'
  },
  {
    url: 'static/music/06 Mumford And Sons - I Gave You All.mp3'
  },
  {
    url: 'static/music/07 Mumford And Sons - Little Lion Man.mp3'
  },
  {
    url: 'static/music/08 Mumford And Sons - Timshel.mp3'
  },
  {
    url: 'static/music/09 Mumford And Sons - Thistle & Weeds.mp3'
  },
  {
    url: 'static/music/10 Mumford And Sons - Awake My Soul.mp3'
  },
  {
    url: 'static/music/11 Mumford And Sons - Dust Bowl Dance.mp3'
  },
  {
    url: 'static/music/12 Mumford And Sons - After the Storm.mp3'
  }
 ];
var callbacks = {
    progress :  function(starttime, duration){
      var progress = document.getElementById('progress');
      progress.max = duration.toFixed(1);
      progress.value=starttime.toFixed(1);
      progressTimer = setInterval(function(){
      progress.value = parseFloat(progress.value) + .1;
      }, 100);
    },
    stop : function(e){
      document.getElementById('play').classList.remove('pause');
      clearInterval(progressTimer);
      document.getElementById('progress').value = 0;
    },
    play : function(e){
      document.getElementById('play').classList.add('pause');
      console.log('Play from',e.detail.elapsed,'of',e.detail.duration);
      clearInterval(progressTimer);
      callbacks.progress(e.detail.elapsed, e.detail.duration);
    },
    loading : function(e){

    },
    next : function(e){
      clearInterval(progressTimer);
      document.getElementById('play').classList.remove('pause');
      console.log('Next song');
    },
    pause : function(e){
      clearInterval(progressTimer);
      console.log('Pausing at ',e.detail.elapsed,'of',e.detail.duration );
    },
    end : function(e){
      console.log('Finished song');
      var el = document.getElementById('progress');
      el.value = el.max;
      callbacks.stop();
    }
 }
 ,progressTimer;


document.addEventListener('DOMContentLoaded', function () {

  var player = new Player(songs);
  player.addEventListener('stop', callbacks.stop, false);
  player.addEventListener('play', callbacks.play, false);
  player.addEventListener('pause', callbacks.pause, false);
  player.addEventListener('end', callbacks.end, false);
  player.addEventListener('next', callbacks.next, false);
  player.addEventListener('previous', callbacks.previous, false);

  /**
   * EVENT LISTENERS 
   */
  document.getElementById('play').addEventListener('mousedown', function(){
    this.classList.toggle('pause') ? player.play() : player.pause();
  }, false);

  document.getElementById('stop').addEventListener('mousedown', function(){
    player.stop();
  });
  document.getElementById('next').addEventListener('mousedown', function(){
    player.next();
  }, false);

  document.getElementById('previous').addEventListener('mousedown', function(){
    player.previous();
  }, false);

  document.getElementById('gain').addEventListener('input', function(){
    document.getElementById('gainDisplay').value = this.value;
    player.gain(parseInt(this.value));
  }, false);
  document.getElementById('gain').dispatchEvent(new Event('input'))
});




var Player = function(songs){
  var context = new AudioContext(), // the AudioContext
    audioBuffer,                    // the buffer of the current playing
    source,                         // current playing source
    playlist = new Playlist(songs), // playlist
    startTime = 0,                  // internal start time for calculating the elapsedTime
    elapsedTime = 0,                // elapsed time playing (for pause / resume)
    gainNode = context.createGain(),// The master volume
  /**
   * Event target for even handling
   */
  EventTarget= function() {
    // Create a DOM EventTarget object
    var target = document.createTextNode(null);
    // Pass EventTarget interface calls to DOM EventTarget object
    this.addEventListener = target.addEventListener.bind(target);
    this.removeEventListener = target.removeEventListener.bind(target);
    this.dispatchEvent = target.dispatchEvent.bind(target);
  },
  target = new EventTarget(),
  /**
   * Create a custom audio player event
   * @param string type the event type eg, stop, play, etc
   * @param object data The event data to supply to the event 
   */
  createEvent = function(type, data){
    return new CustomEvent(type, {detail: data||{}})
  },
  clear = function(){
    if (source){
      source.stop(0);
    }
    source = null;
  },
  next = function(){
    clear();
    if (playlist.next()){
      target.dispatchEvent(createEvent('next') );
      play();
    }
  },
  pause = function(){
    source.stop(0);
    elapsedTime += context.currentTime - startTime;
    target.dispatchEvent(createEvent('pause', {elapsed: elapsedTime, duration: audioBuffer.duration}));
  },
  /**
   * Play the current file
   * @param callback executed when playing with params starttime, duration
   */
  play = function() {
    // load new audio fragment
    if(!source){
      target.dispatchEvent(createEvent('loading'));
      new Loader(playlist.current().url)
      .then(function(buffer, url){
        context.decodeAudioData(buffer, function(buffer) {
          audioBuffer = buffer;
          startPlaying(0);
        }, function(){
         console.log('Error encoding file ' + url);
        });
      });
    }
    else{
      startPlaying(0, elapsedTime % audioBuffer.duration);
    }
  },
  startPlaying = function(elapsed){
    source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(gainNode);
    source.loop = false;
    source.onended = function(e){
      elapsedTime += context.currentTime - startTime;
      // this is also called when pausing
      if (audioBuffer.duration <= elapsedTime){
        if (source){source.stop(0);}
        target.dispatchEvent( createEvent('end') );
        next();
      }
      elapsedTime = startTime = 0;
    }
    startTime = context.currentTime;
    source.start(0, elapsed);
    
    target.dispatchEvent(createEvent('play', {
        'elapsed': elapsed, 
        'duration': audioBuffer.duration
      })
    );
  },
  previous = function(){
    clear();
    if (playlist.previous()){
      target.dispatchEvent(createEvent('previous', {player: this}));
    }
  },
  stop = function(){
    if (source){
      source.stop(0);
    }
    elapsedTime = startTime = 0;
    console.log('Stopped');
    target.dispatchEvent(createEvent('stop'));
  },
  gain = function(gain){
    gainNode.gain.value = gain === 0 ? gain.toFixed(2) : (gain / 100).toFixed(2);
    target.dispatchEvent(createEvent('gain', {gain: gain.toFixed(2)}));
    console.log('setting gain to ', gain.toFixed(0));
  };

  // fix prefixing
  window.AudioContext = window.AudioContext  || window.webkitAudioContext;
  if (!window.AudioContext){console.error("Web Audio API is not supported by this browser.");}
  gainNode.connect(context.destination);
  target.dispatchEvent(createEvent('init'));

  return {
    addEventListener    : target.addEventListener,
    dispatchEvent       : target.dispatchEvent,
    removeEventListener : target.removeEventListener,
    next     : next,
    pause    : pause,
    play     : play,
    playlist : function(){return playlist;},
    previous : previous,
    stop     : stop,
    gain     : gain
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
  getNext = function(){
     if (items.length > index + 1){
      return items[index+1]
    }
    return null;
  },
  next = function(){
    var item = getNext();
    if (item){
      index++;
      return item;
    }
    return null;
  },
  previous = function(){
    if (index > 0 ){
      return items[--index]
    }
    return null;
  },
  reset = function(){
    index = 0;
  },
  shuffle = function(){
    // TODO
  };

  return{
    current : current,
    getNext : getNext,
    next  : next,
    previous : previous,
    reset : reset,
    shuffle : shuffle
  }
};