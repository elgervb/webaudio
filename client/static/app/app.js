var playerApp = angular.module('player', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {
 
  $routeProvider
   .when('/', {
    templateUrl: 'static/app/views/playerView.html'
  })
   .when('/settings', {
    templateUrl: 'static/app/views/settingsView.html'
   });

}); // end config
