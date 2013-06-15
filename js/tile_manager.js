function Tile(x, y) {
	this.x = x;
	this.y = y;
	
	this.blue_style = 'empty'; // what the tile could be, in edit mode
	this.current_style = 'empty'; // what the tile is, in view mode
	this.goal_style = 'empty'; // what the tile will be, in view mode
	this.state = 0;
	
	this.timer = 0;
	this.built = false;
	window.Tiles.live_tiles.push(this);
	
	// set a blueprint style for this tile
	Tile.prototype.set_blueprint = function(style) {
		this.blue_style = style;
		if (this.state == 0 && style == 'empty') {
			this.erase();
		}
		//this.check_neighbors();
		this.draw();
	}
	
	Tile.prototype.erase = function() {
		window.Map.set('tiles', this.x, this.y, 0);
		window.Tiles.live_tiles.remove(this);
		window.Tiles.under_construction.remove(this);
		console.log("deleting tile");
	}
	
	// called by the astronauts
	Tile.prototype.build = function(delta) {
		this.timer += delta;
		if (this.state == 1) { // building
			if (this.timer >= 800) {
				this.timer = 0;
				window.Tiles.under_construction.remove(this);
				this.state = 3;
				this.current_style = this.goal_style;
				this.draw();
				this.built = true;
			}
		} else if (this.state == 2) { // removing
			if (this.timer >= 1000) {
				if (this.goal_style == 'empty') { // deleting completely
					this.state = 0;
					this.erase();
					this.draw();
				} else { // turning into a different tile
					this.timer = 0;
					this.state = 1;
					this.draw();
				}
			}
		}
	}
	
	// confirm blueprint orders
	Tile.prototype.confirm = function() {
		if (this.blue_style != this.goal_style) {
			this.built = false;
			this.goal_style = this.blue_style;
			
			if (this.state == 0) {
				this.state = 1;
				window.Tiles.under_construction.push(this);
			} else if (this.state == 1) {
				this.state = 2;
			} else if (this.state == 3) {
				this.state = 2;
				window.Tiles.under_construction.push(this);
			}
			this.draw();
			return true;
		} else {
			return false; // no action is needed
		}
	}
	
	
	Tile.prototype.check_neighbors = function() {
		for (var y = -1; y < 2; y++) {
			for (var x = -1; x < 2; x++) {
				var neighbor = window.Map.get('tiles', this.x + x, this.y + y);
				//alert(neighbor);
				if (this.state == 0) { // blueprint only
					if (this.blue_style != 'empty') {
						if (neighbor == 0) {
							neighbor = new Tile(this.x + x, this.y + y);
							//window.Map.set('tiles', this.x + x, this.y + y);
						}
						if (neighbor.state == 0 && neighbor.blue_style == 'empty') {
							neighbor.blue_style = 'wall';
							neighbor.draw();
						}					
					} else {
						if (neighbor != 0) {
							if (neighbor.state == 0 && neighbor.blue_style == 'wall') {
								neighbor.blue_style = 'empty'
								neighbor.draw();
							}
						}
					}
				} else if (this.state == 1) {
				
				} else if (this.state == 2) {
				
				} else if (this.state == 3) {
				
				} else if (this.state == 4) {
				
				}
			}
		}
		
	}
	
	// has this tile reached it's goal?
	Tile.prototype.reached_goal = function() {
		return (this.state_que.length == 1);
	}
	
	// check if the ground is clear of any obstacles
	Tile.prototype.check_clear = function() {
		return true;
	}
	
	Tile.prototype.is_wall = function() {
		return (this.current_style == 'wall_0');
	}
	
	// draw the tile on the map
	Tile.prototype.draw = function() {
		
		tilesize = window.Map.tilesize;
		var x = this.x * tilesize;
		var y = this.y * tilesize;
		
		if (this.state == 0) { // blueprint
			window.Draw.use_layer("tiles");
			window.Draw.clear_box(x, y, tilesize, tilesize);
			window.Draw.use_layer("blueprints");
			window.Draw.clear_box(x, y, tilesize, tilesize);
			if (this.blue_style != 'empty') {
				window.Draw.image(this.blue_style, x, y);
				window.Draw.image("blueprint1", x, y);
			}
		} else if (this.state == 1) { // building
			window.Draw.use_layer("tiles");
			window.Draw.clear_box(x, y, tilesize, tilesize);
			if (this.is_wall()) {
				window.Draw.image('wall_build', x, y);
			} else {
				window.Draw.image('tile_build', x, y);
			}
			window.Draw.use_layer("blueprints");
			window.Draw.clear_box(x, y, tilesize, tilesize);
			if (this.blue_style == 'empty') {
				window.Draw.image(this.current_style, x, y);
				window.Draw.image("blueprint3", x, y);
			} else if (this.blue_style != this.goal_style) {
				window.Draw.image(this.blue_style, x, y);
				window.Draw.image("blueprint1", x, y);
			} else {
				window.Draw.image(this.blue_style, x, y);
				window.Draw.image("blueprint4", x, y);
			}
		} else if (this.state == 2) { // removing
			window.Draw.use_layer("tiles");
			window.Draw.clear_box(x, y, tilesize, tilesize);
			if (this.is_wall()) {
				window.Draw.image('wall_build', x, y);
			} else {
				window.Draw.image('tile_build', x, y);
			}
			window.Draw.use_layer("blueprints");
			window.Draw.clear_box(x, y, tilesize, tilesize);
			if (this.blue_style != 'empty') {
				window.Draw.image(this.blue_style, x, y);
				if (this.blue_style == this.goal_style) {
					window.Draw.image('blueprint4', x, y);
				} else {
					window.Draw.image('blueprint1', x, y);
				}
			} else {
				window.Draw.image('blueprint3', x, y);
			}
		} else if (this.state == 3) { // built
			window.Draw.use_layer("tiles");
			window.Draw.clear_box(x, y, tilesize, tilesize);
			window.Draw.image(this.current_style, x, y);
			window.Draw.use_layer("blueprints");
			window.Draw.clear_box(x, y, tilesize, tilesize);
			if (this.blue_style == this.current_style) {
				window.Draw.image(this.blue_style, x, y);
				window.Draw.image("blueprint4", x, y);
			} else if (this.blue_style == 'empty') {
				window.Draw.image("blueprint3", x, y);
			} else {
				window.Draw.image(this.blue_style, x, y);
				window.Draw.image("blueprint1", x, y);
			}
		} else if (this.state == 4) { // invalid
			window.Draw.use_layer("blueprints");
			window.Draw.clear_box(x, y, tilesize, tilesize);
			window.Draw.image("blueprint2", x, y);
		}
	}
}

