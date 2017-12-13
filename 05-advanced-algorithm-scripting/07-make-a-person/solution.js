var Person = function(firstAndLast){
    var wordExp = /\s+/;
	var firstName = firstAndLast.split(wordExp)[0];
	var lastName = firstAndLast.split(wordExp)[1];
	var checkValidity = function(input, fun){
      return typeof input[0] === "string" && input.length === 1;
	};
	this.getFirstName = function(){
		return firstName;
	};
	this.getLastName = function(){
		return lastName;
	};
	this.getFullName = function(){
		return firstName + " " + lastName;
	};
	this.setFirstName = function(first){
		if(checkValidity(arguments)){ firstName = first; }
	};
	this.setLastName = function(last){
		if(checkValidity(arguments)){ lastName = last; }
	};
	this.setFullName = function(fullName){
		if(checkValidity(arguments)){
			var names = fullName.split(wordExp);
			firstName = names[0];
			lastName = names[1];
		}
	};
};
