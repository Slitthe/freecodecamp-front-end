/* ------------ START of VARIABLES & OBJECTS  ------------ */
/*Constructs the API*/
var urls  = {
	apiEndpoint: "https://api.twitch.tv/",
	// Returns the specific URL concatenated in this order: 1.apiEndpoint + 2.subEndpoint argument + 
	// 3. joined array argument with the separator between items
	returnURL: function(subEndpoint, list, separator){
		var base = this.apiEndpoint + subEndpoint;
		list = list.join(separator);
		return base + list;
	},
	popularStreams: function(n){ // get data about the first "n" currently streaming users
		return this.apiEndpoint + "helix/streams?first=" + n;
	},
	byUsername: function(usernames){ // get data using a list of usernames
		return this.returnURL("kraken/users?login=", usernames, ",");
	},
	byId: function(ids){ // get data using a list of user ids
		return this.returnURL("helix/users/?id=", ids, "&id=");
	},
	streamingStatus: function(ids){ // get stremaing info using a list of user ids
		return this.returnURL("helix/streams?user_id=", ids, "&user_id=");
	},
	getProfile: function(user){ // constructs the profile url using a given username
		return  "https://www.twitch.tv/" + user.toLowerCase();
	}
};

// predefined users data stored here
var preDefUsrs = {
	// The default users to get data on, can be modified
	usersList: ["esl_sc2", "ogamingsc2", "cretetion", "freecodecamp", "storbeck", "habathcx", "robotcaleb", "noobs2ninjas", "imaqtpie", "moonmoon_ow"]
	// Adding an incorrect username will simply not display it
};

// top streamer's data stored here
var topStreamers = {};

// Stores the piece neeeded to construct the skeleton result HTML. (and returns it on request)
var resultHTML ={
	mainContainer: "<div class='result clearfix'></div>",
	logoNameContainer: "<div class='logo-name-container clearfix'></div>",
	streamInfoContainer: "<div class='stream-info-container clearfix'></div>",
	status: "<div class='stream-status'></div>",
	displayName: "<a target='_blank' class='display-name'><h3 class='display-name-text'></h3></a>",
	imgLogo: "<img class='img-logo'>",
	optionalBio: "<div class='optional-bio'></div>",
	streamTitle: "<div class='stream-title'></div>",
	liveThumbnail: "<img class='live-thumbnail'>",
	returnHTMLString: function(){
		var mainContainer = $(this.mainContainer);
		// order in which the first-children elements will be constructed
		var orderedElements = ["status", "logoNameContainer", "optionalBio", "streamInfoContainer"];
		for(var i = 0 ; i < orderedElements.length ; i++){
			$(this[orderedElements[i]]).appendTo(mainContainer);
		}
		// Adds various element to their corresponding containers (for positioning purposes)
		$(this.imgLogo).appendTo(mainContainer.find(".logo-name-container"));
		$(this.displayName).appendTo(mainContainer.find(".logo-name-container"));

		$(this.streamTitle).appendTo(mainContainer.find(".stream-info-container"));
		$(this.liveThumbnail).appendTo(mainContainer.find(".stream-info-container"));

		return mainContainer;
	}
};
// Stores the CSS-like selectors of the buttons (to be used for active class toggling)
var filterButtons = [".show-online-btn", ".show-offline-btn", ".show-all-btn"];
var showResBtns = [".show-users-btn", ".popular-streamers-btn"];
/*----------END of VARIABLES & OBJECTS-------------*/



/*-------------START of FUNCTIONS---------------*/
/* Template AJAX Request for this API */
function ajaxRequest(url, fun){
	// $(".loading-bar").css("display", "block");
	$.ajax(url, {
		method: "GET",
		accepts: "json",
		crossDomain: true,
		headers: {
			"Accept": "application/vnd.twitchtv.v5+json",
			"Client-ID": "rcibzr46518k0s9yev4a053xae0qpu"
		},
		success: function(data){
			fun(data);
			$(".error-message").html("");
		},
		error: function(){
			$(".error-message").html("⁃ Failure to fetch data. Please try again. ⁃");
		}
	});
}

// sorts the returned API data by the user's streaming status
function sortByStreaming(which, id){ // which is the obj where the data is stored
	var list = [];
	// (Stream data only stores the streaming users)
	for(var i = 0; i < which.streamData.length ; i++){
		// .userData stores all the users data
		for(var j = 0 ; j < which.usersData.length; j++){
			if(which.streamData[i].user_id === which.usersData[j][id]) {
				// separates the list by pushing the sliced element from the usersData in case a match is found
				list.push(which.usersData.splice(j, 1)[0]);
				// adds the stream data to the last element of the list array (because of .push)
				list[list.length - 1].stream = which.streamData[i];
			}
		}
	}
	// joins the separated lists (streaming users and non-streaming users)
	which.sortedByStreaming = list.concat(which.usersData);
}

