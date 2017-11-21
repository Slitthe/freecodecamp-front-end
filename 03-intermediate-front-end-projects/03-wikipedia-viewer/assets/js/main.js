// VARIABLES
var data = {
	idsList: [],
	indices: [0, 10],
	currentList: [],
	resultsLimit: 200,
	indicesPer: 10,
	nextRequest: false,
	updateIndicies: function(){
			this.indices[0] += this.indicesPer;
			this.indices[1] += this.indicesPer;
	},
	storeUpdateList: function(){
		var optionalArg = arguments[0];
		if (optionalArg){
			if (optionalArg.query.search){
				optionalArg.query.search.forEach(function(current){
						data.idsList.push(current.pageid);
				});
			}
			else if (optionalArg.query.random){
				optionalArg.query.random.forEach(function(current){
					data.idsList.push(current.id);
				});
				
			}
		}
		this.currentList = this.idsList.slice(this.indices[0], this.indices[1]);
	}
};


// HELPER FUNCTIONS
// Template for making the AJAX request to this API, runs a function if the return is succesful
function AJAXRequest(url, fun){
	checkStatus();
	$(".status-info").text("");	
	$(".loading").css("display", "block");

	$.ajax(url, {
		method: "GET",
		success: function(res){
			fun(res);
			checkStatus();
		},
		error: function(){
			$(".status-info").text("Communication with the server failed, could't get the required data.");
			checkStatus();
			$(".loading").css("display", "none");
			$(".show-more").css("display", "block");
		},
		dataType: "json",
		crossDomain: true
	});
}

// Constructs the API URL for the 3 different scenarios:
// search query, random articles and getting articles based on the ids returned from the search query or the random articles
function getURL(query, random){
	var baseURL = "https://en.wikipedia.org";
	var ids = arguments[2];
	var url = baseURL + "/w/api.php?action=query&format=json&origin=*&list=search&indexpageids=1&srsearch=" + query + "&srnamespace=0&srlimit=" + data.resultsLimit + "&srinfo=&srprop=";
	if (random){
		url = baseURL + "/w/api.php?action=query&format=json&origin=*&prop=info&list=random&indexpageids=1&inprop=url&rnnamespace=0&rnlimit=" + data.resultsLimit;
	}
	if(ids){
		var list = ids.join("%7C");
		url = baseURL + "/w/api.php?action=query&format=json&origin=*&prop=extracts%7Cinfo&pageids=" + list + "&exchars=300&exintro=1&explaintext=1&exsectionformat=plain&inprop=url";
	}
	return url;
}

// Handles the scrolling when user reaches the bottom of the page or when the "Show more button"; the bool parameter is used for the show more button trigger
function infiniteScrolling(bool){
	var condition = (Math.ceil($(window).scrollTop() + $(window).height()) >= $(document).height()) && data.nextRequest;
	if(condition || bool){
		data.nextRequest = false;
		data.updateIndicies(data.indicesPer);
		data.storeUpdateList();
		var url = getURL("", false, data.currentList); 
		AJAXRequest(url, function(res){
			if(res.query){
				displayElements(res);
				data.nextRequest = true;
			}
			setStatusMessage(res);
		});
	}
}
// Resets the relevant properties and HTML display content
function resetValEls(){
	data.nextRequest = false;
	data.indices = [0, 0 + data.indicesPer];
	data.currentList = [];
	data.idsList = [];
	$(".status-info").text("");
	$(".results").html("");
	checkStatus();
}

// Loops through the inputData and constructs the HTML results
function displayElements(inputData){
	// uses the current id list to select the object's properties
	data.currentList.forEach(function(currentId, index){
		// creates a jQuery object and then giving it some properties and/or appending it
		var result = $("<a class=\"panel panel-default\"><div></div></a>").attr({
			href: inputData.query.pages[currentId].fullurl,
			target: "_blank"
		});
		$("<h3 class=\"panel-heading\"></h3>").text(inputData.query.pages[currentId].title).appendTo(result);
		$("<div class=\"panel-body\"></div>").text(inputData.query.pages[currentId].extract).appendTo(result);
		result.appendTo(".results");
	});
}

function setStatusMessage(inputData){
	// When there are no more results to show because the set limit has been reached
	if(!data.currentList.length && data.idsList.length === data.resultsLimit){
		$(".status-info").text("Due to performance reasons, the results limit is set to: " + data.resultsLimit + ".");
	}
	// run this if the length of the current list is 0 (= no more results to show)
	else if (!data.currentList.length) {
		$(".status-info").text("No more results.");	
	}
}
function checkStatus(){
	if(!data.nextRequest){
		$(".show-more").css("display", "none");	
		$(".loading").css("display", "none");
	}
	else {
		$(".show-more").css("display", "block");
		$(".loading").css("display", "none");
	}
}

// EVENT LISTENERS
$(".remove-button").click(function(){
	document.querySelector("#search").reset();
	resetValEls();
});

document.body.onscroll = function(event){
		infiniteScrolling(false);
};
document.body.onwheel = function(event){
		infiniteScrolling(false);
};

$(".show-more").on("click", function(){
	infiniteScrolling(true);
});

$(".search-btn").on("click", function(){
	$("#search").submit();
});

$("#search").on("submit", function(event){
	resetValEls();
	event.preventDefault();
	var value = $(this).find("input[type=\"search\"]").val();
	if (value.length >= 1){
		var url = getURL(value, false);
		this.reset();
		AJAXRequest(url, function(res){
			if(res.query.search.length || res.hasOwnProperty("error")){
				data.storeUpdateList(res);
				url = getURL("", false, data.currentList);
				AJAXRequest(url, function(res){
					displayElements(res);
					setStatusMessage(res);
					data.nextRequest = true;
				});
			}
			else {
				$(".status-info").text("No results for the given search query.");
			}
		});
	}
});

$(".random-articles").on("click", function(event){
	resetValEls();
	var url = getURL("", true);
	AJAXRequest(url, function(res){
		data.storeUpdateList(res);
		url = getURL("", false, data.currentList);
		AJAXRequest(url, function(res){
			displayElements(res);
			setStatusMessage(res);
			data.nextRequest = true;
		});
	});
});