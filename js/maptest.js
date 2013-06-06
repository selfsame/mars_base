// get the window object
var win = document.defaultView;

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 608;
canvas.height = 512;
document.body.appendChild(canvas);

// tile object
function tile(map, types, x, y) {
	this.map = map;
	this.types = type;
	this.posx = x;
	this.posy = y;
	this.draw = draw;
	this.getNeighbors = getNeighbors;
	
	
	
	for (var i = 0; i < types.length; i++) {
		var type = types[i];
		var img = new Image();
		if (type == "d") {
			img.src = "./textures/ground/dirt.png";
		} else if (type == "m") {
			img.src = "./textures/ground/room_medical.png";
		} else if (type == "c") {
			img.src = "./textures/ground/room_corridor.png";
		} else if (type == "r") {
			img.src = "./textures/objects/rock.png";
		} else if (type == "a") {
			img.src = "./textures/objects/alphasquare.png";
		}
		this.draw(img);
	}
	
	function draw(imgOb) {
		ctx.drawImage(imgOb, this.posx * 32, this.posy * 32);
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

// display it
var tileMap = new map("mars");
$(window).ready( function(){tileMap.draw();} );

