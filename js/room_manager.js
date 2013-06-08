window.Blueprints = {
	toggle: function(name, x, y) {
		tile = window.Map.get(name, x, y);
		// tile isn't part of the blueprint yet
		if (tile == 0) {
			neighbors = window.Map.get_immediate_neighbors(name, x, y);
			value = this.check_valid(neighbors);
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
		}
	},
	check_valid: function(neighbors) {
		// this is where it checks the validity of a blueprint tile
		// 0 = unselected, 1 = valid, 2 = invalid, 3 = obstacle
		undef_neighbors = 0;
		empty_neighbors = 0;
		valid_neighbors = 0;
		invalid_neighbors = 0;
		
		for(i = 0; i < neighbors.length ; i++){
			if(neighbors[i] === undefined) {
				undef_neighbors++;
			} else if (neighbors[i] == 0) {
				empty_neighbors++;
			} else if (neighbors[i] == 1) {
				valid_neighbors++;
			} else if (neighbors[i] == 2) {
				invalid_neighbors++;
			}
		}
		
		// check if it's on the map edge
		if(undef_neighbors > 0) {
			return 3;
		} else {
			return 2;
		}
	},
	demote_square: function(name, x, y) {
		value = window.Map.get(name, x, y);
		if (value == 1) {
			this.set_value(name, x, y, 2);
			//this.check_neighbors(name, x, y);
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
	}
};

$(window).ready( function() {

	
	function room_tile(type) {
		this.type = type;
	}
	
	window.Map.new_layer('floor', new room_tile("empty"));
	window.Map.new_layer('blues1', 0);
	
	
	
	
});