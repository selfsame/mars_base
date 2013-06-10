function tile (x, y, room, state) {
	this.x = x;
	this.y = y;
	this.room = room;
	this.state = state;
	this.draw = draw;
	
	
	function draw() {
		tilesize = window.Map.tilesize;
		if (this.room.type != "outside") {
			window.Draw.use_layer("rooms");
			window.window.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.room.type, this.x * tilesize, this.y * tilesize);
		}
		
		if (state == 1) { // "BUILD"
			window.Draw.use_layer("blueprints");
			window.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image("blueprints1", x*tilesize, y * tilesize);
		} else if (state == 2) { // "INVALID"
			window.Draw.use_layer("blueprints");
			window.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image("blueprints2", x*tilesize, y * tilesize);
		} else if (state == 3) { // "REMOVE"
			window.Draw.use_layer("blueprints");
			window.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image("blueprints3", x*tilesize, y * tilesize);
		} else if (state == 4) { // "BUILT"
			window.Draw.use_layer("blueprints");
			window.window.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
		}
	}
}

function room (type) {
	this.type = type;
	this.tiles = [];
	this.add_tile = add_tile;
	function add_tile(x, y) {
		// check if it is already part of a room
		value = window.Map.get("rooms", x, y);
		if (value == 0) {
		
		}
		
	}
	function remove_tile(x, y) { // remove the tile from this room
		if (this.tiles.indexOf(
		window.Map.set("rooms", x, y, 0);
	}
	
	function merge_room(other) { // merge "other" room with this one
		
	}
	
	function get_tile(x, y) {
		
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
		
		// create a layer for blueprints
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
	mousedown: function(e){
		tile_clicked = window.Events.tile_under_mouse;
		this.toggle(tile_clicked[0], tile_clicked[1]);
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

window.Rooms = {
	init: function() {
		this.rooms = [];
	
		// ask for events
		window.Events.add_listener(this);
	
		// load room images
		window.Draw.add_image('medical', "./textures/ground/room_medical.png");
		window.Draw.add_image('corridor', "./textures/ground/room_corridor.png");
		window.Draw.add_image('laboratory', "./textures/ground/laboratory.png");
		window.Draw.add_image('commons', "./textures/ground/room_commons.png");
		window.Draw.add_image('greenhouse', "./textures/ground/room_greenhouse.png");
		window.Draw.add_image('power', "./textures/ground/room_power.png");
		window.Draw.add_image('supply', "./textures/ground/room_supply.png");
		
		// create a layer for rooms
		window.Map.create_layer("rooms", 0);
		window.Draw.create_layer("rooms", true);
	
	
	},
	add_room: function(type, tile) {
		
	}
};

$(window).ready( function() {
	function room_tile(type) {
		this.type = type;
	}
	window.Blueprint.init();
	window.Rooms.init();
	
});