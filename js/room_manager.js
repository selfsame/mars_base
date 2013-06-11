function blueprint_tile(x, y, type, state) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.state = state;
	//this.tile = window.rooms.get_tile(x, y);
	this.draw = draw;
	this.toggle = toggle;
	this.check_neighbors = check_neighbors;
	this.set_state = set_state;
	this.check_state = check_state;
	this.check_obstacles = check_obstacles;
	this.build = build;
	this.promote = promote;
	
	function toggle() { // The player has clicked this tile while in edit mode
		
		// change the state based on what it is currently;
		if (this.state == 0) {
			this.type = window.Rooms.editType;
			s = 1;
		} else if (this.state == 1) {
			if (this.type != window.Rooms.editType) {
				this.type = window.Rooms.editType;
				this.check_neighbors();
				s = 2;
			} else {
				s = 0;
			}
		} else if (this.state == 2) {
			if (this.type != window.Rooms.editType) {
				this.type = window.Rooms.editType;
				s = 2;
				this.check_neighbors();
			} else {
				s = 0;
			}
		} else if (this.state == 3) {
			s = 4;
		} else if (this.state == 4) {
			s = 3;
		}
		
		//alert(s);
		
		// check to make sure the state is ok
		this.check_state(s);
		
	}
	
	function check_neighbors() { // Check all the neighboring states
		n = window.Map.get_neighbors("blueprints", this.x, this.y);
		for (i = 0; i < n.length; i++) {
			if (n[i].state != 5) {
				old_state = n[i].state;
				n[i].check_state(old_state);
				//if (old_state != neighbors[i].state) {
				//	neighbors[i].check_neighbors();
				//}
			}
		}
		
	}
	
	function set_state(new_state) { // change the tiles state and redraw
		old_state = this.state;
		this.state = new_state;
		this.draw();
	}
	
	function build() {
		if (this.state == 1) {
			room_tile = window.Map.get("rooms", this.x, this.y);
			room_tile.change_type(this.type);
			this.set_state(4);
			return true;
		} else if (this.state == 3) {
			room_tile = window.Map.get("rooms", this.x, this.y);
			room_tile.change_type("outside");
			this.set_state(0);
			return true;
		} else {
			return false;
		}
	}
	
	function promote() {
		if (this.state == 2) {
			this.state = 1;
		}
	}
	
	function check_state(new_state) { // This function looks at neighboring tiles and it's current state, to figure out if it should change
		
		neighbors = window.Map.get_neighbors("blueprints", this.x, this.y);
		
		main = this;
		function check(tile) {
			return((tile.state == 1 || tile.state == 2 || tile.state == 4) && tile.type == main.type);
		}
		
		//console.log(neighbors[0].type + " " + neighbors[0].state + " " + check(neighbors[0]) + " " + this.type + " " + ((neighbors[0].state == 1 || neighbors[0].state == 2 || neighbors[0].state == 4) && neighbors[0].type == this.type));
		if (this.state == 0 && new_state == 0) {
			return;
		}
		// if the state is "EMPTY" we need to make sure it doesn't affect neighbors
		if (new_state == 0) {
			this.set_state(0);
			this.check_neighbors();
			return;
		}
		//if the state is "BUILD" or "INVALID" you need to check for a square around it
		if(new_state == 1 || new_state == 2) {
		
			found_square = false;
			
			// check top left
			if (check(neighbors[0]) && check(neighbors[1]) && check(neighbors[7])) {
				neighbors[0].set_state(1);
				neighbors[1].set_state(1);
				neighbors[7].set_state(1);
				this.set_state(1);
				found_square = true;
			}
			
			// check top right
			if (check(neighbors[1]) && check(neighbors[2]) && check(neighbors[3])) {
				neighbors[1].set_state(1);
				neighbors[2].set_state(1);
				neighbors[3].set_state(1);
				this.set_state(1);
				found_square = true;
			}
			
			// check bottom right
			if (check(neighbors[3]) && check(neighbors[4]) && check(neighbors[5])) {
				neighbors[3].set_state(1);
				neighbors[4].set_state(1);
				neighbors[5].set_state(1);
				this.set_state(1);
				found_square = true;
			}
			
			// check bottom left
			if (check(neighbors[7]) && check(neighbors[6]) && check(neighbors[5])) {
				neighbors[7].set_state(1);
				neighbors[6].set_state(1);
				neighbors[5].set_state(1);
				this.set_state(1);
				found_square = true;
			}
			
			// no square found, return invalid
			//alert("no square found.");
			if (!found_square) {
				this.set_state(2);
			}
			return;
			
		} else if (new_state == 3) {
			this.set_state(3);
		} else if (new_state == 4) {
			this.set_state(4);
		} else {
			this.set_state(2);
		}
		this.draw();
		return;
	}
	
	function check_obstacles() {
		// THIS IS WHERE IT CHECKS FOR OBSTACLES
		return false;
	}
	
	function draw() {
		tilesize = window.Map.tilesize;
		
		if (this.state == 0) { // "EMPTY"
			window.Draw.use_layer("blueprints");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
		} else if (this.state == 1) { // "BUILD"
			window.Draw.use_layer("blueprints");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.type, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint1", this.x * tilesize, this.y * tilesize);
		} else if (this.state == 2) { // "INVALID"
			window.Draw.use_layer("blueprints");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.type, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint2", this.x * tilesize, this.y * tilesize);
		} else if (this.state == 3) { // "REMOVE"
			window.Draw.use_layer("blueprints");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.type, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint3", this.x * tilesize, this.y * tilesize);
		} else if (this.state == 4) { // "BUILT"
			window.Draw.use_layer("blueprints");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.type, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint4", this.x * tilesize, this.y * tilesize);
		}
	}	
}
function room_tile(x, y, type) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.draw = draw;
	this.change_type = change_type;
	
	function change_type(new_type) {
		old_type = this.type;
		if (old_type != new_type) {
			this.type = new_type;
			this.draw();
		}
	}
	
	// display the tile
	function draw() {
		tilesize = window.Map.tilesize;
		if(this.type == "outside") {
			window.Draw.use_layer("rooms");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
		} else {
			window.Draw.use_layer("rooms");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.type, this.x * tilesize, this.y * tilesize);
		}
	}
}

