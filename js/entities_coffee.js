// Generated by CoffeeScript 1.3.1
(function() {
  var Entity, Walker,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Entity = (function() {

    Entity.name = 'Entity';

    function Entity(name, image, pos) {
      this.name = name != null ? name : 'thing';
      this.image = image != null ? image : 'sprite';
      this.pos = pos != null ? pos : [0, 0];
      this.init();
    }

    Entity.prototype.init = function() {};

    Entity.prototype._update = function() {
      this.draw();
      return this.update();
    };

    Entity.prototype.draw = function() {
      window.Draw.use_layer('entities');
      return window.Draw.image(this.image, this.pos[0], this.pos[1]);
    };

    Entity.prototype.update = function() {};

    return Entity;

  })();

  Walker = (function(_super) {

    __extends(Walker, _super);

    Walker.name = 'Walker';

    function Walker() {
      return Walker.__super__.constructor.apply(this, arguments);
    }

    Walker.prototype.init = function() {
      this.state = 'idle';
      this.speed = 3;
      this.target = 0;
      this.path = 0;
      this.vector = this.normalize_vector(new Vector(0, 1, 0));
      this.new_vector = false;
      this.tile_pos = [parseInt(this.pos[0] / window.Map.tilesize), parseInt(this.pos[1] / window.Map.tilesize)];
      this.wait_time = 0;
      this.total_time = 0;
      this.frame_count = 0;
      this.rotation_ready = 0;
      this.footprint_img = 'prints';
      return window.Draw.make_rotation_sheet(this.image, 32);
    };

    Walker.prototype._update = function(delta) {
      this.delta_time = delta;
      this.total_time += delta;
      this.frame_count += 1;
      if (this[this.state] != null) {
        this[this.state]();
      }
      if (!this.rotation_ready) {
        if (window.Draw.make_rotation_sheet(this.image, 32)) {
          this.rotation_ready = 1;
        }
      }
      this.draw();
      return this.update();
    };

    Walker.prototype.draw = function() {
      var rotation;
      rotation = false;
      if (this.vector) {
        rotation = Math.atan2(this.vector.y, this.vector.x);
        rotation += Math.PI + Math.PI / 2;
      }
      if (this.footprint_img) {
        console.log(this.total_time);
        if (this.frame_count % 8 === 0) {
          window.Draw.use_layer('background');
          window.Draw.image(this.footprint_img, this.pos[0], this.pos[1], 32, 32, rotation);
        }
      }
      window.Draw.use_layer('entities');
      window.Draw.image(this.image, this.pos[0], this.pos[1], 32, 32, rotation);
      window.Draw.context.fillStyle = 'white';
      return window.Draw.draw_text(this.state, this.pos[0], this.pos[1] - 18, {
        fillStyle: 'white',
        font: '18px arial'
      });
    };

    Walker.prototype.get_random_tile = function(distance) {
      var x, y;
      if (distance == null) {
        distance = false;
      }
      if (!distance) {
        x = parseInt(Math.random() * window.Map.width);
        y = parseInt(Math.random() * window.Map.height);
      } else {
        x = parseInt((Math.random() * distance * 2) - distance) + this.tile_pos[0];
        y = parseInt((Math.random() * distance * 2) - distance) + this.tile_pos[1];
        x = window.util.constrict(x, 0, window.Map.width);
        y = window.util.constrict(y, 0, window.Map.height);
      }
      return [x, y];
    };

    Walker.prototype.normalize_vector = function(vector) {
      var len;
      len = vector.length();
      vector = vector.unit().multiply(this.speed);
      return vector;
    };

    Walker.prototype.idle = function() {
      var path;
      this.target = this.get_random_tile(5);
      path = window.Entities.get_path(this.tile_pos[0], this.tile_pos[1], this.target[0], this.target[1]);
      if (path) {
        this.path = path;
        return this.state = 'moving';
      }
    };

    Walker.prototype.wait = function() {
      this.wait_time += this.delta_time;
      if (this.wait_time > 600) {
        this.wait_time = 0;
        return this.state = 'idle';
      }
    };

    Walker.prototype.rotating = function() {
      var fraction, p, r, r1, r2;
      this.wait_time += this.delta_time;
      p = Math.PI;
      r1 = Math.atan2(this.old_vector.y, this.old_vector.x) + p;
      r2 = Math.atan2(this.new_vector.y, this.new_vector.x) + p;
      if (r1 > r2) {
        r = r1 - r2;
      } else {
        r = r2 - r1;
      }
      this.rotate_speed = r * 300;
      if (this.wait_time > this.rotate_speed) {
        this.wait_time = 0;
        this.vector = this.new_vector;
        this.state = 'moving';
        return;
      }
      fraction = this.wait_time / this.rotate_speed;
      return this.vector = Vector.lerp(this.old_vector, this.new_vector, fraction);
    };

    Walker.prototype.moving = function() {
      this.tile_pos = [parseInt(this.pos[0] / window.Map.tilesize), parseInt(this.pos[1] / window.Map.tilesize)];
      if (this.tile_pos[0] === this.path[0][0] && this.tile_pos[1] === this.path[0][1]) {
        this.path = this.path.splice(1, this.path.length);
        if (this.path.length === 0) {
          this.state = 'wait';
          return;
        }
        this.new_vector = this.normalize_vector(new Vector(this.path[0][0] - this.tile_pos[0], this.path[0][1] - this.tile_pos[1], 0));
        this.old_vector = this.vector;
        return this.state = 'rotating';
      } else {
        this.pos[0] += this.new_vector.x;
        return this.pos[1] += this.new_vector.y;
      }
    };

    return Walker;

  })(Entity);

  window.Entities = {
    init: function() {
      window.Events.add_listener(this);
      this.classes = {
        Entity: Entity,
        Walker: Walker
      };
      this.path_finder = new PF.JumpPointFinder();
      this.sentient = [];
      return this.sentient.push(new Walker('bot', 'sprite', [700, 700]));
    },
    update: function(delta) {
      var thing, _i, _len, _ref, _results;
      if (this.sentient != null) {
        _ref = this.sentient;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          thing = _ref[_i];
          _results.push(thing._update(delta));
        }
        return _results;
      }
    },
    get_path: function(x, y, x2, y2) {
      var grid;
      grid = new PF.Grid(window.Map.width, window.Map.height, window.Map.arrays['pathfinding']);
      try {
        return this.path_finder.findPath(x, y, x2, y2, grid);
      } catch (error) {
        return false;
      }
    },
    add_class: function(name, ancestor) {
      if (ancestor == null) {
        ancestor = 'Entity';
      }
      if (this.classes[name] != null) {
        return false;
      }
      if (this.classes[ancestor] != null) {
        eval("this.classes[name] = (function(_super) {          __extends(" + name + ", _super);          function " + name + "() {            return " + name + ".__super__.constructor.apply(this, arguments);          }          return " + name + ";        })(this.classes[ancestor]);");
        return this.classes[name];
      }
    }
  };

  $(window).ready(function() {
    window.Draw.add_image('tracks', "./textures/tracks.png");
    window.Draw.add_image('prints', "./textures/prints.png");
    return window.Entities.init();
  });

}).call(this);
