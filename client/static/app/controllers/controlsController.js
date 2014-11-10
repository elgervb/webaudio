playerApp.controller('ControlsController', ['$scope', '$timeout', '$interval', 'player', 
  function($scope, $timeout, $interval, player){

    var progressTimer;
    $scope.progress = {};
    $scope.progress.max = 0;
    $scope.progress.value = 0;
    // Gain
    $scope.gain = 80; // initial gain
    $scope.nowplaying = null;
    $scope.$watch('gain', function( value ){
      player.gain( parseFloat(value) )
    });

    $scope.play = function(){
      if ($scope.state === 'playing'){
        player.pause();
      }
      else{
        player.play();
      }
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
    $scope.hasNext = function(){
      return player.playlist().peek(1);
    }
     $scope.hasPrevious = function(){
      return player.playlist().peek(-1);
    }

    // event handling. Use $timeout because of timing issues with $scope.$apply
    $scope.$on('loading', function(event, track){
      $timeout(function(){
        $scope.state = "loading";
        $scope.nowplaying = track
      });
    });
    $scope.$on('play', function(event, track, elapsed, duration){
      $timeout(function(){
        $scope.state = "playing";
        $scope.nowplaying = track
        $scope.progress.max = parseFloat(duration.toFixed(1));
        $scope.progress.value = parseFloat(elapsed.toFixed(1));       

        if (progressTimer){
          $interval.cancel(progressTimer);
        }
        progressTimer = $interval(function(){
          $scope.progress.value = (parseFloat($scope.progress.value) + .5).toFixed(1);
        }, 500);
      })
    });
     $scope.$on('pause', function(event){
      $timeout(function(){
         $scope.state = "pause";
         $interval.cancel(progressTimer);
      })
    });
    $scope.$on('stop', function(event){
      $timeout(function(){
      $scope.state = "";
       $interval.cancel(progressTimer);
      })
    });
    $scope.$on('previous', function(event){
        $timeout(function(){
        $interval.cancel(progressTimer);
      })
    });
    $scope.$on('next', function(event){
        $timeout(function(){
        $interval.cancel(progressTimer);
      })
    });
    $scope.$on('$destroy', function() {
      $interval.cancel(progressTimer);
    });

  }]
);