/*
function Room(type) {
	this.type = type;
	
	this.tiles = {
		build: [],
		built: []
	};
	
	this.add_tile = add_tile;
	this.merge = merge;
	this.contains = contains;
	this.update_tile = update_tile;
	
	function update_tile(tile) {
		if(tile.state == 4) {
			if(this.tiles.built.indexOf(tile) == -1) {
				this.tiles.built.push(tile);
				this.tiles.build.remove(tile);
			}
		} else {
			this.tiles.built.remove(tile);
			this.tiles.build.push(tile);
		}
	}
	
	function add_tile(tile) { // add the given tile to this room
		other = tile.room;
		tile.room = this;
		if(tile.state == 4) {
			this.tiles.built.push(tile);
			other.tiles.built.remove(tile);
		} else {
			this.tiles.build.push(tile);
			other.tiles.build.remove(tile);
		}
	}
	
	function merge(other) { // merge given room with this one
		if(this.type == other.type) {
			this.tiles.built.concat(other.tiles.built);
			other.tiles.built = [];
			this.tiles.build.concat(other.tiles.build);
			other.tiles.build = [];
			window.Rooms.delete_room(other);
		}
	}
	
	function contains(tile) { // check if this room contains the given tile
		return (this.tiles.build.indexOf(tile) > -1 && this.tiles.built.indexOf(tile) > -1);
	} 
}
*/

