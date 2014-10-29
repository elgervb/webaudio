/*
 * Promises: http://www.html5rocks.com/en/tutorials/es6/promises/
 * AudioBuffer: https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
 * AudioContext: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
 * Web Audio lab: http://chimera.labs.oreilly.com/books/1234000001552/ch02.html#s02_2
 * styling html5 slider: http://brennaobrien.com/blog/2014/05/style-input-type-range-in-every-browser.html
 * implement event model on custom object: http://stackoverflow.com/questions/15308371/custom-events-model-without-using-dom-events-in-javascript
 */
var callbacks = {
    progress :  function(starttime, duration){
      var progress = document.getElementById('progress');
      progress.max = parseFloat(duration.toFixed(1));
      progress.value = parseFloat(starttime.toFixed(1));
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
      clearInterval(progressTimer);
      callbacks.progress(e.detail.elapsed, e.detail.duration);

      document.querySelector('.now-playing').innerHTML = e.detail.track.path;
    },
    loading : function(e){

    },
    next : function(e){
      clearInterval(progressTimer);
      document.getElementById('play').classList.remove('pause');
    },
    pause : function(e){
      clearInterval(progressTimer);
    },
    end : function(e){
      var el = document.getElementById('progress');
      el.value = el.max;
      callbacks.stop();
    }
 }
 ,progressTimer;


document.addEventListener('DOMContentLoaded', function () {

  var player = new Player({debug: true});
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
  document.getElementById('gain').dispatchEvent(new Event('input'));

  // EVENT LISTENERS for playlist & library
  document.querySelector('.clear-playlist').addEventListener('click', function(e){
    e.preventDefault();
    player.playlist().clear();

    var nodes = document.querySelectorAll('#playlist li');
    for (var i = 0; i < nodes.length; i++){
      document.getElementById('playlist').removeChild(nodes[i]);
    }
  });

  document.getElementById('filter').addEventListener('change', function(){
    var nodes = document.querySelectorAll('#library li');
    if (!nodes){return;}
    for(var i=0;i<nodes.length;i++){
      var node = nodes[i];
      if (node.innerHTML.toLowerCase().contains(this.value)){
        if (node.classList.contains('hide')){
          node.classList.remove('hide');
        }
      }
      else{
        node.classList.add('hide');
      }
    }
  }, false);
  


var buildGUI =  function(tracks){
  var displayTrack = function(track){
    if (track.artist && track.album){
      return track.artist + ' - ' + track.album + " " + track.track + " " + track.title;
    }
    return track.path;
  },
  library = document.getElementById('library');
  tracks.forEach(function(track){
    var item = document.createElement('li');
    item.dataset.guid = track.guid;
    item.innerHTML = displayTrack(track);
    library.appendChild(item);

    item.addEventListener('click', function(){
      var playlist = document.getElementById('playlist');
      var item = document.createElement('li');
      item.dataset.guid = track.guid;
      item.innerHTML = displayTrack(track);
      playlist.appendChild(item);
      player.playlist().add([track]);

      item.addEventListener('click', function(e){
        var guid = this.dataset.guid;
        player.playlist().goto(guid);
        player.play();
      }, false);

    }, false);
  });
  if (document.getElementById('filter').value){
      document.getElementById('filter').dispatchEvent(new Event('change'));
    }
}
// Get library from server
if (localStorage.length == 0 || !localStorage.getItem('local.library')){
  new Loader('../server/', 'json')
    .then(function(tracks){
      localStorage.setItem('local.library', JSON.stringify(tracks) );
      buildGUI(tracks);
    });
}
else{
  buildGUI( JSON.parse(localStorage.getItem('local.library')) );
}


}); // end DOMContentLoaded
