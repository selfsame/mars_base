
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
				this.placed = false; // if this object has been placed yet
			}
			
			// draw this to the map
			// should be updated
			Thing.prototype.draw = function() {
				if (this.placed && this.layout != []) {
					
					var width = this.layout.length;
					var height = this.layout[0].length;
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
							var coords = this.local_to_world([i, j]);
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
							var coords = [location[0] + this.layout[0], location[1] + this.layout[1]];
							if (this.layout[i][j] != 0) {
								var ob = window.Map.get('objects', coords[0], coords[1]);
								if (ob) { // an object already exists here
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
		
		window.Draw.add_image('crater_small', "./textures/ground/crater_small.png");
		window.Draw.add_image('crater_medium', "./textures/ground/crater_medium.png");
		window.Draw.add_image('crater_large', "./textures/ground/crater_large.png");
		
		window.Entities.classes.Thing = Thing;
		window.Entities.classes.Crater_Small = Crater_Small
		//window.Entities.classes.Derpifier = Derpifier;
		
	
	});
}).call(this);

