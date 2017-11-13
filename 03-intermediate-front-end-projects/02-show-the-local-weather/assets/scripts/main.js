/* ------------------- VARIABLES -----------------*/
var temp = document.querySelector(".data-outside.temperature .value");
	precip = document.querySelector(".data-container .precipitations .value"),
	wSpeed = document.querySelector(".data-container .wind-speed .value"),
	wDir = document.querySelector(".data-container .wind-direction .value"),
	humid = document.querySelector(".data-container .humidity .value"),
	atmPress = document.querySelector(".data-container .pressure .value"),
	shortDesc = document.querySelector(".short-summary"),
	longDesc = document.querySelector(".long-summary"),
	cityName = document.querySelector(".location-name"),
	searchForm = document.querySelector("form.search"),
	statusMessage = document.querySelector(".status-info"),
	locationBtn = document.querySelector(".location-btn"),
	weatherIcon = document.querySelector(".weather-icon");


var unitsData = {
	current: "si",
	us: {
		temperature: " °F",
		speed: " mph",
		pressure: " mb"
	},
	si: {
		temperature: " °C",
		speed: " m/s",
		pressure: " hPa"
	},
	measurements: {
		temperature: 1,
		precipitation: 2,
		windSpeed: 3,
		windDirection: 4,
		humidity: 5,
		atmPressure: 6,
		shortSummary: "All well",
		longSummary: "All well and the sun is shining",
		icon: "tornado"
	},
	iconFiles: {
		"clear-day": "/assets/images/clear-day.svg",
		"clear-night": "/assets/images/clear-night.svg" ,
		"rain": "/assets/images/rain.svg" ,
		"snow": "/assets/images/snow.svg" ,
		"sleet": "/assets/images/sleet.svg" ,
		"wind": "/assets/images/wind.svg" ,
		"fog": "/assets/images/fog.svg" ,
		"cloudy": "/assets/images/cloudy.svg" ,
		"partly-cloudy-day": "/assets/images/partly-cloudy-day.svg" ,
		"partly-cloudy-night": "/assets/images/partly-cloudy-night.svg" ,
		"hail": "/assets/images/hail.svg" ,
		"thunderstorm": "/assets/images/thunderstorm.svg" ,
		"tornado": "/assets/images/tornado.svg" ,
	}
};

// Transform temperature and wind speed

/* list of icons:
icon:

	- clear-day
	- clear-night
	- rain
	- snow
	- sleet
	- wind
	- fog
	- cloudy
	- partly-cloudy-day
	- partly-cloudy-night
	- hail
	- thunderstorm
	- tornado
*/

// adds the appropiate measurement symbol to the values (celsius fahrenheit, mph m/s)
unitsData.changeUnitsSign = function(){
	document.querySelector(".data-outside.temperature .sign").textContent = this[this.current].temperature;;
	document.querySelector(".data-container .wind-speed .sign").textContent = this[this.current].speed;
	document.querySelector(".data-container .pressure .sign").textContent = this[this.current].pressure;
};

// converts between imperial and metrics by avoiding making another HTTP request to the weather API
unitsData.unitsConvertor = function(checked){
	if(checked){
		this.current = "us";
	}
	else {
		this.current = "si";
	}
	if (this.current === "si"){
		this.measurements.temperature =  (this.measurements.temperature - 32) * 5/9;
		this.measurements.windSpeed =  this.measurements.windSpeed * 0.44704;
	}
	else if (this.current === "us"){
		this.measurements.temperature =  (this.measurements.temperature * 9/5) + 32;
		this.measurements.windSpeed =  this.measurements.windSpeed * 2.23694;
	}
	temp.textContent = Number(this.measurements.temperature).toFixed(1);
	wSpeed.textContent = Number(this.measurements.windSpeed).toFixed(2); 
};

// stores the weather data in the unitsData object
unitsData.measurements.updateWeatherData = function(weatherData){
	this.temperature = weatherData.currently.temperature;
	this.precipitation = (Number(weatherData.currently.precipProbability) * 100);
	this.windSpeed = weatherData.currently.windSpeed;
	this.windDirection = weatherData.currently.windBearing;
	this.humidity = (Number(weatherData.currently.humidity) * 100);
	this.atmPressure = weatherData.currently.pressure;
	this.shortSummary = weatherData.currently.summary;
	this.longSummary = weatherData.hourly.summary;
	this.icon = weatherData.currently.icon;
};

