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
      delay: '='
    },
    template: '<div class="progress-bar"><div class="progress" style="width:{{progress}}%"></div></div>',
    link: function(scope, element, attrs) {
      console.dir(element);

      element.css('width', scope.progress);
    }
  };
}]);