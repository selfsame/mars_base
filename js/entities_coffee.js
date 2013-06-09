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
      this.vector = 0;
      return this.tile_pos = [parseInt(this.pos[0] / window.Map.tilesize), parseInt(this.pos[1] / window.Map.tilesize)];
    };

    Walker.prototype._update = function() {
      if (this[this.state] != null) {
        this[this.state]();
      }
      this.draw();
      return this.update();
    };

    Walker.prototype.get_random_tile = function(distance) {
      var x, y;
      if (distance == null) {
        distance = false;
      }
      x = parseInt(Math.random() * window.Map.width);
      y = parseInt(Math.random() * window.Map.height);
      return [x, y];
    };

    Walker.prototype.idle = function() {
      var path;
      this.target = this.get_random_tile();
      path = window.Entities.get_path(this.tile_pos[0], this.tile_pos[1], this.target[0], this.target[1]);
      if (path) {
        this.path = path;
        return this.state = 'moving';
      }
    };

    Walker.prototype.moving = function() {
      var len;
      if (!this.vector) {
        this.vector = new Vector(this.path[0][0] - this.tile_pos[0], this.path[0][1] - this.tile_pos[1], 0);
        len = this.vector.length();
        this.vector = this.vector.unit().multiply(this.speed);
      }
      this.pos[0] += this.vector.x;
      this.pos[1] += this.vector.y;
      this.tile_pos = [parseInt(this.pos[0] / window.Map.tilesize), parseInt(this.pos[1] / window.Map.tilesize)];
      if (this.tile_pos[0] === this.path[0][0] && this.tile_pos[1] === this.path[0][1]) {
        this.path = this.path.splice(1, this.path.length);
        this.vector = 0;
        if (this.path.length === 0) {
          this.state = 'idle';
          return this.vector = 0;
        }
      }
    };

    return Walker;

  })(Entity);

  window.Entities = {
    init: function() {
      this.path_finder = new PF.JumpPointFinder();
      this.sentient = [];
      return this.sentient.push(new Walker('bot', 'sprite', [100, 100]));
    },
    update: function() {
      var thing, _i, _len, _ref, _results;
      if (this.sentient != null) {
        _ref = this.sentient;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          thing = _ref[_i];
          _results.push(thing._update());
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
    }
  };

  $(window).ready(function() {
    return window.Entities.init();
  });

}).call(this);
