/**
 * Values & factories
 */
playerApp.factory('player', 
  function($rootScope, $filter, usersettings){
    var player =  new Player({debug: true});

    player.addEventListener('loading', function(e){
      $rootScope.$broadcast('loading', e.detail.track);
    }, false);
    player.addEventListener('play', function(e){
      $rootScope.$broadcast('play', e.detail.track, e.detail.elapsed, e.detail.duration);
    }, false);
     player.addEventListener('pause', function(e){
      $rootScope.$broadcast('pause');
    }, false);
    player.addEventListener('stop', function(){
      $rootScope.$broadcast('stop');
    }, false);
    player.addEventListener('end', function(){
      $rootScope.$broadcast('stop');
    }, false);
    player.addEventListener('next', function(){
      $rootScope.$broadcast('next');
    }, false);
    player.addEventListener('previous', function(){
      $rootScope.$broadcast('previous');
    }, false);

    /*
     * Extensions
     */
    player.addEventListener('play', function(e){
      var msg = "Now playing " + $filter('track')(e.detail.track) + "(" + $filter('duration')(e.detail.elapsed||0) + " of " + $filter('duration')(e.detail.duration) + ")";

      if ("Notification" in window && Notification.permission !== "granted" && usersettings.notifications) { 
        Notification.requestPermission(function(){});
      }
      plugins.notifications(msg, usersettings);
    }, false);

    return player;
  }
);

var plugins = {
    /**
     * Show a notification when the next song is played when the player is not visible
     */
    notifications: function(message, usersettings){
      var notification, hidden, visible, visibilityChange;

      if (!usersettings.notifications){
        return;
      }
      // first, do some prefix checking
      if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
        hidden = "hidden";
        visible = "visible";
        visibilityChange = "visibilitychange";
      } else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden";
        visible = "mozVisible";
        visibilityChange = "mozvisibilitychange";
      } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visible = "msVisible";
        visibilityChange = "msvisibilitychange";
      } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visible = "webkitVisible";
        visibilityChange = "webkitvisibilitychange";
      }

      if (document.visibilityState === hidden){
        // do the notificaton
        if ("Notification" in window) { // check for support
          if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            notification = new Notification(message);
          }
          else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
              // If the user is okay, let's create a notification
              if (permission === "granted") {
                notification = new Notification(message);
              }
            });
          }
        }
      }
    }
  };
