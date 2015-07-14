// get size of montage area from css
var mon = document.getElementById("montage");
var width = mon.clientWidth, height = mon.clientHeight;

// a list of the video elements, for later manipulation
var config;
var playLists = {};
var layout;

// need playlist of objects for each stream...

// get the configuration data for this wall
var xmlhttp = new XMLHttpRequest();

// optionally load config file from GET parameter
var configFile = "setup.json";
var cf = get('config');
if(cf != null){
	configFile = cf + ".json";
}

// get comfig file, then set up
xmlhttp.onreadystatechange = function() {
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		var myArr = JSON.parse(xmlhttp.responseText);
		config = myArr;
		start();
	}
};
xmlhttp.open("GET", configFile, true);
xmlhttp.send();


// set up layout, generate play lists, populate layout and play
function start(){
	var layoutId = parseInt(config.layout);
	var streams = createLayout(layoutId);
	createplayLists(streams);
	populateLayout();
}


// take the config data and layout the streams
// takes a list of ids for the elements in each location
function createplayLists(streams){

	// one playlist for each layout position
	// populate them from the config data
	for(var i = 0; i < streams.length; i++){
		var vId = streams[i];
		playLists[vId] = {list: [], location: i};

		if(config.positions[i+1]){
			var videos = config.positions[i+1];
			for(var j = 0; j < videos.length; j++){
				// encode start and end times in url
				var path = videos[j].path;
				path += encodeTimes(videos[j].start, videos[j].end);

				// get placement and crop information
				var crop = videos[j].crop;

				// create object and add to playlist
				var vidObj = new VideoSegment(path, crop);
				playLists[vId].list.push(vidObj);
			}
		}
	}
	console.log(playLists);
}


// create the mosaic:
// build containers for the videos
// but video elements are empty
function createLayout(layoutId){
	layout = layouts[layoutId];
	var streams = [];

	for (var i =0; i < layout.length; i++){
		var stream = addStreamToLayout(i);
		streams.push(stream.id);
	}

	// return a list of position ids
	return streams;
}


// add a stream to the layout
// creates an element to hold the video, and one to crop it
// and adds these to the mosaic
function addStreamToLayout(streamId){
	var vidEl = document.createElement('video');
	vidEl.id = "vid" + streamId;

	// get position of this stream
	var pos = layout[streamId];

	// create container that can do cropping
	var cropEl = document.createElement('div');
	cropEl.className = 'crop';
	cropEl.style.top = (pos.top * height) + "px";
	cropEl.style.left = (pos.left * width) + "px";
	cropEl.style.width = (pos.width * width) + "px";
	cropEl.style.height = (pos.height * height) + "px";

	// add container to montage
	var container = document.getElementById('montage');
	container.appendChild(cropEl);
	cropEl.appendChild(vidEl);

	return vidEl;
}


// populate the layout from the playLists
// and add listeners so streams can go through lists
function populateLayout(){
	for (var k in playLists){
		var list = playLists[k].list;
		var vidObj = list.shift();
		setVideoStream(k, vidObj);

		// add listener
		var vidEl = document.getElementById(k);
		addNextVideoListener(vidEl);

	}
	var montage = document.getElementById('montage');
	montage.style.backgroundColor = "black";
}


// add listener so that stream moves on to next in playList when current
// video ends
function addNextVideoListener(stream){
	// add pause listener, to load next obj for stream
	// (end doesn't fire when video reaches end of url encoded slice)
	stream.addEventListener("pause", function(ev){
		nextVid(ev.target.id);
	});
}


// play the next video in the playList for this stream
function nextVid(streamId){
	var list = playLists[streamId].list;
	if(list.length > 0){
		var nextV = list.shift();
		console.log("moving to next video in stream " + streamId);
		setVideoStream(streamId, nextV);
		return true;
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


// style the stream container to crop video
function cropVideoContainer(vidEl, streamId, crop){
	// get position of this stream
	var location = playLists[streamId].location;
	var pos = layout[location];

	if(crop == null){
		crop = {left:0, top:0, width: 1, height: 1 };
	}
	// scale to zoom in (and thus crop)
	var scaledWidth = (pos.width * width)/crop.width;
	var scaledHeight = (pos.height * height)/crop.height;
	vidEl.style.width = scaledWidth + "px";
	vidEl.style.height = scaledHeight + "px";
	// shift so correct area is visible
	vidEl.style.marginLeft = -(crop.left * scaledWidth) + "px";
	vidEl.style.marginTop = -(crop.top * scaledHeight) + "px";
}


// replace the video in a stream with the given VideoSegment object
function setVideoStream(streamId, vidObj){
	var vidEl = document.getElementById(streamId);
	if(vidObj){ // make sure we have an object
		// change src
		vidEl.src = vidObj.url;
		// change crop
		cropVideoContainer(vidEl, streamId, vidObj.crop)
		// play
		vidEl.play();
	}
}


// an object representing a segment of the montage for
// a single video
var VideoSegment = function(url, crop){
	this.url = url;
	this.crop = crop;
};


// retrieve a GET parameter
function get(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}
