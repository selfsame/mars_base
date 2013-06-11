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

		// check to make sure the state is ok
		this.check_state(s);
		
	}
	
	function check_neighbors() { // Check all the neighboring states
		n = window.Map.get_neighbors("blueprints", this.x, this.y);
		for (i = 0; i < n.length; i++) {
			if (n[i].state != 5) {
				old_state = n[i].state;
				n[i].check_state(old_state);
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
			this.draw();
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
				neighbors[0].promote();
				neighbors[1].promote();
				neighbors[7].promote();
				this.set_state(1);
				found_square = true;
			}
			
			// check top right
			if (check(neighbors[1]) && check(neighbors[2]) && check(neighbors[3])) {
				neighbors[1].promote();
				neighbors[2].promote();
				neighbors[3].promote();
				this.set_state(1);
				found_square = true;
			}
			
			// check bottom right
			if (check(neighbors[3]) && check(neighbors[4]) && check(neighbors[5])) {
				neighbors[3].promote();
				neighbors[4].promote();
				neighbors[5].promote();
				this.set_state(1);
				found_square = true;
			}
			
			// check bottom left
			if (check(neighbors[7]) && check(neighbors[6]) && check(neighbors[5])) {
				neighbors[7].promote();
				neighbors[6].promote();
				neighbors[5].promote();
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
			this.editType = "medical";
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

$(window).ready( function() {
	//window.Blueprint.init();
	window.Rooms.init();
	
});