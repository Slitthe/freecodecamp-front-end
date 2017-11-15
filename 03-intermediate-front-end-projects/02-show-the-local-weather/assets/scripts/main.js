// Array.includes() polyfill
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
Array.prototype.includes||Object.defineProperty(Array.prototype,"includes",{value:function(r,e){function t(r,e){return r===e||"number"==typeof r&&"number"==typeof e&&isNaN(r)&&isNaN(e)}if(null==this)throw new TypeError('"this" is null or not defined')
var n=Object(this),i=n.length>>>0
if(0===i)return!1
for(var o=0|e,u=Math.max(o>=0?o:i-Math.abs(o),0);i>u;){if(t(n[u],r))return!0
u++}return!1}})

/* ------------------- VARIABLES -----------------*/
var temp = document.querySelector(".data-outside.temperature .value"),
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
		"clear-day": "assets/images/clear-day.svg",
		"clear-night": "assets/images/clear-night.svg",
		"rain": "assets/images/rain.svg",
		"snow": "assets/images/snow.svg",
		"sleet": "assets/images/sleet.svg",
		"wind": "assets/images/wind-speed.svg",
		"fog": "assets/images/fog.svg",
		"cloudy": "assets/images/cloudy.svg",
		"partly-cloudy-day": "assets/images/partly-cloudy-day.svg",
		"partly-cloudy-night": "assets/images/partly-cloudy-night.svg",
		"hail": "assets/images/hail.svg",
		"thunderstorm": "assets/images/thunderstorm.svg",
		"tornado": "assets/images/tornado.svg"
	}
};

/* ----------------- FUNCTIONS ----------------*/
// adds the appropiate measurement symbol to the values (celsius fahrenheit, mph m/s)
unitsData.changeUnitsSign = function(){
	document.querySelector(".data-outside.temperature .sign").textContent = this[this.current].temperature;
	document.querySelector(".data-container .wind-speed .sign").textContent = this[this.current].speed;
	document.querySelector(".data-container .pressure .sign").textContent = this[this.current].pressure;
};

// converts between imperial and metrics by avoiding making another HTTP request to the weather API
unitsData.unitsConvertor = function(checked){
	if(checked){
		this.current = "us";
		this.measurements.temperature =  (this.measurements.temperature * 9/5) + 32;
		this.measurements.windSpeed =  this.measurements.windSpeed * 2.23694;
	}
	else {
		this.current = "si";
		this.measurements.temperature =  (this.measurements.temperature - 32) * 5/9;
		this.measurements.windSpeed =  this.measurements.windSpeed * 0.44704;
	}

	temp.textContent = Number(this.measurements.temperature).toFixed(1);
	wSpeed.textContent = Number(this.measurements.windSpeed).toFixed(2); 
};

// stores the weather data in the unitsData object
unitsData.measurements.updateWeatherData = function(weatherData){
	this.temperature = weatherData.currently.temperature;
	this.precipitation = (Number(weatherData.currently.precipProbability) * 100).toFixed(0);
	this.windSpeed = weatherData.currently.windSpeed;
	this.windDirection = weatherData.currently.windBearing;
	this.humidity = (Number(weatherData.currently.humidity) * 100).toFixed(0);
	this.atmPressure = weatherData.currently.pressure.toFixed(0);
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
	document.querySelector(".pointer-arrow").style.transform = "rotate(" + unitsData.measurements.windDirection + "deg)";
};


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

// Make AJAX request to weather API using latitude and longitude data
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
		jsonRes.results[0].address_components.forEach(function(current){
			if (current.types.includes("locality") && current.types.includes("political")){
				county = current.long_name + ", ";
			}
			if (current.types.includes("country")){
				country = current.long_name;
			}
		});
		cityName.textContent = county + country;
	});
}

// Changes the text contet of the status and makes it dissapear after the timeout ends
function changeStatus(text){
	statusMessage.classList.remove("hidden");
	statusMessage.textContent = text;
	setTimeout(function(){
		statusMessage.classList.add("hidden");
		setTimeout(function(){
			statusMessage.textContent = "";
		}, 1000);
	}, 10000);
}

// Gets the browser navigation.geolocation data and executes the callback function opon success
function geoLocation (success){
	navigator.geolocation.getCurrentPosition(function(data){
		var lat = data.coords.latitude;
		var long = data.coords.longitude;
		success(lat, long);
	}, 
	function(){
		changeStatus("You either denied access to your location or something went wrong. Please try to use the search feature instead.");
	});
}

/* ------------------ EVENT LISTENERS -----------------*/
/* Metric to Imperial switcher*/
document.querySelector(".units-changer").addEventListener("change", function(){
	unitsData.unitsConvertor(this.checked);
	unitsData.changeUnitsSign();
});

/* Mimics a form submit with a reset action and prevents the from from submitting on "Enter" */
searchForm.addEventListener("keypress", function(event){
	if (event.keyCode === 13){
		event.preventDefault();
		this.reset();
	}
});

/* Search bar, gets weather details by getting the geolocation data from google and then calling the weather API with that information */
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

/* Calls the weather API with the data from the navigator.geolocation (only requested on button click)*/
locationBtn.addEventListener("click", function(){
	geoLocation(function(lat, long){
		weatherReq(lat, long);
		locationNameReq(lat, long);
	});
});