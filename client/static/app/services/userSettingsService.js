playerApp.factory('usersettings', 
  function(){

  	var item = JSON.parse(localStorage.getItem('local.usersettings'));
  	if (item){
  		return item;
  	}

  	return {
  		notifications: true
  	}
  }
);