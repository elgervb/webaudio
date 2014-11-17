playerApp.controller('settingsController', ['$scope', '$timeout', '$interval', 'player', 'usersettings', 
  function($scope, $timeout, $interval, player, usersettings){

  	$scope.usersettings = usersettings;

  	$scope.$watch('usersettings', 
  		function(v){
  			localStorage.setItem('local.usersettings',JSON.stringify( $scope.usersettings ));
  		}, true
  	);

  	$scope.$watch('usersettings', 
  		function(v){
  			console.dir($scope.usersettings);
  		}, true
  	);

  	$scope.diskusage = function(){
      var size = 0;
      if (localStorage.getItem('local.library')){
        size += localStorage.getItem('local.library').length;
      }
      if (localStorage.getItem('local.playlist')){
        size += localStorage.getItem('local.playlist').length;
      }
  		return size;
  	}
  }
]);