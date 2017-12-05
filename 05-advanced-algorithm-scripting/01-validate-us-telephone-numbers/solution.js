function telephoneCheck(str) {
  // (123 or 123) pattern
  var rParantheses = /(\(\d{3}|\d{3}\))/gi;
  // check for (123)
  var fullParantheses = /\(\d{3}\)/gi;
  var r = /(1?\s?\(?\d{3}\)?\s?\-?\d{3}\s?\-?\d{4})/gi;
  // checks that if  (123 or 123) pattern exists that then the parantheses are matched (123)
  if(!(fullParantheses.exec(str)) && rParantheses.exec(str)){
  	return false;
  }
  //checks that the "r" pattern matches the whole string
  return str.replace(r, "").length === 0 ? true : false;
}
