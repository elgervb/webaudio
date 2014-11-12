
playerApp.filter('track', function() {
  return function(track) {
    if(!track){
      return "";
    }
    if (track.artist && track.album){
      return track.artist + " - " + track.album + " - " + track.track + " "  + track.title;
    } else {
      return track.path + " (" + track.id3 + ")";
    }
  };
});

playerApp.filter('duration', function() {
  return function(d) {
    if (!d){
      return "0:00";
    }
    var s = parseInt(d % 60);
    var m = parseInt(d/60)%60;
    var h = parseInt(d/3600)%60;
    return (h?h+":":"")+(m<10&&h>0?"0"+m:m)+ ":" + (s<10?"0"+s:s) || 0;
  };
});

playerApp.filter('size', function() {
  return function(size) {
    var i = Math.floor( Math.log(size) / Math.log(1024) );
    return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ['B', 'kB', 'MB', 'GB', 'TB'][i];
  };
});