window.Blueprints = {
	toggle: function(name, x, y) {
		tile = window.Map.get(name, x, y);
		if (tile == 0) {
			neighbors = window.Map.get_immediate_neighbors(name, x, y);
			value = this.check_clear(neighbors);
			this.set_value(name, x, y, value);
			if(value == 1 || value == 2) {
				this.check_square(name, x, y);
			}
		} else if (tile == 1) {
			this.set_value(name, x, y, 0);
			this.check_neighbors(name, x, y);
		} else {
			this.set_value(name, x, y, 0);
		}
	},
	set_value: function(name, x, y, value) {
		current = window.Map.get(name, x, y);
		if (current != value) {
			window.Map.set(name, x, y, 0);
			window.Map.draw_blueprint_tile(name, x, y);
			window.Map.set(name, x, y, value);
			window.Map.draw_blueprint_tile(name, x, y);
			//this.get_exterior_walls(name, x, y);
		}
	},
	check_clear: function(neighbors) {
	
		// THIS IS WHERE IT CHECKS FOR OBSTACLES
		
		// check if it's on the map edge, or over an obstacle
		if(neighbors.indexOf(undefined) != -1) {
			return 3;
		} else {
			return 2;
		}
	},
	demote_square: function(name, x, y) {
		value = window.Map.get(name, x, y);
		if (value == 1) {
			this.set_value(name, x, y, 2);
		}
	},
	check_neighbors: function(name, x, y) {
		if(!this.check_square(name, x-1, y-1)) {
			this.demote_square(name, x-1, y-1);
		}
		if(!this.check_square(name, x, y-1)) {
			this.demote_square(name, x, y-1);
		}
		if(!this.check_square(name, x+1, y-1)) {
			this.demote_square(name, x+1, y-1);
		}
		if(!this.check_square(name, x+1, y)) {
			this.demote_square(name, x+1, y);
		}
		if(!this.check_square(name, x+1, y+1)) {
			this.demote_square(name, x+1, y+1);
		}
		if(!this.check_square(name, x, y+1)) {
			this.demote_square(name, x, y+1);
		}
		if(!this.check_square(name, x-1, y+1)) {
			this.demote_square(name, x-1, y+1);
		}
		if(!this.check_square(name, x-1, y)) {
			this.demote_square(name, x-1, y);
		}
	},
	check_square: function(name, x, y) {
		neighbors = window.Map.get_neighbors(name, x, y);
		found_square = false;
		val = window.Map.get(name, x, y);
		//check middle
		if(val == 1 || val == 2) {
		
			// check top left
			if ((neighbors[0] == 1 || neighbors[0] == 2) && (neighbors[1] == 1 || neighbors[1] == 2) && (neighbors[7] == 1 || neighbors[7] == 2)) {
				this.set_value(name, x-1, y, 1);
				this.set_value(name, x-1, y-1, 1);
				this.set_value(name, x, y-1, 1);
				this.set_value(name, x, y, 1);
				found_square = true;
			}
			
			// check top right
			if ((neighbors[1] == 1 || neighbors[1] == 2) && (neighbors[2] == 1 || neighbors[2] == 2) && (neighbors[3] == 1 || neighbors[3] == 2)) {
				this.set_value(name, x, y-1, 1);
				this.set_value(name, x+1, y-1, 1);
				this.set_value(name, x+1, y, 1);
				this.set_value(name, x, y, 1);
				found_square = true;
			}
			
			// check bottom right
			if ((neighbors[3] == 1 || neighbors[3] == 2) && (neighbors[4] == 1 || neighbors[4] == 2) && (neighbors[5] == 1 || neighbors[5] == 2)) {
				this.set_value(name, x+1, y, 1);
				this.set_value(name, x+1, y+1, 1);
				this.set_value(name, x, y+1, 1);
				this.set_value(name, x, y, 1);
				found_square = true;
			}
			
			// check bottom left
			if ((neighbors[5] == 1 || neighbors[5] == 2) && (neighbors[6] == 1 || neighbors[6] == 2) && (neighbors[7] == 1 || neighbors[7] == 2)) {
				this.set_value(name, x-1, y, 1);
				this.set_value(name, x-1, y+1, 1);
				this.set_value(name, x, y+1, 1);
				this.set_value(name, x, y, 1);
				found_square = true;
			}
		}
		
		return found_square;
	},
	compare_neighbors: function(neighbors, compare) {
		for (i = 0; i <= neighbors.length; i++) {
			val = 0;
			if (neighbors[i] == 1 || neighbors[i] == 2) {
				val = 1;
			} else {
				val = 0;
			}
			if(compare[i] != val) {
				return false;
			}
		}
		return true;
	}/*,
	get_wall_type: function(name, x, y) {
		if(window.Map.get(name, x, y) == 1) {
			alert("before");
			neighbors = window.Map.get_neighbors(name, x, y);
			alert("after");
			wall_type = -1;
			if(this.compare_neighbors(neighbors, [1, 0, 0, 0, 0, 0, 0, 0])) {
				wall_type = 8;
			} else if(this.compare_neighbors(neighbors, [0, 1, 0, 0, 0, 0, 0, 0])) {
				wall_type = 7;
			} else if(this.compare_neighbors(neighbors, [0, 0, 1, 0, 0, 0, 0, 0])) {
				wall_type = 6;
			} else if(this.compare_neighbors(neighbors, [0, 0, 0, 1, 0, 0, 0, 0])) {
				wall_type = 3;
			} else if(this.compare_neighbors(neighbors, [0, 0, 0, 0, 1, 0, 0, 0])) {
				wall_type = 0;
			} else if(this.compare_neighbors(neighbors, [0, 0, 0, 0, 0, 1, 0, 0])) {
				wall_type = 1;
			} else if(this.compare_neighbors(neighbors, [0, 0, 0, 0, 0, 0, 1, 0])) {
				wall_type = 2;
			} else if(this.compare_neighbors(neighbors, [0, 0, 0, 0, 0, 0, 0, 1])) {
				wall_type = 5;
			}
			//alert(wall_type);
		}
	},
	get_exterior_walls: function(name, x, y) {
		// top left
		this.get_wall_type(name, x-1, y-1);
		// top
		this.get_wall_type(name, x, y-1);
		// top right
		this.get_wall_type(name, x+1, y-1);
		// left
		this.get_wall_type(name, x-1, y);
		// right
		this.get_wall_type(name, x+1, y);
		// bot left
		this.get_wall_type(name, x-1, y+1);
		// bot
		this.get_wall_type(name, x, y+1);
		// bot right
		this.get_wall_type(name, x+1, y+1);
	} */
};

$(window).ready( function() {
	alert("window loaded");
	
	function room_tile(type) {
		this.type = type;
	}
	
	window.Map.new_layer('floor', new room_tile("empty"));
	window.Map.new_layer('blues1', 0);
	
});