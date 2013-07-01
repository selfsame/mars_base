

$(window).ready(function() {

	// add some rocks
	Rock = window.Entities.add_class('Rock', 'Thing');

	// adding a method to the new class
	Rock.prototype.setup = function() {
	  window.Map.set("pathfinding", this.tile_pos[0], this.tile_pos[1], 1);
	  this.no_path = false;
	  
	};

	Crater = window.Entities.add_class('Crater', 'Thing');

	// adding a method to the new class
	Crater.prototype.setup = function() {
	  window.Map.set("pathfinding", this.tile_pos[0], this.tile_pos[1], 1);
	};
	
	Crater.prototype.init = function() {
		this.no_path = false;
		this.sprite_size = 128;
		this.grid_area = [0, 3, 0, 3];
		this.setup();
		return this.attach_to_map([this.tile_pos[0], this.tile_pos[1]]);
	}


	window.Map.generate();

  
  


});


