var playerApp = angular.module('player', ['ngRoute'])

.run(function($templateCache) {
  //$templateCache.put('templateId.html', 'This is the content of the template');

  // TODO implement template caching http://stackoverflow.com/questions/24658966/using-templatecache-in-ui-routers-template
})

.config(function($routeProvider, $locationProvider) {
 
  $routeProvider
  .when('/', {
    templateUrl: 'static/app/views/playerView.html'
  })
  .when('/settings', {
    templateUrl: 'static/app/views/settingsView.html',
    controller: 'settingsController'
   })
  .when('/player', {
    redirectTo: '/'
  });

   $locationProvider.html5Mode('true');

}) // end config


.directive('progressbar', ['$timeout', function($timeout){
  return {
    restrict: 'E',
    scope: {
      progress: '=',
      delay: '=',
      low: '=?',
      medium:'=?',
      high:'=?'
    },
    template: '<div class="progress-bar"><div class="progress {{cssclass}}" style="width:{{progress}}%"></div></div>',
    link: function($scope, element, attrs) {
      $scope.low = $scope.low || 50;
      $scope.medium = $scope.medium || 75;
      $scope.high = $scope.high || 95;

      if ($scope.progress < $scope.low){
        $scope.cssclass = 'low';
      }
      else if($scope.progress < $scope.medium){
       $scope.cssclass = 'medium';
      }
      else{
        $scope.cssclass = 'high';
      }

      element.css('width', $scope.progress);
    }
  };
}]);