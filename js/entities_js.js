
(function() {
	var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
	__hasProp = {}.hasOwnProperty,
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };


	$(window).ready(function() {
		
		Entity = window.Entities.classes.Entity
		
		Thing = (function(_super) {

			__extends(Thing, _super);

			Thing.name = 'Thing';

			function Thing() {
				Thing.__super__.constructor.apply(this, arguments);
				this.world_coords = []; // top left corner, in world coordinates
				this.layout = []; // 2d layout of this object
				this.placable = false;
				this.placed = false; // if this object has been placed yet
			}
			
			// draw this to the map
			// should be updated
			Thing.prototype.draw = function() {
				if (this.placed && this.layout != []) {
					
					var width = this.layout[0].length;
					var height = this.layout.length;
					var t_size = window.Map.tilesize;
					
					window.Draw.use_layer('objects');
					window.Draw.image(this.image, this.world_coords[0] * t_size, this.world_coords[1] * t_size, width * t_size, height * t_size);
					window.Draw.draw_box(this.world_coords[0] * t_size, this.world_coords[1] * t_size, width * t_size, height * t_size);
					return true;
				} else {
					return false; // nothing to draw
				}
			}	
			
			 // convert local coordinates to world coordinates
			Thing.prototype.local_to_world = function(local) {
				return [this.world_coords[0] + local[0], this.world_coords[1] + local[1]];
			}

			// convert world coordinates to local coordinates
			Thing.prototype.world_to_local = function(world) {
				return [world[0] - this.world_coords[0], world[1] - this.world_coords[1]];
			}

			// attach this object's layout to the correct world maps
			Thing.prototype.apply_layout = function() {
				if (this.layout != []) {
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
				}
				return false;
			}

			// check if it can be placed at given location
			Thing.prototype.check_clear = function(location) {
				if (this.layout) {
					for (var i = 0; i < this.layout.length; i++) {
						for (var j = 0; j < this.layout[i].length; j++) {
							var coords = [location[0] + i, location[1] + j];
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
			Thing.prototype.place = function(location) {
				if (this.check_clear(location)) {
					this.world_coords = location;
					this.placed = this.apply_layout();
					
					if (this.placed) {
						this.draw();
						return true
					}
				}
				return false;
			}
			
			return Thing;
			
		})(Entity); 
		
		Crater_Small = (function(_super) {
			
			__extends(Crater_Small, _super);
			
			Crater_Small.name = 'Crater_Small';
			
			function Crater_Small(coords) {
				Crater_Small.__super__.constructor.apply(this, arguments);
				this.layout = [[1, 1, 1],
							   [1, 1, 1],
							   [1, 1, 1]];
				this.image = 'crater_small';
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
				this.layout = [[0, 1, 1, 1, 0],
							   [1, 1, 1, 1, 1],
							   [1, 1, 1, 1, 1],
							   [1, 1, 1, 1, 1],
							   [0, 1, 1, 1, 0]];
				this.image = 'crater_large';
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
				this.image = 'derpifier';
				if (coords) {
					return this.place(coords);
				}
				return true;
			}
			
			return Derpifier;
		})(Thing);
		
		
		window.Draw.add_image('crater_small', "./textures/ground/crater_small.png");
		window.Draw.add_image('crater_medium', "./textures/ground/crater_medium.png");
		window.Draw.add_image('crater_large', "./textures/ground/crater_large.png");
		window.Draw.add_image('derpifier', "./textures/objects/derpifier.png");
		
		window.Entities.classes.Thing = Thing;
		window.Entities.classes.Crater_Small = Crater_Small
		window.Entities.classes.Crater_Medium = Crater_Medium
		window.Entities.classes.Crater_Large = Crater_Large
		window.Entities.classes.Derpifier = Derpifier;
		
	
	});
}).call(this);

