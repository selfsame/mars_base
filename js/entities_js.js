

$(window).ready(function() {
	
	DThing = window.Entities.add_class('DThing', 'Thing');


	


	DThing.prototype.init = function() {
		this.attach_to_map();
		this.world_coords = []; // top left corner, in world coordinates
		this.layout = []; // 2d layout of this object
		this.placable = false;
		this.placed = false; // if this object has been placed yet
		this.name = 'Thing';
	}
	
	// draw this to the map
	// should be updated
	
	
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
							window.Map.set('pathfinding', coords[0], coords[1], 1);
							window.Map.set('objects', coords[0], coords[1], this);
						} else if (this.layout[i][j] != 0) {
							window.Map.set('objects', coords[0], coords[1], this);
						}
					}
				}
				return true;
			} else {
				for (var i = 0; i < this.layout.length; i++) {
					for (var j = 0; j < this.layout[i].length; j++) {
						var coords = this.local_to_world([j, i]);
						if (this.layout[i][j] == 1) { // collision and placement
							window.Map.set('pathfinding', coords[0], coords[1], 0);
							window.Map.set('objects', coords[0], coords[1], 0);
						} else if (this.layout[i][j] != 0) {
							window.Map.set('objects', coords[0], coords[1], 0);
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
				this.draw();
				return true
			} else {
				this.world_coords = [];
				this.placed = false;
			}
		}
		return false;
	}
	

	crater_small = new DThing('crater', 'crater_small', [ 20,40 ]);
	crater_small.layout = [[1, 1, 1],
						   [1, 1, 1],
						   [1, 1, 1]];
		
	console.log( crater_small );

	

	
	/*Crater_Small = (function(_super) {
		
		__extends(Crater_Small, _super);
		
		Crater_Small.name = 'Crater_Small';
		
		function Crater_Small(coords) {
			Crater_Small.__super__.constructor.apply(this, arguments);
			this.layout = [[1, 1, 1],
						   [1, 1, 1],
						   [1, 1, 1]];
			this.image = 'crater_small';
			this.name = 'Small Crater'
			if (coords) {
				return this.place(coords);
			}
			return true;
		}
		
		return Crater_Small;
	})(Thing);
	
	Crater_Medium = (function(_super) {
		
		__extends(Crater_Medium, _super);
		
		Crater_Medium.name = 'Crater_Small';
		
		function Crater_Medium(coords) {
			Crater_Medium.__super__.constructor.apply(this, arguments);
			this.layout = [[2, 1, 1, 2],
						   [1, 1, 1, 1],
						   [1, 1, 1, 1],
						   [2, 1, 1, 2]];
			this.image = 'crater_medium';
			this.name = 'Medium Crater'
			if (coords) {
				return this.place(coords);
			}
			return true;
		}
		
		return Crater_Medium;
	})(Thing);
	
	Crater_Large = (function(_super) {
		
		__extends(Crater_Large, _super);
		
		Crater_Large.name = 'Crater_Large';
		
		function Crater_Large(coords) {
			Crater_Large.__super__.constructor.apply(this, arguments);
			this.layout = [[2, 1, 1, 1, 2],
						   [1, 1, 1, 1, 1],
						   [1, 1, 1, 1, 1],
						   [1, 1, 1, 1, 1],
						   [2, 1, 1, 1, 2]];
			this.image = 'crater_large';
			this.name = 'Large Crater'
			if (coords) {
				return this.place(coords);
			}
			return true;
		}
		
		return Crater_Large;
	})(Thing);
	
	Derpifier = (function(_super) {
		
		__extends(Derpifier, _super);
		
		Derpifier.name = 'Derpifier';
		
		function Derpifier(coords) {
			Derpifier.__super__.constructor.apply(this, arguments);
			this.layout = [[1, 0, 0, 2],
						   [1, 1, 1, 2]];
			this.name = 'Derpifier'
			this.image = 'derpifier';
			if (coords) {
				return this.place(coords);
			}
			return true;
		}
		
		return Derpifier; */


	window.Draw.add_image('rock', "./textures/ground/crater_small.png");
	window.Draw.add_image('crater_small', "./textures/ground/crater_small.png");
	window.Draw.add_image('crater_medium', "./textures/ground/crater_medium.png");
	window.Draw.add_image('crater_large', "./textures/ground/crater_large.png");
	window.Draw.add_image('derpifier', "./textures/objects/derpifier.png");
	


});

