

window.object_manager = {
	init: function() {
		this.selected = 0;
		this.edit_mode = true;
		this.edit_style = 'select';
		window.Events.add_listener(this);
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
		//		this.edit_style = 'place';
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
					alert('Selected: ' + this.selected.name);
				}
			} else if (this.edit_style == 'move') {
				
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