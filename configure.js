/******************************************************************************/
//   Code for the user interface, to build a mosaic
/******************************************************************************/

// nodejs initiation
var urlarr = window.location.href.split("/");
var server = urlarr[0] + "//" + urlarr[2];
var vidDir = "videos/";


// put nodejs stuff in try/catch, so we can still run without
try{
	var socket = io.connect(server);

	socket.on('connect', function(client){
		console.log('connected ');
		getVideoList();
	});
}
catch(e){
	// no nodejs, try xmlhttprequest to php
	console.log('not running on nodejs');
	var xhr = new XMLHttpRequest();

	// get filelist
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var myArr = JSON.parse(xhr.responseText);
			console.log(xhr.responseText);
			setVideoList(myArr);
		}
	};
	xhr.open("GET", "vidLister.php", true);
	xhr.send();

}

// request list of videos
var videoList = [];
function getVideoList(){
	socket.emit('videoList', {});
	socket.on('vidList', function(data){
		setVideoList(data.list);
	});
}


// display the available videos
function setVideoList(videoList){
	var selectors = document.getElementsByClassName('clipselector');
	for(var i = 0; i < selectors.length; i++){
		for (var j=0; j<videoList.length; j++){
			var opt = document.createElement('option');
			opt.value = vidDir + videoList[j];
			opt.innerHTML = videoList[j];
			selectors[i].appendChild(opt);
		}
		selectors[i].appendChild(opt);
		selectors[i].hidden = false;
	}
	var manualInputs = document.getElementsByClassName('clipNameInput');
	for(var i = 0; i < manualInputs.length; i++){
		manualInputs[i].hidden = true;
	}
}

/******************************************************************************/

var newConfig = {};


// a selector to specify which layout we want to use
function addLayoutSelector(lId){
	document.getElementById('after').style.marginTop = (height + 50) + 'px';
	var options = document.createElement('select');
	options.id = 'layoutSelect';
	for (k in layouts){  // layouts defined in mosaic.js... I know...
		var opt = document.createElement('option');
		opt.value = k;
		opt.appendChild(document.createTextNode("layout " + k));
		options.appendChild(opt);
		if(parseInt(k) === lId){
			opt.selected = true;
		}
	}

	options.addEventListener("change", function(){
		var chosen = document.getElementById('layoutSelect');
		// console.log("Select layout " + chosen.value);
		updateLayout(chosen.value);

	});

	var aft = document.getElementById('layoutSelector');
	aft.appendChild(options);
}


// build and return a widget containing fields to specify a clip for a stream
function addClipAdder(layoutPosition){
	// choose a video

	var newClip = document.createElement("div");
	newClip.className = 'selectClip';
	newClip.name = layoutPosition;

	var listTitle = document.createElement('h3');
	listTitle.appendChild(document.createTextNode("Position " + layoutPosition));
	newClip.appendChild(listTitle);

	var listContainer = document.createElement('ol');
	listContainer.id = 'vidList' + layoutPosition;
	newClip.appendChild(listContainer);

	var clipName = document.createElement('input');
	clipName.type = 'text';
	clipName.className = 'clipNameInput'
	clipName.id = 'clip' + layoutPosition;
	clipName.name = layoutPosition;
    clipName.placeholder = 'Clip file';

	var select = document.createElement('select');
	select.id = 'select' + layoutPosition;
	select.className = 'clipselector';
	select.hidden = true;
	newClip.appendChild(select);

	newClip.addEventListener("mouseenter", function(ev){
		// console.log(ev.target.name);
		var vId = parseInt(ev.target.name)-1;
		var vidEl = document.getElementById('crop' + vId);
		if(vidEl){
			vidEl.className += " highlight"
		}
	}, true);
	newClip.addEventListener("mouseleave", function(ev){
		// console.log(ev.target.name);
		var vId = parseInt(ev.target.name)-1;
		var vidEl = document.getElementById('crop' + vId);
		if(vidEl){
			vidEl.className = "crop"
		}
	});
	newClip.appendChild(clipName);

	var start = document.createElement('input');
	start.type = "number";
	start.id = 'start' + layoutPosition;
    start.placeholder = 'Start';
	newClip.appendChild(start);

	var end = document.createElement('input');
	end.type = "number";
	end.id = 'end' + layoutPosition;
    end.placeholder = 'End';
	newClip.appendChild(end);

	var add = document.createElement('button');
	add.value = 'Add';
	add.className = "remove";
	add.innerHTML = "&oplus;";
	// add.appendChild(document.createTextNode("Add"));
	add.onclick = function(){
		selectClip(layoutPosition);
	};
	newClip.appendChild(add);
	// set start and finish time
	// (later) specify crop

	return newClip;
}


// a new clip has been specified for the given location - get the data
// from the widget fields and call funtion to add to stream
function selectClip(locationId){
	console.log(locationId);
	var clipEl = document.getElementById('clip' + locationId);
	var clip = clipEl.value;
	var clipSel = document.getElementById('select' + locationId);
	var clipSel = clipSel.value;
	// if we have a selection and no text, use selection
	console.log(clipSel + " " + clip);
	if(clipSel != null && clip === ''){
		clip = clipSel;
	}
	var startEl = document.getElementById('start' + locationId);
	var start = startEl.value;
	var stopEl = document.getElementById('end' + locationId);
	var stop = stopEl.value;

	addClip(locationId, clip, start, stop);

	clipEl.value = '';
	startEl.value = '';
	stopEl.value = '';

}


