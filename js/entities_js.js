

function anim(sprite, clips, size, loc, rot, rot_off, type, layer) {
	this.sprite = sprite; // sprite image
	this.size = size; // [width, height] of clips
	this.clips = clips; // [clipsX, clipsY]
	this.location = loc; // [x, y] world coords
	this.rotation = rot; // rotation value
	this.rot_offset = rot_off; // sprite offset when image is rotated
	this.paused = false;
	this.total_frames = clips[0] * clips[1]; // total number of frames
	this.type = type; // 'flipper'/'loop'/'property'
	this.flip = true; // used for flipper mode. true = play forward. false = reverse
	this.clip = [0, 0]; // current [x, y]
	this.speed = 50; // ticks per frame
	this.frame = 0; // current frame
	this.time = 0; // current ticks
	this.needs_draw = true; // does this need to be drawn?
	if (this.layer == null) {
		this.layer = 'Entities';
	}
	console.log('layer: ' + this.layer);
	window.Anims.register(this); // register for updates
	
	anim.prototype.clip_increment = function(amount) {
		if (this.type == 'loop') {
			this.frame = ((this.frame + amount) % this.total_frames);
			var x = (this.frame % this.clips[0]);
			var y = Math.floor(this.frame / this.clips[1]);
			this.clip = [x, y];
			this.needs_draw = true;
		} else if (this.type == 'flip') {
			if (this.flip) {
				this.frame = this.frame + amount;
				if (this.frame >= this.total_frames) {
					this.frame = this.total_frames - 1;
				} else {
					this.needs_draw = true;
				}
				var x = (this.frame % this.clips[0]);
				if (this.clips[1] != 1) {
					var y = Math.floor(this.frame / this.clips[1]);
				} else {
					var y = 0;
				}
				this.clip = [x, y];
			} else {
				this.frame = this.frame - amount;
				if (this.frame <= 0) {
					this.frame = 0;
				} else {
					this.needs_draw = true;
				}
				var x = (this.frame % this.clips[0]);
				if (this.clips[1] != 1) {
					var y = Math.floor(this.frame / this.clips[1]);
				} else {
					var y = 0;
				}
				this.clip = [x, y];
			}
		} else if (this.type == 'property') {
			if (this.frame != this.prop['prop']) {
				this.frame = this.prop['prop'];
				if (this.frame >= this.total_frames) {
					this.frame = this.total_frames - 1;
				} else {
					this.needs_draw = true;
				}
				var x = (this.frame % this.clips[0]);
				if (this.clips[1] != 1) {
					var y = Math.floor(this.frame / this.clips[1]);
				} else {
					var y = 0;
				}
				this.clip = [x, y];
			} else {
				this.needs_draw = false;
			}
		}
	
		return this.frame;
	}
	anim.prototype.frame_update = function(delta) {
		this.time += delta;
		var lapse = Math.floor(this.time / this.speed);
		if (lapse > 0) {
			this.clip_increment(lapse);
			this.time %= this.speed;
		}
	}
	anim.prototype.draw = function() {
		
		//window.Draw.use_layer('Entities');
		window.Draw.use_layer('objects');
		
		if (this.needs_draw) {
			console.log('frame: ' + this.frame + " clip: " + this.clip);
			if (this.rotation == 1) {
				window.Draw.clear_box(this.location[0] * 32, this.location[1] * 32, this.size[0], this.size[1]);
				this.needs_draw = !window.Draw.sub_image(this.sprite, this.location[0] * 32, this.location[1] * 32, this.size[0], this.size[1], this.size, this.clip, 0);
			} else if (this.rotation == 2) {
				window.Draw.clear_box(this.location[0] * 32, this.location[1] * 32, this.size[1], this.size[0]);
				this.needs_draw = !window.Draw.sub_image(this.sprite, (this.location[0] + this.rot_offset[0]) * 32, (this.location[1] + this.rot_offset[1]) * 32, this.size[0], this.size[1], this.size, this.clip, Math.PI/2);
			} else if (this.rotation == 3) {
				window.Draw.clear_box(this.location[0] * 32, this.location[1] * 32, this.size[0], this.size[1]);
				this.needs_draw = !window.Draw.sub_image(this.sprite, this.location[0] * 32, this.location[1] * 32, this.size[0], this.size[1], this.size, this.clip, Math.PI);
			} else if (this.rotation == 4) {
				window.Draw.clear_box(this.location[0] * 32, this.location[1] * 32, this.size[1], this.size[0]);
				this.needs_draw = !window.Draw.sub_image(this.sprite, (this.location[0] + this.rot_offset[0]) * 32, (this.location[1] + this.rot_offset[1]) * 32, this.size[0], this.size[1], this.size, this.clip, Math.PI * 1.5);
			}
			
			return this.needs_draw;
			
		}
	}
}