// visually update the interface to match the data found in the unitsData object
unitsData.measurements.changeDisplayValues = function(){
	temp.textContent = this.temperature;
	precip.textContent = this.precipitation ;
	wSpeed.textContent = this.windSpeed;
	wDir.textContent = this.windDirection;
	humid.textContent = this.humidity;
	atmPress.textContent = this.atmPressure;
	shortDesc.textContent = this.shortSummary;
	longDesc.textContent = this.longSummary;
	weatherIcon.setAttribute("src", unitsData.iconFiles[this.icon]);
};







/* ----------------- FUNCTIONS ----------------*/
// generic HTTP request which returns a parsed JSON object on succesful request
function makeRequest (method, url, fun){
	var xhr = new XMLHttpRequest();
	xhr.open(method, url , true);
	xhr.send();
	xhr.onreadystatechange = function(){
		if(xhr.readyState === 4){
			if (xhr.status === 200){
				fun(JSON.parse(xhr.response));
			}
			else {
				changeStatus("Unable to fetch the required data (the HTTP request failed)");
			}
		}
	};
}

// Make AJAX request to weather API
function weatherReq(lat, long){
	// uses the data stored in unitsData.current to get either "metric" or "imperial" units
	var url = "https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/e1febb8e0a30865008ac7a67f8716037/" + lat + "," + long + "?units=";
	url = url + unitsData.current;
	makeRequest("GET", url , function(jsonRes){
		unitsData.measurements.updateWeatherData(jsonRes);
		unitsData.measurements.changeDisplayValues();
		unitsData.changeUnitsSign();
	});
}

// AJAX Req to Google Maps API to get location details
function locationNameReq (lat, long){
	makeRequest("GET", "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + long + "&key=AIzaSyBOQfI3AN0jUZoZbQwzRxi9RubPggIy90E", function(jsonRes){
		var county = "", 
		country = "";
		jsonRes.results[0]["address_components"].forEach(function(current){
			if (current.types.includes("administrative_area_level_2")){
				county = current["long_name"];
			}
			if (current.types.includes("country")){
				country = current["long_name"];
			}
		});
		cityName.textContent = county + ", " + country;
	});
}


function changeStatus(text){
	statusMessage.textContent = text;
	setTimeout(function(){
		statusMessage.textContent = "";
	}, 4000);
}



/* ------------------ EVENT LISTENERS -----------------*/
document.querySelector(".units-changer").addEventListener("change", function(){
	unitsData.unitsConvertor(this.checked);
	unitsData.changeUnitsSign();
});

/* Mimics a form submit with a reset action */
searchForm.addEventListener("keypress", function(event){
	console.log("keypress")
	if (event.keyCode === 13){
		event.preventDefault();
		this.reset();
	}
});

searchForm.addEventListener("reset", function(){
	var searchQuery = encodeURI(this.elements[0].value);
	var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + searchQuery + "&key=AIzaSyBOQfI3AN0jUZoZbQwzRxi9RubPggIy90E";
	// get coordinates of the location by address
	makeRequest("GET", url, function(jsonRes){
		if (jsonRes.results.length >= 1) {
			statusMessage.textContent = "";
			var lat = jsonRes.results[0].geometry.location.lat;
			var long = jsonRes.results[0].geometry.location.lng;
			weatherReq(lat, long);
			locationNameReq(lat, long);
			unitsData.changeUnitsSign();
		}
		else {
			changeStatus("There were no results for the search query. Please check the spelling or alternatively enter a different location.");
		}

	});
});

function geoLocation (success){
	navigator.geolocation.getCurrentPosition(function(data){
		var lat = data.coords.latitude;
		var long = data.coords.longitude;
		success(lat, long);
	}, 
	function(err){
		changeStatus("You either denied access to your location or something went wrong. Please try to use the search feature instead.");
	});
}




/*------------------------ INTIALIZATION(things to run when the page first loads)-------------------*/
locationBtn.addEventListener("click", function(){
	geoLocation(function(lat, long){
		weatherReq(lat, long);
		locationNameReq(lat, long);
	});
});









