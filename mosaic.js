// get size of montage area from css
var mon = document.getElementById("montage");
var width = mon.clientWidth, height = mon.clientHeight;

// a list of the video elements, for later manipulation
var vidStreams = [];
var playLists = [];

// need playlist of objects for each stream...

// get the configuration data for this wall
var xmlhttp = new XMLHttpRequest();

// optionally load config file from GET parameter
var configFile = "setup.json";
var cf = get('config');
if(cf != null){
	configFile = cf + ".json";
}

xmlhttp.onreadystatechange = function() {
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		var myArr = JSON.parse(xmlhttp.responseText);
		// runLayout(myArr);
		createPlaylists(myArr);
		start();
	}
};
xmlhttp.open("GET", configFile, true);
xmlhttp.send();


// take the config data and layout the streams
function createPlaylists(wall){
	var layoutId = parseInt(wall.layout);
	var layout = layouts[layoutId];

	for(var i = 0; i < layout.length; i++){
		playLists.push([]);
	}

	for(var i = 0; i < layout.length; i++){
		// get path to content
		var position = parseInt(wall.positions[i].position);
		var videos = wall.positions[i].videos;

		for (var j = 0; j < videos.length; j++){

			var path = videos[j].path;

			// encode start and end times in url
			path += encodeTimes(videos[j].start, videos[j].end);

			// get placement and crop information
			var placement = layout[position-1];
			var crop = videos[j].crop;

			var vidObj = new VideoSegment("vid" + i, path, placement, crop);
			playLists[i].push(vidObj);

		}
	}
}

// take the first item from each playlist and create
// the mosaic
function start(){
	for (var i =0; i < playLists.length; i++){
		// remove first item
		var vidObj = playLists[i].shift();
		var t = addVideoStream(vidObj);
		vidStreams.push(t);
		addNextVideoListener(t);
	}
}

// add listener to do next
function addNextVideoListener(stream){
	// add pause listener, to load next obj for stream
	// (end doesn't fire when video reaches end of url encoded slice)
	stream.addEventListener("pause", function(ev){
		var started = nextVid(ev.target.id);
	});
}

// play the next video in the stream
function nextVid(streamId){
	for(var i = 0; i < playLists.length; i++){
		var list = playLists[i];
		if(list.length > 0){
			if(streamId === list[0].vid){
				var nextV = list.shift();
				console.log("moving to next video in stream " + streamId);
				replaceVideoStream(streamId, nextV);
				// add listener for next
				var stream = document.getElementById(streamId);
				return true;
			}
		}
	}
	// nothing to replace - so one stream has stopped
	console.log("stream " + streamId + " finished");
	return false; // no stream found
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
function addVideoStream(vidObj){
	var pos = vidObj.placement;
	var crop = vidObj.crop;

	var vidEl = document.createElement('video');
	vidEl.width = pos.width * width;
	vidEl.height = pos.height * height;
	vidEl.id = vidObj.vid;
	// vidEl.controls = true;
	vidEl.src = vidObj.url;
	vidEl.autoplay = true;

	// create container that can do cropping
	var cropEl = document.createElement('div');
	cropEl.className = 'crop';
	cropEl.style.top = (pos.top * height) + "px";
	cropEl.style.left = (pos.left * width) + "px";
	cropEl.style.width = (pos.width * width) + "px";
	cropEl.style.height = (pos.height * height) + "px";

	cropVideoContainer(vidEl, pos, crop);

	var container = document.getElementById('montage');
	container.appendChild(cropEl);
	cropEl.appendChild(vidEl);

	return vidEl;
}

// style the stream container to crop video
function cropVideoContainer(vidEl, pos, crop){
	if(crop == null){
		crop = {left:0, top:0, width: 1, height: 1 };
	}
	// scale to zoom in (and thus crop)
	var scaledWidth = (pos.width * width)/crop.width;
	var scaledHeight = (pos.height * height)/crop.height;
	vidEl.width = scaledWidth;
	vidEl.height = scaledHeight;
	// shift so correct area is visible
	vidEl.style.marginLeft = -(crop.left * scaledWidth) + "px";
	vidEl.style.marginTop = -(crop.top * scaledHeight) + "px";
}


// replace a stream
function replaceVideoStream(streamId, vidObj){
	for(var i = 0; i < vidStreams.length; i++){
		var vidEl = vidStreams[i];
		if(vidEl.id === streamId){
			// change src
			vidEl.src = vidObj.url;
			// change crop
			cropVideoContainer(vidEl, vidObj.placement, vidObj.crop)
			// play
			vidEl.play();
		}
	}
}


/****
play, pause, skip, replace individual streams
****/
function play(streamNo){
	var videl = vidStreams[streamNo];
	videl.play();
}

function pause(streamNo){
	var videl = vidStreams[streamNo];
	videl.pause();
}

function skipTo(streamNo, time){
	var videl = vidStreams[streamNo];
	videl.currentTime = time;
}

function replace(streamNo, path){
	var videl = vidStreams[streamNo];
	videl.src = path;
}

// an object representing a segment of the montage for
// a single video
var VideoSegment = function(vid, url, placement, crop){
	this.vid = vid;
	this.url = url;
	this.placement = placement;
	this.crop = crop;
};

// retrieve a GET parameter
function get(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}
