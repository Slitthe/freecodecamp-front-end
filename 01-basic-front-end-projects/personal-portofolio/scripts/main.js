
// Creates a 2 dimensional array of elements and some specified attribute 
function elementsAttributePairs (cssStyleSelector, dataAttribute) {
	var headerElements = document.querySelectorAll(cssStyleSelector);
	var arrayedList = [];
	for (var i = 0 ; i < headerElements.length ; i++){
		arrayedList.push(new Array(headerElements[i]));
		arrayedList[i].push(headerElements[i].getAttribute(dataAttribute));
	}
	return arrayedList;
}
// Use the function to store it in a variable
var pairsList = elementsAttributePairs("header button", "data-target-id", true);


/* Returns a scrollSpy function based  on the inputs 
	execElements: the element and corresponding matching id 2 dimensional array pairs (in this case its the "pairsList" variable)
	dataAttribute: the attribute which contains the matching ids for the elements, in this format " data-*="#matching-id" "
	targetElements: the elements upon which "classToToggle" class is activated/deactivated
	halfHeight: a boolean value which specifies if the toggle should begin when the elements's top scroll offset exceeds the half of the window height
	classToToggle: a class that should be toggled on the element (and removed from the rest) whose related id element matches the current scroll position
*/

function scrollSpyGenerator (execElements, dataAttribute, targetElements, halfHeight, classToToggle) {
	if (halfHeight && typeof halfHeight === "boolean") {
		var height = window.innerHeight / 2;
	}
	else {
		var height = 0;
	}

	return function () {
		for (var i = 0 ; i < execElements.length ; i++) {
			if (i !== execElements.length - 1) {
				if (window.scrollY >= ($(execElements[i][1]).offset().top - height) && window.scrollY <= $(execElements[(i+1)][1]).offset().top - height) {
					$(targetElements).removeClass(classToToggle);
					$("[" + dataAttribute + "=\"" + execElements[i][1] +"\"] li").addClass(classToToggle);

					break;	
				}
			}
			else if (i === (execElements.length - 1)) {
				if (window.scrollY >= ($(execElements[i][1]).offset().top - height)) {
					$(targetElements).removeClass(classToToggle);
					$("[" + dataAttribute + "=\"" + execElements[i][1] +"\"] li").addClass(classToToggle);
					break;
				}
			}
		}
	}
}

document.body.onscroll = scrollSpyGenerator(pairsList,"data-target-id", "header button li", true, "active");



$(".demo-link").on("click", function(){ // what happens when you click the "demo" button / projects section
	$("header").css({
		position: "static",
		display: "none"
	});
	$("html").css("overflow", "hidden"); // makes the page unscrollable
	$(".screen-hide").css({
		display: "block",
		height: $("html").height() + "px"
	});
	$(".iframe-container").css("display", "block"); // show the iframe container
	$(".iframe-container iframe").prop("src", $(this).attr("data-target-href")); // change the source of the iframe for the current project
	
});

$(".iframe-container button").on("click", function(){ // iframe close button
	$("header").css({
		position: "fixed",
		display: "block"
	});
	$(".iframe-container iframe").prop("src", "");
	$(".iframe-container").hide();
	$(".screen-hide").hide();
	$("html").css("overflow", "visible");
});


$("header button").click(function(){ // scroll to their respective target ids when you click any of the header buttons
	var relatedId = $(this).attr("data-target-id");
	smoothScroll(window.scrollY, ($(relatedId).offset().top - $("header").height()), 100);
});



// smooth scrolling
function smoothScroll (current, target, duration) { 
	var tickDuration = Math.abs(current - target) / duration;
	var currentScroll = current;
	if (current >= target) {
		
		var interval = setInterval(function() {
			currentScroll -= tickDuration;
			scrollTo(0, currentScroll);
			if(currentScroll <= target) {
				clearInterval(interval);
			}
		} , 2);
	}
	else {

		var interval = setInterval(function() {
			currentScroll += tickDuration;
			scrollTo(0, currentScroll);
			if(currentScroll >= target) {
				clearInterval(interval);
			}
		} , 2);
	}
}

$(".screen-hide").on("touchmove", function(e){
	e.preventDefault();
});
