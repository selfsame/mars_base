// get the window object
var win = document.defaultView;

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1148/2;
canvas.height = 1024/2;
document.body.appendChild(canvas);

// tile object
function tile(map, type, x, y) {
	this.map = map;
	this.type = type;
	this.posx = x;
	this.posy = y;
	this.draw = draw;
	//this.getNeighbors = getNeighbors;
	this.img = new Image();
	
	if (type == "d") {
		this.img.src = "./textures/ground/dirt.png";
	} else if (type == "m") {
		this.img.src = "./textures/ground/room_medical.png";
	}
	
	function draw() {
		ctx.drawImage(this.img, this.posx * 16, this.posy * 16);
	}
	
	function getNeighbors() {
		return "derp";
	}
}

// map object
function map(mapName) {
	this.tiles = [];
	this.draw = draw;
	this.mapName = mapName;
	this.m = win.maps[mapName];
	
	this.width = this.m[0].length;
	this.height = this.m.length;
	
	
	for (var i = 0; i < this.width; i++) {
		var column = [];
		for(var j = 0; j < this.height; j++) {
			column[j] = new tile(this, this.m[j][i], i, j); 
		}
		this.tiles[i] = column;
	}
	

	
	
	function draw() {
		for (var i = 0; i < this.width; i++) {
			for (var j = 0; j < this.height; j++) {
				this.tiles[i][j].draw();
			}
		}
	}
	
	function getTile(x, y) {
		return this.tiles[x][y]
	}
}

// create a map
var tileMap = new map("mars");
// display it
tileMap.draw();
