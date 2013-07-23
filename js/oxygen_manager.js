function Oxygen_Tile(x, y, type) {
	this.x = x;
	this.y = y;
	this.new_level = 0;
	this.oxygen_level = -1;
	this.type = type;
	this.increment = 0;
	
	Oxygen_Tile.prototype.calc_new = function(delta) {
		if (this.type == 0) {
			var neighbs = window.Map.get_neighbors('oxygen', this.x, this.y);
			var total = 0;
			var num_neighbs = 1;
			for (var i = 0; i < neighbs.length; i++) {
				if (neighbs[i] != null) {
					if (neighbs[i].type != 1) {
						total += neighbs[i].oxygen_level;
						total += neighbs[i].increment;
						num_neighbs += 1;
					}
				}
			}
			
			total += this.oxygen_level;
			total = Math.floor(total/num_neighbs + this.increment);
			if (total > 100) {
				total = 100;
			} else if (total < 0) {
				total = 0;
			}
			
			this.new_level = total;
		} else if (this.type == 1) {
			this.new_level = -1;
		}
	}
	
	Oxygen_Tile.prototype.apply_new = function(delta) {
		if (window.Oxygen.show_grid) {
			if (this.oxygen_level != this.new_level) {
				if (this.type == 1) {
					this.oxygen_level = this.new_level;
					window.Draw.use_layer('oxygen');
					window.Draw.clear_box(this.x * 32, this.y * 32, 32, 32);
					window.Draw.draw_box(this.x * 32, this.y * 32, window.Map.tilesize, window.Map.tilesize, {
							fillStyle: "rgba(25, 255, 0, .5)",
							strokeStyle: "rgba(25, 255 0, .5)",
							lineWidth: 1
						});	
				} else if (this.type == 0) {
					var x = Math.floor(this.new_level * 2.55);
					var color = "rgba(" + (255 - x) + ", 0, " + x + ", .5)";
					window.Draw.use_layer('oxygen');
					window.Draw.clear_box(this.x * 32, this.y * 32, 32, 32);
					window.Draw.draw_box(this.x * 32, this.y * 32, window.Map.tilesize, window.Map.tilesize, {
							fillStyle: color,
							strokeStyle: color,
							lineWidth: 1
						});	
					this.oxygen_level = this.new_level;
				}
			}	
		}
	}
}
window.Oxygen = {
	init: function() {
		// ask for events
		window.Events.add_listener(this);
		this.update_speed = 700;
		this.needs_update = true;
		this.show_grid = false;
		this.time = 0;
		
		this.exterior_increm = -75;
		
		if (window.Map.arrays['oxygen'] != null) {
			for (var i = 0; i < window.Map.height; i++) {
				for (var j = 0; j < window.Map.width; j++) {
					var o = new Oxygen_Tile(j, i, 0);
					o.new_level = 0;
					o.increment = this.exterior_increm;
					window.Map.set('oxygen', j, i, o);
				}	
			}	
		}
		window.Draw.hide_layer("oxygen");
	},
	update: function(delta) {
		this.time += delta;
		if (this.time > this.update_speed) {
			this.needs_update = true;
			this.time %= this.update_speed;
		} else {
			this.needs_update = false;
		}
		
		if (this.needs_update) {
			// calculate new oxygen levels
			for (var i = 0; i < window.Map.height; i++) {
				for (var j = 0; j < window.Map.width; j++) {
					window.Map.get('oxygen', j, i).calc_new(delta);
				}	
			}
			// apply new oxygen levels
			for (var i = 0; i < window.Map.height; i++) {
				for (var j = 0; j < window.Map.width; j++) {
					window.Map.get('oxygen', j, i).apply_new(delta);
				}	
			}	 
		}
	},
	show_oxygen: function(mode) { // true = blueprint mode, false = view mode
		if (mode) {
			this.show_grid = true;
			console.log("Showing oxygen view!");
			window.Draw.show_layer("oxygen");
		} else {
			this.show_grid = false;
			console.log("Hiding oxygen view!");
			window.Draw.hide_layer("oxygen");
		}
	},
	keydown: function(e){ // called on keypress
		if (e.keyCode == 83) { // S
			if(this.show_grid) {
				this.show_oxygen(false);
			} else {
				this.show_oxygen(true);
			}
		}
	},
	mousedown: function(e){
		e.preventDefault();
		
		if (e.which == 1 && this.show_grid) {
			var coords = window.Events.tile_under_mouse;
			console.log('This square has ' + window.Map.get('oxygen', coords[0], coords[1]).oxygen_level + ' (out of 100) oxygen.');
		}
	}
}

$(window).ready( function() {
	window.Oxygen.init();
});