// loops through the sortedStreaming data and constructs the HTML results
function htmlConstructor(data){
	$(".results-container").html("");

	for(var i = 0 ; i < data.length ; i++){
		var stream = data[i].stream;
		var htmlStr = resultHTML.returnHTMLString(); // gets the skeleton HTML
		if(stream){ // add additional info for live streamers
			htmlStr.addClass("online");
			$(htmlStr).find(".stream-title").text(stream.title);
			// 2nd arg of .replace is img resolution (lower it if performance is impacted)
			var streamThumbUrl = stream.thumbnail_url.replace("{width}x{height}", "160x90");
			$(htmlStr).find(".live-thumbnail").attr("src", streamThumbUrl);
		}
		else {
			htmlStr.addClass("offline");
		}

		$(htmlStr).find(".display-name .display-name-text").text(data[i].display_name);
		$(htmlStr).find(".display-name").attr("href", urls.getProfile(data[i].name));
		$(htmlStr).find(".img-logo").attr("src", data[i].logo);
		// .bio value of null doesn't affect the .text() method
		$(htmlStr).find(".optional-bio").text(data[i].bio);
		
		htmlStr.appendTo(".results-container");
	}
}

// hide/shows elements
function hideShow (hideSelector, showSelector){
	$(hideSelector).fadeOut();
	$(showSelector).fadeIn();
}

// accepts an array of classes ("."included), a single class (".") and a className (no ".")
// removes the className from all the removeList elements & adds that class to the "keep" only
function toggleClass(removeList, keep, className){
	for(var  i = 0 ; i < removeList.length ; i++){
		$(removeList[i]).removeClass(className);
	}
	$(keep).addClass(className);
}

// sorts the data by streaming status & constructs the HTML for that
function streamStoreSortConstruct(res, obj, idPropName){
	obj.streamData = res.data;
	sortByStreaming(obj, "_id");
	htmlConstructor(obj.sortedByStreaming);
}

// all the steps required to request and show the data from the popular streamers list
function popularStreamersReq(){
	ajaxRequest(urls.popularStreams(10), function(popStreamRes){ // 1st get popular streamers data
		// store the ids
		topStreamers.ids = [];
		for(var i = 0 ; i < popStreamRes.data.length ; i++){
			topStreamers.ids.push(popStreamRes.data[i].user_id);
		}

		ajaxRequest(urls.byId(topStreamers.ids), function(usrNameRes){ // 2nd get usernames
			topStreamers.usersData = usrNameRes.data;
			// store the usernames
			topStreamers.usersList = [];
			for(var j = 0 ; j < topStreamers.usersData.length ; j++){
				topStreamers.usersList.push(topStreamers.usersData[j].login);
			}

			ajaxRequest(urls.byUsername(topStreamers.usersList),function(resData){ // 3rd get data using usernames
				topStreamers.usersData = resData.users;
				var nextReqUrl = urls.streamingStatus(topStreamers.ids);

				ajaxRequest(nextReqUrl, function(res){ // 4th get streaming data
					streamStoreSortConstruct(res, topStreamers, "_id");
					// toggles the active buttons classes
					toggleClass(filterButtons, ".show-all-btn", "active");
					toggleClass(showResBtns, ".popular-streamers-btn", "active");
				}); // 4th req
			}); // 3rd req
		}); // 2nd  req
	}); // 1st req
}

// all the steps to request and show the data from the predefined users list
function predefinedUsersReq(){
	ajaxRequest(urls.byUsername(preDefUsrs.usersList),function(resData){ // 1st get data using usernames
		preDefUsrs.usersData = resData.users;
		// stores the ids
		preDefUsrs.ids = [];
		for(var i = 0 ; i < preDefUsrs.usersData.length ; i ++){
			preDefUsrs.ids.push(preDefUsrs.usersData[i]._id);
		}
		var nextReqUrl = urls.streamingStatus(preDefUsrs.ids);

		ajaxRequest(nextReqUrl, function(res){ // 2nd get streaming data
			streamStoreSortConstruct(res, preDefUsrs, "_id");
			// toggles the active buttons classes
			toggleClass(filterButtons, ".show-all-btn", "active");
			toggleClass(showResBtns, ".show-users-btn", "active");
		}); // 2st Req end
	}); // 1st Req end
}
/*------------------END OF FUNCTIONS------------------------*/






/* ----- START of EVENTS LISTENERS------*/
// The functionality and aspect of the filter buttons
$(".show-online-btn").on("click", function(){
	toggleClass(filterButtons, ".show-online-btn", "active");
	hideShow(".results-container .offline", ".results-container .online");
});
$(".show-offline-btn").on("click", function(){
	toggleClass(filterButtons, ".show-offline-btn", "active");
	hideShow(".results-container .online", ".results-container .offline");

});
$(".show-all-btn").on("click", function(){
	toggleClass(filterButtons, ".show-all-btn", "active");
	hideShow("",".results-container .result");
});




// Request different data (predefined list vs popular streamers)
$(".show-users-btn").on("click", function(){
	predefinedUsersReq();
});
$(".popular-streamers-btn").on("click", function(){
	popularStreamersReq();
});
/* ----- END of EVENTS LISTENERS------*/


/*------------------RUN ON PAGE LOAD------------------*/
// Runs the default users request on page load
predefinedUsersReq();