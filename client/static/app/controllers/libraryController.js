playerApp.controller('LibraryController', ['$scope', '$rootScope', 'player', 
  function($scope, $rootScope, player){

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
  }]
);