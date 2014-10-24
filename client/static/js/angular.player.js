var playerApp = angular.module('player', [])

  .controller('ControlsController', ['$scope', 'player', function($scope, player){

    // Gain
    $scope.gain = 80; // initial gain
    $scope.$watch('gain', function( value ){
      player.gain( parseFloat(value) )
    });

    $scope.play = function(){
      player.play();
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

  }])

  .controller('LibraryController', ['$scope', 'player', function($scope, player){

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

  }])

  .controller('PlaylistController', ['$scope', 'player', function($scope, player){



  }]);

/**
 * Values & factories
 */
playerApp.value('player', new Player({debug: true}) );