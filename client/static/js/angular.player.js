var playerApp = angular.module('player', [])

  .controller('ControlsController', ['$scope', 'player', function($scope, player){

    // Gain
    $scope.gain = 80; // initial gain
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

    $scope.$on('loading', function(event){
        $scope.state = "loading";
    });
    $scope.$on('play', function(event){
      $scope.$apply(function(){
        $scope.state = "playing";
      })
    });
     $scope.$on('paused', function(event){
      $scope.state = "pause";
    });
    $scope.$on('stop', function(event){
      $scope.state = "";
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
      player.play(track);
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

  player.addEventListener('loading', function(){
    $rootScope.$broadcast('loading');
  }, false);
  player.addEventListener('play', function(){
    $rootScope.$broadcast('play');
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