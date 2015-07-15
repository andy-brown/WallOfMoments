var newConfig = {};

function addLayoutSelector(lId){
	document.getElementById('after').style.marginTop = (height + 50) + 'px';
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
	newClip.appendChild(start);

	var end = document.createElement('input');
	end.type = "number";
	end.id = 'end' + layoutPosition;
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
	if(newConfig.positions[locationId] == null){
		newConfig.positions[locationId] = [];
	}
	newConfig.positions[locationId].push(c);

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
		console.log(ev.target.id);
		var re = /remove-([0-9]*)-([0-9]*)/;
		var matches = re.exec(ev.target.id);
		var loc = matches[1];
		var pos = matches[2];
		newConfig.positions[loc].splice(pos-1, 1);
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

	var conf = copyConfig(newConfig, layoutId);
	conf.layout = layoutId;
	playLists = {};
	emptyElement('montage');
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

}

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
function apply(){
	building = true;
	emptyElement('montage');
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
