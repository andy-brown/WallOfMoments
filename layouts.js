/*
	define possible layouts to use for walls
	sizes are given as proportions of overall available space
	(so keep this sensible!)
*/

// layout definitions
var layouts = {
	1: // simple 2x2
	[
		{ left: 0, top: 0, width: 0.5, height: 0.5 },
		{ left: 0.5, top: 0, width: 0.5, height: 0.5 },
		{ left: 0, top: 0.5, width: 0.5, height: 0.5 },
		{ left: 0.5, top: 0.5, width: 0.5, height: 0.5 }
	],
	2: // simple 3x3
	[
		{ left: 0, top: 0, width: 0.33, height: 0.33 },
		{ left: 0.33, top: 0, width: 0.33, height: 0.33 },
		{ left: 0.66, top: 0, width: 0.34, height: 0.33 },
		{ left: 0, top: 0.33, width: 0.33, height: 0.33 },
		{ left: 0.33, top: 0.33, width: 0.33, height: 0.33 },
		{ left: 0.66, top: 0.33, width: 0.34, height: 0.33 },
		{ left: 0, top: 0.66, width: 0.33, height: 0.34 },
		{ left: 0.33, top: 0.66, width: 0.33, height: 0.34 },
		{ left: 0.66, top: 0.66, width: 0.34, height: 0.34 },
	],
	3: // 6 box with top left twice size
	[
		{ left: 0, top: 0, width: 0.6667, height: 0.6667 },
		{ left: 0.6667, top: 0, width: 0.3333, height: 0.3333 },
		{ left: 0.6667, top: 0.3333, width: 0.3333, height: 0.3333 },
		{ left: 0, top: 0.6667, width: 0.3333, height: 0.3333 },
		{ left: 0.3333, top: 0.6667, width: 0.3333, height: 0.3333 },
		{ left: 0.6667, top: 0.6667, width: 0.3333, height: 0.3333 }
	]
};
