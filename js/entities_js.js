

$(window).ready(function() {


	DThing = window.Entities.add_class('DThing', 'Thing');

	DThing.prototype.init = function() {
		this.world_coords = []; // top left corner, in world coordinates
		this.layout = []; // 2d layout of this object
		this.tag_loc = [0, 0]; // location relative to layout, where the tag goes
		
		this.ghost_loc = false; // show object ghost
		this.ghost_rot = 1; // represents the rotation of the ghost
		this.ghost_layout = this.layout;
		
		this.moveable = false; // can the colonists move this object?
		this.buildable = false; // can the colonists build this object?
		this.removable = false; // can the astronauts remove this object?
		this.selectable = true; // can this object be selected?
		this.rotatable = true; // can this object be rotated?
		
		this.rotation = 1; // represents the rotation
		
		this.placed = false; // if this object has been placed yet
		this.name = 'Plain Thingy';
		this.setup();
		return this;
	}
	
	DThing.prototype.setup = function() {
		console('wrong one fool');
	}
	
	// draw this to the map
	// should be updated
	DThing.prototype.draw = function() {
		if (this.ghost_loc) {
			this.draw_ghost(this.ghost_loc);
		}
		if (this.placed && this.layout != []) {
			
			var width = this.layout[0].length;
			var height = this.layout.length;
			var t_size = window.Map.tilesize;
			
			window.Draw.use_layer('objects');
			var r = this.get_rot(this.rotation);
			return (window.Draw.image(this.image, this.world_coords[0] * t_size, this.world_coords[1] * t_size, width * t_size, height * t_size, r, .75));
			
		} else if (!this.placed && this.layout != []) {
			window.Draw.use_layer('objects');
			var t_size = window.Map.tilesize;
			
			for (var i = 0; i < this.layout.length; i++) {
				for (var j = 0; j < this.layout[i].length; j++) {
					var coords = this.local_to_world([j, i]);
					window.Draw.use_layer('objects');
					if (this.layout[i][j] != 0) { // non-empty square
						window.Draw.clear_box(coords[0] * t_size, coords[1] * t_size, t_size, t_size);
					}
				}
			}
			
		} else {
			return false; // nothing to draw
		}
	}
	
	DThing.prototype.get_rot = function(rot) {
		if (rot == 2) {
			return Math.PI/2;
		} else if (rot == 3) {
			return Math.PI;
		} else if (rot == 4) {
			return Math.PI * 1.5;
		} else {
			return 0;
		}
		
	}
	
	// draw a ghost of this object at given location
	DThing.prototype.draw_ghost = function(location) {
		this.ghost_loc = location;
		if (this.ghost_layout != []) {
			var width = this.layout[0].length;
			var height = this.layout.length;
			var t_size = window.Map.tilesize;
			
			window.Draw.use_layer('entities');
			var r = this.get_rot(this.ghost_rot);
			return (window.Draw.image(this.image, this.ghost_loc[0] * t_size, this.ghost_loc[1] * t_size, width * t_size, height * t_size, r, .5));
		}
	}
	
	// add a tag to this object
	DThing.prototype.draw_tag = function(type) {
		this.remove_tag();
		if (type == 'move') {
			var t_size = window.Map.tilesize;
			var loc = [(this.world_coords[0] + this.tag_loc[0]) * t_size, (this.world_coords[1] + this.tag_loc[1]) * t_size];
			window.Draw.use_layer('tags');
			window.Draw.image('tag_move', loc[0], loc[1], t_size, t_size);
			if (this.ghost_loc) {
				var loc = [(this.ghost_loc[0] + this.tag_loc[0]) * t_size, (this.ghost_loc[1] + this.tag_loc[1]) * t_size];
				window.Draw.image('tag_move', loc[0], loc[1], t_size, t_size);
			}
		} else if (type == 'remove') {
			var t_size = window.Map.tilesize;
			var loc = [(this.world_coords[0] + this.tag_loc[0]) * t_size, (this.world_coords[1] + this.tag_loc[1]) * t_size];
			window.Draw.use_layer('tags');
			window.Draw.image('tag_remove', loc[0], loc[1], t_size, t_size);
		}
		
		
	}
	
	// method might not be needed
	DThing.prototype.remove_tag = function() {
		var t_size = window.Map.tilesize;
		var loc = [(this.world_coords[0] + this.tag_loc[0]) * t_size, (this.world_coords[1] + this.tag_loc[1]) * t_size];
		window.Draw.use_layer('tags');
		window.Draw.clear_box(loc[0], loc[1], t_size, t_size);
		if (this.ghost_loc) {
			var loc = [(this.ghost_loc[0] + this.tag_loc[0]) * t_size, (this.ghost_loc[1] + this.tag_loc[1]) * t_size];
			window.Draw.clear_box(loc[0], loc[1], t_size, t_size);
		}
	}
	
	DThing.prototype.get_layout = function(rot) {
		if (!rot) {
			rot = this.rotation;
		}
		if (rot == 1) { // 0 degrees
			return this.layout;
		} else if (rot == 2) { // 90 degrees
			return this.layout.transpose().reverse_rows();
		} else if (rot == 3) { // 180 degrees
			return this.layout.reverse_rows().reverse_cols();
		} else if (rot == 4) { // 270 degrees
			return this.layout.transpose().reverse_cols();
		}
	}
	
	 // convert local coordinates to world coordinates
	DThing.prototype.local_to_world = function(local, world) {
		if (world == undefined) {
			world = this.world_coords;
		}
		return [world[0] + local[0], world[1] + local[1]];
	}

	// convert world coordinates to local coordinates
	DThing.prototype.world_to_local = function(world) {
		return [world[0] - this.world_coords[0], world[1] - this.world_coords[1]];
	}

	// attach this object's layout to the correct world maps
	DThing.prototype.apply_layout = function(location, rot) {
		if (!location) {
			location = this.world_coords;
		}
		if (!rot) {
			rot = this.rotation;
		}
		var rot_layout = this.get_layout(rot);
		if (rot_layout != []) {
			if (this.placed) {
				for (var i = 0; i < rot_layout.length; i++) {
					for (var j = 0; j < rot_layout[i].length; j++) {
						var coords = this.local_to_world([j, i], location);
						if (rot_layout[i][j] == 1) { // collision and placement
							window.Map.push('objects', coords[0], coords[1], this);
							window.Map.set('pathfinding', coords[0], coords[1], 1);
						} else if (rot_layout[i][j] != 0) {
							window.Map.push('objects', coords[0], coords[1], this);
						}
					}
				}
				return true;
			} else {
				for (var i = 0; i < this.layout.length; i++) {
					for (var j = 0; j < this.layout[i].length; j++) {
						var coords = this.local_to_world([j, i]);
						if (this.layout[i][j] == 1) { // collision and placement
							window.Map.remove('objects', coords[0], coords[1], this);
							window.Map.set('pathfinding', coords[0], coords[1], 0);
						} else if (this.layout[i][j] != 0) {
							window.Map.remove('objects', coords[0], coords[1], this);
						}
					}
				}
				return true;
			}
		}
		return false;
	}
	
	// check if it can be placed at given location
	DThing.prototype.check_clear = function(location, rot_layout) {
		if (rot_layout == 'undefined') {
			rot_layout = this.layout;
		}
		if (rot_layout) {
			
			for (var i = 0; i < rot_layout.length; i++) {
				for (var j = 0; j < rot_layout[i].length; j++) {
					var coords = [location[0] + j, location[1] + i];
					if (rot_layout[i][j] != 0) {
						var ob = window.Map.get('objects', coords[0], coords[1]);
						if (ob != 0) { // an object already exists here
							if (!window.Map.contains('objects', coords[0], coords[1], this)) {
								return false;
							}
						}
					}
				}
			}
		}
		return true;
	}

	// place this object at a given location
	DThing.prototype.place = function(location, rotation) {
		if (rotation) {
			this.rotation = rotation;
		}
		if (this.check_clear(location, this.rotation)) {
			this.world_coords = location;
			this.placed = true;
			if (this.apply_layout(location, rotation)) {
				this.attach_to_map();
				return true
			} else {
				this.world_coords = [];
				this.placed = false;
			}
		}
		return false;
	}
	
	// remove the object
	DThing.prototype.remove = function() {
		var p = this.placed;
		this.placed = false;
		if (this.apply_layout()) {
			this.needs_draw = true;
			this.draw();
			this.detach_from_map();
			return true;
		}
		this.placed = p;
		return false;
	}
	
	Crater_Small = window.Entities.add_class('Crater_Small', 'DThing');
	
	Crater_Small.prototype.setup = function() {
		this.name = 'Small Crater';
		this.image = 'crater_small';
		this.tag_loc = [1, 1];
		this.layout = [[1, 1, 1],
					   [1, 1, 1],
					   [1, 1, 1]];
	}
	

	Derpifier = window.Entities.add_class('Derpifier', 'DThing');
	
	Derpifier.prototype.setup = function() {
		this.name = 'Derpifier';
		this.image = 'derpifier';
		this.moveable = true;
		this.buildable = true;
		this.removable = true;
		this.selectable = true;
		this.tag_loc = [0, 0];
		this.layout = [[1, 0, 0, 2],
					   [1, 1, 1, 2]];
	}
	
	
	Air_Vent = window.Entities.add_class('Air_Vent', 'DThing');
	
	Air_Vent.prototype.setup = function() {
		this.name = 'Air Vent';
		this.image = 'air_vent';
		this.moveable = true;
		this.buildable = true;
		this.removable = true;
		this.selectable = true;
		this.layout = [[2]];
	}
	
	Air_Vent.prototype.check_clear = function(location) {
		
	}
	
	window.Draw.add_image('rock', "./textures/ground/crater_small.png");
	window.Draw.add_image('crater_small', "./textures/ground/crater_small.png");
	window.Draw.add_image('crater_medium', "./textures/ground/crater_medium.png");
	window.Draw.add_image('crater_large', "./textures/ground/crater_large.png");
	window.Draw.add_image('derpifier', "./textures/objects/derpifier.png");
	window.Draw.add_image('air_vent', "./textures/objects/air_vent.png");
	
	window.Draw.add_image('tag_move', "./textures/UI/tag_move.png");
	window.Draw.add_image('tag_build', "./textures/UI/tag_build.png");
	window.Draw.add_image('tag_remove', "./textures/UI/tag_remove.png");

});