window.Tiles = {
	init: function() {
		this.edit_mode = false;
		this.edit_style = 'corridor';
		this.under_construction = [];
		this.live_tiles = [];
		
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
		window.Draw.add_image('wall', "./textures/walls/external/wall_ext_m.png");
		
		// load blueprint images
		window.Draw.add_image('blueprint1', "./textures/ground/blueprint_build.png");
		window.Draw.add_image('blueprint2', "./textures/ground/blueprint_invalid.png");
		window.Draw.add_image('blueprint3', "./textures/ground/blueprint_remove.png");
		window.Draw.add_image('blueprint4', "./textures/ground/blueprint_built.png");
		
		// create map layers
		window.Map.create_layer('tiles', 0);
		
		// create draw layers
		window.Draw.create_layer('tiles', true);
		window.Draw.create_layer('blueprints', true);
	},
	confirm_blueprints: function() { // confirm all blueprints
		for(var i = 0; i < this.live_tiles.length; i++) {
				this.live_tiles[i].confirm();
		}
		console.log("tiles to be built: " + this.under_construction.length);
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
			this.edit_style = "wall";
		} else if (e.keyCode == 55) { // 7
			this.edit_style = "empty";
		} else if (e.keyCode == 66) { // b
			if(this.edit_mode) {
				console.log("confirming blueprint orders");
				this.confirm_blueprints();
			}
		} else if (e.keyCode == 86) { // v
			if (this.edit_mode) {
				this.edit_mode = false;
				console.log("Switching view mode to no-edit!");
				window.Draw.hide_layer("blueprints");
			} else {
				this.edit_mode = true;
				console.log("Switching view mode to edit!");
				window.Draw.show_layer("blueprints");
			}
		}
	},
	mousedown: function(e){
		if (this.edit_mode) {
			// get the tile the user clicked
			var tile_coords = window.Events.tile_under_mouse;
			var t = window.Map.get('tiles', tile_coords[0], tile_coords[1]);
			if (t == 0) { // if the tile does not exist, make one
				console.log("tile doesn't exist yet, making one");
				if (this.edit_style != 'empty') {
					t = new Tile(tile_coords[0], tile_coords[1]);
					window.Map.set('tiles', tile_coords[0], tile_coords[1], t);
					t.set_blueprint(this.edit_style);
				}
			} else {
				t.set_blueprint(this.edit_style);
			}
		}
	},
	update: function(delta) { // hackish update code, change when astronauts can interact
		for(i = 0; i < this.under_construction.length; i++) {
			//this.under_construction[i].build(delta/10);
		}
	}
}

$(window).ready( function() {
	window.Tiles.init();
});