window.Rooms = {
	init: function() {
		
		this.mode = "edit";
		this.editType = "corridor";
		
		// ask for events
		window.Events.add_listener(this);
	
		// load room images
		window.Draw.add_image('medical', "./textures/ground/room_medical.png");
		window.Draw.add_image('corridor', "./textures/ground/room_corridor.png");
		window.Draw.add_image('laboratory', "./textures/ground/room_laboratory.png");
		window.Draw.add_image('commons', "./textures/ground/room_commons.png");
		window.Draw.add_image('greenhouse', "./textures/ground/room_greenhouse.png");
		window.Draw.add_image('power', "./textures/ground/room_power.png");
		window.Draw.add_image('supply', "./textures/ground/room_supply.png");
		
		// load blueprint images
		window.Draw.add_image('blueprint1', "./textures/ground/blueprint_build.png");
		window.Draw.add_image('blueprint2', "./textures/ground/blueprint_invalid.png");
		window.Draw.add_image('blueprint3', "./textures/ground/blueprint_remove.png");
		window.Draw.add_image('blueprint4', "./textures/ground/blueprint_built.png");
		
		// create draw layers for rooms and blueprints
		window.Draw.create_layer("rooms", true);
		window.Draw.create_layer("blueprints", true);
		
		// create map layers for blueprint and room tiles
		room_tiles = [];
		blueprint_tiles = [];
		for (i = 0; i <= window.Map.height-1; i++) {
			room_tiles.push([]);
			blueprint_tiles.push([]);
			for (j = 0; j <= window.Map.width-1; j++) {
				rt = new room_tile(j, i, "outside", 5);
				bt = new blueprint_tile(j, i, "empty", 0);
				room_tiles[i].push(rt);
				blueprint_tiles[i].push(bt);
			}
		}
		window.Map.arrays["rooms"] = room_tiles;
		window.Map.arrays["blueprints"] = blueprint_tiles;
	},
	construct_all: function() {
		for(i = 0; i < window.Map.arrays["blueprints"].length; i++) {
			for(j = 0; j < window.Map.arrays["blueprints"][i].length; j++) {
				window.Map.arrays["blueprints"][i][j].build();
			}
		}
	},
	
	mousedown: function(e){
		if (this.mode == "edit") {
			// get the tile the user clicked
			tile_coords = window.Events.tile_under_mouse;
			tile = window.Map.get("blueprints", tile_coords[0], tile_coords[1]);
			tile.toggle();
			
		}
	},
	keydown: function(e){
		if (e.keyCode == 49) { // 1
			this.editType = "corridor";
		} else if (e.keyCode == 50) { // 2
			this.editType = "supply";
		} else if (e.keyCode == 51) { // 3
			this.editType = "greenhouse";
		} else if (e.keyCode == 52) { // 4
			this.editType = "commons";
		} else if (e.keyCode == 53) { // 5
			this.editType = "laboratory";
		} else if (e.keyCode == 54) { // 6
			this.editType = "medical";bv
		} else if (e.keyCode == 55) { // 7
			this.editType = "power";
		} else if (e.keyCode == 66) { // b
			console.log("constructing tiles from blueprints");
			this.construct_all();
		} else if (e.keyCode == 86) { // v
			if (this.mode == "edit") {
				this.mode = "view";
				window.Draw.hide_layer("blueprints");
			} else {
				this.mode = "edit";
				window.Draw.show_layer("blueprints");
			}
			console.log("switching view mode to " + this.mode);
		}
	}
	
}

