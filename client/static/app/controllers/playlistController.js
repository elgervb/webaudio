 /**
   * Controller for the playlist
   *
   * TODO find a way to use the playlist object of player to map the tracks to. Now we use $scope.tracks, that means we have a double administration
   */
playerApp.controller('PlaylistController', ['$scope', '$rootScope', 'player', 
  function($scope, $rootScope, player){

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
      // clear cache
      localStorage.setItem('local.playlist', JSON.stringify( $scope.tracks ) );
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
    $scope.shuffle = function(){
      $scope.tracks =  player.playlist().shuffle();
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