
function job_ref(type, obj) {
	this.type = type;
	this.obj = obj;
	this.obj.job = this;
	this.location = obj.get_usage();

	this.timer = 0; // for debugging 
	
	// all callbacks
	this.job_done = window.Objects.job_done;
	this.job_fail = window.Objects.job_failed;
	this.job_cancel = window.Objects.job_cancelled;
	
	// unimplemented
	this.reqs = [];
}
window.Objects = {
	init: function() {
		this.selected = 0;
		this.edit_mode = true;
		this.edit_style = 'select';
		this.rot_layout = [];
		this.rotation = 1;
		window.Events.add_listener(this);
		
		this.jobs = [];
		
		this.buildable_obs = {};
	},
	// called if a tile wants to change (checks all around the tile)
	tile_changed: function(x, y) {
		var neighbs = window.Map.get_neighbors('objects', x, y);
		var checked = [];
		for (var i = 0; i < neighbs.length; i++) {
			if (neighbs[i] instanceof Array) {
				for (var j = 0; j < neighbs[i].length; j++) {
					var ob = neighbs[i][j];
					if (checked.indexOf(ob) == -1) {
						if (!ob.placed) {
							if(!ob.check_clear(ob.ghost_loc, ob.ghost_rot)) {
								return false;
							}
						} else {
							if (ob.ghost_loc) {
								if(!ob.check_clear(ob.ghost_loc, ob.ghost_rot)) {
								return false;
								}
							} 
							if(!ob.check_clear(ob.location, ob.rotation)) {
								return false;
							}
						}
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
			if (e.keyCode == 77) { // M : move
				if (this.selected.moveable) {
					this.edit_style = 'move';
					this.rotation = this.selected.rotation;
					this.rot_layout = this.selected.get_layout(this.rotation);
				} else {
					alert(this.selected.name + " can't be moved!");
				}
			} else if (e.keyCode == 68) { // D : destroy
				if (this.selected.removable && this.selected.placed) {
					this.set_job(this.selected, 'remove');
				} else {
					alert(this.selected.name + " can't be removed!");
				}	
			} else if (e.keyCode == 82) { // R : rotate
				if (this.edit_style == 'move' || this.edit_style == 'build') {
					if (this.selected.rotatable) {
						this.rotate();
					} else {
						alert(this.selected.name + " can't be rotated!");
					}
				}
			} else if (e.keyCode == 67) { // C : clear
				if (this.selected.job != null) {
					this.job_cancelled(this.selected.job);
				}
			}
		}
	},
	// change an objects job
	set_job: function(obj, type, loc, rot) {
		this.job_cancelled(obj.job);
		obj.draw_tag(type);
		if (type == 'place' || type == 'move' || type == 'build') {
			obj.show_ghost(loc, rot, true);
		}
		j = new job_ref(type, obj);
		this.jobs.push(j);
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
				if (this.selected.check_clear(coords, this.rotation)) {
					if (this.selected.job != null) {
						if (this.selected.job.type == 'build') {
							this.set_job(this.selected, 'build', coords, this.rotation);
						} else {
							this.set_job(this.selected, 'move', coords, this.rotation);
						}
					} else {
						this.set_job(this.selected, 'move', coords, this.rotation);
					}					
					this.edit_style = 'select'; // set the edit style back to selection
				} else {
					alert("Object cannot be placed there!");
				}
			} else if (this.edit_style == 'build') {
				var coords = window.Events.tile_under_mouse;
				if (this.selected.check_clear(coords, this.rotation)) {
					if (this.selected.job == null) { // currently no job on object
						//this.selected.hide_ghost(); // remove any old ghost
						this.selected.show_ghost(coords, this.rotation, true); // draw a new ghost
						this.selected.attach_to_map();
						this.selected.draw_tag('build');
						j = new job_ref('build', this.selected);
						this.jobs.push(j);
					} 
					
					var ob = eval('new window.Entities.classes.' + this.buildable_obs[this.selected.name] + '()');
					this.selected = ob;
				}
			}
		}
	},
	// called consistantly
	update: function(delta) {
		if (this.selected != 0) {
			if (this.selected.useable && this.selected.placed) {
				this.draw_useage(this.selected.location, this.selected.get_layout(this.selected.rotation));
			}
			if (this.selected.job != null) {
				if (this.selected.job.type == 'remove') {
					this.highlight_selected('red');
				} else if (this.selected.job.type == 'move') {
					this.highlight_selected('green');
				} else if (this.selected.job.type == 'build') {
					this.highlight_selected('green');
				}
			} else {
				this.highlight_selected('yellow');
			}
			if (this.edit_style == 'move' || this.edit_style == 'build') {
				
				if (this.selected.check_clear(window.Events.tile_under_mouse, this.rotation)) {
					this.draw_layout(window.Events.tile_under_mouse, this.rot_layout, 'green');
				} else {
					this.draw_layout(window.Events.tile_under_mouse, this.rot_layout, 'red');
				}
				this.draw_useage(window.Events.tile_under_mouse, this.rot_layout);
				
			}
		}
		
		// for testing
		this.do_jobs_test(delta);
		
		
	},	
	// highlights the current selected object in the given color, also highlights the ghost
	highlight_selected: function(color) {
		if (color == undefined) {
			color = 'yellow';
		}
		if (this.selected.placed) {
			this.draw_layout(this.selected.location, this.selected.get_layout(), color);
		}
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
	// callback for job cancelled
	job_cancelled: function(ref) {
		if (ref != null) {
			if (window.Objects.jobs.indexOf(ref) != -1) {
				window.Objects.jobs.remove(ref);
			}
			ref.obj.job = null;
			ref.obj.tagged = false;
			
			if (ref.type == 'remove') {
				console.log ('remove job cancelled.');
			} else if (ref.type == 'build') {
				console.log ('build job cancelled');
				ref.obj.hide_ghost();
				// entity returns resources if gathered ?
			} else if (ref.type == 'move') {
				ref.obj.hide_ghost();
				console.log('move job cancelled');
				// object could be in entity inventory 
			} else if (ref.type == 'place') {
				ref.obj.hide_ghost();
				console.log('place job cancelled');
				// object is in entity inventory
			} else if (ref.type == 'destroy') { // not really possible without selecting items from inventory
				console.log('destroy job cancelled');
				// object is in entity inventory
			}
		}
	},
	// callback for job succeeded;
	job_done: function(ref) {
		if (window.Objects.selected == ref.obj) {
			window.Objects.unselect();
		}
		ref.obj.job = null;
		ref.obj.hide_ghost();
		ref.obj.tagged = false;
		console.log(ref.type + ' job completed.');d
		if (window.Objects.jobs.indexOf(ref) != -1) {
			window.Objects.jobs.remove(ref);
		}
	},
	// callback for job failed
	job_failed: function(ref) {
		if (window.Objects.jobs.indexOf(ref) != -1) {
			window.Objects.jobs.remove(ref);
		}
		console.log(ref.type + ' job could not be completed. Adding back to que.');
		window.Objects.jobs.push(ref);
	},
	// simulates colonists doing jobs, using delta
	do_jobs_test: function(delta) {
		for (var i = 0; i < this.jobs.length; i++) {
			var job = this.jobs[i];
			job.timer += delta;
			if (job.timer > 6000) { // colonist has walked to the job location
				if (job.type == 'remove') {
					job.obj.destroy();
					job.job_done(job);
				} else if (job.type == 'build') {
					job.obj.place();
					job.job_done(job);
				} else if (job.type == 'move') {
					if (job.obj.placed) {
						job.obj.remove();
					} else if (job.timer > 10000) { // colonist has walked to the obj.ghost_loc
						job.obj.place();
						job.job_done(job);
					}
				}
				
 			}
		}
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