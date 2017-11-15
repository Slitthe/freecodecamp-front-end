# FreeCodeCamp's Weather Machine 

* Shows the current weather for a given location, by using the HTML5's geolocation coordinates or by using the search bar and entering an address.

* Data shown 
  -  temperature
  -  rain chance
  -  humidity
  -  air pressure
  -  wind direction
  -  wind speed
  -  weather summary


* Uses the <a href="https://darksky.net/">Dark Sky</a> API to get the actual weather data.
 
* <a href="https://developers.google.com/maps/documentation/geocoding/start">Google Geocoding</a> API is used to retrieve the location name if the user chooses to allow access to his/her location details. Alternatively, if the search bar is used, that same API is reponsibile for getting the latitude and longitude of the entered query search string (which will be passed on the weather API request). 

* There is a status message feature which is meant to clear out why something didn't work as expected. It will inform that:
  - The user has denied access to their location
  - The search query had no results
  - There was an error in the HTTP request/response.

* Able to switch between Metric and Imperial measuring systems. Temperature's and wind speed values will change, as well as the correct symbol. For the air pressure, the values remain the same, however there is a switch in the unit of measurement used (milibar and   hectopascal).
  - The measuring unit currently selected will be used to retrieve the correct data from any further weather API request (by passing the "unit" key with the "us" or "si" values in the URL query string; GET request)

 ---
---

## Objectives


1.  Objective: Build a CodePen.io app that is functionally similar to this: http://codepen.io/FreeCodeCamp/full/bELRjV.

2.  Rule #1: Don't look at the example project's code. Figure it out for yourself.

3.  Rule #2: Fulfill the below user stories. Use whichever libraries or APIs you need. Give it your own personal style.

4.  User Story: I can see the weather in my current location.

5.  User Story: I can see a different icon or background image (e.g. snowy mountain, hot desert) depending on the weather.

6.  User Story: I can push a button to toggle between Fahrenheit and Celsius.

7.  Note: Many internet browsers now require an HTTP Secure (https://) connection to obtain a user's locale via HTML5 Geolocation. For this reason, we recommend using HTML5 Geolocation to get user location and then use the freeCodeCamp Weather API https://fcc-weather-api.glitch.me which uses an HTTP Secure connection for the weather. Also, be sure to connect to CodePen.io via https://.

8.  Remember to use Read-Search-Ask if you get stuck.

9.  When you are finished, click the "I've completed this challenge" button and include a link to your CodePen.

10. You can get feedback on your project by sharing it with your friends on Facebook.







---

###  <a href="https://codepen.io/Slitthe/full/bYrXEm/">Codepen DEMO</a> <img src="https://cdn1.iconfinder.com/data/icons/simple-icons/256/codepen-256-black.png" height="30">
