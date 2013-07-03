// Generated by CoffeeScript 1.3.1
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  $(window).ready(function() {
    var Airtank, Door, Entity, Launchpad, Locker, Derpifier, Placeable, Thing;
    Entity = (function() {

      Entity.name = 'Entity';

      function Entity(nombre, image, pos) {
        this.nombre = nombre != null ? nombre : 'thing';
        this.image = image != null ? image : 'sprite';
        this.pos = pos != null ? pos : [0, 0];
        this.EID = window.get_unique_id();
        this.draw_hooks = [];
        this.tile_pos = [parseInt(this.pos[0] / window.Map.tilesize), parseInt(this.pos[1] / window.Map.tilesize)];
        this.debug = [];
        this.half_size = 16;
        this.no_path = false;
        this.opacity = false;
        this.sprite_size = 32;
        this.sprite_offset = [0, 0];
        this.claimed = false;
        this.state_que = [];
        this.hidden = false;
        this.block_build = false;
        this.needs_draw = true;
        this.persistant_draw = true;
        this.grid_area = false;
        this.init();
        this.init_2();
      }

      Entity.prototype.init = function() {};

      Entity.prototype.init_2 = function() {};

      Entity.prototype.__update = function(delta) {
        this.pos_to_tile_pos();
        this.delta_time = delta;
        this.total_time += delta;
        this.frame_count += 1;
        if (this['_' + this.state] != null) {
          this['_' + this.state]();
        }
        if (!this.hidden) {
          this.draw();
        }
        return this.update(delta);
      };

      Entity.prototype.que_add_first = function(state) {
        return this.state_que = [state].concat(this.state_que);
      };

      Entity.prototype.que_add_last = function(state) {
        return this.state_que.push(state);
      };

      Entity.prototype.hide = function() {
        if (!this.hidden) {
          this.hidden = true;
          if (this.persistant_draw) {
            window.Draw.use_layer('objects');
            return window.Draw.clear_box(this.pos[0], this.pos[1], this.sprite_size, this.sprite_size);
          }
        }
      };

      Entity.prototype.show = function() {
        if (this.hidden) {
          this.hidden = false;
          if (this.persistant_draw) {
            return this.needs_draw = true;
          }
        }
      };

      Entity.prototype.draw = function() {
        var drawn, hook, _i, _len, _ref, _results;
        if (this.persistant_draw === true) {
          if (this.needs_draw) {
            window.Draw.use_layer('objects');
            drawn = window.Draw.image(this.image, this.pos[0] + this.sprite_offset[0], this.pos[1] + this.sprite_offset[0], this.sprite_size, this.sprite_size, this.opacity);
            if (drawn) {
              this.needs_draw = false;
            }
          }
        } else {
          window.Draw.use_layer('entities');
          drawn = window.Draw.image(this.image, this.pos[0] + this.sprite_offset[0], this.pos[1] + this.sprite_offset[0], this.sprite_size, this.sprite_size, this.opacity);
        }
        _ref = this.draw_hooks;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          hook = _ref[_i];
          _results.push(this[hook]());
        }
        return _results;
      };

      Entity.prototype.update = function() {};

      Entity.prototype.pos_to_tile_pos = function() {
        if (this.pos != null) {
          return this.tile_pos = [parseInt((this.pos[0] + this.half_size) / window.Map.tilesize), parseInt((this.pos[1] + this.half_size) / window.Map.tilesize)];
        }
      };

      Entity.prototype.destroy = function() {
        var obj_in_map;
        console.log('destroying ', this);
        window.Entities.objects_hash.remove(this);
        window.Entities.sentient_hash.remove(this);
        if (this.no_path) {
          window.Map.set('pathfinding', this.tile_pos[0], this.tile_pos[1], 0);
        }
        console.log(__indexOf.call(window.Entities.sentient, this) >= 0);
        window.Entities.objects.remove(this);
        window.Entities.sentient.remove(this);
        if (this.persistant_draw) {
          window.Draw.clear_box(this.pos[0], this.pos[1], this.sprite_size, this.sprite_size);
        }
        obj_in_map = window.Map.get('objects', this.tile_pos[0], this.tile_pos[1]);
        if (obj_in_map) {
          obj_in_map.remove(this);
        }
        return delete this;
      };

      return Entity;

    })();
    Thing = (function(_super) {

      __extends(Thing, _super);

      Thing.name = 'Thing';

      function Thing() {
        Thing.__super__.constructor.apply(this, arguments);
		this.world_coords = []; // top left corner, in world coordinates
		this.layout = []; // 2d layout of this object
		this.placed = false;
	  }
	  
	  Thing.prototype.init = function() {
        return this.attach_to_map();
      };
	  
	  // convert local coordinates to world coordinates
	  Thing.prototype.local_to_world = function(local) {
		return [this.world_coords[0] + local[0], this.world_coords[1] + local[1]];
	  }
	  
	  // convert world coordinates to local coordinates
	  Thing.prototype.world_to_local = function(world) {
		return [world[0] - this.world_coords[0], world[1] - this.world_coords[1]];
	  }
	  
	  // attach this object's layout to the correct world maps
	  Thing.prototype.apply_layout = function() {
		if (layout != []) {
			for (var i = 0; i < layout.length; i++) {
				for (var j = 0; j < layout[i].length; j++) {
					var coords = this.local_to_world([i, j]);
					if (this.layout[i][j] == 1) { // collision and placement
						window.Map.set('pathfinding', coords[0], coords[1], 1);
						window.Map.set('objects', coords[0], coords[1], this);
					} else if (this.layout[i][j] != 0) {
						window.Map.set('objects', coords[0], coords[1], this);
					}
				}
			}
		}
	  }
	  
	  // check if it can be placed at given location
	  Thing.prototype.check_clear = function(location) {
		if (layout != []) {
			for (var i = 0; i < layout.length; i++) {
				for (var j = 0; j < layout[i].length; j++) {
					var coords = [location[0] + layout[0], location[1] + layout[1]];
					if (this.layout[i][j] != 0) {
						var ob = window.Map.get('objects', coords[0], coords[1]);
						if (ob != 0) { // an object already exists here
							return false;
						}
					}
				}
			}
		}
		return true;
	  }
	  
	  // place this object at a given location
	  Thing.prototype.place = function(location) {
		if (this.check_clear(location)) {
			this.apply_layout();
			this.world_coords = location;
			// this is where it should be called to draw
			this.placed = true;
			return true;
		} else {
			return false;
		}
	  }

      Thing.prototype.attach_to_map = function(tpos) {
        var i, j, obj_in_map, _i, _ref, _ref1, _results;
        if (tpos == null) {
          tpos = false;
        }
        if (!tpos) {
          tpos = this.tile_pos;
        }
        this.show();
        window.Entities.objects.push(this);
        window.Entities.objects_hash.add(this);
        if (this.grid_area) {
          _results = [];
          for (i = _i = _ref = this.grid_area[0], _ref1 = this.grid_area[1]; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
            _results.push((function() {
              var _j, _ref2, _ref3, _results1;
              _results1 = [];
              for (j = _j = _ref2 = this.grid_area[2], _ref3 = this.grid_area[3]; _ref2 <= _ref3 ? _j <= _ref3 : _j >= _ref3; j = _ref2 <= _ref3 ? ++_j : --_j) {
                obj_in_map = window.Map.get('objects', tpos[0] + i, tpos[1] + j);
                if (!obj_in_map) {
                  _results1.push(window.Map.set('objects', tpos[0] + i, tpos[1] + j, [this]));
                } else {
                  if (__indexOf.call(obj_in_map, this) < 0) {
                    _results1.push(obj_in_map.push(this));
                  } else {
                    _results1.push(void 0);
                  }
                }
              }
              return _results1;
            }).call(this));
          }
          return _results;
        } else {
          obj_in_map = window.Map.get('objects', tpos[0], tpos[1]);
          if (!obj_in_map) {
            return window.Map.set('objects', tpos[0], tpos[1], [this]);
          } else {
            if (__indexOf.call(obj_in_map, this) < 0) {
              return obj_in_map.push(this);
            }
          }
        }
      };

      Thing.prototype.detach_from_map = function() {
        var i, j, obj_in_map, _i, _ref, _ref1, _results;
        this.hide();
        window.Entities.objects.remove(this);
        window.Entities.objects_hash.remove(this);
        if (this.grid_area) {
          _results = [];
          for (i = _i = _ref = this.grid_area[0], _ref1 = this.grid_area[1]; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
            _results.push((function() {
              var _j, _ref2, _ref3, _results1;
              _results1 = [];
              for (j = _j = _ref2 = this.grid_area[2], _ref3 = this.grid_area[3]; _ref2 <= _ref3 ? _j <= _ref3 : _j >= _ref3; j = _ref2 <= _ref3 ? ++_j : --_j) {
                obj_in_map = window.Map.get('objects', this.tile_pos[0] + i, this.tile_pos[1] + j);
                if (obj_in_map && obj_in_map.length > 0) {
                  obj_in_map.remove(this);
                  if (obj_in_map.length === 0) {
                    _results1.push(window.Map.set('objects', this.tile_pos[0] + i, this.tile_pos[1] + j, 0));
                  } else {
                    _results1.push(void 0);
                  }
                } else {
                  _results1.push(void 0);
                }
              }
              return _results1;
            }).call(this));
          }
          return _results;
        } else {
          obj_in_map = window.Map.get('objects', this.tile_pos[0], this.tile_pos[1]);
          if (obj_in_map && obj_in_map.length > 0) {
            obj_in_map.remove(this);
            if (obj_in_map.length === 0) {
              return window.Map.set('objects', this.tile_pos[0], this.tile_pos[1], 0);
            }
          }
        }
      };

      return Thing;

    })(Entity);
    Placeable = (function(_super) {

      __extends(Placeable, _super);

      Placeable.name = 'Placeable';

      function Placeable() {
        return Placeable.__super__.constructor.apply(this, arguments);
      }

      Placeable.prototype.init_2 = function() {
        this.placed_image = this.image;
        this.unplaced_image = this.image;
        this.placed = false;
        this.registered = false;
        if (!this.registered) {
          return window.Placer.register(this);
        }
      };

      Placeable.prototype.place = function() {
        console.log(this.nombre, 'getting placed');
        this.placed = true;
        this.pos_to_tile_pos();
        return this.image = this.placed_image;
      };

      Placeable.prototype.unplace = function() {
        this.placed = false;
        this.image = this.unplaced_image;
        return window.Placer.register(this);
      };

      return Placeable;

    })(Thing);
	Derpifier = (function(_super) {
		__extends(Derpifier, _super);
		Derpifier.name = 'Derpifier';
		function Derpifier() {
			return Derpifier.__super__.constructor.apply(this, arguments);
			this.sprite_size = [128, 64];
			this.layout = [[1, 0, 0, 2],
						   [1, 1, 1, 2]];
		}
		
		Derpifier.prototype.place = function(location) {
			if (this.check_clear(location)) {
				this.apply_layout();
				this.world_coords = location;
				// this is where it should be called to draw
				this.placed = true;
				return true;
			} else {
				return false;
			}
		}
		
		return Derpifier;
		
		
		
	})(Placeable);
    Door = (function(_super) {

      __extends(Door, _super);

      Door.name = 'Door';

      function Door() {
        return Door.__super__.constructor.apply(this, arguments);
      }

      Door.prototype.init = function() {
        this.drawn = false;
        this.open = 0;
        this.attach_to_map();
        window.Draw.use_layer('objects');
        return window.Draw.clear_box(this.pos[0], this.pos[1], 32, 32);
      };

      Door.prototype.place = function() {
        var bottom, center, left, pos, right, top;
        this.placed = true;
        this.pos_to_tile_pos();
        pos = this.tile_pos;
        left = window.Map.get('tiles', pos[0] - 1, pos[1]);
        right = window.Map.get('tiles', pos[0] + 1, pos[1]);
        top = window.Map.get('tiles', pos[0], pos[1] - 1);
        bottom = window.Map.get('tiles', pos[0], pos[1] + 1);
        center = window.Map.get('tiles', pos[0], pos[1]);
        if (left && left.is_wall() && right && right.is_wall()) {
          this.placed_image = 'door_h';
        } else if (top && top.is_wall() && bottom && bottom.is_wall()) {
          this.placed_image = 'door_v';
        }
        this.image = this.placed_image;
        return window.Map.set('pathfinding', this.tile_pos[0], this.tile_pos[1], 0);
      };

      Door.prototype.draw = function() {
        var drawn, hook, _i, _len, _ref, _results;
        if (this.placed) {
          this.placed_draw();
        } else {
          if (this.persistant_draw === true) {
            if (this.needs_draw) {
              window.Draw.use_layer('objects');
              drawn = window.Draw.image(this.image, this.pos[0] + this.sprite_offset[0], this.pos[1] + this.sprite_offset[0], this.sprite_size, this.sprite_size, this.opacity);
              if (drawn) {
                this.needs_draw = false;
              }
            }
          } else {
            window.Draw.use_layer('entities');
            drawn = window.Draw.image(this.image, this.pos[0] + this.sprite_offset[0], this.pos[1] + this.sprite_offset[0], this.sprite_size, this.sprite_size, this.opacity);
          }
        }
        _ref = this.draw_hooks;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          hook = _ref[_i];
          _results.push(this[hook]());
        }
        return _results;
      };

      Door.prototype.placed_draw = function() {
        var hook, _i, _len, _ref, _results;
        this.open -= 1;
        if (this.open < 0) {
          this.open = 0;
        }
        window.Draw.use_layer('objects');
        window.Draw.clear_box(this.pos[0], this.pos[1], 32, 32);
        window.Draw.image('supply', this.pos[0], this.pos[1], 32, 32);
        if (this.image === 'door_h') {
          window.Draw.image('corridor', this.pos[0] + this.sprite_offset[0], this.pos[1] + this.sprite_offset[0] + 11, (this.sprite_size - 1) - this.open, 10, {
            fillStyle: 'red'
          });
        } else {
          window.Draw.image('corridor', this.pos[0] + this.sprite_offset[0] + 11, this.pos[1] + this.sprite_offset[0], 10, (this.sprite_size - 1) - this.open, {
            fillStyle: 'red'
          });
        }
        _ref = this.draw_hooks;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          hook = _ref[_i];
          _results.push(this[hook]());
        }
        return _results;
      };

      Door.prototype.visited = function() {
        this.open += 2;
        if (this.open > 32) {
          return this.open = 32;
        }
      };

      return Door;

    })(Placeable);
    Launchpad = (function(_super) {

      __extends(Launchpad, _super);

      Launchpad.name = 'Launchpad';

      function Launchpad() {
        return Launchpad.__super__.constructor.apply(this, arguments);
      }

      Launchpad.prototype.init = function() {
        this.persistant_draw = true;
        this.block_build = true;
        this.grid_area = [-2, 1, -2, 1];
        return this.attach_to_map([this.tile_pos[0], this.tile_pos[1]]);
      };

      return Launchpad;

    })(Thing);
    Locker = (function(_super) {

      __extends(Locker, _super);

      Locker.name = 'Locker';

      function Locker() {
        return Locker.__super__.constructor.apply(this, arguments);
      }

      return Locker;

    })(Placeable);
    Airtank = (function(_super) {

      __extends(Airtank, _super);

      Airtank.name = 'Airtank';

      function Airtank() {
        return Airtank.__super__.constructor.apply(this, arguments);
      }

      Airtank.prototype.use = function(entity) {
        if (!this.oxygen) {
          this.oxygen = 80000;
          this.max_oxygen = 80000;
        }
        if (this.oxygen > 30) {
          entity.oxygen += 30;
          this.oxygen -= 30;
        } else {
          return true;
        }
        if (entity.oxygen >= entity.max_oxygen) {
          return true;
        }
        if (this.oxygen >= this.max_oxygen) {
          this.nombre = 'empty tank';
          return this.image = 'emptytanks';
        }
      };

      return Airtank;

    })(Placeable);
    window.Entities.classes.Entity = Entity;
    window.Entities.classes.Thing = Thing;
    window.Entities.classes.Placeable = Placeable;
    window.Entities.classes.Door = Door;
    window.Entities.classes.Launchpad = Launchpad;
    window.Entities.classes.Airtank = Airtank;
	window.Entities.classes.Derpifier = Derpifier;
    return window.Entities.classes.Locker = Locker;
  });

}).call(this);
