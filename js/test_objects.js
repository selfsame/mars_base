$(window).ready(function() {
	
	obj_placeable = window.Entities.add_class('obj_placeable');
	
	
	obj_placeable.setup = function() {
		this.path_array = []; // how this object affects the pathing array
		this.sprite_img = '';
	}
	
	
	// is the object in a suitable locaiton to be built?
	obj_placeable.prototype.blueprint_check = function() {
		return false;
	}
	
	// create a new class with an ancestor
	crate_closed = window.Entities.add_class('crate_closed', 'obj_placeable');

	// adding a method to the new class
	crate_closed.prototype.setup = function() {
	  this.footprint_img = 'crate_closed';
	  
	};

	// creating an instance, and adding it to the list of entities that get updated.
	//spirit = new Rover('Spirit', 'spirit', [900,1000]);
	//spirit.setup();
});