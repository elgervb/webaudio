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
  		return localStorage.getItem('local.library').length + localStorage.getItem('local.playlist').length;
  	}
  }
]);