$(window).ready(function() {
	window.Anims = {
		init: function() {
			window.Events.add_listener(this);
			this.animations = [];
		},
		register: function(anim) {
			if (this.animations.indexOf(anim) == -1) {
				this.animations.push(anim);
			}
		},
		unregister: function(anim) {
			if (this.animations.indexOf(anim) != -1) {
				this.animations.remove(anim);
			}
		},
		update: function(delta) {
			for(var i = 0; i < this.animations.length; i++) {
				if (!this.animations[i].paused) {
					this.animations[i].frame_update(delta);
				}
			}
		}
		
	}

	DThing = window.Entities.add_class('DThing', 'Thing');

	DThing.prototype.init = function() {
		this.location = [[0, 0]]; // top left corner, in world coordinates
		this.drawn = false;
		this.rotation = 1; // represents the rotation
		this.layout = [[1]]; // 2d layout of this object with no rotation
		this.layout_rot = [[1]]; // layout of this object with current rotation
		
		this.tagged = false; // is this object tagged?
		this.tag = 'build'; // the tag type
		this.tag_loc = [0, 0]; // tag location relative to layout
		
		this.rot_offset = [0, 0]; // offset for sprite when it's rotated
		this.placed = false; // if this object has been placed yet
		this.name = 'Plain Thingy';
		
		this.job = null; // job reference object associated with this object
		
		this.ghost_loc = false; // show object ghost
		this.ghost_rot = 1; // represents the rotation of the ghost
		
		this.moveable = false; // can the colonists move this object?
		this.useable = false; // can the colonists use this object?
		this.buildable = false; // can the colonists build this object?
		this.removable = false; // can the colonists remove this object?
		this.selectable = true; // can this object be selected?
		this.rotatable = true; // can this object be rotated?
		
		this.place_interior = true; // can this object be placed inside
		this.place_exterior = true; // can the object be placed outside

		this.setup();
		return this;
	}
	
	DThing.prototype.setup = function() {
		console('wrong one fool');
	}
	
	// where can this object be used?
	DThing.prototype.get_usage = function() {
		if (this.placed) {
			return this.location;
		} else {
			return this.ghost_loc;
		}
	}
	
	DThing.prototype.freeze = function() {
		this.props = [this.selectable, this.removable, this.buildable, this.rotatable];		
		this.selectable = false;
		this.removable = false;
		this.buildable = false;
		this.rotatable = false;
		this.frozen = true;
	}
	
	DThing.prototype.unfreeze = function() {
		this.selectable = this.props[0];
		this.removable = this.props[1];
		this.buildable = this.props[2];
		this.rotatable = this.props[3];
		this.frozen = false;
	}
	
	// draw this to the map
	DThing.prototype.draw = function() {
		this.ent_draw();
		if (this.placed && this.layout != [] && !this.drawn) {
			
			var width = this.layout[0].length;
			var height = this.layout.length;
			var t_size = window.Map.tilesize;
			
			window.Draw.use_layer('objects');
			var r = this.get_rot(this.rotation);
			if (this.rotation == 2 || this.rotation == 4) {
				this.drawn = (window.Draw.image(this.image, (this.location[0] + this.rot_offset[0]) * t_size, (this.location[1] + this.rot_offset[1]) * t_size, width * t_size, height * t_size, r, true));
			} else {
				this.drawn = (window.Draw.image(this.image, (this.location[0]) * t_size, (this.location[1]) * t_size, width * t_size, height * t_size, r, true));
			}
			
			return this.drawn;
			
		} else {
			return false; // nothing to draw
		}
	}
	
	DThing.prototype.ent_draw = function() {
		if (this.ghost_loc) {
			this.draw_ghost();
		}
		if (this.tagged) {
			this.draw_tag(this.tag);
		}
	}
	
	// erase this from the map
	DThing.prototype.erase = function() {
		var lay = this.get_layout(this.rotation);
		var t_size = window.Map.tilesize;
		
		
		window.Draw.use_layer('objects');
		for (var i = 0; i <lay.length; i++) {
			for (var j = 0; j < lay[i].length; j++) {
				var coords = [this.location[0] + j, this.location[1] + i];
				window.Draw.use_layer('objects');
				if (lay[i][j] != 0) { // non-empty square
					window.Draw.clear_box(coords[0] * t_size, coords[1] * t_size, t_size, t_size);
				}
			}
		}
		
		this.drawn = false;
	}
	
	// transform the integer rot variable into a radian
	DThing.prototype.get_rot = function(rot) {
		if (rot == 2) {
			return Math.PI/2;
		} else if (rot == 3) {
			return Math.PI;
		} else if (rot == 4) {
			return Math.PI * 1.5;
		} else {
			return 0;
		}
		
	}
	
	// draw a ghost of this object
	DThing.prototype.draw_ghost = function() {
		if (this.ghost_layout != []) {
			
			var width = this.layout[0].length;
			var height = this.layout.length;
			var t_size = window.Map.tilesize;
			window.Draw.use_layer('entities');
			var r = this.get_rot(this.ghost_rot);
			if (this.ghost_rot == 2 || this.ghost_rot == 4) {
				return (window.Draw.image(this.image, (this.ghost_loc[0] + this.rot_offset[0]) * t_size, (this.ghost_loc[1] + this.rot_offset[1]) * t_size, width * t_size, height * t_size, r, .25));
			} else {
				return (window.Draw.image(this.image, (this.ghost_loc[0]) * t_size, (this.ghost_loc[1]) * t_size, width * t_size, height * t_size, r, .25));
			}
		}
		return false;
	}
	
	// show this objects ghost at given location and rotation
	DThing.prototype.show_ghost = function(loc, rot, apply_layout) {
		this.ghost_loc = loc;
		this.ghost_rot = rot;
		this.ghost_layout = this.get_layout(rot);
		
		if (apply_layout) {
			return(this.apply_layout(loc, rot, false));
		}
		
		return true;
	}
	
	// remove any ghost
	DThing.prototype.hide_ghost = function() {
		if (this.ghost_loc) {
			this.remove_layout(this.ghost_loc, this.ghost_rot);
			if (this.placed) {
				this.apply_layout(this.location, this.rotation, true);
			}
			this.remove_tag();
		}
		this.ghost_loc = false;
		this.ghost_rot = this.rotation;
		this.ghost_layout = this.layout;	
	}
	
	// add a tag to this object
	DThing.prototype.draw_tag = function(type) {
		if (type != null) {
			this.tag = type;
		}
		this.tagged = true;
		if (this.tag == 'move') {
			var t_size = window.Map.tilesize;
			window.Draw.use_layer('entities');
			if (this.placed) {
				var loc = [(this.location[0] + this.tag_loc[0]) * t_size, (this.location[1] + this.tag_loc[1]) * t_size];
				window.Draw.image('tag_move', loc[0], loc[1], t_size, t_size);
			}
			if (this.ghost_loc) {
				var loc = [(this.ghost_loc[0] + this.tag_loc[0]) * t_size, (this.ghost_loc[1] + this.tag_loc[1]) * t_size];
				window.Draw.image('tag_move', loc[0], loc[1], t_size, t_size);
			}
		} else if (this.tag == 'remove') {
			var t_size = window.Map.tilesize;
			var loc = [(this.location[0] + this.tag_loc[0]) * t_size, (this.location[1] + this.tag_loc[1]) * t_size];
			window.Draw.use_layer('entities');
			window.Draw.image('tag_remove', loc[0], loc[1], t_size, t_size);
		} else if (this.tag == 'build') {
			var t_size = window.Map.tilesize;
			window.Draw.use_layer('entities');
			if (this.ghost_loc) {
				var loc = [(this.ghost_loc[0] + this.tag_loc[0]) * t_size, (this.ghost_loc[1] + this.tag_loc[1]) * t_size];
				window.Draw.image('tag_build', loc[0], loc[1], t_size, t_size);
			}
		} else {
			this.tagged = false;
		}
		
	}
	
	// remove any tags currently drawn
	DThing.prototype.remove_tag = function() {
		this.tag = 'null';
		this.tagged = false;
	}
	
	// get a rotated layout of the object
	DThing.prototype.get_layout = function(rot) {
		if (!rot) {
			rot = this.rotation;
		}
		var lay = this.layout;
		
		if (rot == 1) { // 0 degrees
			lay = this.layout;
		} else if (rot == 2) { // 90 degrees
			lay = this.layout.transpose().reverse_rows();
			for (var i = 0; i < lay.length; i++) {
				for (var j = 0; j < lay[i].length; j++) {
					switch(lay[i][j]) {
						case 4: 
							lay[i][j] = 5;
							break;
						case 5:
							lay[i][j] = 6;
							break;
						case 6:
							lay[i][j] = 7;
							break;
						case 7:
							lay[i][j] = 3;
							break;
						default:
							break;
					}
				}
			}
		} else if (rot == 3) { // 180 degrees
			lay = this.layout.reverse_rows().reverse_cols();
			for (var i = 0; i < lay.length; i++) {
				for (var j = 0; j < lay[i].length; j++) {
					switch(lay[i][j]) {
						case 4: 
							lay[i][j] = 6;
							break;
						case 5:
							lay[i][j] = 7;
							break;
						case 6:
							lay[i][j] = 4;
							break;
						case 7:
							lay[i][j] = 5;
							break;
						default:
							break;
					}
				}
			}
		} else if (rot == 4) { // 270 degrees
			lay = this.layout.transpose().reverse_cols();
			for (var i = 0; i < lay.length; i++) {
				for (var j = 0; j < lay[i].length; j++) {
					switch(lay[i][j]) {
						case 4: 
							lay[i][j] = 7;
							break;
						case 5:
							lay[i][j] = 4;
							break;
						case 6:
							lay[i][j] = 5;
							break;
						case 7:
							lay[i][j] = 6;
							break;
						default:
							break;
					}
				}
			}
		}
		
		return lay;
	}
	
	 // convert local coordinates to world coordinates
	DThing.prototype.local_to_world = function(local, world) {
		if (world == undefined) {
			world = this.location;
		}
		return [world[0] + local[0], world[1] + local[1]];
	}

	// convert world coordinates to local coordinates
	DThing.prototype.world_to_local = function(world) {
		return [world[0] - this.location[0], world[1] - this.location[1]];
	}
	
	// attach this object's layout to the correct maps
	DThing.prototype.apply_layout = function(loc, rot, pathing) {
		if (loc == null) {
			loc = this.location;
		}
		if (rot == null) {
			rot = this.rotation;
		}
		
		var rot_layout = this.get_layout(rot);
		if (rot_layout != []) {
			for (var i = 0; i < rot_layout.length; i++) {
				for (var j = 0; j < rot_layout[i].length; j++) {
					var coords = this.local_to_world([j, i], loc);
					if (rot_layout[i][j] == 1) { // collision and placement
						window.Map.push('objects', coords[0], coords[1], this);
						if (pathing) {
							window.Map.set('pathfinding', coords[0], coords[1], 1);
						}
					} else if (rot_layout[i][j] != 0) {
						window.Map.push('objects', coords[0], coords[1], this);
					}
				}
			}
			return true; 
		}
		return false;
	}
	
	// detach this object's layout from the correct maps
	DThing.prototype.remove_layout = function(loc, rot) {
		if (loc == null) {
			loc = this.location;
		}
		if (rot == null) {
			rot = this.rotation;
		}
		var rot_layout = this.get_layout(rot);
		if (rot_layout != []) {
			for (var i = 0; i < rot_layout.length; i++) {
				for (var j = 0; j < rot_layout[i].length; j++) {
					var coords = this.local_to_world([j, i], loc);
					if (rot_layout[i][j] == 1) { // collision and placement
						window.Map.remove('objects', coords[0], coords[1], this);
						//window.Map.set('objects', coords[0], coords[1], 0);
						window.Map.set('pathfinding', coords[0], coords[1], 0);
					} else if (rot_layout[i][j] != 0) {
						//console.log('removing: ' + coords);
						window.Map.set('objects', coords[0], coords[1], 0);
						//window.Map.remove('objects', coords[0], coords[1], this);
					}
				}
			}
			return true;
		}
		return false;
	}
	
	// check if it can be placed at given location
	DThing.prototype.check_clear = function(loc, rot) {
		var rot_layout;
		if (rot == null) {
			rot = this.rotation;
			rot_layout = this.layout;
		} else {
			rot_layout = this.get_layout(rot);
		}
		if (rot_layout) {
			
			for (var i = 0; i < rot_layout.length; i++) {
				for (var j = 0; j < rot_layout[i].length; j++) {
					var coords = [loc[0] + j, loc[1] + i];
					if (rot_layout[i][j] != 0) {
						var ob = window.Map.get('objects', coords[0], coords[1]);
						
						if (ob != 0) { // look for other objects here
							if (!window.Map.contains('objects', coords[0], coords[1], this)) {
								return false;
							}
						}
						
						var t = window.Map.get('tiles', coords[0], coords[1]);
						
						// if it can be placed outside
						if (!this.place_exterior) {
							if (t == 0) {
								return false;
							}
						}
						
						// if it can be placed inside
						if (this.place_interior) {
							if (t != 0) {
								if (!t.is_floor(true)) {
									return false;
								}
							}
						} else {
							if (t != 0) {
								return false;
							}
						}
					}
				}
			}
		}
		return true;
	}

	// easy functions to hook into 
	DThing.prototype.install = function() { }
	DThing.prototype.uninstall = function() { }


	DThing.prototype.build = function() {
		// generic command that routes to place/destroy/remove if applicable
		if (this.place_job == 'build') { this.place(); }
		if (this.place_job == 'remove') { this.destroy(); }

	}

	// place this object at a given location
	DThing.prototype.place = function(loc, rot) {
		if (loc == null) {
			loc = this.ghost_loc;
		}
		
		if (rot == null) {
			rot = this.ghost_rot;
		}
		
		if (loc && this.check_clear(loc, rot)) {
			
			this.location = loc;
			this.rotation = rot;
			if (this.apply_layout(loc, rot)) {
				this.placed = true;
				this.attach_to_map();
				this.install();
				return true
			} else {
				this.location = [];
			}
		}
		return false;
	}
	
	// destroy the object completely
	DThing.prototype.destroy = function() {
		// to-do
		this.remove();
		// super important to clean up the various references
		this.__destroy();
	}
	
	// removes the object from the map, doesn't destroy it
	DThing.prototype.remove = function() {
		if (this.placed && this.remove_layout()) {
			this.erase();
			this.placed = false;
			//this.detach_from_map();
			this.uninstall();
			return true;
		}
		return false;
	}
	
	Crater_Small = window.Entities.add_class('Crater_Small', 'DThing');	
	Crater_Small.prototype.setup = function() {
		this.name = 'Small Crater';
		this.image = 'crater_small';
		this.tag_loc = [1, 1];
		this.layout = [[1, 1, 1],
					   [1, 1, 1],
					   [1, 1, 1]];
	}
	
	Derpifier = window.Entities.add_class('Derpifier', 'DThing');	
	Derpifier.prototype.setup = function() {
		this.name = 'Derpifier';
		this.image = 'derpifier';
		this.rot_offset = [-1, 1];
		this.moveable = true;
		this.buildable = true;
		this.removable = true;
		this.selectable = true;
		this.tag_loc = [0, 0];
		this.layout = [[1, 0, 0, 2],
					   [1, 1, 1, 2]];
		this.place_interior = true;
		this.place_exterior = true;
	}
	
	Air_Vent = window.Entities.add_class('Air_Vent', 'DThing');	
	Air_Vent.prototype.setup = function() {
		this.name = 'Air Vent';
		this.image = 'air_vent';
		this.moveable = true;
		this.buildable = true;
		this.removable = true;
		this.selectable = true;
		
		this.place_interior = true;
		this.place_exterior = false;
			
		this.layout = [[2]];
	}
	
	Water_Tank = window.Entities.add_class('Water_Tank', 'DThing');
	Water_Tank.prototype.setup = function() {
		this.name = 'Water Tank';
		this.image = 'water_tank';
		this.moveable = true;
		this.rot_offset = [-1, 1];
		this.buildable = true;
		this.removable = true;
		this.selectable = true;
		this.useable = true;
		this.layout = [[1, 1, 1, 1, 1, 2],
					   [1, 1, 1, 1, 1, 5],
					   [1, 1, 1, 1, 1, 2],
					   [1, 1, 1, 1, 1, 2]];
		
		this.place_interior = false;
		this.place_exterior = true;
		
	}
	
	Launchpad2 = window.Entities.add_class('Launchpad2', 'DThing');
	Launchpad2.prototype.setup = function() {
		this.name = 'Launchpad2';
		this.image = 'launchpad';
		this.tag_loc = [0, 1];
		this.moveable = false;
		this.buildable = false;
		this.removable = false;
		this.selectable = true;
		this.useable = true;
		this.layout = [[2, 4, 4, 2],
					   [7, 2, 2, 5],
					   [7, 2, 2, 5],
					   [2, 6, 6, 2]];
	}
	
	Wide_Door = window.Entities.add_class('Wide_Door', 'DThing');
	Wide_Door.prototype.setup = function() {
		this.name = 'Wide Door';
		this.image = 'door_tester';
		this.rot_offset = [-.5, .5];
		this.moveable = true;
		this.buildable = true;
		this.removable = true;
		this.selectable = true;
		this.layout = [[2, 2]];
		
		this.place_interior = true;
		this.place_exterior = false;
		this.anim = false;
	}
	Wide_Door.prototype.check_clear = function(loc, rot) {
		var rot_layout;
		if (rot == null) {
			rot = this.rotation;
			rot_layout = this.layout;
		} else {
			rot_layout = this.get_layout(rot);
		}
		if (rot_layout) {
			var w = rot_layout[0].length;
			var h = rot_layout.length;
		
			for (var i = 0; i < h; i++) {
				for (var j = 0; j < w; j++) {
					var coords = [loc[0] + j, loc[1] + i];
					if (rot_layout[i][j] != 0) {
						var ob = window.Map.get('objects', coords[0], coords[1]);
						
						if (ob != 0) { // look for other objects here
							if (!window.Map.contains('objects', coords[0], coords[1], this)) {
								return false;
							}
						}
						
						var t = window.Map.get('tiles', coords[0], coords[1]);

						if (t == 0) {
							return false;
						}

						if (!t.is_floor(true)) {
							return false;
						}
					}
				}
			}
			
			if (w > h) { // horizontal orientation
				var coords1 = [loc[0] - 1, loc[1]];
				var coords2 = [loc[0] + 2, loc[1]];
			} else { // vertical orientation
				var coords1 = [loc[0], loc[1] - 1];
				var coords2 = [loc[0], loc[1] + 2];
			}
			
			var t = window.Map.get('tiles', coords1[0], coords1[1]);
			if (t == 0) {
				return false;
			} else {
				if (t.built) {
					if (!t.is_wall(true)) {
						return false;
					} else {
						t = window.Map.get('tiles', coords2[0], coords2[1]);
						if (t == 0) {
							return false;
						} else {
							if (t.built) {
								if (!t.is_wall(true)) {
									return false;
								}
							} else {
								return false;
							}
						}
					}
				} else {
					return false;
				}
			}
			
		}
		return true;
	}
	
	// draw this to the map
	Wide_Door.prototype.draw = function() {
		this.ent_draw();
		if (this.placed && this.layout != []) {
			this.drawn = this.anim.draw();
			return this.drawn;
		} else {
			return false; // nothing to draw
		}
	}
	Wide_Door.prototype.ent_draw = function() {
		if (this.ghost_loc) {
			this.draw_ghost();
		}
		if (this.anim) {
			this.anim.draw()
		}
		if (this.tagged) {
			this.draw_tag(this.tag);
		}
	}
	Wide_Door.prototype.place = function(loc, rot) {
		if (loc == null) {
			loc = this.ghost_loc;
		}
		
		if (rot == null) {
			rot = this.ghost_rot;
		}
		
		if (loc && this.check_clear(loc, rot)) {
			
			this.location = loc;
			this.rotation = rot;
			if (this.location == this.ghost_loc) {
				this.hide_ghost();
			}
			if (this.apply_layout(loc, rot)) {
				this.placed = true;
				this.attach_to_map();

				this.anim = new anim('door_opening', [4, 4], [64, 32], this.location, this.rotation, this.rot_offset, 'flip', 'objects');
				
				this.anim.flip = false;
				this.anim.frame = 19;
				this.anim.speed = 35;
				return true
			} else {
				this.location = [];
			}
		}
		return false;
	}
	Wide_Door.prototype.open = function() {
		if (this.placed) {
			if (this.anim) {
				this.anim.flip = true;
			}
		}
	}
	Wide_Door.prototype.close = function() {
		if (this.placed) {
			if (this.anim) {
				this.anim.flip = false;
			}
		}
	}
	// removes the object from the map, doesn't destroy it
	Wide_Door.prototype.remove = function() {
		if (this.placed && this.remove_layout()) {
			//this.erase();
			window.Anims.unregister(this.anim);
			this.anim = false;
			this.placed = false;
			//this.detach_from_map();
			this.uninstall();
			return true;
		}
		return false;
	}
	
	Airlock = window.Entities.add_class('Airlock', 'DThing');
	Airlock.prototype.setup = function() {
		this.name = 'Airlock';
		this.image = 'airlock';
		this.rot_offset = [1, -1];
		this.moveable = true;
		this.buildable = true;
		this.removable = true;
		this.selectable = true;
		this.useable = true;
		this.layout = [[4, 4],
					   [1, 1],
					   [1, 1],
					   [6, 6]];
		this.place_interior = true;
		this.place_exterior = true;
	}
	Airlock.prototype.check_clear = function(loc, rot) {
		var rot_layout;
		if (rot == null) {
			rot = this.rotation;
			rot_layout = this.layout;
		} else {
			rot_layout = this.get_layout(rot);
		}
		if (rot_layout) {
			var w = rot_layout[0].length;
			var h = rot_layout.length;
			
			if (rot == 1) { 
				var coords1 = [loc[0], loc[1] + 2];
				var coords2 = [loc[0] +1, loc[1] + 2];
			} else if (rot == 2) {
				var coords1 = [loc[0] + 1, loc[1]];
				var coords2 = [loc[0] + 1, loc[1] + 1];
			} else if (rot == 3) {
				var coords1 = [loc[0], loc[1] + 1];
				var coords2 = [loc[0] +1, loc[1] + 1];
			} else {
				var coords1 = [loc[0] + 2, loc[1]];
				var coords2 = [loc[0] + 2, loc[1] + 1];
			}
		}
		
		var t = window.Map.get('tiles', coords1[0], coords1[1]);
		if (t == 0) {
			return false;
		} else {
			if (t.built) {
				if (!t.is_wall(true)) {
					return false;
				} else {
					t = window.Map.get('tiles', coords2[0], coords2[1]);
					if (t == 0) {
						return false;
					} else {
						if (t.built) {
							if (!t.is_wall(true)) {
								return false;
							}
						} else {
							return false;
						}
					}
				}
			} else {
				return false;
			}
		}
		
		return true;
	}
	
	
	Basic_Plant = window.Entities.add_class('Basic_Plant', 'DThing');
	Basic_Plant.prototype.setup = function() {
		this.name = 'Basic Plant';
		this.image = 'basic_plant';
		this.moveable = true;
		this.buildable = true;
		this.removable = true;
		this.selectable = true;
		
		this.place_interior = true;
		this.place_exterior = true;
			
		this.layout = [[1]];
		this.anim = false;
		
		this.water_amt = 0;
		this.water_frame = {prop: 1};
		
	}
	Basic_Plant.prototype.place = function(loc, rot) {
		if (loc == null) {
			loc = this.ghost_loc;
		}
		
		if (rot == null) {
			rot = this.ghost_rot;
		}
		
		if (loc && this.check_clear(loc, rot)) {
			
			this.location = loc;
			this.rotation = rot;
			if (this.location == this.ghost_loc) {
				this.hide_ghost();
			}
			if (this.apply_layout(loc, rot)) {
				this.placed = true;
				this.attach_to_map();
				console.log('adding new anim!!');
				this.anim = new anim('basic_plant_life', [6, 1], [32, 32], this.location, this.rotation, this.rot_offset, 'property', 'objects');
				
				this.anim.prop = this.water_frame;
				
				
				var o = window.Map.get('oxygen', this.location[0], this.location[1]);
				o.increment = 5;
				
				
				return true;
			} else {
				this.location = [];
			}
		}
		return false;
	}	
	Basic_Plant.prototype.draw = function() {
		this.ent_draw();
		if (this.placed && this.layout != []) {
			this.drawn = this.anim.draw();
			return this.drawn;
		} else {
			return false; // nothing to draw
		}
	}
	Basic_Plant.prototype.ent_draw = function() {
		if (this.ghost_loc) {
			this.draw_ghost();
		}
		if (this.anim) {
			this.anim.draw()
		}
		if (this.tagged) {
			this.draw_tag(this.tag);
		}
	}
	Basic_Plant.prototype.water = function(amount) {
		this.water_amt += amount;
		if (this.water_amt > 100) {
			this.water_amt = 100;
		}
		
		this.water_frame['prop'] = Math.floor(this.water_amt/20);
		console.log(this.water_amt);
	}
	window.Anims.init(); 

	
	// object images
	window.Draw.add_image('rock', "./textures/ground/crater_small.png");
	window.Draw.add_image('crater_small', "./textures/ground/crater_small.png");
	window.Draw.add_image('crater_medium', "./textures/ground/crater_medium.png");
	window.Draw.add_image('crater_large', "./textures/ground/crater_large.png");
	window.Draw.add_image('derpifier', "./textures/objects/derpifier.png");
	window.Draw.add_image('air_vent', "./textures/objects/air_vent.png");
	window.Draw.add_image('water_tank', "./textures/objects/water_tank.png");
	window.Draw.add_image('launchpad', "./textures/objects/launchpad.png");
	window.Draw.add_image('door_tester', "./textures/objects/door_tester.png");
	window.Draw.add_image('airlock', "./textures/objects/airlock.png");
	window.Draw.add_image('basic_plant', "./textures/objects/basic_plant.png");
	window.Draw.add_image('basic_plant_life', "./textures/objects/basic_plant_life.png");
	window.Draw.add_image('door_opening', "./textures/objects/door_open.png");
	
	// tag images
	window.Draw.add_image('tag_move', "./textures/UI/tag_move.png");
	window.Draw.add_image('tag_build', "./textures/UI/tag_build.png");
	window.Draw.add_image('tag_remove', "./textures/UI/tag_remove.png");

});