window.Blueprint = {
	init: function() {
		// ask for events
		window.Events.add_listener(this);
	
		// load blueprint images
		window.Draw.add_image('blueprint1', "./textures/ground/blueprint_build.png");
		window.Draw.add_image('blueprint2', "./textures/ground/blueprint_invalid.png");
		window.Draw.add_image('blueprint3', "./textures/ground/blueprint_remove.png");
		window.Draw.add_image('blueprint3', "./textures/ground/blueprint_built.png");
		
		// create a layer for tiles
		tiles = [];
		for (i = 0; i <= window.Map.height-1; i++) {
			tiles.push([]);
			for (j = 0; j <= window.Map.width-1; j++) {
				tiles[i].push(new tile(j, i, "outside", 5));
			}
		}
		window.Map.arrays["tiles"] = tiles;
		window.Draw.create_layer("tiles", true);
		
		window.Map.create_layer("blueprints", 0);
		window.Draw.create_layer("blueprints", true);
	},
	draw_tile: function(x, y, value) {
		// check if the images for drawing blueprints are loaded
		if (window.Draw.images.blueprint1 && window.Draw.images.blueprint2) {
			tilesize = window.Map.tilesize;
			window.Draw.use_layer("blueprints");
			window.Draw.clear_box(x * tilesize, y * tilesize, tilesize, tilesize);
			if (value == 1) {
				window.Draw.image("blueprint1", x*tilesize, y*tilesize);
			} else if (value == 2) {
				window.Draw.image("blueprint2", x*tilesize, y*tilesize);
			}
		}
	},
	toggle: function(x, y) {
		tile = window.Map.get("blueprints", x, y);
		if (tile == 0) {
			neighbors = window.Map.get_immediate_neighbors("blueprints", x, y);
			value = this.check_clear(neighbors);
			this.set_value(x, y, value);
			
			if(value == 1 || value == 2) {
				this.check_square(x, y);
			}
		} else if (tile == 1) {
			this.set_value(x, y, 0);
			this.check_neighbors(x, y);
		} else {
			this.set_value(x, y, 0);
		}
	},
	set_value: function(x, y, value) {
		current = window.Map.get("blueprints", x, y);
		if (current != value) {
			window.Map.set("blueprints", x, y, value);
			this.draw_tile(x, y, value);
		}
	},
	check_clear: function(neighbors) {
	
		// THIS IS WHERE IT CHECKS FOR OBSTACLES
		
		// check if it's on the map edge, or over an obstacle
		if(neighbors.indexOf(undefined) != -1) {
			return 3;
		} else {
			return 2;
		}
	},
	demote_square: function(x, y) {
		value = window.Map.get("blueprints", x, y);
		if (value == 1) {
			this.set_value(x, y, 2);
		}
	},
	check_neighbors: function(x, y) {
		if(!this.check_square(x-1, y-1)) {
			this.demote_square(x-1, y-1);
		}
		if(!this.check_square(x, y-1)) {
			this.demote_square(x, y-1);
		}
		if(!this.check_square(x+1, y-1)) {
			this.demote_square(x+1, y-1);
		}
		if(!this.check_square(x+1, y)) {
			this.demote_square(x+1, y);
		}
		if(!this.check_square(x+1, y+1)) {
			this.demote_square(x+1, y+1);
		}
		if(!this.check_square(x, y+1)) {
			this.demote_square(x, y+1);
		}
		if(!this.check_square(x-1, y+1)) {
			this.demote_square(x-1, y+1);
		}
		if(!this.check_square(x-1, y)) {
			this.demote_square(x-1, y);
		}
	},
	check_square: function(x, y) {
		neighbors = window.Map.get_neighbors("blueprints", x, y);
		found_square = false;
		val = window.Map.get("blueprints", x, y);
		//check middle
		if(val == 1 || val == 2) {
		
			// check top left
			if ((neighbors[0] == 1 || neighbors[0] == 2) && (neighbors[1] == 1 || neighbors[1] == 2) && (neighbors[7] == 1 || neighbors[7] == 2)) {
				this.set_value(x-1, y, 1);
				this.set_value(x-1, y-1, 1);
				this.set_value(x, y-1, 1);
				this.set_value(x, y, 1);
				found_square = true;
			}
			
			// check top right
			if ((neighbors[1] == 1 || neighbors[1] == 2) && (neighbors[2] == 1 || neighbors[2] == 2) && (neighbors[3] == 1 || neighbors[3] == 2)) {
				this.set_value(x, y-1, 1);
				this.set_value(x+1, y-1, 1);
				this.set_value(x+1, y, 1);
				this.set_value(x, y, 1);
				found_square = true;
			}
			
			// check bottom right
			if ((neighbors[3] == 1 || neighbors[3] == 2) && (neighbors[4] == 1 || neighbors[4] == 2) && (neighbors[5] == 1 || neighbors[5] == 2)) {
				this.set_value(x+1, y, 1);
				this.set_value(x+1, y+1, 1);
				this.set_value(x, y+1, 1);
				this.set_value(x, y, 1);
				found_square = true;
			}
			
			// check bottom left
			if ((neighbors[5] == 1 || neighbors[5] == 2) && (neighbors[6] == 1 || neighbors[6] == 2) && (neighbors[7] == 1 || neighbors[7] == 2)) {
				this.set_value(x-1, y, 1);
				this.set_value(x-1, y+1, 1);
				this.set_value(x, y+1, 1);
				this.set_value(x, y, 1);
				found_square = true;
			}
		}
		
		return found_square;
	},
	compare_neighbors: function(neighbors, compare) {
		for (i = 0; i <= neighbors.length; i++) {
			val = 0;
			if (neighbors[i] == 1 || neighbors[i] == 2) {
				val = 1;
			} else {
				val = 0;
			}
			if(compare[i] != val) {
				return false;
			}
		}
		return true;
	}
};

