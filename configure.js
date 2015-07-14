var newConfig = {};

function addLayoutSelector(lId){
	var options = document.createElement('select');
	options.id = 'layoutSelect';
	for (k in layouts){
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
	clipName.id = 'clip' + layoutPosition;
	clipName.name = layoutPosition;
	newClip.addEventListener("mouseover", function(ev){
		console.log(ev.target.name);
		var vId = parseInt(ev.target.name)-1;
		var vidEl = document.getElementById('crop' + vId);
		if(vidEl){
			vidEl.className += " highlight"
		}
	});
	clipName.onmouseout = function(ev){
		console.log(ev.target.name);
		var vId = parseInt(ev.target.name)-1;
		var vidEl = document.getElementById('crop' + vId);
		if(vidEl){
			vidEl.className = "crop"
		}
	};
	newClip.appendChild(clipName);

	var start = document.createElement('input');
	start.type = "number";
	start.id = 'start' + layoutPosition;
	newClip.appendChild(start);

	var end = document.createElement('input');
	end.type = "number";
	end.id = 'end' + layoutPosition;
	newClip.appendChild(end);

	var add = document.createElement('button');
	add.value = 'Add';
	add.appendChild(document.createTextNode("Add"));
	add.onclick = function(){
		selectClip(layoutPosition);
	};
	newClip.appendChild(add);
	// set start and finish time
	// (later) specify crop

	return newClip;
}


// a new clip has been specified for the given location
function selectClip(locationId){
	console.log(locationId);
	var clipEl = document.getElementById('clip' + locationId);
	var clip = clipEl.value;
	var startEl = document.getElementById('start' + locationId);
	var start = startEl.value;
	var stopEl = document.getElementById('end' + locationId);
	var stop = stopEl.value;

	addClip(locationId, clip, start, stop);

	clipEl.value = '';
	startEl.value = '';
	stopEl.value = '';


}


// show a specified clip
function addClip(locationId, url, start, stop){
	console.log(url + " " + start + "-" + stop);
	var c = { "path": url,
				"start": start,
				"end": stop };
	newConfig.positions[locationId].push(c);
	var listEl = document.getElementById('vidList' + locationId);
	var listItem = document.createElement('li');
	var timeSnippet = encodeTimes(start, stop);
	listItem.appendChild(document.createTextNode(url + " " + timeSnippet));
	// remove button...
	listEl.appendChild(listItem);

}

function addTrackSpecifiers(layoutId){
	var cont = document.getElementById('clipSelector');
	var layout = layouts[layoutId];
	for(var i = 0; i<layout.length; i++){
		var clipSelector = addClipAdder(i+1);
		cont.appendChild(clipSelector);
	}


}

// change the layout for the one specified
function updateLayout(layoutId){
	playLists = {};//  = null;
	emptyElement('montage');
	emptyElement('clipSelector');
	var streams = createLayout(layoutId);
	newConfig.layout = layoutId;
	newConfig.positions = {};
	for(var i = 0; i < streams.length; i++){
		newConfig.positions[i+1] = [];
	}
	addTrackSpecifiers(layoutId);
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
			addClip(k, vid.path, vid.start, vid.end);
		}
	}
	newConfig = conf;

}


// apply the config and run it
function apply(){
	emptyElement('montage');
	console.log(newConfig);
	config = newConfig;
	start(false);
}


// save the config
function save(){
	// save newConfig as json
	console.log(JSON.stringify(newConfig));
}

// load another config
function load(){
}