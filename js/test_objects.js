$(window).ready(function() {
	
	
	obj_placeable = (function(_super) {

		__extends(obj_placeable, _super);

		function obj_placeable() {
		  return obj_placeable.__super__.constructor.apply(this, arguments);
		}

		obj_placeable.setup = function() {
			this.path_array = []; // how this object affects the pathing array
			this.sprite_img = '';
			this.x = -1;
			this.y = -1;
			this.placed = false;
		}
		
		// is the object in a suitable locaiton to be built?
		// should be overwritten by subclasses
		obj_placeable.prototype.blueprint_check = function() {
			return false;
		}
		
		obj_placeable.prototype.update_location(x, y) {
			if (this.x != x && this.y != y) {
				this.x = x;
				this.y = y;
				this.draw();
			}
		}
		
		obj_placeable.prototype.place(x, y) {
			this.x = x;
			this.y = y;
			this.placed = true;
			this.init();
			this.draw();
		}
		
		// overwrite
		obj_placeable.prototype.draw() {
			return;			
		}
		
		return obj_placeable;
	})(Thing);
	
	
	obj_crate = (function(_super) {

		__extends(obj_crate, _super);

		function obj_crate() {
		  return obj_crate.__super__.constructor.apply(this, arguments);
		}

		obj_crate.setup = function() {
			this.path_array = [1]; // how this object affects the pathing array
			this.sprite_img = 'crate_closed';
		}
		
		obj_crate.prototype.blueprint_check = function() {
			return window.Maps.get("objects", this.x, this.y) == 0;
		}
		
		obj_crate.prototype.draw() {
			if (this.placed
			
			
		}
		
		
		return obj_crate;
	})(Thing);
	
});