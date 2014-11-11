playerApp.controller('settingsController', ['$scope', '$timeout', '$interval', 'player', 
  function($scope, $timeout, $interval, player){

  	$scope.diskusage = function(){
  		return localStorage.getItem('local.library').length + localStorage.getItem('local.playlist').length;
  	}
  }
]);