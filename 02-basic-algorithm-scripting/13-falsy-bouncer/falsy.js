function bouncer(arr) {
	// removes the falsy values by using a simple conditional
	return arr.filter(function(val){
		return val ? true : false;
	});
}
