function Tile(x, y) {
	this.x = x;
	this.y = y;
	
	this.blue_style = 'empty'; // what the tile could be, in edit mode
	this.current_style = 'empty'; // what the tile is, in view mode
	this.goal_style = 'empty'; // what the tile will be, in view mode
	this.state = 0;
	
	this.blue_wall_style = 'empty' // shape of the wall in edit mode
	this.wall_style = 'empty'; // the shape of the wall tile
	
	this.valid = true;
	
	this.timer = 0;
	this.built = false;
	window.Tiles.live_tiles.push(this);
	
	// set a blueprint style for this tile
	Tile.prototype.set_blueprint = function(style) {
		this.blue_style = style;
		
		this.valid = true;
		
		if (style == 'wall') {
			this.blue_wall_style = this.determine_wall_style();
			if (this.blue_wall_style == 'empty') {
				this.blue_style = 'empty';
				if (this.state == 0) {
					this.erase();
				}
			}
			
		} else if (style == 'empty') {
			if (this.state == 0) {
				this.erase();
			} if (this.state == 1 || this.state == 2) {
				if (this.goal_style != 'wall') {
					this.set_blueprint('wall');
					this.get_walls();
				} else {
					this.get_walls();
					this.blue_style = 'wall';
				}
			} else {
				this.set_blueprint('wall');
				this.get_walls();
			}
		} else if (style != 'wall') {
			this.get_walls();
		}
		
		this.valid = this.check_clear();

		if (this.valid || style == 'empty') {
			window.Tiles.invalid_tiles.remove(this);
		} else if (this.blue_style != 'empty') {
			if (window.Tiles.invalid_tiles.indexOf(this) == -1) {
				window.Tiles.invalid_tiles.push(this);
			}
		}
	
		this.draw();
	
	}
	
	// build walls around a tile
	Tile.prototype.get_walls = function() {
		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < 3; y++) {
				var neighbor = window.Map.get('tiles', this.x + x - 1, this.y + y - 1);
				if (neighbor == 0) { // nothing exists at this neighbors
					neighbor = new Tile (this.x + x - 1, this.y + y - 1);
					window.Map.set('tiles', neighbor.x, neighbor.y, neighbor);
					neighbor.set_blueprint('wall');
				} else if (neighbor.blue_style == 'wall' || neighbor.blue_style == 'empty') { // there is a tile here already
					neighbor.set_blueprint('wall');
				}
			}
		}
	}
	
	// remove this tile from the window.Map layer
	Tile.prototype.erase = function() {
		window.Map.set('tiles', this.x, this.y, 0);
		window.Tiles.live_tiles.remove(this);
		window.Tiles.under_construction.remove(this);
		window.Tiles.invalid_tiles.remove(this);
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
					window.Map.set('pathfinding', this.x, this.y, 1);
					var o = window.Map.get('oxygen', this.x, this.y);
					o.increment = 0;
					o.type = 1;
					this.draw_neighbor_shadows();
				} else {
					this.draw_shadows();
					var o = window.Map.get('oxygen', this.x, this.y);
					o.increment = 0;
					o.type = 0;
					window.Map.set('pathfinding', this.x, this.y, 0);
				}
			}
		} else if (this.state == 2) { // removing
			if (this.timer >= 1000) {
				this.draw_neighbor_shadows();
				if (this.goal_style == 'empty') { // deleting completely
					this.state = 0;
					this.erase();
					this.current_style = 'empty';
					window.Map.set('pathfinding', this.x, this.y, 0);
					var o = window.Map.get('oxygen', this.x, this.y);
					o.increment = window.Oxygen.exterior_increm;
					o.type = 0;
					this.draw();
				} else { // turning into a different tile
					this.timer = 0;
					this.current_style = 'empty';
					this.state = 1;
					var o = window.Map.get('oxygen', this.x, this.y);
					o.increment = 0;
					o.type = 0;
					this.draw_shadows();
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
				if (this.blue_style == 'wall') {
					this.wall_style = this.blue_wall_style;
				}
				window.Map.set('pathfinding', this.x, this.y, 0);
				window.Tiles.under_construction.push(this);
				var o = window.Map.get('oxygen', this.x, this.y);
				o.increment = window.Oxygen.exterior_increm;
				o.type = 0;
			} else if (this.state == 1 || this.state == 2) {
				if (this.blue_style == 'wall') {
					this.wall_style = this.blue_wall_style;
				}
				this.state = 2;
			} else if (this.state == 3) { // already built
				this.state = 2;
				if (this.blue_style == 'wall') {
					this.wall_style = this.blue_wall_style;
					var o = window.Map.get('oxygen', this.x, this.y);
					o.increment = window.Oxygen.exterior_increm;
					o.type = 0;
				} else {
					var o = window.Map.get('oxygen', this.x, this.y);
					o.increment = 0;
					o.type = 0;
				}
				this.draw_neighbor_shadows();
				this.draw_shadows();
				window.Map.set('pathfinding', this.x, this.y, 0);
				window.Tiles.under_construction.push(this);
			}
			this.draw();
			return true;
		} else if (this.blue_style == 'wall') { 5
			if (this.blue_wall_style != this.wall_style) { // they are both wall
				this.wall_style = this.blue_wall_style;
				this.draw();
				return false;
			}
		} else {
			return false; // no action is needed
		}
	}
	
	// cancel blueprint orders
	Tile.prototype.cancel = function() {
		if (this.state == 0) {
			this.erase();
			this.set_blueprint('empty');
			return true;
		} else {
			this.set_blueprint(this.goal_style);
			return false;
		}
	}
	
	// update the neighbors' shadows
	Tile.prototype.draw_neighbor_shadows = function() {
		var neighbors = window.Map.get_neighbors('tiles', this.x, this.y);
		for (var i = 0; i < neighbors.length; i++) {
			if (neighbors[i] != 0) { // a tile exists
				neighbors[i].draw_shadows(); // draw some shadows on it!
			}
		}
	}
	
	// get's the unique binary value for this tile. if count_blues is true, it will count unbuilt blue tiles
	Tile.prototype.get_bin_value = function() {
		var neighbors = window.Map.get_neighbors('tiles', this.x, this.y);
		var total = 0;
		for (var i = 0; i < neighbors.length; i++) {
			if (neighbors[i] != 0) { // there is a tile at this neighbor	
				if (neighbors[i].blue_style != 'wall' && neighbors[i].blue_style != 'empty')  {
					total += Math.pow(2, i + 1);
				}
			}
		}
		return total;
	}
	
	Tile.prototype.determine_wall_style = function() {
		var bin_val = this.get_bin_value();
		var wall_style = window.Tiles.wall_styles[bin_val];
		//console.log("bin: " + bin_val + " style: wall_base_" + wall_style + ".png");
		if (wall_style != undefined) {
			return ('wall_base_' + window.Tiles.wall_styles[bin_val]);
		} else if ( bin_val == 0 ) { // no neighbors
			return ('empty'); // should be empty
		} else { // catch-all style
			return ('wall_base_17');
		}
	}
	
	// check if the ground is clear of any obstacles
	Tile.prototype.check_clear = function(x, y) {
		if (x && y) {
			return window.Objects.tile_changed(x, y);
		} else {
			return window.Objects.tile_changed(this.x, this.y);
		}
	}
	
	// check if the neighbors around this tile are clear of any obstacles
	Tile.prototype.check_neighbors_clear = function() {
		for (i = -1; i < 2; i++) {
			for (j = -1; j < 2; j++) {
				if (!this.check_clear(this.x + i, this.y + j)) {
					return false;
				}
			}
		}
		return true;
	}
	
	// draw the tile on the map
	Tile.prototype.draw = function() {
		
		var tilesize = window.Map.tilesize;
		var x = this.x * tilesize;
		var y = this.y * tilesize;
		if (this.state == 0) { // a blueprint only
			if (this.valid || this.blue_style == 'empty') {
				if (this.blue_style == 'wall') {
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image(this.blue_wall_style, x, y);
					window.Draw.image("blueprint1", x, y);
				} else if (this.blue_style == 'empty') {
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.use_layer("wall_shadows");
					window.Draw.clear_box(x, y, tilesize, tilesize);
				} else {
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image(this.blue_style, x, y);
					window.Draw.image("blueprint1", x, y);
				}
				window.Draw.use_layer("tiles");
				window.Draw.clear_box(x, y, tilesize, tilesize);
			} else {
				window.Draw.use_layer("blueprints");
				window.Draw.clear_box(x, y, tilesize, tilesize);
				if (this.blue_style == 'wall') {
					window.Draw.image(this.blue_wall_style, x, y);
				} else {
					window.Draw.image(this.blue_style, x, y);
				}
				window.Draw.image("blueprint2", x, y);
			}
		} else if (this.state == 1 || this.state == 2) { // building/removing something
			if (this.goal_style == 'wall') {
				window.Draw.use_layer("tiles");
				window.Draw.clear_box(x, y, tilesize, tilesize);
				window.Draw.image("wall_build", x, y);
				if (this.blue_style != this.goal_style) {
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					if (this.blue_style == 'empty') {
						window.Draw.image("blueprint3", x, y);
					} else {
						window.Draw.image(this.blue_style, x, y);
						window.Draw.image("blueprint1", x, y);
					}
				} else {
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image(this.blue_wall_style, x, y);
					window.Draw.image("blueprint4", x, y);
				}
			} else {
				window.Draw.use_layer("tiles");
				window.Draw.clear_box(x, y, tilesize, tilesize);
				window.Draw.image("tile_build", x, y);
				if (this.blue_style != this.goal_style) {
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					if (this.blue_style == 'wall') {
						window.Draw.image(this.blue_wall_style, x, y);
						window.Draw.image("blueprint1", x, y);
					} else if (this.blue_style == 'empty') {
						window.Draw.image(this.current_style, x, y);
						window.Draw.image('blueprint3', x, y);
					} else {
						window.Draw.image(this.blue_style, x, y);
						window.Draw.image("blueprint1", x, y);
					}
				} else {
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image(this.blue_style, x, y);
					window.Draw.image("blueprint4", x, y);
				}
			}
		} else if (this.state == 3) { // tile is built
			if (this.current_style == 'wall') {
				window.Draw.use_layer("tiles");
				window.Draw.clear_box(x, y, tilesize, tilesize);
				window.Draw.image(this.wall_style, x, y);
				if (this.blue_style != this.goal_style) {
					if (this.blue_style == 'empty') {
						window.Draw.use_layer("blueprints");
						window.Draw.clear_box(x, y, tilesize, tilesize);
						window.Draw.image(this.wall_style, x, y);
						window.Draw.image("blueprint3", x, y);
						if (!this.valid) {
							window.Draw.image("blueprint2", x, y);
						}
					} else {
						window.Draw.use_layer("blueprints");
						window.Draw.clear_box(x, y, tilesize, tilesize);
						window.Draw.image(this.blue_style, x, y);
						if (this.valid) {
							window.Draw.image("blueprint1", x, y);
						} else {
							window.Draw.image("blueprint2", x, y);
						}
					}
				} else { // both goal and blueprint are walls
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image(this.blue_wall_style, x, y);
					window.Draw.image("blueprint4", x, y);
				}
			} else {
				window.Draw.use_layer("tiles");
				window.Draw.clear_box(x, y, tilesize, tilesize);
				window.Draw.image(this.current_style, x, y);
				if (this.blue_style != this.goal_style) {
					if (this.blue_style == 'empty') {
						window.Draw.use_layer("blueprints");
						window.Draw.clear_box(x, y, tilesize, tilesize);
						window.Draw.image(this.current_style, x, y);
						window.Draw.image("blueprint3", x, y);
						if (!this.valid) {
							window.Draw.image("blueprint2", x, y);
						}
					} else if (this.blue_style == 'wall') {
						window.Draw.use_layer("blueprints");
						window.Draw.clear_box(x, y, tilesize, tilesize);
						window.Draw.image(this.blue_wall_style, x, y);
						if (this.valid) {
							window.Draw.image("blueprint1", x, y);
						} else {
							window.Draw.image("blueprint2", x, y);
						}
					} else {
						window.Draw.use_layer("blueprints");
						window.Draw.clear_box(x, y, tilesize, tilesize);
						window.Draw.image(this.blue_style, x, y);
						if (this.valid) {
							window.Draw.image("blueprint1", x, y);
						} else {
							window.Draw.image("blueprint2", x, y);
						}
					}
				} else {
					window.Draw.use_layer("blueprints");
					window.Draw.clear_box(x, y, tilesize, tilesize);
					window.Draw.image(this.blue_style, x, y);
					window.Draw.image("blueprint4", x, y);
				}
			}
		}
	}
	
	// returns true if the tile is currently a wall that is built
	Tile.prototype.is_wall = function(blues) {
		if (blues) {
			return (this.state == 3 && this.current_style == 'wall' && this.blue_style == 'wall')
		} else {
			return (this.state == 3 && this.current_style == 'wall');
		}
	}
	
	// returns true if the tile is currently a floor that is built
	Tile.prototype.is_floor = function(blues) {
		if (blues) {
			return (this.state == 3 && this.current_style == this.blue_style && this.current_style != 'wall');
		} else {
			return (this.state == 3 && this.current_style != 'wall');
		}
	}
	
	// draw the shadows for this tile
	Tile.prototype.draw_shadows = function() {
	
		if ((this.goal_style != 'wall' && this.goal_style != 'empty')) {
			var neighbors = window.Map.get_neighbors('tiles', this.x, this.y);
			var tilesize = window.Map.tilesize;
			var x = this.x * tilesize;
			var y = this.y * tilesize;
			window.Draw.use_layer("wall_shadows");
			window.Draw.clear_box(x, y, tilesize, tilesize);
			var walls = [];
			for (i = 0; i < neighbors.length; i++) {
				if (neighbors[i] != 0) {
					if (neighbors[i].state == 3 && neighbors[i].current_style == 'wall') {
						walls.push(true);
					} else {
						walls.push(false);
					}
				} else {
					walls.push(false);
				}
				
			}
			
			// check top
			if (walls[1]) {
				window.Draw.image('shadow_1', x, y);
			}
			
			// check right
			if (walls[3]) {
				window.Draw.image('shadow_4', x, y);
			}
			
			// check bottom
			if (walls[5]) {
				window.Draw.image('shadow_3', x, y);
			}
			
			// check left
			if (walls[7]) {
				window.Draw.image('shadow_2', x, y);
			}
			
			// top and right
			if (walls[1] && walls[3]) {
				window.Draw.image('shadow_9', x, y);
			} else if (!walls[1] && !walls[3] && walls[2]) {
				window.Draw.image('shadow_8', x, y);
			}
			
			// right and bottom
			if (walls[3] && walls[5]) {
				window.Draw.image('shadow_10', x, y);
			} else if (!walls[3] && !walls[5] && walls[4]) {
				window.Draw.image('shadow_5', x, y);
			}
			
			// bottom and left
			if (walls[5] && walls[7]) {
				window.Draw.image('shadow_11', x, y);
			} else if (!walls[5] && !walls[7] && walls[6]) {
				window.Draw.image('shadow_6', x, y);
			}
			
			// left and top
			if (walls[7] && walls[1]) {
				window.Draw.image('shadow_12', x, y);
			} else if (!walls[7] && !walls[1] && walls[0]) {
				window.Draw.image('shadow_7', x, y);
			}
		
		} else {
			window.Draw.use_layer("wall_shadows");
			var tilesize = window.Map.tilesize;
			var x = this.x * tilesize;
			var y = this.y * tilesize;
			window.Draw.clear_box(x, y, tilesize, tilesize);
		}	
	}	
}