window.Rooms2 = {
	init: function() {
		this.rooms = [];
		
		this.mode = "edit";
		this.currentType = "supply";
		
		// ask for events
		window.Events.add_listener(this);
	
		// load room images
		window.Draw.add_image('medical', "./textures/ground/room_medical.png");
		window.Draw.add_image('corridor', "./textures/ground/room_corridor.png");
		window.Draw.add_image('laboratory', "./textures/ground/room_laboratory.png");
		window.Draw.add_image('commons', "./textures/ground/room_commons.png");
		window.Draw.add_image('greenhouse', "./textures/ground/room_greenhouse.png");
		window.Draw.add_image('power', "./textures/ground/room_power.png");
		window.Draw.add_image('supply', "./textures/ground/room_supply.png");
		
		// load blueprint images
		window.Draw.add_image('blueprint1', "./textures/ground/blueprint_build.png");
		window.Draw.add_image('blueprint2', "./textures/ground/blueprint_invalid.png");
		window.Draw.add_image('blueprint3', "./textures/ground/blueprint_remove.png");
		window.Draw.add_image('blueprint4', "./textures/ground/blueprint_built.png");
		
		
		// create draw layers for rooms and blueprints
		window.Draw.create_layer("rooms", true);
		window.Draw.create_layer("blueprints", true);
		
		// create a map layer for tiles
		outside = new Room("outside");
		this.rooms.push(outside);
		tiles = [];
		for (i = 0; i <= window.Map.height-1; i++) {
			tiles.push([]);
			for (j = 0; j <= window.Map.width-1; j++) {
				t = new Tile(j, i, outside, 5);
				tiles[i].push(t);
			}
		}
		window.Map.arrays["rooms"] = tiles;
		
	},
	
	mousedown: function(e){
		if (this.mode == "edit") {
			// get the tile the user clicked
			tile_coords = window.Events.tile_under_mouse;
			tile = window.Map.get("rooms", tile_coords[0], tile_coords[1]);
			// check if the tile isn't already part of a room
			if (tile.room.type == "outside") {
				// check if the tile is next to an existing room(s)
				connections = this.isConnected(tile);
				if (connections.length == 0) { // this tile is on it's own
					room = this.add_room(this.currentType);
					tile.update_state();
					room.add_tile(tile);
				} else if (connections.length == 1) { // this tile is connected to one other
					tile.update_state();
					connections[0].add_tile(tile);
				} else { // this tile is next to multiple rooms
					room = connections[0];
					tile.update_state();
					room.add_tile(tile);
					for(k = 1; k < connections.length; k++) {
						room.merge(connections[k]);
					}
				}
			}
		}
		console.log("num rooms: " + (this.rooms.length-1));
		
	},
	isConnected: function(tile) { // used when constructing rooms
		neighbors = window.Map.get_immediate_neighbors("rooms", tile.x, tile.y);
		rooms = [];
		for (i = 0; i < neighbors.length; i++) {
			if (neighbors[i].room.type == this.currentType) {
				if(rooms.indexOf(neighbors[i].room) == -1) { // we don't want to count duplicate rooms
					rooms.push(neighbors[i].room); // add it to the list of connected rooms
				}
			}
		}
		
		return rooms;
		
	},
	delete_room: function(room) { // remove a room object
		// check if it's empty
		if (room.tiles.built.length == 0 && room.tiles.build.length == 0) {
			this.rooms.remove(room);
			return true;
		}
		return false;
	},
	add_room: function(type) { // create a new room object
		room = new Room(type);
		this.rooms.push(room);
		return room;
	}
};

$(window).ready( function() {
	//window.Blueprint.init();
	window.Rooms.init();
	
});