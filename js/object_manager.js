

window.Objects = {
	init: function() {
		this.selected = 0;
		this.edit_mode = true;
		this.edit_style = 'select';
		this.rot_layout = [];
		this.rotation = 1;
		window.Events.add_listener(this);
		
		this.buildable_obs = {};
		
		this.obs_moving = []; // all objects that need to be moved
		this.obs_building = []; // all objects that need to be built
		this.obs_removing = []; // all objects that need to be removed
	},
	// called if a tile wants to change (checks all around the tile)
	tile_changed: function(x, y) {
		var neighbs = window.Map.get_neighbors('objects', x, y);
		for (var i = 0; i < neighbs.length; i++) {
			if (neighbs[i] instanceof Array) {
				for (var j = 0; j < neighbs[i].length; j++) {
					var ob = neighbs[i][j];
					if (!ob.check_clear(ob.world_coords, ob.get_layout())) {
						return false;
					}
				}
			}
		}
		return true;
		
	},
	// carefully takes care of 'unselecting' an object
	unselect: function() {
		if (this.selected != 0) {
			if (!this.selected.placed && !this.selected.ghost_loc) {
				this.selected.destroy();
			}
		}
		this.selected = 0;
	},
	// add an object to the place menu
	add_buildable: function(name, object) {
		
		this.buildable_obs[name] = object;
		option = $('<div class="ui_menu_option"><p class="">' + name + '</p><img src="./textures/UI/confirm.png"></div>');
		option.attr('ob', object);
		console.log('adding to menu: ' + name);
		
		option.click(function(e) {
			$(this).parent().children().removeClass('active');
			$(this).addClass('active');
			return window.Objects.menu_clicked($(this).attr('ob'));
		});
		$('#place').find('#menu').append(option);
	},
	// method is called when a button in the place menu is clicked
	menu_clicked: function(object) {
		if (this.edit_mode) {
			this.unselect();
			ob = eval('new window.Entities.classes.' + object + '()');
			
			if (ob) {
				this.selected = ob;
				this.rot_layout = this.selected.layout;
				this.rotation = this.selected.rotation;
				this.edit_style = 'build';
			}
	}
	},
	// called when rotating
	rotate: function() {
		this.rotation += 1;
		if (this.rotation == 5) {
			this.rotation = 1;
		}
		this.rot_layout = this.selected.get_layout(this.rotation);
		
	},
	// called on keypress
	keydown: function(e){
		//alert(e.keyCode);
		if (this.selected != 0) {
			if (e.keyCode == 77) { // M
				if (this.selected.moveable) {
					this.edit_style = 'move';
					this.rotation = this.selected.rotation;
					this.rot_layout = this.selected.get_layout(this.rotation);
				} else {
					alert(this.selected.name + " can't be moved!");
				}
			} else if (e.keyCode == 68) { // D
				if (this.selected.removable && this.selected.placed) {
					this.selected.draw_tag('remove');
					this.selected.hide_ghost();
					this.obs_moving.remove(this.selected);
					this.obs_building.remove(this.selected);
					if (this.obs_removing.indexOf(this.selected) == -1) {
						this.obs_removing.push(this.selected);
					}
					
				} else {
					alert(this.selected.name + " can't be removed!");
				}	
			} else if (e.keyCode == 82) { // R
				if (this.edit_style == 'move' || this.edit_style == 'build') {
					if (this.selected.rotatable) {
						this.rotate();
					} else {
						alert(this.selected.name + " can't be rotated!");
					}
				}
			}
		}
	},	
	// called on mouse click
	mousedown: function(e){
		e.preventDefault();
		
		if (e.which == 1 && this.edit_mode) {
			if (this.edit_style == 'select') {
				var coords = window.Events.tile_under_mouse;
				this.selected = window.Map.get('objects', coords[0], coords[1]);
				if (this.selected != 0) {
					this.selected = this.selected[0];
					this.rotation = this.selected.rotation;
					this.rot_layout = this.selected.get_layout(this.rotation);
					if (!this.selected.selectable) {
						this.selected = 0;
						return;
					}
				} else {
					this.selected = 0
				}
			} else if (this.edit_style == 'move') {
				var coords = window.Events.tile_under_mouse;
				if (this.selected.check_clear(coords, this.rot_layout)) {
					this.selected.hide_ghost(); // remove any old ghost
					this.selected.show_ghost(coords, this.rotation, true); // draw a new ghost
					if (this.selected.placed) {
						this.selected.draw_tag('move'); // draw the move tag
						this.obs_removing.remove(this.selected); 
						this.obs_building.remove(this.selected);
						if (this.obs_moving.indexOf(this.selected) == -1) {
							this.obs_moving.push(this.selected);
						}
					} else {
						this.selected.draw_tag('build');
						this.obs_removing.remove(this.selected); 
						this.obs_moving.remove(this.selected);
						if (this.obs_building.indexOf(this.selected) == -1) {
							this.obs_building.push(this.selected);
						}
					}
					this.edit_style = 'select'; // set the edit style back to selection
					
					//this.selected = 0;
				} else {
					alert("Object cannot be placed there!");
				}
			} else if (this.edit_style == 'build') {
				var coords = window.Events.tile_under_mouse;
				if (this.selected.check_clear(coords, this.rot_layout)) {
					this.selected.attach_to_map();
					this.selected.show_ghost(coords, this.rotation, true); // draw a new ghost
					this.selected.draw_tag('build'); // draw the move tag
					this.edit_style = 'select'; // set the edit style back to selection
					this.obs_removing.remove(this.selected); 
					this.obs_moving.remove(this.selected);
					if (this.obs_building.indexOf(this.selected) == -1) {
						this.obs_building.push(this.selected);
					}
				}
			}
		}
	},
	// called consistantly
	update: function(delta) {
		if (this.selected != 0) {
			if (this.selected.useable) {
				this.draw_useage(this.selected.world_coords, this.selected.get_layout(this.selected.rotation));
			}
			if (this.obs_removing.indexOf(this.selected) != -1) {
				this.highlight_selected('red');
			} else if (this.obs_moving.indexOf(this.selected) != -1) {
				this.highlight_selected('green');
			} else if (this.obs_building.indexOf(this.selected) != -1) {
				this.highlight_selected('green');
			} else {
				this.highlight_selected('yellow');
			}
			if (this.edit_style == 'move' || this.edit_style == 'build') {
				
				if (this.selected.check_clear(window.Events.tile_under_mouse, this.rot_layout)) {
					this.draw_layout(window.Events.tile_under_mouse, this.rot_layout, 'green');
				} else {
				
					this.draw_layout(window.Events.tile_under_mouse, this.rot_layout, 'red');
				}
				this.draw_useage(window.Events.tile_under_mouse, this.rot_layout);
			}
		}
	},	
	// highlights the current selected object in the given color, also highlights the ghost
	highlight_selected: function(color) {
		if (color == undefined) {
			color = 'yellow';
		}
		this.draw_layout(this.selected.world_coords, this.selected.get_layout(), color);
		if (this.selected.ghost_loc) {
			var lay = this.selected.get_layout(this.selected.ghost_rot);
			this.draw_layout(this.selected.ghost_loc, lay, "blue");
			this.draw_useage(this.selected.ghost_loc, lay);
		}
	},	
	// draws footprints showing how the object can be used
	draw_useage: function(pos, layout) {
		window.Draw.use_layer('entities');
		for (var i = 0; i < layout[0].length; i++) {
			for (var j = 0; j < layout.length; j++) {
				var n = layout[j][i];
				if (n == 4 || n == 5 || n == 6 || n == 7) {
					window.Draw.image('use_' + n, (pos[0] + i) * window.Map.tilesize, (pos[1] + j) * window.Map.tilesize)
				}
			}
		}
	},
	// draws the given layout at the given position, in the given color
	draw_layout: function(pos, layout, color) {
		window.Draw.use_layer('entities');
		if (color == 'red') {
			color = "rgba(255, 20, 10, .15)";
		} else if (color == 'green') {
			 color = "rgba(10, 255, 10, .15)";
		} else if (color == 'yellow') {
			color = "rgba(128, 128, 10, .15)";
		} else {
			color = "rgba(0, 40, 200, .15)";
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
	// called on mouse click released
	mouseup: function(e) {
		e.preventDefault();			
		//console.log ('building : ' + this.obs_building);
		//console.log ('removing : ' + this.obs_removing);
		//console.log ('moving : ' + this.obs_moving);
	}
}



$(window).ready( function(){	
	
	// footprint/usage images
	window.Draw.add_image('use_4', "./textures/UI/use_down.png");
	window.Draw.add_image('use_5', "./textures/UI/use_left.png");
	window.Draw.add_image('use_6', "./textures/UI/use_up.png");
	window.Draw.add_image('use_7', "./textures/UI/use_right.png");
	
	window.Objects.init();
});