window.Tiles = {
	init: function() {
		this.edit_mode = false; // blueprint mode = true, view mode = false
		this.edit_style = 'corridor'; // current cursor type
		
		this.wall_set = 'chunky 2'; // the folder holding the wall images
		this.shad_set = 'plain'; // the folder holding the shadow images
		
		this.dragging = false; // is the mouse being clicked/dragged?
		this.start_tile = [0,0];
		
		this.under_construction = []; // an array of all tiles currently in need of construction
		this.live_tiles = []; // an array of all tiles (used when doing any operation on all active tiles)
		this.invalid_tiles = []; //  a list of all invalid tiles (used when confirming blueprint orders)
		
		this.wall_styles = {
			// 1
			12: 1,
			14: 1,
			6: 1,
			//10: 1,
			4: 1,
			// 2
			56: 2,
			//40: 2,
			16: 2,
			24: 2,
			48: 2,
			// 3
			224: 3,
			//160: 3,
			64: 3,
			96: 3,
			192: 3,
			// 4
			386: 4,
			//130: 4,
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
			//264: 9,
			//392: 9,
			398: 9,
			396: 9,
			//140: 9,
			262: 9,
			390: 9,
			270: 9,
			388: 9,
			//132: 9,
			268: 9,
			//138: 9,
			//134: 9,
			394: 9,
			//266: 9,
			//142: 9,
			// 10
			28: 10,
			20: 10,
			//18: 10,
			//38: 10,
			62: 10,
			54: 10,
			//50: 10,
			30: 10,
			60: 10,
			22: 10,
			//36: 10,
			52: 10,
			//42: 10,
			//26: 10,
			//46: 10,
			//44: 10,
			//58: 10,
			// 11
			112: 11,
			80: 11,
			//72: 11,
			//152: 11,
			248: 11,
			216: 11,
			//200: 11,
			120: 11,
			240: 11,
			88: 11,
			//144 : 11,
			208: 11,
			//168: 11,
			//104: 11,
			//184: 11,
			//176: 11,
			//232: 11,
			// 12
			448: 12,
			320: 12,
			//288: 12,
			//98: 12,
			482: 12,
			354: 12,
			//290: 12,
			480: 12,
			450: 12,
			352: 12,
			//66: 12,
			322: 12,
			//162: 12,
			//416: 12,
			//226: 12,
			//194: 12,
			//418: 12,
			// 13
			136: 13,
			// 14
			34: 14,
			// 15
			442: 15,
			314: 15,
			410: 15,
			282: 15,
			434: 15,
			306: 15,
			402: 15,
			274: 15,
			440: 15,
			312: 15,
			408: 15,
			280: 15,
			432: 15,
			304: 15,
			400: 15,
			272: 15,
			// 16
			238: 16,
			110: 16,
			206: 16,
			78: 16,
			230: 16,
			102: 16,
			198: 16,
			70: 16,
			236: 16,
			108: 16,
			204: 16,
			76: 16,
			228: 16,
			100: 16,
			196: 16,
			68: 16,
			// 18
			254: 18,
			246: 18,
			214: 18,
			222: 18,
			92: 18,
			124: 18,
			84: 18,
			116: 18,
			252: 18,
			220: 18,
			244: 18,
			212: 18,
			126: 18,
			94: 18,
			118: 18,
			86: 18,
			// 19
			494: 19,
			364: 19,
			366: 19,
			492: 19,
			486: 19,
			484: 19,
			356: 19,
			358: 19,
			462: 19,
			460: 19,
			332: 19,
			334: 19,
			454: 19,
			452: 19,
			324: 19,
			326: 19,
			// 20
			446: 20,
			438: 20,
			436: 20,
			444: 20,
			318: 20,
			316: 20,
			308: 20,
			310: 20,
			414: 20,
			412: 20,
			406: 20,
			404: 20,
			286: 20,
			284: 20,
			278: 20,
			276: 20,
			// 21
			506: 21,
			378: 21,
			346: 21,
			474: 21,
			498: 21,
			466: 21,
			338: 21,
			370: 21,
			504: 21,
			376: 21,
			344: 21,
			472: 21,
			496: 21,
			464: 21,
			336: 21,
			368: 21,
			// 22
			426: 22,
			424: 22,
			296: 22,
			298: 22,
			// 23
			186: 23,
			178: 23,
			146: 23,
			154: 23,
			// 24
			234: 24,
			202: 24,
			74: 24,
			106: 24,
			// 25
			164: 25,
			174: 25,
			166: 25,
			172: 25,
			// 26
			430: 26,
			428: 26,
			302: 26,
			294: 26,
			422: 26,
			300: 26,
			292: 26,
			420: 26,
			// 27
			190: 27,
			182: 27,
			188: 27,
			156: 27,
			158: 27,
			148: 27,
			180: 27,
			150: 27,
			// 28
			250: 28,
			218: 28,
			242: 28,
			114: 28,
			122: 28,
			82: 28,
			210: 28,
			90: 28,
			// 29
			490: 29,
			362: 29,
			488: 29,
			456: 29,
			458: 29,
			330: 29,
			328: 29,
			360: 29,
			// 30
			170: 30,
			// 31
			160: 31,
			// 32
			10: 32,
			// 33
			40: 33,
			// 34
			130: 34,
			// 35
			134: 35,
			142: 35,
			140: 35,
			132: 35,
			// 36
			26: 36,
			58: 36,
			18: 36,
			50: 36,
			// 37
			416: 37,
			418: 37,
			288: 37,
			290: 37,
			// 38
			104: 38,
			232: 38,
			72: 38,
			200: 38,
			// 39
			266: 39,
			394: 39,
			392: 39,
			264: 39,
			// 40
			44: 40,
			46: 40,
			36: 40,
			38: 40,
			// 41
			194: 41,
			226: 41,
			98: 41,
			66: 41,
			// 42
			176: 42,
			184: 42,
			152: 42,
			144: 42,
			// 43
			138: 43,
			// 44
			162: 44,
			// 45
			42: 45,
			// 46
			168: 46
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
		for (var i = 0; i < 46; i++) {
			window.Draw.add_image('wall_base_' + (i+1), "./textures/walls/external/" + this.wall_set + '/wall_base_' + (i+1) + ".png");
		}
		
		// used in case the blueprint style isn't set properly
		window.Draw.add_image('wall', "./textures/walls/external/" + this.wall_set + "/wall_base_17.png");
		
		// load shadow images
		for (var i = 0; i < 12; i++) {
			window.Draw.add_image('shadow_' + (i+1), "./textures/walls/shadows/" + this.shad_set + '/shad_' + (i+1) + ".png");
		}
		
		// load blueprint images
		window.Draw.add_image('blueprint1', "./textures/ground/blueprint_build.png");
		window.Draw.add_image('blueprint2', "./textures/ground/blueprint_invalid.png");
		window.Draw.add_image('blueprint3', "./textures/ground/blueprint_remove.png");
		window.Draw.add_image('blueprint4', "./textures/ground/blueprint_built.png");
		
		// create map layers
		//window.Map.create_layer('tiles', 0);
		
		// create draw layers
		//window.Draw.create_layer('tiles', true);
		//window.Draw.create_layer('wall_shadows', true);
		//window.Draw.create_layer('blueprints', true);
	},
	
	show_blueprints: function(mode) { // true = blueprint mode, false = view mode
		if (mode) {
			this.edit_mode = true;
			console.log("Switching to blueprint view!");
			window.Draw.hide_layer("wall_shadows");
			window.Draw.show_layer("blueprints");
		} else {
			this.edit_mode = false;
			console.log("Switching to default view!");
			window.Draw.hide_layer("blueprints");
			window.Draw.show_layer("wall_shadows");
		}
	},
	
	confirm_blueprints: function() { // confirm all pending blueprints
		if (this.invalid_tiles.length == 0) {
			console.log("Player confirmed all pending blueprints. Total pending: " + this.live_tiles.length);
			for(var i = 0; i < this.live_tiles.length; i++) {
				this.live_tiles[i].confirm();
			}
			return true;
		} else {
			alert("Cannot confirm blueprints! Get rid of the invalid tiles first.");
			return false;
		}
	},
	
	cancel_blueprints: function() { // cancel all pending blueprints
		for(var t = 0; t < this.live_tiles.length; t) {
			if(!this.live_tiles[t].cancel()) { // tile wasn't removed (it's already built), skip over it
				t++;
			}
		}
		this.invalid_tiles = [];
	},
	
	keydown: function(e){ // called on keypress
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
				this.confirm_blueprints();
			}
		} else if (e.keyCode == 86) { // v
			if (this.edit_mode) {
				this.show_blueprints(false);
			} else {
				this.show_blueprints(true);
			}
		} else if (e.keyCode == 67) { // c
			this.cancel_blueprints();
		} else if (e.keyCode == 82) { // r
			this.edit_style = 'empty';
		}
	},
	
	mousedown: function(e) { // called on mouse click
		e.preventDefault();
		if (this.edit_mode && e.which == 1) {
			// get the tile the user clicked and save it for later
			this.start_tile = window.Events.tile_under_mouse;
			this.dragging = true;
		}
	},
	
	update: function(delta) {
		for (var i = 0; i < this.under_construction.length; i++) {
			this.under_construction[i].build(delta/4);
		}	
	},
	mouseup: function(e) { // called on mouse click released
		e.preventDefault();
		if (this.dragging && this.edit_mode && e.which == 1) {
			var end_tile = window.Events.tile_under_mouse;
			
			var top_left = [0, 0]; // top left corner of drag
			var bottom_right = [0, 0]; // bottom right corner of drag
			
			
			// determine the x coordinates for the top left tile and bottom right tile
			if (this.start_tile[0] < end_tile[0]) {
				top_left[0] = this.start_tile[0];
				bottom_right[0] = end_tile[0];
			} else {
				top_left[0] = end_tile[0];
				bottom_right[0] = this.start_tile[0];
			}
			
			// determine the y coordinates for the top left tile and bottom right tile
			if (this.start_tile[1] < end_tile[1]) {
				top_left[1] = this.start_tile[1];
				bottom_right[1] = end_tile[1];
			} else {
				top_left[1] = end_tile[1];
				bottom_right[1] = this.start_tile[1];
			}
			
			// place the tiles in the box
			for (var i = top_left[0]; i <= bottom_right[0]; i++) {
				for (var j = top_left[1]; j <= bottom_right[1]; j++) {
					var t = window.Map.get('tiles', i, j);
					
					if (t == 0) { // if the tile does not exist, make one and set the blueprint to edit_style
						if (this.edit_style != 'empty') {
							t = new Tile(i, j);
							window.Map.set('tiles', i, j, t);
							t.set_blueprint(this.edit_style);
						}
					} else {
						t.set_blueprint(this.edit_style);
					}
				}
			}		
			this.dragging = false;
		}
	}
}

$(window).ready( function() {
	window.Tiles.init();
	window.Draw.persistant_layers['wall_shadows'].css('z-index',99999);
});

