

window.object_manager = {
	init: function() {
		this.selected = 0;
		this.edit_mode = true;
		this.edit_style = 'select';
		window.Events.add_listener(this);
		this.obs_moving = []; // all objects that need to be moved
		this.obs_building = []; // all objects that need to be built
		this.obs_removing = []; // all objects that need to be removed
	}, 	
	keydown: function(e){ // called on keypress
		//alert(e.keyCode);
		if (this.selected != 0) {
			if (e.keyCode == 77) { // M
				this.edit_style = 'move';
			} else if (e.keyCode == 68) { // D
				this.edit_style = 'destroy';
				// call the object to be removed
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
					if (this.selected.selectable) {
						alert('Selected: ' + this.selected + this.selected.name);
						return;
					} else {
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
			this.highlight_selected();
			if (this.edit_style == 'move') {
				if (this.selected.check_clear(window.Events.tile_under_mouse)) {
					this.draw_layout(window.Events.tile_under_mouse, this.selected.layout, 'green');
				} else {
					this.draw_layout(window.Events.tile_under_mouse, this.selected.layout, 'red');
				}
			}
		}
	},
	
	highlight_selected: function() {
		this.draw_layout(this.selected.world_coords, this.selected.layout, 'yellow');
	},
	
	draw_layout: function(pos, layout, color) {
		window.Draw.use_layer('entities');
		if (color == 'red') {
			color = "rgba(255, 20, 10, .5)";
		} else if (color == 'green') {
			 color = "rgba(10, 255, 10, .5)";
		} else if (color == 'yellow') {
			color = "rgba(128, 128, 10, .5)";
		} else {
			color = "rgba(10, 20, 255, .5)";
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
				this.selected.remove();
				if (this.selected.place(coords)) {
					this.edit_style = 'select';
					this.selected = 0;
				} else {
					this.selected.place(this.selected.world_coords)
					alert('cannot place here!');
				}
			}
		}
	}
	
}



$(window).ready( function(){	
	window.object_manager.init();
});