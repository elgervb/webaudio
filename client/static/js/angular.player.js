var playerApp = angular.module('player', [])

  .controller('ControlsController', ['$scope', '$timeout', '$interval', 'player', function($scope, $timeout, $interval, player){

    var progressTimer;
    $scope.progress = {};
    $scope.progress.max = 0;
    $scope.progress.value = 0;
    // Gain
    $scope.gain = 80; // initial gain
    $scope.nowplaying = "";
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

    // event handling. Use $timeout because of timing issues with $scope.$apply
    $scope.$on('loading', function(event, track){
      $timeout(function(){
        $scope.state = "loading";
        $scope.nowplaying = "loading " + track.path
      });
    });
    $scope.$on('play', function(event, track, elapsed, duration){
      $timeout(function(){
        $scope.state = "playing";
        $scope.nowplaying = track.path
        $scope.progress.max = parseFloat(duration.toFixed(1));
        $scope.progress.value = parseFloat(elapsed.toFixed(1));        
        

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

    $scope.filter = 'muse';
    // Get library from server
    if (localStorage.length == 0 || !localStorage.getItem('local.library')){
      new Loader('../server/', 'json')
        .then(function(tracks){
          localStorage.setItem('local.library', JSON.stringify(tracks) );
          $scope.tracks = tracks;
        });
    }
    else{
      $scope.tracks = JSON.parse(localStorage.getItem('local.library'));
    }

    $scope.addToPlaylist = function(track){
      console.log('send add to playlist');
      $rootScope.$broadcast('addToPlayList', track);
    }

  }])

  .controller('PlaylistController', ['$scope', '$rootScope', 'player', function($scope, $rootScope, player){

    $scope.tracks = [];

    $scope.play = function(track){
      player.playlist().goto(track.guid);
      player.play();
    }

    $scope.$on('addToPlayList', function(event, track){
      console.log('receive add to playlist ' + track.path);
      player.playlist().add(track);
      $scope.tracks.push(track);
    });


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