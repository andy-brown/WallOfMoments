# WallOfMoments
Simple HTML to display a mosaic of videos.
Implemented using HTML5 JavaScript and CSS.
Can be served through a standard Web server (best), or using the Nodejs server included:
> node server.js

Nodejs server runs on port 3003: visit http://localhost:3003/

Note that the current file requires a videos/ folder which is populated with some content (not in repo).

layouts.js define the possible configurations of mosaic.

Configuration is done via a json config file - see setup.json as an example.  This is the default loaded.  It defines a layout (id from layouts.js) and a list of videos for each position in the layout.

Viewing index.html loads the example config setup.json, otherwise add the GET parameter config=XXX will load XXX.json.

Adding GET parameter edit=y will display the editor to change the videos shown in each location (although save and load buttons don't work yet).

Videos can be cropped - see setup.json for an example; cropping isn't an option in the editor at the moment.
