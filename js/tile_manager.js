function Tile(x, y) {
	this.x = x;
	this.y = y;
	
	this.blue_style = 'empty'; // what the tile could be, in edit mode
	this.current_style = 'empty'; // what the tile is, in view mode
	this.goal_style = 'empty'; // what the tile will be, in view mode
	this.state = 0;
	
	this.wall_style = 'empty'; // the shape of the wall tile
	
	this.timer = 0;
	this.built = false;
	window.Tiles.live_tiles.push(this);
	
	// set a blueprint style for this tile
	Tile.prototype.set_blueprint = function(style) {
		this.blue_style = style;
		if (this.state == 0 && style == 'empty') {
			this.erase();
		}
		if (style == 'wall') {
			this.wall_style = this.determine_wall_style(true);
		}
		//this.check_neighbors();
		this.draw();
	}
	
	// remove this tile from the window.Map layer
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
				this.built = true;
				window.Tiles.under_construction.remove(this);
				this.state = 3;
				this.current_style = this.goal_style;
				this.draw();
				if (this.current_style == 'wall') { // if this is a wall, update neighbor shadows
					var neighbors = window.Map.get_neighbors('tiles', this.x, this.y);
					for (var i = 0; i < neighbors.length; i++) {
						if (neighbors[i] != 0) { // a tile exists
							if (!(neighbors[i].current_style == 'wall' || neighbors[i].goal_style == 'wall')) { // it's not a wall
								neighbors[i].draw_shadows(); // draw some shadows on it!
								console.log("drawing shadows on a neighbor");
							}
						}
					}
				}
			}
		} else if (this.state == 2) { // removing
			if (this.timer >= 1000) {
				if (this.goal_style == 'empty') { // deleting completely
					this.state = 0;
					this.erase();
					this.current_style = 'empty';
					this.draw();
				} else { // turning into a different tile
					this.timer = 0;
					this.current_style = 'empty';
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
	
	
	// get's the unique binary value for this tile. if count_blues is true, it will count unbuilt blue tiles
	Tile.prototype.get_bin_value = function(count_blues) {
		var neighbors = window.Map.get_neighbors('tiles', this.x, this.y);
		var total = 0;
		for (var i = 0; i < neighbors.length; i++) {
			if (neighbors[i] != 0) { // there is a tile at this neighbor
				if ((neighbors[i].goal_style != 'wall' && neighbors[i].goal_style != 'empty') || (neighbors[i].current_style != 'wall' && neighbors[i].current_style != 'empty')) {
					total += Math.pow(2, i + 1);
				} else if (count_blues && neighbors[i].blue_style != 'wall') {
					total += Math.pow(2, i + 1);
				}
			}
		}
		return total;
	}
	
	Tile.prototype.determine_wall_style = function(count_blues) {
		var bin_val = this.get_bin_value(count_blues);
		var wall_style = window.Tiles.wall_styles[bin_val]
		console.log(bin_val + ':  wall_ext_' + window.Tiles.wall_styles[bin_val]);
		console.log(bin_val);
		if (wall_style != undefined) {
			return ('wall_ext_' + window.Tiles.wall_styles[bin_val]);
		} else {b
			return ('wall_ext_17');
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
		return (this.state == 3 && this.current_style == 'wall');
	}
	
	// draw the tile on the map
	Tile.prototype.draw = function() {
		
		var tilesize = window.Map.tilesize;
		var x = this.x * tilesize;
		var y = this.y * tilesize;
		if (this.state == 0) { // a blueprint only
			if (this.blue_style == 'wall') {
				window.Draw.use_layer("blueprints");
				window.Draw.clear_box(x, y, tilesize, tilesize);
				window.Draw.image(this.wall_style, x, y);
				window.Draw.image("blueprint1", x, y);
			} else if (this.blue_style == 'empty') {
				window.Draw.use_layer("blueprints");
				window.Draw.clear_box(x, y, tilesize, tilesize);
			} else {
				window.Draw.use_layer("blueprints");
				window.Draw.clear_box(x, y, tilesize, tilesize);
				window.Draw.image(this.blue_style, x, y);
				window.Draw.image("blueprint1", x, y);
			}
			window.Draw.use_layer("tiles");
			window.Draw.clear_box(x, y, tilesize, tilesize);
		} else if (this.state == 1) { // building something
			if (this.goal_style == 'wall') {
				window.Draw.use_layer("tiles");
				window.Draw.clear_box(x, y, tilesize, tilesize);
				window.Draw.image("wall_build", x, y);
				if (this.blue_style != this.goal_style) { // the blueprint wants something different than the current construction
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image(this.blue_style, x, y);
					window.Draw.image("blueprint1", x, y);
				} else {
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image(this.wall_style, x, y);
					window.Draw.image("blueprint4", x, y);
				}
			} else {
				window.Draw.use_layer("tiles");
				window.Draw.clear_box(x, y, tilesize, tilesize);
				window.Draw.image("tile_build", x, y);
				if (this.blue_style != this.goal_style) { // the blueprint wants something different than the current construction
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image(this.blue_style, x, y);
					window.Draw.image("blueprint1", x, y);
				} else {
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image(this.blue_style, x, y);
					window.Draw.image("blueprint4", x, y);
				}
			}
		} else if (this.state == 2) { // removing something
			if (this.current_style == 'wall') {
				window.Draw.use_layer("tiles");
				window.Draw.clear_box(x, y, tilesize, tilesize);
				window.Draw.image("wall_build", x, y);
				if (this.goal_style == 'empty') { // tile is being removed completely
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image("blueprint3", x, y);
				} else { // tile is being changed
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image(this.goal_style, x, y);
					window.Draw.image("blueprint1", x, y);
				}
			} else {
				window.Draw.use_layer("tiles");
				window.Draw.clear_box(x, y, tilesize, tilesize);
				window.Draw.image("tile_build", x, y);
				if (this.goal_style == 'empty') { // tile is being removed completely
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image("blueprint3", x, y);
				} else { // tile is being changed
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image(this.goal_style, x, y);
					window.Draw.image("blueprint1", x, y);
				}
			}
		} else if (this.state == 3) { // tile is built
			if (this.current_style == 'wall') {
				window.Draw.use_layer("tiles");
				window.Draw.clear_box(x, y, tilesize, tilesize);
				window.Draw.image(this.wall_style, x, y);
				if (this.blue_style != this.goal_style) { // the blueprint wants something different than what is built
					if (this.blue_style == 'empty') { // the blueprints want it to be removed
						window.Draw.use_layer("blueprints");
						window.Draw.clear_box(x, y, tilesize, tilesize);
						window.Draw.image(this.wall_style, x, y);
						window.Draw.image("blueprint3", x, y);
					} else {
						window.Draw.use_layer("blueprints");
						window.Draw.clear_box(x, y, tilesize, tilesize);
						window.Draw.image(this.blue_style, x, y);
						window.Draw.image("blueprint1", x, y);
					}
				} else {
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image(this.wall_style, x, y);
					window.Draw.image("blueprint4", x, y);
				}
			} else {
				window.Draw.use_layer("tiles");
				window.Draw.clear_box(x, y, tilesize, tilesize);
				window.Draw.image(this.current_style, x, y);
				if (this.blue_style != this.goal_style) { // the blueprint wants something different than what is built
					if (this.blue_style == 'empty') { // the blueprints want it to be removed
						window.Draw.use_layer("blueprints");
						window.Draw.clear_box(x, y, tilesize, tilesize);
						window.Draw.image(this.current_style, x, y);
						window.Draw.image("blueprint3", x, y);
					} else {
						window.Draw.use_layer("blueprints");
						window.Draw.clear_box(x, y, tilesize, tilesize);
						window.Draw.image(this.blue_style, x, y);
						window.Draw.image("blueprint1", x, y);
					}
				} else {
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image(this.wall_style, x, y);
					window.Draw.image("blueprint4", x, y);
				}
			}
		}
	}
	
	Tile.prototype.draw_shadows = function() {
		var neighbors = window.Map.get_neighbors('tiles', this.x, this.y);
		var tilesize = window.Map.tilesize;
		var x = this.x * tilesize;
		var y = this.y * tilesize;
		window.Draw.use_layer("wall_shadows");
		window.Draw.clear_box(x, y, tilesize, tilesize);
		
		// check top
		if (neighbors[1] != 0) {
			if (neighbors[1].is_wall()) {
				window.Draw.image('shadow_1', x, y);
			}
		}
		
		// check right
		if (neighbors[3] != 0) {
			if (neighbors[3].is_wall()) {
				window.Draw.image('shadow_4', x, y);
			}
		}
		
		// check left
		if (neighbors[5] != 0) {
			if (neighbors[5].is_wall()) {
				window.Draw.image('shadow_3', x, y);
			}
		}
		
		// check bottom
		if (neighbors[7] != 0) {
			if (neighbors[7].is_wall()) {
				window.Draw.image('shadow_2', x, y);
			}
		}
		
	}	
}

window.Tiles = {
	init: function() {
		this.edit_mode = false;
		this.edit_style = 'corridor';
		this.under_construction = [];
		this.live_tiles = [];
		this.wall_styles = {
			// 1
			12: 1,
			14: 1,
			6: 1,
			10: 1,
			4: 1,
			// 2
			56: 2,
			40: 2,
			16: 2,
			24: 2,
			48: 2,
			// 3
			224: 3,
			160: 3,
			64: 3,
			96: 3,
			192: 3,
			// 4
			386: 4,
			130: 4,
			256: 4,
			384: 4,
			258: 4,
			// 5
			32: 5,
			// 6
			128: 6,
			// 7
			2: 7,
			//8
			8: 8,
			// 9
			260: 9,
			264: 9,
			392: 9,
			398: 9,
			396: 9,
			140: 9,
			262: 9,
			390: 9,
			270: 9,
			388: 9,
			132: 9,
			268: 9,
			138: 9,
			134: 9,
			394: 9,
			266: 9,
			142: 9,
			// 10
			28: 10,
			20: 10,
			18: 10,
			38: 10,
			62: 10,
			54: 10,
			50: 10,
			30: 10,
			60: 10,
			22: 10,
			36: 10,
			52: 10,
			42: 10,
			26: 10,
			46: 10,
			44: 10,
			58: 10,
			// 11
			112: 11,
			80: 11,
			72: 11,
			152: 11,
			248: 11,
			216: 11,
			200: 11,
			120: 11,
			240: 11,
			88: 11,
			144 : 11,
			208: 11,
			168: 11,
			104: 11,
			184: 11,
			176: 11,
			232: 11,
			// 12
			448: 12,
			320: 12,
			288: 12,
			98: 12,
			482: 12,
			354: 12,
			290: 12,
			480: 12,
			450: 12,
			352: 12,
			66: 12,
			322: 12,
			162: 12,
			416: 12,
			226: 12,
			194: 12,
			418: 12,
			// 13
			136: 13,
			// 14
			34: 14
		};
		
		
		
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
		for (var i = 0; i < 14; i++) {
			window.Draw.add_image('wall_ext_' + (i+1), "./textures/walls/external/" + 'wall_ext_' + (i+1) + ".png");
		}
		window.Draw.add_image('wall_base_17', "./textures/walls/external/wall_ext_17.png");
		window.Draw.add_image('wall', "./textures/walls/external/wall_ext_m.png");
		
		// load shadow images
		for (var i = 0; i < 8; i++) {
			window.Draw.add_image('shadow_' + (i+1), "./textures/walls/shadows/" + 'shad_' + (i+1) + ".png");
		}
		
		// load blueprint images
		window.Draw.add_image('blueprint1', "./textures/ground/blueprint_build.png");
		window.Draw.add_image('blueprint2', "./textures/ground/blueprint_invalid.png");
		window.Draw.add_image('blueprint3', "./textures/ground/blueprint_remove.png");
		window.Draw.add_image('blueprint4', "./textures/ground/blueprint_built.png");
		
		// create map layers
		window.Map.create_layer('tiles', 0);
		
		// create draw layers
		window.Draw.create_layer('tiles', true);
		window.Draw.create_layer('wall_shadows', true);
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
				window.Draw.show_layer("wall_shadows");
				window.Draw.hide_layer("blueprints");
			} else {
				this.edit_mode = true;
				console.log("Switching view mode to edit!");
				window.Draw.show_layer("blueprints");
				window.Draw.hide_layer("wall_shadows");
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
			//this.under_construction[i].build(delta/2);
		}
	}
}

$(window).ready( function() {
	window.Tiles.init();
});
