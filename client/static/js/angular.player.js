var playerApp = angular.module('player', [])

  .controller('ControlsController', ['$scope', '$timeout', '$interval', 'player', function($scope, $timeout, $interval, player){

    var progressTimer;
    $scope.progress = {};
    $scope.progress.max = 0;
    $scope.progress.value = 0;
    // Gain
    $scope.gain = 80; // initial gain
    $scope.nowplaying = null;
    $scope.$watch('gain', function( value ){
      player.gain( parseFloat(value) )
    });

    $scope.play = function(){
      if ($scope.state === 'playing'){
        player.pause();
      }
      else{
        player.play();
      }
    }
    $scope.stop = function(){
      player.stop();
    }
    $scope.previous = function(){
      player.previous();
    }
    $scope.next = function(){
      player.next();
    }
    $scope.hasNext = function(){
      return player.playlist().peek(1);
    }
     $scope.hasPrevious = function(){
      return player.playlist().peek(-1);
    }

    // event handling. Use $timeout because of timing issues with $scope.$apply
    $scope.$on('loading', function(event, track){
      $timeout(function(){
        $scope.state = "loading";
        $scope.nowplaying = track
      });
    });
    $scope.$on('play', function(event, track, elapsed, duration){
      $timeout(function(){
        $scope.state = "playing";
        $scope.nowplaying = track
        $scope.progress.max = parseFloat(duration.toFixed(1));
        $scope.progress.value = parseFloat(elapsed.toFixed(1));       

        if (progressTimer){
          $interval.cancel(progressTimer);
        }
        progressTimer = $interval(function(){
          $scope.progress.value = (parseFloat($scope.progress.value) + .5).toFixed(1);
        }, 500);
      })
    });
     $scope.$on('pause', function(event){
      $timeout(function(){
         $scope.state = "pause";
         $interval.cancel(progressTimer);
      })
    });
    $scope.$on('stop', function(event){
      $timeout(function(){
      $scope.state = "";
       $interval.cancel(progressTimer);
      })
    });
    $scope.$on('previous', function(event){
        $timeout(function(){
        $interval.cancel(progressTimer);
      })
    });
    $scope.$on('next', function(event){
        $timeout(function(){
        $interval.cancel(progressTimer);
      })
    });
    $scope.$on('$destroy', function() {
      $interval.cancel(progressTimer);
    });

  }])

  .controller('LibraryController', ['$scope', '$rootScope', 'player', function($scope, $rootScope, player){

    $scope.addToPlaylist = function(track){
      $rootScope.$broadcast('addToPlayList', track);
    }

    $scope.load = function(){
      $scope.loading = true;
      // Get library from server
      if (localStorage.length == 0 || !localStorage.getItem('local.library')){
        new Loader('../server/', 'json')
          .then(function(tracks){
            localStorage.setItem('local.library', JSON.stringify(tracks) );
            $scope.$apply(function(){
              $scope.tracks = tracks;
              $scope.loading = false;
            });
          });
      }
      else{
        $scope.tracks = JSON.parse(localStorage.getItem('local.library'));
        $scope.loading = false;
      }

    };
    $scope.reload = function(){
      localStorage.removeItem('local.library');
      $scope.tracks = "";
      $scope.load();
    };

    
    $scope.load();
  }])

  /**
   * Controller for the playlist
   *
   * TODO find a way to use the playlist object of player to map the tracks to. Now we use $scope.tracks, that means we have a double administration
   */
  .controller('PlaylistController', ['$scope', '$rootScope', 'player', function($scope, $rootScope, player){

    $scope.tracks = [];

    $scope.play = function(track){
      if (player.state() !== 'loading'){
        player.playlist().goto(track.guid);
        player.play();
      }
    };
    $scope.clear = function(){
      player.playlist().clear();
      $scope.tracks = [];
    }
    $scope.nowplaying = function(track){
      if (player.playlist().current().guid === track.guid){
        return true;
      }
      return false;
    }
    $scope.save = function(){
      localStorage.setItem('local.playlist', JSON.stringify( $scope.tracks ) ); 
    };

    $scope.$on('addToPlayList', function(event, track){
      player.playlist().add(track);
      $scope.tracks.push(track);
    });

    if (localStorage.length && localStorage.getItem('local.playlist')){
      $scope.tracks = JSON.parse( localStorage.getItem('local.playlist') );

      $scope.tracks.forEach(function(track){
        player.playlist().add(track);
      });
    }
  }]);

/**
 * Values & factories
 */
playerApp.factory('player', function($rootScope){
  var player =  new Player({debug: true});

  player.addEventListener('loading', function(e){
    $rootScope.$broadcast('loading', e.detail.track);
  }, false);
  player.addEventListener('play', function(e){
    $rootScope.$broadcast('play', e.detail.track, e.detail.elapsed, e.detail.duration);
  }, false);
   player.addEventListener('pause', function(e){
    $rootScope.$broadcast('pause');
  }, false);
  player.addEventListener('stop', function(){
    $rootScope.$broadcast('stop');
  }, false);
  player.addEventListener('end', function(){
    $rootScope.$broadcast('stop');
  }, false);
  player.addEventListener('next', function(){
    $rootScope.$broadcast('next');
  }, false);
  player.addEventListener('previous', function(){
    $rootScope.$broadcast('previous');
  }, false);

  return player;
});

playerApp.filter('track', function() {
  return function(track) {
    if(!track){
      return "";
    }
    if (track.artist && track.album){
      return track.artist + " - " + track.album + " - " + track.track + " "  + track.title;
    } else {
      return track.path + " (" + track.id3 + ")";
    }
  };
});

playerApp.filter('duration', function() {
  return function(d) {
    if (!d){
      return;
    }
    var s = parseInt(d % 60);
    var m = parseInt(d/60)%60;
    var h = parseInt(d/3600)%60;
    return (h?h+":":"")+(m<10&&h>0?"0"+m:m)+ ":" + (s<10?"0"+s:s)
  };
});
