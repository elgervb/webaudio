/**
 * Audio player for the web, using the HTML5 audio API
 *
 * 
 * Events:
 *  - stop:     when the player has stopped playing
 *  - next:     when moving the the next track
 *  - previous: when moving to the previous track
 *  - loading:  when track is loaded
 *  - end
 *  - play
 *  - pause
 */
var Player = function(options){
  var context = new AudioContext(), // the AudioContext
    audioBuffer,                    // the buffer of the current playing
    source,                         // current playing source
    playlist = new Playlist(),      // playlist
    startTime = 0,                  // internal start time for calculating the elapsedTime
    elapsedTime = 0,                // elapsed time playing (for pause / resume)
    gainNode = context.createGain(),// The master volume
    options  = options || {},
    state = 'idle',                 // the state of the player idle, pause, playing, loading ()
    nowPlaying
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
    elapsedTime = startTime = 0;
    state='idle';
  },
  log = function(msg){
    if(options.debug){
      console.log(msg);
    }
  },
  next = function(){
    log("next song");
    clear();
    if (playlist.next()){
      target.dispatchEvent(createEvent('next') );
      play();
    }
    else{
      target.dispatchEvent(createEvent('stop'));
    }
  },
  pause = function(){
    state = 'paused';
    if (source){
      source.stop(0);
      target.dispatchEvent(createEvent('pause', {elapsed: elapsedTime, duration: audioBuffer.duration}));
    }
  },
  encodeURIComponents = function(uri){
    return encodeURI(uri)
      .replace(/\+/, encodeURIComponent("+"))
      .replace(/%20/g,'+');
  },
  /**
   * Play the current file
   * @param callback executed when playing with params starttime, duration
   */
  play = function() {
    // load new audio fragment
    if(!source){
      if (state === 'loading'){
        console.warn('Player is already loading. Please try again later.');
        return; 
      }
      if (playlist.size() <= 0){ // nothing to play
        log("Nothing to play. Playlist is empty");
        target.dispatchEvent(createEvent('stop'));
        return;
      }
      state = 'loading';
      target.dispatchEvent(createEvent('loading', {track: playlist.current() } ));
      log('start loading...', playlist.current().path);
      new Loader( encodeURIComponents( '../server/stream/'+ playlist.current().path ) )
      .then(function(buffer, url){
        state = 'loading';
        log(state+' '+playlist.current().path);
        log('reading...');
        var beginTime = new Date().getTime();
        context.decodeAudioData(buffer, function(buffer) {
          log( "Reading took " + (new Date().getTime() - beginTime) / 1000 + 'ms' );
          audioBuffer = buffer;
          log("Start playing. Duration: "+ audioBuffer.duration);
          clear();
          nowPlaying = playlist.current();
          startPlaying();
        }, function(){
         log('Error encoding file ');
         stop(); // try to fix loading issue
        });
      })
      .catch(function(error){
        log('error loading '+ error.status +'-'+ error.message);
        clear();
      });
    }
    else if (state === 'paused'){
      //log("resume elapsed: "+ elapsedTime +' duration '+ audioBuffer.duration);
      startPlaying();
    }
    else{
      // Uhm, are we trying to play a new song while already playing another?
      clear();
      play();
    }
  },
  startPlaying = function(){
    source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(gainNode);
    source.loop = false;
    source.onended = function(e){
      log("onended called");
      elapsedTime += parseFloat((context.currentTime - startTime).toFixed(2));
      log(state +' elapsed: '+ elapsedTime +' duration: '+audioBuffer.duration );
      // this is also called when pausing
      if ( startTime > 0 && audioBuffer.duration <= elapsedTime){
        if (source){source.stop(0);}
        log("song ended");
        target.dispatchEvent( createEvent('end') );
        next();
        elapsedTime = startTime = 0;
      }
    }
    
    startTime = context.currentTime;
    source.start(0, elapsedTime);
    state = 'playing';

    log(state +' elapsed: '+ elapsedTime +' duration: '+audioBuffer.duration );
    
    target.dispatchEvent(createEvent('play', {
        'elapsed': elapsedTime, 
        'duration': audioBuffer.duration,
        'track': nowPlaying
      })
    );
  },
  previous = function(){
    log("previous");
    clear();
    if (playlist.previous()){
      target.dispatchEvent(createEvent('previous'));
      play();
    }
    else{
      target.dispatchEvent(createEvent('stop'));
    }
  },
  stop = function(){
    log("stop");
    clear();
    target.dispatchEvent(createEvent('stop'));
  },
  gain = function(gain){
    gainNode.gain.value = gain === 0 ? parseFloat(gain.toFixed(2)) : parseFloat((gain / 100).toFixed(2));
    target.dispatchEvent(createEvent('gain', {gain: parseFloat(gain.toFixed(2))}));
    log('setting gain to '+ gain.toFixed(0));
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
    next                : next,
    pause               : pause,
    play                : play,
    playlist            : function(){return playlist;},
    previous            : previous,
    stop                : stop,
    gain                : gain
  }
};

var Loader = function (url, responsetype) {
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest(),
    beginTime = new Date().getTime();
    request.open('GET', url, true);
    request.responseType = responsetype||'arraybuffer';

    request.onload = function(){
      if (request.status == 200) {
        console.log( "Loading took " + (new Date().getTime() - beginTime) / 1000 + 'ms' );
        resolve(request.response, url);
      }
      else{
        reject({status:request.status, message: request.statusText, response: request.response});
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
  songs = items||[],
  add = function(add){
    songs = songs.concat(add);
  },
  clear = function(){
    index = 0;
    songs = [];
  },
  current = function(){
    return songs[index];
  },
  getNext = function(){
     if (songs.length > index + 1){
      return songs[index+1]
    }
    return null;
  },
  goto = function(guid){
    for ( var i in songs) {
      if (songs[i].guid === guid){
        index = parseInt(i);
        return;
      }
    }
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
      return songs[--index]
    }
    return null;
  },
  remove = function(index){
    index = index || 0;
    songs.splice(index, 1);
  },
  reset = function(){
    index = 0;
  },
  shuffle = function(){
    // TODO
  },
  size = function(){
    return songs.length;
  };

  return{
    add : add,
    clear : clear,
    current : current,
    getNext : getNext,
    goto : goto,
    next  : next,
    previous : previous,
    remove : remove,
    reset : reset,
    shuffle : shuffle,
    size : size
  }
};