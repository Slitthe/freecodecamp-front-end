// ----------------------- Variables
var famousCheck = document.getElementById("famous"),
	moviesCheck = document.getElementById("movies"),
	fbShareUrl = "https://www.facebook.com/sharer/sharer.php?u=" + window.location.href;
fbShareUrl = fbShareUrl.replace("index.html", "/");



//-------------------Dependency functions
// rgb color generator based on the input interval
function colorGenerator(minVal, maxVal) {
	var rgb = "rgb(";
	function rangeRandomGen(min, max) {
		var difference = max - min;
		return Math.floor(Math.random() * difference + min);
	}
	rgb += rangeRandomGen(minVal, maxVal);
	rgb += ", ";
	rgb += rangeRandomGen(minVal, maxVal);
	rgb += ", ";
	rgb += rangeRandomGen(minVal, maxVal) + ")";
	return rgb;
}

function checkCheckbox() { //negated XOR checker (!XOR) for the two checkboxes
	if ((famousCheck.checked && moviesCheck.checked) || (!famousCheck.checked && !moviesCheck.checked)) {
		return "";
	} else if (famousCheck.checked) {
		return "famous";
	} else {
		return "movies";
	}
}

// Generates twitter share URL to match the Twitter's limit by potentially remove some elements (hastag, author and finally cut the quote text)
function twitterShareURL(text, hashtag, author) {
	var url = "https://twitter.com/intent/tweet?";
	var textLength = function() {
		return text.length + (hashtag.length + 1);
	};

	// whitespace to %20 for URLs
	function whitespaceConvertor(str) {
		return str.replace(/ +/g, "%20");
	}


	if (textLength() > 140) {
		text = text.replace(author, "");
	}
	if (textLength() > 140) {
		hashtag = "";
	}
	if (textLength() > 140) {
		text = text.substr(0, 140);
	}
	url += "text=" + whitespaceConvertor(text) + "&";
	url += "hashtags=" + hashtag;
	return url;
}

// API requester 
function quoteRequest() {
	var category = checkCheckbox();
	var url = "https://andruxnet-random-famous-quotes.p.mashape.com/?cat=" + category + "&count=1";
	$.ajax(url, {
		method: "POST",
		headers: {
			"X-Mashape-Key": "AeTtWN86UbmshvCKMj5JYnNfghVzp1pm3SvjsnY7ewH1kf1SsL"
		},
		dataType: "json",
		success: function(data) {
         data = data[0];
			var twitterText = data.quote + " - " + data.author;
			document.querySelector(".quote-container .quote-text").innerText = data.quote;
			document.querySelector(".quote-container .quote-author").innerText = data.author;
			document.querySelector(".twitter-share-button").setAttribute("href", twitterShareURL(twitterText, "quote-generator", data.author));
		}
	});
}



// -------------------------Page Load stuff
// Make a API request on page load
quoteRequest();

// Generates FB share link based on domain name
document.getElementsByClassName("fb-share-button")[0].setAttribute("href", fbShareUrl);

$("meta[property=\"og:url\"]").attr("content", window.location.href);


// -------------------------Event listeners
// API request and styling on button click
document.getElementsByClassName("new-quote-button")[0].addEventListener("click", function(){
	quoteRequest();
	// Below code deals with fade and color changes
	var rgbColor = colorGenerator(50, 120);
	$(".quote-text").fadeOut(300, function(){
		$(this).fadeIn(300);
		$(this).css("color", rgbColor);
	});
	$("body").css("background", rgbColor);
	$(".quote-author").css("color", rgbColor);
});

// Category checkboxes toggler
$("div[data-for=\"movies\"").on('click', function(){
	// toggles the checked boolean
	$(this).children("input").prop("checked", !($(this).children("input").prop("checked")));
	$(this).toggleClass("active");
	console.log($(this).children("input").prop("checked"));
});

$("div[data-for=\"famous\"").on('click', function(){
	$(this).children("input").prop("checked", !($(this).children("input").prop("checked")));
	$(this).toggleClass("active");
	console.log($(this).children("input").prop("checked"));
});
