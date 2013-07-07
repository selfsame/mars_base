

window.Objects = {
	init: function() {
		this.selected = 0;
		this.edit_mode = true;
		this.edit_style = 'select';
		this.rot_layout = [];
		this.rotation = 1;
		window.Events.add_listener(this);
		this.obs_moving = []; // all objects that need to be moved
		this.obs_building = []; // all objects that need to be built
		this.obs_removing = []; // all objects that need to be removed
	}, 
	
	rotate: function() {
		this.rotation += 1;
		if (this.rotation == 5) {
			this.rotation = 1;
		}
	},
		
	keydown: function(e){ // called on keypress
		//alert(e.keyCode);
		if (this.selected != 0) {
			if (e.keyCode == 77) { // M
				if (this.selected.moveable) {
					this.edit_style = 'move';
					this.rotation = this.selected.rotation;
					this.rot_layout = this.selected.layout;
				} else {
					alert(this.selected.name + " can't be moved!");
				}
			} else if (e.keyCode == 68) { // D
				if (this.selected.removable) {
					this.selected.draw_tag('remove');
					this.selected.ghost_loc = false;
					this.obs_moving.remove(this.selected);
					this.obs_building.remove(this.selected);
					if (this.obs_removing.indexOf(this.selected) == -1) {
						this.obs_removing.push(this.selected);
					}
					
				} else {
					alert(this.selected.name + " can't be removed!");
				}	
			} else if (e.keyCode == 82) { // R
				if (this.selected.rotatable && this.edit_style == 'move') {
					this.rotate();
					this.rot_layout = this.selected.get_layout(this.rotation);
				}
			}
		//	} else if (e.keyCode == 80) { // P
		//		this.edit_style = 'build';
		//	}
		}
	},	
	mousedown: function(e){ // called on mouse click
		e.preventDefault();
		
		if (e.which == 1 && this.edit_mode) {
			if (this.edit_style == 'select') {
				var coords = window.Events.tile_under_mouse;
				this.selected = window.Map.get('objects', coords[0], coords[1]);
				if (this.selected != 0) {
					this.selected = this.selected[0];
					this.rotation = this.selected.rotation;
					this.rot_layout = this.selected.layout;
					if (!this.selected.selectable) {
						this.selected = 0;
						return;
					}
				} else {
					this.selected = 0
				}
			} else if (this.edit_style == 'move') {
				
			}
		}
	},
	update: function(delta) { // called consistantly
		if (this.selected != 0) {
			if (this.obs_removing.indexOf(this.selected) != -1) {
				this.highlight_selected('red');
			} else if (this.obs_moving.indexOf(this.selected) != -1) {
				this.highlight_selected('green');
			} else if (this.obs_building.indexOf(this.selected) != -1) {
				this.highlight_selected('green');
			} else {
				this.highlight_selected('yellow');
			}
			if (this.edit_style == 'move') {
				if (this.selected.check_clear(window.Events.tile_under_mouse, this.rot_layout)) {
					this.draw_layout(window.Events.tile_under_mouse, this.rot_layout, 'green');
				} else {
					this.draw_layout(window.Events.tile_under_mouse, this.rot_layout, 'red');
				}
			}
		}
	},	
	highlight_selected: function(color) {
		if (color == undefined) {
			color = 'yellow';
		}
		this.draw_layout(this.selected.world_coords, this.selected.get_layout(), color);
		if (this.selected.ghost_loc) {
			this.draw_layout(this.selected.ghost_loc, this.selected.get_layout(this.selected.ghost_rot), "blue");
		}
	},
	draw_layout: function(pos, layout, color) {
		window.Draw.use_layer('entities');
		if (color == 'red') {
			color = "rgba(255, 20, 10, .25)";
		} else if (color == 'green') {
			 color = "rgba(10, 255, 10, .25)";
		} else if (color == 'yellow') {
			color = "rgba(128, 128, 10, .25)";
		} else {
			color = "rgba(0, 40, 200, .25)";
		}
		
		for (var i = 0; i < layout[0].length; i++) {
			for (var j = 0; j < layout.length; j++) {
				if (layout[j][i] != 0) {
					window.Draw.draw_box((pos[0] + i) * window.Map.tilesize, (pos[1] + j) * window.Map.tilesize, window.Map.tilesize, window.Map.tilesize, {
						fillStyle: color,
						strokeStyle: color,
						lineWidth: 2
					});
				}
			}
		}
		
	},
	mouseup: function(e) { // called on mouse click released
		e.preventDefault();
		if (e.which == 1 && this.edit_mode) {
			if (this.edit_style == 'move') {
				var coords = window.Events.tile_under_mouse;
				
				if (this.selected.check_clear(coords)) {
					this.selected.ghost_rot = this.rotation;
					this.selected.remove_tag();
					this.selected.draw_ghost(coords);
					this.selected.draw_tag('move');
					this.selected.apply_layout(coords, this.rotation);
					this.edit_style = 'select';
					this.obs_removing.remove(this.selected);
					this.obs_building.remove(this.selected);
					if (this.obs_moving.indexOf(this.selected) == -1) {
						this.obs_moving.push(this.selected);
					}
					//this.selected = 0;
				} else {
					alert("Object cannot be placed there!");
				}
			}
		}
	}	
}



$(window).ready( function(){	
	window.Objects.init();
});