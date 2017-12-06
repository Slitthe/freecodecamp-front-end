function updateRecords(id, prop, value){
  var curr = collection[id];
  // Scenario: value is empty string "" --> delete that prop
  if(value === ""){
    delete curr[prop];
  }
  else if (prop === "tracks"){
    // Scenario: prop is "tracks" and "tracks" doesn't exist
    if (!curr[prop]){
      curr.tracks = [];
      curr.tracks.push(value);
    }
    // Scenario: prop is "tracks" and and value different from ""
    else {
      curr[prop].push(value);
    }
  }
  // Other cases: update and/or create that prop
  else {
    curr[prop] = value;
  }
  return collection;
}