// add a specified clip to a stream
function addClip(locationId, url, start, stop){
	// console.log(url + " " + start + "-" + stop);
	var c = { "path": url,
				"start": start,
				"end": stop };
	if(newConfig.positions[locationId] == null){
		newConfig.positions[locationId] = [];
	}
	newConfig.positions[locationId].push(c);
	console.log(newConfig);

	var listEl = document.getElementById('vidList' + locationId);
	var listItem = document.createElement('li');
	listItem.id = locationId + "-" + newConfig.positions[locationId].length;
	var timeSnippet = encodeTimes(start, stop);

	// remove button...
	var remBut = document.createElement('button');
	remBut.innerHTML = '&otimes;';
	remBut.id = 'remove-' + listItem.id;
	remBut.className = 'remove';
	remBut.addEventListener('click', function(ev){
		// id's are no guide to actual position in the config list
		// for this, use position in <ol> of the element
		// <ol> should always reflect current config
		var listItemEl = document.getElementById(ev.target.id).parentElement;
		var listEl = listItemEl.parentElement;
		console.log(listEl);
		var index = 0;
		for(var i = 0; i < listEl.childNodes.length; i++){
			if(listEl.childNodes[i] == listItemEl){
				index = i;
			}
		}
		console.log(pos);
		console.log(ev.target.id);
		var re = /remove-([0-9]*)-([0-9]*)/;
		var matches = re.exec(ev.target.id);
		var loc = matches[1];
		var pos = matches[2];
		// get position in list
		newConfig.positions[loc].splice(index, 1);
		var listEl = document.getElementById('vidList' + loc);
		listEl.removeChild(document.getElementById(loc + "-" + pos));
		console.log(newConfig);
		// emptyElement('clipSelector');
		// populateConfig(newConfig);
	});
	listItem.appendChild(remBut);
	var sp = document.createElement('span');
	sp.appendChild(document.createTextNode(url + " " + timeSnippet));
	listItem.appendChild(sp);

	listEl.appendChild(listItem);

}


// add a widget for each stream in the layout, so we can choose what
// goes in that stream
function addTrackSpecifiers(layoutId){
	var cont = document.getElementById('clipSelector');
	var layout = layouts[layoutId];
	for(var i = 0; i<layout.length; i++){
		var clipSelector = addClipAdder(i+1);
		cont.appendChild(clipSelector);
	}
}


// add section for selecting which video's audio is played
function addAudioSelector(layoutId){
	var audioList = document.getElementById('audioSelector');
	var layout = layouts[layoutId];
	var currentAudio = config.sound;
	for(var i = 0; i<layout.length; i++){
		var radio = document.createElement('input');
		radio.type = 'radio';
		radio.name = 'audio';
		radio.value = i;
		if((i+1) == currentAudio){
			radio.checked = 'true';
		}
		radio.addEventListener('click', function(){
			newConfig.sound = (parseInt(this.value)+1);
		});
		audioList.appendChild(radio);
		audioList.appendChild(document.createTextNode(i+1 + " "));
	}
	console.log("Audio: " + config.sound);

}


// change the layout for the one specified
function updateLayout(layoutId){

	var conf = copyConfig(newConfig, layoutId);
	conf.layout = layoutId;
	playLists = {};
	emptyElement('montage');
	emptyElement('audioSelector');
	var montage = document.getElementById('montage');
	montage.style.backgroundColor = "white";
	emptyElement('clipSelector');
	var streams = createLayout(layoutId);
	newConfig.layout = layoutId;
	newConfig.positions = {};
	for(var i = 0; i < streams.length; i++){
		newConfig.positions[i+1] = [];
	}
	addTrackSpecifiers(layoutId);
	if(conf.positions != null && conf.positions.length > 0){
		populateConfig(conf);
	}
	addAudioSelector(layoutId);
}


// copy a configuration
function copyConfig(old, newId){
	var newStreamCount = layouts[newId].length;
	var copy = {};
	copy.layout = old.layout;
	copy.positions = [];
	var i = 0;
	for(var k in old.positions){
		if(i < newStreamCount){
			copy.positions[k] = old.positions[k];
		}
		i++;
	}
	return copy;
}

// empty the mosaic
function emptyElement(elId){
	var container = document.getElementById(elId);
	while(container.firstChild){
		container.removeChild(container.firstChild);
	}
}


// add current config details to form
function populateConfig(conf){
	for (k in conf.positions){
		for(var i=0; i< conf.positions[k].length; i++){
			var vid = conf.positions[k][i];
			console.log('adding ' + vid.path + ' to ' + vid);
			addClip(k, vid.path, vid.start, vid.end);
		}
	}
	newConfig = conf;

}


// apply the config and run it
function apply(fullScreen){
	building = true;
	emptyElement('montage');
	config = newConfig;
	start(false);
	if(fullScreen){
		goFullScreen();
	}
}


// keyboard interaction
document.addEventListener('keydown', function(ev){
	// console.log(ev);
	if(ev.keyCode == 70){ // F
		if(fullScreen){
			exitFullScreen();
		}
		else{
			goFullScreen();
		}
	}
	else if(ev.keyCode == 80){ // P
		// if not built, then run apply(false)
		var pl = Object.keys(playLists);
		if(pl.length == 0){
			apply(false);
		}
		// play/pause
		playPause();
	}
	else if(ev.keyCode == 69){ // E
		// empty mosaic
		updateLayout(newConfig.layout);
	}

});

// save the config
function save(){
	// save newConfig as json
	var url = "saveConf.php";
	var filename = prompt("Please enter a name for this wall");
	if(filename === null){
		return;
	}
	filename = filename + ".json";
	var params = "fname=" + filename + "&conf=" + JSON.stringify(newConfig);
	var http = new XMLHttpRequest();
	http.open("POST", url, true);

	//Send the proper header information along with the request
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function() {//Call a function when the state changes.
		if(http.readyState == 4 && http.status == 200) {
			alert(http.responseText);
		}
	}
	http.send(params);
	console.log(JSON.stringify(newConfig));
}

// load another config
function load(){
}
