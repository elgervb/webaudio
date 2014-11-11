var playerApp = angular.module('player', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {
 
  $routeProvider
   .when('/', {
    templateUrl: 'static/app/views/playerView.html'
  });

}); // end config
