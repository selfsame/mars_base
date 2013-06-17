function floor_tile(x, y, state) {
	this.x = x;
	this.y = y;
	this.state = state;
	this.style = "corridor";
	this.draw = draw;
	this.check_clear = check_clear;
	this.check_neighbor_clear = check_neighbor_clear;
	this.confirm = confirm;
	this.set_state = set_state;
	this.toggle = toggle;
	this.build = build;
	this.get_wall_type = get_wall_type;
	this.get_wall_locations = get_wall_locations;
	this.connected = connected;
	this.is_wall = is_wall;
	this.set_style = set_style;
	this.timer = 0;
	this.change = false;
	this.change_style = "corridor";
	this.wall_type = "wall_0";
	this.prev_built = 0; // was the wall previously built, was it being built, or was it being removed
	this.change_to = 0;
	
	function toggle(style) { // called when the tile is clicked on
		if (this.state == 0) { // the tile is empty
			this.style = style;
			if (this.check_clear() && this.check_neighbor_clear()) {
				this.set_state(1);
				this.get_wall_locations();
			} else {
				this.set_state(2);
				this.get_wall_locations();
			}
		} else if (this.state == 1) { // the tile will be built
			this.set_state(0);
			this.get_wall_locations();
		} else if (this.state == 2) { // the tile is invalid
			this.set_state(0);
			this.get_wall_locations();
		} else if (this.state == 3) { // the tile will be removed
			this.set_state(4);
			this.get_wall_locations();
		} else if (this.state == 4) { // The tile was already built
			this.state = 3;
			if (this.connected()) {
				this.change = true;
			}
			this.draw();
			this.get_wall_locations();
		} else if (this.state == 5) { // the tile is being built
			this.set_state(6);
			this.get_wall_locations();
		} else if (this.state == 6) { // the tile is being removed
			this.set_state(5);
			this.get_wall_locations();
		} else if (this.state == 7) { // a wall will be built
			this.style = style;
			if (this.check_clear() && this.check_neighbor_clear()) {
				this.set_state(1);
				this.get_wall_locations();
			} else {
				this.set_state(2);
				this.get_wall_locations();
			}
		} else if (this.state == 8) { // a wall will be removed here
			if (this.change) { // wall is already being changed into somethign else, change it back to just a wall or a wall being built or a wall being removed
				this.change = false;
				if (this.connected()) {
					this.set_state(this.prev_built);
				}
				this.draw();
				this.get_wall_locations();
			} else { // wall is being removed because it isn't connected to any tiles
				this.change = true;
				this.style = style;
				this.draw();
				this.get_wall_locations();
			}
		} else if (this.state == 9) { // a wall is already built here
			this.change = true;
			this.prev_built = 9;
			this.style = style;
			this.change_style = style;
			this.set_state(8);
			this.get_wall_locations();
		} else if (this.state == 10) { // a wall is being built here
			this.change = true;
			this.prev_built = 10;
			this.style = style;
			this.change_style = style;
			this.set_state(8);
			this.get_wall_locations();
		} else if (this.state == 11) { // a wall is being removed here
			this.change = true;
			this.style = style;
			this.prev_built = 11;
			this.change_style = style;
			this.set_state(8);
			this.get_wall_locations();
		}
	}
	
	function build(delta) { // method called when being worked on.
		
		this.timer += delta;
		
		if (this.state == 5) {
			if (this.timer >= 500) {
				this.set_state(4);
				window.Map.set("pathfinding", this.x, this.y, 0);
				this.timer = 0;
				this.built = true;
				window.Floors.under_construction.remove(this);
			}
		} else if (this.state == 6) {
			if (this.timer >= 600) {
				if (this.change) {
					this.timer = 0;
					this.change = false;
					this.set_state(10);
				} else {
					window.Map.set("pathfinding", this.x, this.y, 0);
					this.set_state(0);
					this.timer = 0;
					this.built = true;
					window.Floors.under_construction.remove(this);
				}
			}
		} else if (this.state == 10) {
			if (this.timer >= 700) {
				window.Map.set("pathfinding", this.x, this.y, 1);
				this.set_state(9);
				this.timer = 0;
				this.built = true;
				window.Floors.under_construction.remove(this);	
			}
		} else if (this.state == 11) {
			if (this.timer >= 700) {
				if (this.change) {
					this.change = false;
					this.set_state(5);
					this.timer = 0;
				} else {
					this.set_state(0);
					window.Map.set("pathfinding", this.x, this.y, 0);
					this.timer = 0;
					this.built = true;
					window.Floors.under_construction.remove(this);
				}	
			}
		}
	}

	
	function set_state(new_state) { // change the tiles state and redraw
		old_state = this.state;
		if (old_state != new_state) {
			this.state = new_state;
			this.draw();
		}
	}
	
	function check_clear() { // check to make sure it is ok to build here		
		back = window.Map.get("background", this.x, this.y);
		return (back != 2);
	}
	
	function check_neighbor_clear() {
		back = window.Map.get_neighbors("background", this.x, this.y);
		for (n = 0; n < back.length; n++) {
			if (back[n] == 2) {
				return false;
			}
		}
		return true;
	}
	
	function is_wall() { // is this tile a wall?
		return (this.state == 7 || this.state == 8 || this.state == 9 || this.state == 10 || this.state == 11);
	}
	
	function confirm() { // confirm the build orders
		if (this.state == 1) { // "BUILD"
			window.Floors.under_construction.push(this);
			this.set_state(5);
			return true;
		} else if (this.state == 3) { // "REMOVE'
			window.Floors.under_construction.push(this);
			this.set_state(6);
			return true;
		} else if (this.state == 7) { // "BUILD WALL"
			window.Floors.under_construction.push(this);
			this.set_state(10);
			return true;
		} else if (this.state == 8) { // "REMOVE WALL"
			window.Floors.under_construction.push(this);
			this.set_state(11);
			return true;
		} else {
			return false;
		}
	}
	
	function get_wall_type() { // gets the type of wall tile to place
		return "wall_0"; // return a block type for now
	}
	
	function get_wall_locations() { // determines what neighbors should be walls
		neighbors = window.Map.get_neighbors("floor", this.x, this.y);

		if (this.state == 0) { // There is nothing here
			// check to see if each neighbor is connected
			for (i = 0; i < neighbors.length; i++) {
				if(!neighbors[i].connected()) { // the neighbor is a wall tile, that isn't connected
					if (neighbors[i].state == 7) {
						neighbors[i].set_state(0);
					} else if (neighbors[i].state == 10) {
						neighbors[i].change = false;
						neighbors[i].prev_built = 10;
						neighbors[i].set_state(8);
					} else if (neighbors[i].state == 9) {
						neighbors[i].change = false;
						neighbors[i].prev_built = 9;
						neighbors[i].set_state(8);
					}
				} else {
					neighbors[i].wall_type = get_wall_type();
					// POSSIBLE CALL TO DRAW IF WALL TYPE IS DIFFERENT?
				}
			}
			// check to see if this place needs a wall
			if(this.connected()) {
				//this.prev_built = 7;
				this.set_state(7);
			}
		} else if (this.state == 1) { //
			for (i = 0; i < neighbors.length; i++) {
				if(!neighbors[i].check_clear()) { // the neighbor is invalid, need to set this tile to invalid
					this.set_state(2);
				} else if (neighbors[i].state == 0) {
					neighbors[i].set_state(7);
				} else if (neighbors[i].state == 8) {
					if (!neighbors[i].change) {
						neighbors[i].set_state(9);
					}
				}
			}
		} else if (this.state == 2) { // this tile is invalid. there shouldn't be any walls.
			for (i = 0; i < neighbors.length; i++) {
				if(!neighbors[i].connected()) { // the neighbor is a wall tile, that isn't connected
					if (neighbors[i].state == 7) {
						neighbors[i].set_state(0);
					} else if (neighbors[i].state == 10) {
						neighbors[i].change = false;
						neighbors[i].prev_built = 10;
						neighbors[i].set_state(8);
					} else if (neighbors[i].state == 9) {
						neighbors[i].change = false;
						neighbors[i].prev_built = 9;
						neighbors[i].set_state(8);
					}
				}
			}
		} else if (this.state == 3) { // tile is being removed. remove any unconnected walls
			for (i = 0; i < neighbors.length; i++) {
				if (!neighbors[i].connected()) { // if the neighbor isn't connected, schedule to be removed
					if (neighbors[i].state == 3) {
						if (neighbors[i].change) {
							neighbors[i].change = false;
							neighbors[i].draw();
						}
					} else {
						neighbors[i].set_state(8);
					}
				}
			}
		} else if (this.state == 4) { // the tile is already built. check to make sure walls are built, or being built.
			for (i = 0; i < neighbors.length; i++) {
				if (neighbors[i].state == 0) { // the neighbor is empty. wall must be built
					//neighbors[i].prev_build = 7;
					neighbors[i].set_state(7);
				} else if (neighbors[i].state == 3) {
					if (!neighbors[i].change) {
						neighbors[i].change = true;
						neighbors[i].draw();
					}
				} else if (neighbors[i].state == 8) { // the neighbor wall is being removed. set it back to normal
					// check that it's not turning into a tile first
					if (!neighbors[i].change) {
						neighbors[i].set_state(9);
					}
				} else if (neighbors[i].state == 11) { // the neighbors wall is in the process of being removed
					if (!neighbors[i].change) { // make sure it's not changing into a tile
						//neighbors[i].prev_build = 7;
						neighbors[i].set_state(7); //DOUBLE CHECK HERE!!! ---------------------------------------------- <
					}
				}
			}
		} else if (this.state == 5) {
			for (i = 0; i < neighbors.length; i++) {
				if (neighbors[i].state == 0) { // the neighbor is empty. wall must be built
					//neighbors[i].prev_build = 7;
					neighbors[i].set_state(7);
				} else if (neighbors[i].state == 8) { // the neighbor wall is being removed. set it back to normal
					// check that it's not turning into a tile first
					if (!neighbors[i].change) {
						neighbors[i].set_state(9);
					}
				} else if (neighbors[i].state == 11) { // the neighbors wall is in the process of being removed
					if (!neighbors[i].change) { // make sure it's not changing into a tile
						//neighbors[i].prev_build = 7;
						neighbors[i].set_state(7); //DOUBLE CHECK HERE!!! ---------------------------------------------- <
					}
				}
			}
		} else if (this.state == 6) {
			for (i = 0; i < neighbors.length; i++) {
				if (!neighbors[i].connected()) {
					if (neighbors[i].state == 7) { // scheduled to be built
						neighbors[i].set_state(0);
					} else if (neighbors[i].state == 9) { // already built
						neighbors[i].set_state(8);
					} else if (neighbors[i].state == 10) { // process of being built
						neighbors[i].change = false;
						neighbors[i].set_state(8);
					}
				}
			}
		} else if (this.state == 7) { // a wall scheduled to be built
			if(!this.connected()) {
				this.set_state(0);
			}
			for (i = 0; i < neighbors.length; i++) {
				if (!neighbors[i].connected()) {
					if (neighbors[i].state == 7) {
						neighbors[i].set_state(0);
					} else if (neighbors[i].state == 9 || neighbors[i].state == 10) {
						neighbors[i].set_state(8);
					}
				}
			}
		} else if (this.state == 8) { // the wall is scheduled to be removed
			if(this.change) { // check if it's changing into a tile
				for (i = 0; i < neighbors.length; i++) {
					if (neighbors[i].state == 0) { // the neighbor is empty. wall must be built
						//neighbors[i].prev_build = 7;
						neighbors[i].set_state(7);
					} else if (neighbors[i].state == 8) { // the neighbor wall is being removed. set it back to normal
						// check that it's not turning into a tile first
						if (!neighbors[i].change) {
							neighbors[i].set_state(9);
						}
					} else if (neighbors[i].state == 11) { // the neighbors wall is in the process of being removed
						if (!neighbors[i].change) { // make sure it's not changing into a tile
							neighbors[i].set_state(7); //DOUBLE CHECK HERE!!! ---------------------------------------------- <
						}
					}
				}
			} else { // wall is not changing, look for unconnected walls
				for (i = 0; i < neighbors.length; i++) {
					if (!neighbors[i].connected()) { // if it's not connected, build a wall
						neighbors[i].set_state(0); // CHECK INVALID HERE TOO MAYBE? <-------------------------------------------
					}	
				}
			}
		} else if (this.state == 9) { // a wall is already built here
			for (i = 0; i < neighbors.length; i++) {
				if (!neighbors[i].connected()) {
					if (neighbors[i].state == 7) {
						neighbors[i].set_state(0);
					} else if (neighbors[i].state == 9 || neighbors[i].state == 10) {
						neighbors[i].set_state(8);
					}
				}
			}
		} else if (this.state == 10) { // a wall is being built here
			if(!this.connected()) {
				this.change = false;
				this.prev_built = 10;
				this.set_state(8);
			}
			for (i = 0; i < neighbors.length; i++) {
				if (neighbors[i].is_wall() && !neighbors[i].connected()) {
					if (neighbors[i].state == 7) {
						neighbors[i].set_state(0);
					} else if (neighbors[i].state == 9 || neighbors[i].state == 10) {
						neighbors[i].set_state(8);
					}
				}
			}		
		} else if (this.state == 11) { // a wall is being removed here
			if(this.connected && !this.change) {
				this.prev_built = 11;
				//neighbors[i].prev_build = 7;
				this.set_state(7);
			}		
			for (i = 0; i < neighbors.length; i++) {
				if (neighbors[i].is_wall() && !neighbors[i].connected()) {
					if (neighbors[i].state == 7) {
						neighbors[i].set_state(0);
					} else if (neighbors[i].state == 9 || neighbors[i].state == 10) {
						neighbors[i].set_state(8);
					}
				}
			}
		}
	}
	
	function connected() { // is this tile connected to a tile?
		if (this.state != 1 && this.state != 4 && this.state != 5) { // MAYBE DON'T INCLUDE 6 HERE?? <--------------
			n = window.Map.get_neighbors("floor", this.x, this.y);
			for (j = 0; j < n.length; j++) {
				if (n[j].state == 1 || n[j].state == 4 || n[j].state == 5 || (n[j].state == 8 && n[j].change)) {
					return true;
				}
			}
			//alert("tile + " + this.state + " " + this.x + ", " + this.y);
			return false;
		}
		return true;
	}
	
	function set_style(style) { // change the style (texture/type)
		this.style = style;
		this.draw();
	}
	
	function draw() { // redraw to the blueprint layer
		tilesize = window.Map.tilesize;
		
		if (this.state == 0) { // "EMPTY"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.use_layer("floor");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
		} else if (this.state == 1) { // "BUILD"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint1", this.x * tilesize, this.y * tilesize);
		} else if (this.state == 2) { // "INVALID"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint2", this.x * tilesize, this.y * tilesize);
		} else if (this.state == 3) { // "REMOVE"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			if (this.change) {
				window.Draw.image(this.wall_type, this.x * tilesize, this.y * tilesize);
				window.Draw.image("blueprint1", this.x * tilesize, this.y * tilesize);
			} else {
				window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
				window.Draw.image("blueprint3", this.x * tilesize, this.y * tilesize);
			}
			window.Draw.use_layer("floor");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
		} else if (this.state == 4) { // "BUILT"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint4", this.x * tilesize, this.y * tilesize);
			window.Draw.use_layer("floor");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
		} else if (this.state == 5) { // "BEING BUILT"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint4", this.x * tilesize, this.y * tilesize);
			window.Draw.use_layer("floor");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image("tile_build", this.x * tilesize, this.y * tilesize);
		} else if (this.state == 6) { // "BEING REMOVED"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint3", this.x * tilesize, this.y * tilesize);
			window.Draw.use_layer("floor");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image("tile_build", this.x * tilesize, this.y * tilesize);
		} else if (this.state == 7) { // "WALL BUILD"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.wall_type, this.x * tilesize, this.y * tilesize)yeah;
			window.Draw.image("blueprint1", this.x * tilesize, this.y * tilesize);
		} else if (this.state == 8) { // "WALL REMOVE"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			if(this.change) {
				window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
				window.Draw.image("blueprint1", this.x * tilesize, this.y * tilesize);
			} else {
				window.Draw.image(this.wall_type, this.x * tilesize, this.y * tilesize);
				window.Draw.image("blueprint3", this.x * tilesize, this.y * tilesize);
			}
		} else if (this.state == 9) { // "WALL BUILT"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image("blueprint4", this.x * tilesize, this.y * tilesize);
			window.Draw.use_layer("floor");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.wall_type, this.x * tilesize, this.y * tilesize);
		} else if (this.state == 10) { // "WALL BEING BUILT"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image("blueprint4", this.x * tilesize, this.y * tilesize);
			window.Draw.use_layer("floor");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image("wall_build", this.x * tilesize, this.y * tilesize);
		} else if (this.state == 11) { // "WALL BEING REMOVED"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image("blueprint3", this.x * tilesize, this.y * tilesize);
			window.Draw.use_layer("floor");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image("wall_build", this.x * tilesize, this.y * tilesize);
		}
		window.Draw.use_layer("blueprint");
		window.Draw.draw_text(this.state, this.x * tilesize + 16, this.y * tilesize + 16, {
          fillStyle: 'white',
          font: '16px courier',
		  scale: false,
		  rulerw: 16,
		  use_scroll:true
        });
		
	}
}

