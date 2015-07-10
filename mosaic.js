// get size of montage area from css
var mon = document.getElementById("montage");
var width = mon.clientWidth, height = mon.clientHeight;

// a list of the video elements, for later manipulation
var vidElements = [];

// get the configuration data for this wall
var xmlhttp = new XMLHttpRequest();
var configFile = "setup.json";
xmlhttp.onreadystatechange = function() {
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		var myArr = JSON.parse(xmlhttp.responseText);
		runLayout(myArr);
	}
};
xmlhttp.open("GET", configFile, true);
xmlhttp.send();


// take the config data and layout the videos
function runLayout(wall){
	var layoutId = parseInt(wall.layout);
	var layout = layouts[layoutId];
	for(var i = 0; i < wall.videos.length; i++){

		// get path to content
		var path = wall.videos[i].path;

		// encode start and end times in url
		path += encodeTimes(wall.videos[i].start, wall.videos[i].end);

		// get placement and crop information
		var postion = parseInt(wall.videos[i].position);
		var placement = layout[postion-1];
		var crop = wall.videos[i].crop;

		// create and add to mosaic
		var t = addVideoStream("vid" + i, path, placement, crop);
		vidElements.push(t);
	}
}


// creates a snippet to add to url encoding start and end times
// for video
function encodeTimes(start, end){
	if(start == null){
		start = 0;
	}
	var snippet = "#t=" + start;
	if(end != null){
		snippet += "," + end;
	}
	return snippet;
}


// Add a video stream to the montage
// at specified postion with (optional) cropping
function addVideoStream(vidid, url, pos, crop){

	var vidEl = document.createElement('video');
	vidEl.width = pos.width * width;
	vidEl.height = pos.height * height;
	vidEl.id = vidid;

	var cropEl = document.createElement('div');
	cropEl.className = 'crop';
	cropEl.style.top = (pos.top * height) + "px";
	cropEl.style.left = (pos.left * width) + "px";

	cropEl.appendChild(vidEl);
	if (crop != null){
		cropEl.style.width = (pos.width * width);
		cropEl.style.height = (pos.height * height);
		vidEl.style.marginLeft = -(crop.left * width) + "px";
		vidEl.style.marginTop = -(crop.top * height) + "px";
		vidEl.width = ((pos.width/crop.width)) * width;
		vidEl.height = ((pos.height/crop.height)) * height;
	}

	// vidEl.controls = true;
	vidEl.src = url;
	vidEl.autoplay = true;

	var container = document.getElementById('montage');
	container.appendChild(cropEl);
	return vidEl;
}


/****
play, pause, skip, replace individual streams
****/
function play(streamNo){
	var videl = vidElements[streamNo];
	videl.play();
}

function pause(streamNo){
	var videl = vidElements[streamNo];
	videl.pause();
}

function skipTo(streamNo, time){
	var videl = vidElements[streamNo];
	videl.currentTime = time;
}

function replace(streamNo, path){
	var videl = vidElements[streamNo];
	videl.src = path;
}
