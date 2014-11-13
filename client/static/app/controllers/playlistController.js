 /**
   * Controller for the playlist
   *
   * TODO find a way to use the playlist object of player to map the tracks to. Now we use $scope.tracks, that means we have a double administration
   */
playerApp.controller('PlaylistController', ['$scope', '$rootScope', '$timeout', 'player', 
  function($scope, $rootScope, $timeout, player){

    $scope.tracks = [];

    $scope.play = function(track){
      if (player.state() !== 'loading'){
        player.playlist().goto(track.guid);
        player.play();
      }
    };
    $scope.clear = function(){
      player.playlist().clear();
      $scope.tracks = player.playlist().items();
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
      $scope.tracks = player.playlist().shuffle();
    };
    $scope.moveUp = function(track, $event){
      $event.preventDefault();
      var playlist = player.playlist();
      var index = playlist.indexOf(track.guid);
      playlist.moveItem(index, index-1);
      $scope.tracks = playlist.items();
      $event.stopPropagation();
    };
    $scope.moveDown = function(track, $event){
      $event.preventDefault();
      var playlist = player.playlist();
      var index = playlist.indexOf(track.guid);
      playlist.moveItem(index, index+1);
      $scope.tracks = playlist.items();
      $event.stopPropagation();
    };
    $scope.remove = function(track, $event){
      $event.preventDefault();
      var playlist = player.playlist();
      var index = playlist.indexOf(track.guid);
      playlist.remove( index );
    
      $scope.tracks = playlist.items();

      $event.stopPropagation();
    };

    $scope.$on('addToPlayList', function(event, track){
      player.playlist().add(track);
      $scope.tracks = player.playlist().items();
    });
    $scope.$on('addAllToPlayList', function(event, tracks){
      var playlist = player.playlist();
      playlist.clear();
      tracks.forEach(function(t){
        playlist.add(t);
      });
      $timeout(function(){
        $scope.tracks = playlist.items();
      });
      
    });

    if (localStorage.length && localStorage.getItem('local.playlist')){
      JSON.parse( localStorage.getItem('local.playlist') ).forEach(function(track){
        player.playlist().add(track);
      });
      $scope.tracks = player.playlist().items();
    }
  }]);