window.Floors = {
	init: function() {
		this.edit_mode = false;
		this.edit_style = "corridor";
		this.under_construction = [];
		
		// ask for events
		window.Events.add_listener(this);
	
		// load floor images
		window.Draw.add_image('medical', "./textures/ground/room_medical.png");
		window.Draw.add_image('corridor', "./textures/ground/room_corridor.png");
		window.Draw.add_image('laboratory', "./textures/ground/room_laboratory.png");
		window.Draw.add_image('commons', "./textures/ground/room_commons.png");
		window.Draw.add_image('greenhouse', "./textures/ground/room_greenhouse.png");
		window.Draw.add_image('power', "./textures/ground/room_power.png");
		window.Draw.add_image('supply', "./textures/ground/room_supply.png");
		window.Draw.add_image('tile_build', "./textures/ground/tile_under_construction.png");
		window.Draw.add_image('wall_build', "./textures/ground/wall_under_construction.png");
		
		// load wall images
		window.Draw.add_image('wall_0', "./textures/walls/external/wall_ext_m.png");
		
		// load blueprint images
		window.Draw.add_image('blueprint1', "./textures/ground/blueprint_build.png");
		window.Draw.add_image('blueprint2', "./textures/ground/blueprint_invalid.png");
		window.Draw.add_image('blueprint3', "./textures/ground/blueprint_remove.png");
		window.Draw.add_image('blueprint4', "./textures/ground/blueprint_built.png");
		
		// THIS IS WHERE YOU WOULD CALL A FUNCTION TO FILL THE FLOOR TILE ARRAY
		// fill map layers
		floor_tiles = [];
		blueprint_tiles = [];
		for (i = 0; i <= window.Map.height-1; i++) {
			floor_tiles.push([]);
			for (j = 0; j <= window.Map.width-1; j++) {
				tile = new floor_tile(j, i, 0);
				floor_tiles[i].push(tile);
			}
		}
		
		// create map layers
		window.Map.arrays["floor"] = floor_tiles;
		
		// create draw layers
		window.Draw.create_layer("floor", true);
		window.Draw.create_layer("blueprint", true);
	},
	confirm_all: function() { // confirm all blueprints
		for(i = 0; i < window.Map.arrays["floor"].length; i++) {
			for(j = 0; j < window.Map.arrays["floor"][i].length; j++) {
				window.Map.arrays["floor"][i][j].confirm();
			}
		}
		console.log("tiles to be built: " + this.under_construction.length);
	},
	mousedown: function(e){
		if (this.edit_mode) {
			// get the tile the user clicked
			tile_coords = window.Events.tile_under_mouse;
			tile = window.Map.get("floor", tile_coords[0], tile_coords[1]);
			tile.toggle(this.edit_style);
		}
	},
	keydown: function(e){
		if (e.keyCode == 49) { // 1
			this.edit_style = "corridor";
		} else if (e.keyCode == 50) { // 2
			this.edit_style = "supply";
		} else if (e.keyCode == 51) { // 3
			this.edit_style = "greenhouse";
		} else if (e.keyCode == 52) { // 4
			this.edit_style = "commons";
		} else if (e.keyCode == 53) { // 5
			this.edit_style = "laboratory";
		} else if (e.keyCode == 54) { // 6
			this.edit_style = "medical";
		} else if (e.keyCode == 55) { // 7
			this.edit_style = "power";
		} else if (e.keyCode == 66) { // b
			if(this.edit_mode) {
				console.log("confirming blueprint orders");
				this.confirm_all();
			}
		} else if (e.keyCode == 86) { // v
			if (this.edit_mode) {
				this.edit_mode = false;
				console.log("Switching view mode to no-edit!");
				window.Draw.hide_layer("blueprint");
			} else {
				this.edit_mode = true;
				console.log("Switching view mode to edit!");
				window.Draw.show_layer("blueprint");
			}
		}
	},
	update: function(delta) { // hackish update code, change when astronauts can interact
		for(i = 0; i < this.under_construction.length; i++) {
			this.under_construction[i].build(delta/4);
		}
	}
}


$(window).ready( function() {
	window.Floors.init();
});