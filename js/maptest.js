$(window).ready( function(){
	alert("window is ready");
	
	// get the window object
	var win = document.defaultView;

	// Create the canvas
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	canvas.width = 608;
	canvas.height = 512;
	document.body.appendChild(canvas);
	
	// collect the images
	// eventually this somewhere else
	win.images = {};
	images.dirt = new Image();
	images.dirt.src = "./textures/ground/dirt.png";
	images.medical = new Image();
	images.medical.src = "./textures/ground/room_medical.png";
	images.corridor = new Image();
	images.corridor.src = "./textures/ground/room_corridor.png";
	images.rock = new Image();
	images.rock.src = "./textures/objects/rock.png";
	images.alpha = new Image();
	images.alpha.src = "./textures/objects/alphasquare.png";
	images.crateOpen = new Image();
	images.crateOpen.src = "./textures/objects/crate_open.png";
	images.crateClosed = new Image();
	images.crateClosed.src = "./textures/objects/crate_closed.png";
	images.airTanks = new Image();
	images.airTanks.src = "./textures/objects/airtanks.png";
	
	
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
			if (type == "d") {
				this.draw(images.dirt);
			} else if (type == "m") {
				this.draw(images.medical);
			} else if (type == "c") {
				this.draw(images.corridor);
			} else if (type == "r") {
				this.draw(images.rock);
			} else if (type == "a") {
				this.draw(images.alpha);
			} else if (type == "cc") {
				this.draw(images.crateClosed);
			} else if (type == "co") {
				this.draw(images.crateOpen);
			} else if (type == "at") {
				this.draw(images.airTanks);
			}
			 
		}
		
		function draw(imgOb) {
			ctx.drawImage(imgOb, this.posx * 32, this.posy * 32);
		}
		
		function getNeighbors() {
			return "derp";
		}
	}

	// map object
	function map() {
		this.tiles = [];
		this.draw = draw;
		this.load = load;
		
		this.width = 0;
		this.height = 0;
		
		function load(mapName) {
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
	
	// now make the map
	// eventually get rid of load and draw functions
	var tileMap = new map();
	tileMap.load("mars");
	tileMap.draw();
} );

