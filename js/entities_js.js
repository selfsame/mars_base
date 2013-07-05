

$(window).ready(function() {


	DThing = window.Entities.add_class('DThing', 'Thing');

	DThing.prototype.init = function() {
		this.world_coords = []; // top left corner, in world coordinates
		this.layout = []; // 2d layout of this object
		this.tag_loc = [0, 0]; // location relative to layout, where the tag goes
		
		this.moveable = false; // can the colonists move this object?
		this.buildable = false; // can the colonists build this object?
		this.removable = false; // can the astronauts remove this object?
		this.selectable = true; // can this object be selected?
		
		
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
		if (this.placed && this.layout != []) {
			
			var width = this.layout[0].length;
			var height = this.layout.length;
			var t_size = window.Map.tilesize;
			
			window.Draw.use_layer('objects');
			return (window.Draw.image(this.image, this.world_coords[0] * t_size, this.world_coords[1] * t_size, width * t_size, height * t_size));
			//window.Draw.draw_box(this.world_coords[0] * t_size, this.world_coords[1] * t_size, width * t_size, height * t_size);
			
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
	
	// add a tag to this object
	DThing.prototype.add_tag = function(type) {
		return true;
	}
	
	 // convert local coordinates to world coordinates
	DThing.prototype.local_to_world = function(local) {
		return [this.world_coords[0] + local[0], this.world_coords[1] + local[1]];
	}

	// convert world coordinates to local coordinates
	DThing.prototype.world_to_local = function(world) {
		return [world[0] - this.world_coords[0], world[1] - this.world_coords[1]];
	}

	// attach this object's layout to the correct world maps
	DThing.prototype.apply_layout = function() {
		if (this.layout != []) {
			if (this.placed) {
				for (var i = 0; i < this.layout.length; i++) {
					for (var j = 0; j < this.layout[i].length; j++) {
						var coords = this.local_to_world([j, i]);
						if (this.layout[i][j] == 1) { // collision and placement
							window.Map.push('objects', coords[0], coords[1], this);
							window.Map.set('pathfinding', coords[0], coords[1], 1);
						} else if (this.layout[i][j] != 0) {
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
	DThing.prototype.check_clear = function(location) {
		if (this.layout) {
			
			for (var i = 0; i < this.layout.length; i++) {
				for (var j = 0; j < this.layout[i].length; j++) {
					var coords = [location[0] + j, location[1] + i];
					if (this.layout[i][j] != 0) {
						var ob = window.Map.get('objects', coords[0], coords[1]);
						if (ob != 0) { // an object already exists here
							return false;
						}
					}
				}
			}
		}
		return true;
	}

	// place this object at a given location
	DThing.prototype.place = function(location) {
		if (this.check_clear(location)) {
			this.world_coords = location;
			this.placed = true;
			if (this.apply_layout()) {
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
		this.tag_loc = [0, 0];
		this.layout = [[1, 0, 0, 2],
					   [1, 1, 1, 2]];
	}

	window.Draw.add_image('rock', "./textures/ground/crater_small.png");
	window.Draw.add_image('crater_small', "./textures/ground/crater_small.png");
	window.Draw.add_image('crater_medium', "./textures/ground/crater_medium.png");
	window.Draw.add_image('crater_large', "./textures/ground/crater_large.png");
	window.Draw.add_image('derpifier', "./textures/objects/derpifier.png");
	


});

