// Generated by CoffeeScript 1.3.1
(function() {
  var Airtank, Colonist, Engineer, Entity, Hash, Talker, Thing, Walker,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  window.phrases = {
    'help': ['help!', 'hey guys?', 'this is bad.', 'frack!', 'not good', 'oh no!'],
    'found': ['I see a $1', 'look, a $1'],
    'need': ['I need a $1', 'anybody seen a $1?'],
    'location': ['the $1 is over there', 'I saw a $1', 'look, $1', 'here is the $1'],
    'forget': ['no $1 here'],
    'greet': ['Nice to meet you, $1']
  };

  Entity = (function() {

    Entity.name = 'Entity';

    function Entity(nombre, image, pos) {
      this.nombre = nombre != null ? nombre : 'thing';
      this.image = image != null ? image : 'sprite';
      this.pos = pos != null ? pos : [0, 0];
      this.draw_hooks = [];
      this.tile_pos = [parseInt(this.pos[0] / window.Map.tilesize), parseInt(this.pos[1] / window.Map.tilesize)];
      this.debug = [];
      this.half_size = 16;
      this.no_path = false;
      this.init();
      this.sprite_size = 32;
      this.sprite_offset = [0, 0];
      this.claimed = false;
      this.state_que = [];
      this.hidden = false;
    }

    Entity.prototype.init = function() {};

    Entity.prototype._update = function(delta) {
      this.pos_to_tile_pos();
      this.delta_time = delta;
      this.total_time += delta;
      this.frame_count += 1;
      if (this[this.state] != null) {
        this[this.state]();
      }
      if (!this.hidden) {
        this.draw();
      }
      return this.update(delta);
    };

    Entity.prototype.hide = function() {
      if (!this.hidden) {
        return this.hidden = true;
      }
    };

    Entity.prototype.show = function() {
      if (this.hidden) {
        return this.hidden = false;
      }
    };

    Entity.prototype.draw = function() {
      var hook, _i, _len, _ref, _results;
      window.Draw.use_layer('entities');
      window.Draw.image(this.image, this.pos[0] + this.sprite_offset[0], this.pos[1] + this.sprite_offset[0], this.sprite_size, this.sprite_size);
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
      window.Entities.objects_hash.remove_member(this);
      window.Entities.sentient_hash.remove_member(this);
      if (this.no_path) {
        window.Map.set('pathfinding', this.tile_pos[0], this.tile_pos[1], 0);
      }
      console.log(__indexOf.call(window.Entities.sentient, this) >= 0);
      window.Entities.objects.remove(this);
      window.Entities.sentient.remove(this);
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
      return Thing.__super__.constructor.apply(this, arguments);
    }

    Thing.prototype.init = function() {
      var obj_in_map;
      window.Entities.objects.push(this);
      window.Entities.objects_hash.add(this);
      obj_in_map = window.Map.get('objects', this.tile_pos[0], this.tile_pos[1]);
      if (!obj_in_map) {
        return window.Map.set('objects', this.tile_pos[0], this.tile_pos[1], [this]);
      } else {
        return obj_in_map.push(this);
      }
    };

    return Thing;

  })(Entity);

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

  })(Thing);

  Walker = (function(_super) {

    __extends(Walker, _super);

    Walker.name = 'Walker';

    function Walker() {
      return Walker.__super__.constructor.apply(this, arguments);
    }

    Walker.prototype.init = function() {
      this.state = 'idle';
      this.speed = 4;
      this.turn_speed = .04;
      this.target = 0;
      this.path = 0;
      this.vector = this.normalize_vector(new Vector(0, 1, 0));
      this.new_vector = false;
      this.wait_time = 0;
      this.total_time = 0;
      this.frame_count = 0;
      this.footprint_img = 'prints';
      this.velcoity = .1;
      this.draw_prints = 0;
      this.rotate_sprite = 1;
      this.pos = [this.pos[0] - this.pos[0] % 32, this.pos[1] - this.pos[1] % 32];
      this.sprite_size = 32;
      this.sprite_offset = [0, 0];
      window.Entities.sentient.push(this);
      window.Entities.sentient_hash.add(this);
      return this.setup();
    };

    Walker.prototype.setup = function() {};

    Walker.prototype.draw = function() {
      var hook, i, s, x, y, _i, _j, _len, _len1, _ref, _ref1, _results;
      this.draw_sprite();
      window.Draw.context.fillStyle = 'white';
      window.Draw.draw_text(this.state, this.pos[0] + 2, this.pos[1] + 43, {
        fillStyle: 'white',
        font: 'courier',
        fontsize: 8
      });
      _ref = this.debug;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        s = _ref[i];
        window.Draw.draw_text(s, this.pos[0] + 18, this.pos[1] + i * 11, {
          fillStyle: 'white',
          font: 'courier',
          fontsize: 8
        });
      }
      this.debug = [];
      if (this.target) {
        x = this.target[0] * window.Map.tilesize;
        y = this.target[1] * window.Map.tilesize;
      }
      _ref1 = this.draw_hooks;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        hook = _ref1[_j];
        _results.push(this[hook]());
      }
      return _results;
    };

    Walker.prototype.draw_sprite = function() {
      var rotation;
      rotation = false;
      if (this.vector && this.rotate_sprite) {
        rotation = Math.atan2(this.vector.y, this.vector.x);
        rotation += Math.PI + Math.PI / 2;
      }
      if (this.footprint_img) {
        if (this.draw_prints) {
          this.draw_prints = 0;
          window.Draw.use_layer('background');
          window.Draw.image(this.footprint_img, this.pos[0], this.pos[1], 32, 32, rotation);
        }
      }
      window.Draw.use_layer('entities');
      return window.Draw.image(this.image, this.pos[0] + this.sprite_offset[0], this.pos[1] + this.sprite_offset[0], this.sprite_size, this.sprite_size, rotation);
    };

    Walker.prototype.normalize_vector = function(vector) {
      var len;
      len = vector.length();
      vector = vector.unit().multiply(this.speed);
      return vector;
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

    Walker.prototype.path_to = function(pos) {
      var path;
      path = window.Entities.get_path(this.tile_pos[0], this.tile_pos[1], pos[0], pos[1]);
      if (path && (path.length != null) && path.length > 0) {
        this.path = path;
        this.state = 'moving';
        return true;
      } else {
        this.state = 'wait';
        return false;
      }
    };

    Walker.prototype.idle = function() {
      var use;
      if ((this.state_que != null) && this.state_que.length > 0) {
        use = this.state_que.pop(0);
        this.state = use;
        return;
      }
      this.target = this.get_random_tile(10);
      return this.path_to(this.target);
    };

    Walker.prototype.wait = function() {
      this.wait_time += this.delta_time;
      if (this.wait_time > 600) {
        this.wait_time = 0;
        return this.state = 'idle';
      }
    };

    Walker.prototype.moving = function() {
      var near, p1, p2, tilesize;
      if (!(this.path != null) || this.path.length === 0) {
        this.state = 'wait';
        return;
      }
      tilesize = window.Map.tilesize;
      p1 = this.path[0][0] * tilesize;
      p2 = this.path[0][1] * tilesize;
      this.vect_to_target = new Vector((this.path[0][0] * tilesize) - this.pos[0], (this.path[0][1] * tilesize) - this.pos[1], 0);
      this.dist_to_target = this.vect_to_target.length();
      this.target_vect = this.normalize_vector(this.vect_to_target);
      this.vector = Vector.lerp(this.vector, this.target_vect, this.turn_speed);
      near = 10;
      if (this.pos[0] > p1 - near && this.pos[0] < p1 + near && this.pos[1] > p2 - near && this.pos[1] < p2 + near) {
        this.path = this.path.splice(1, this.path.length);
        this.velocity = .1;
        if (this.path.length === 0) {
          this.state = 'wait';
        }
      } else {
        return this.move(1);
      }
    };

    Walker.prototype.radians_between_vectors = function(v1, v2) {
      var l1, l2, l3;
      l1 = v1.unit();
      l2 = v2.unit();
      l3 = l1.subtract(l2);
      return l3.length();
    };

    Walker.prototype.move = function(friction) {
      var avoid, l, r;
      if (friction == null) {
        friction = .95;
      }
      this.vector = this.vector.multiply(.90);
      if (!this.vvv) {
        this.vvv = new Vector(0, 0, 0);
      }
      if (!this.dist_to_target) {
        return;
      }
      r = this.radians_between_vectors(this.vvv, this.vect_to_target);
      if (r > .5) {
        friction = 1 - r;
      }
      this.vvv = this.vvv.multiply(friction);
      this.vvv = this.vvv.add(this.vector.multiply(.2));
      if (this.vvv.length() > this.speed) {
        this.vvv = this.normalize_vector(this.vvv);
      }
      if (this.vvv.length() > this.speed / 3) {
        if (this.frame_count % 18 === 0) {
          this.draw_prints = 1;
        }
      }
      avoid = this.get_floor_avoidance();
      if ((avoid != null) && (avoid !== false && avoid !== (void 0)) && (avoid.x != null)) {
        l = avoid.length();
        if (l > 1) {
          if (l > 6) {
            avoid = avoid.unit().multiply(6);
          }
          this.pos[0] += avoid.x;
          this.pos[1] += avoid.y;
          window.Entities.sentient_hash.update_member(this);
          return;
        }
      }
      this.pos[0] += this.vvv.x;
      this.pos[1] += this.vvv.y;
      return window.Entities.sentient_hash.update_member(this);
    };

    Walker.prototype.get_floor_avoidance = function() {
      var count, i, j, n_v, nl, tile, v, x, y, _i, _j;
      v = new Vector(0, 0, 0);
      count = 0;
      for (i = _i = -1; _i <= 1; i = ++_i) {
        for (j = _j = -1; _j <= 1; j = ++_j) {
          tile = window.Map.get('pathfinding', this.tile_pos[0] + i, this.tile_pos[1] + j);
          if (tile === 1) {
            x = ((this.tile_pos[0] + i) * window.Map.tilesize) - this.pos[0];
            y = ((this.tile_pos[1] + j) * window.Map.tilesize) - this.pos[1];
            n_v = new Vector(x, y, 0);
            nl = n_v.length();
            count += 1;
            n_v = n_v.unit().multiply(32 / nl);
            v = v.add(n_v);
          }
        }
      }
      if (count > 0) {
        v = v.divide(count).multiply(.11);
        return v;
      }
      return false;
    };

    Walker.prototype.wait = function() {
      this.wait_time += this.delta_time;
      this.move(.8);
      if (this.wait_time > 600) {
        this.wait_time = 0;
        return this.state = 'idle';
      }
    };

    Walker.prototype.n_tiles_away = function(p1, p2, n) {
      if (p1[0] > p2[0] - n && p1[0] < p2[0] + n && p1[1] > p2[1] - n && p1[1] < p2[1] + n) {
        return true;
      }
    };

    return Walker;

  })(Entity);

  Talker = (function(_super) {

    __extends(Talker, _super);

    Talker.name = 'Talker';

    function Talker() {
      return Talker.__super__.constructor.apply(this, arguments);
    }

    Talker.prototype.init_voice = function() {
      console.log('init v');
      this.voice_que = [];
      this.hear_que = [];
      this.draw_hooks.push('draw_voice');
      this.wander_dist = 4;
      this.conversation_timer = 0;
      this.conversation_partner = false;
      return this.memory = {
        objects: {},
        entities: {}
      };
    };

    Talker.prototype.draw_voice = function() {
      var alpha, font, phlen, phrase, ymod;
      if (Math.random() < .2) {
        this._process();
      }
      if ((this.voice_que != null) && this.voice_que.length > 0) {
        this.voice_que[0][1] += 1;
        phrase = this.voice_que[0][0];
        phlen = phrase.length * 10 + 10;
        window.Draw.use_layer('entities');
        alpha = 1 - this.voice_que[0][1] / 90;
        ymod = alpha * 30 - 30;
        font = {
          fillStyle: 'rgba(0,0,0,' + alpha + ')',
          strokeStyle: 'black',
          font: 'courier',
          fontsize: 16
        };
        if (this.voice_que[0][2] === 'emergency') {
          font = {
            fillStyle: 'rgba(255,0,0,' + alpha + ')',
            strokeStyle: 'red',
            font: 'Comic Sans MS',
            fontsize: 20
          };
        }
        window.Draw.draw_box(this.pos[0], this.pos[1] - 20 + ymod, phlen, 20, {
          fillStyle: 'rgba(255,255,255,' + alpha + ')',
          strokeStyle: 'black',
          lineWidth: 0
        });
        window.Draw.draw_lines([[this.pos[0] + 4, this.pos[1] + ymod], [this.pos[0] + 5 + 4, this.pos[1] + 7 + ymod], [this.pos[0] + 10 + 4, this.pos[1] + ymod]], {
          strokeStyle: 'transparent',
          lineWidth: 0
        });
        window.Draw.draw_text(phrase, this.pos[0] + 5, this.pos[1] - 5 + ymod, font);
        if (this.voice_que[0][1] > 90) {
          this.voice_que = this.voice_que.splice(1, this.voice_que.length);
        }
        if (this.voice_que.length > 4) {
          return this.voice_que = this.voice_que.splice(1, this.voice_que.length);
        }
      }
    };

    Talker.prototype.converse = function() {
      var me, target;
      if (this.conversation_partner) {
        this.conversation_timer += 1;
        target = new Vector(this.conversation_partner.pos[0], this.conversation_partner.pos[1], 0);
        me = new Vector(this.pos[0], this.pos[1], 0);
        this.vector = Vector.lerp(this.vector, target.subtract(me), this.turn_speed);
      }
      if (this.conversation_timer > 200) {
        this.conversation_partner = false;
        this.conversation_timer = 0;
        return this.state = 'idle';
      }
    };

    Talker.prototype.get_phrase = function(key) {
      var choice, set;
      if (window.phrases[key] != null) {
        set = window.phrases[key];
        choice = set[parseInt(Math.random() * set.length)];
        if (choice != null) {
          return choice;
        }
      }
    };

    Talker.prototype.say = function(key, arg1, arg2) {
      var guy, phrase, _i, _len, _ref, _results;
      if (arg1 == null) {
        arg1 = false;
      }
      if (arg2 == null) {
        arg2 = false;
      }
      phrase = this.get_phrase(key);
      if (phrase) {
        if (this.voice_que.length < 1) {
          if (key === 'help') {
            this.voice_que.push([phrase.replace(/[$][1]/g, arg1), 0, 'emergency']);
          } else {
            this.voice_que.push([phrase.replace(/[$][1]/g, arg1), 0]);
          }
          _ref = window.Entities.sentient;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            guy = _ref[_i];
            if (guy !== this && guy.hear) {
              _results.push(guy.hear(this, key, arg1, arg2));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      }
    };

    Talker.prototype.hear = function(entity, key, arg1, arg2) {
      if (arg1 == null) {
        arg1 = false;
      }
      if (arg2 == null) {
        arg2 = false;
      }
      return this.hear_que.push([entity, key, arg1, arg2]);
    };

    Talker.prototype._process = function() {
      var arg1, arg2, blocked, entity, found, key, mem, need, needs, obj, r, talk, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2;
      _ref = this.hear_que;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        talk = _ref[_i];
        entity = talk[0];
        key = talk[1];
        arg1 = talk[2];
        arg2 = talk[3];
        needs = [];
        blocked = [];
        if (key === 'forget') {
          if (arg1 && arg2) {
            this._forget(arg1, arg2);
          }
        }
        if (key === 'need') {
          if (arg1) {
            if (__indexOf.call(needs, arg1) < 0) {
              needs.push(arg1);
            }
          }
        }
        if (key === 'location') {
          if (arg2) {
            if (!this.memory.objects[arg1]) {
              this.memory.objects[arg1] = [arg2];
            }
            if (_ref1 = !arg2, __indexOf.call(this.memory.objects[arg1], _ref1) >= 0) {
              this.memory.objects[arg1].push(arg2);
            }
          }
          blocked.push(arg1);
        }
        if (key === 'greet') {
          if (arg1 && arg1 === this.nombre) {
            this.conversation_partner = entity;
            this.state_que = [];
            this.state = 'converse';
            this.say('greet', entity.nombre);
          }
        }
        for (_j = 0, _len1 = needs.length; _j < _len1; _j++) {
          need = needs[_j];
          if (__indexOf.call(blocked, need) < 0) {
            if (this.memory.objects[need] && this.memory.objects[need].length > 0) {
              _ref2 = this.memory.objects[need];
              for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                mem = _ref2[_k];
                r = window.Map.get('objects', mem[0], mem[1]);
                found = false;
                if (r && r.length > 0) {
                  for (_l = 0, _len3 = r.length; _l < _len3; _l++) {
                    obj = r[_l];
                    if (obj.nombre === need) {
                      found = true;
                      this.say('location', need, this.memory.objects[need][0]);
                      this.hear_que = [];
                      return;
                    } else {
                      this._forget(need, mem);
                    }
                  }
                }
              }
            }
          }
        }
        this.hear_que = [];
      }
    };

    return Talker;

  })(Walker);

  Colonist = (function(_super) {

    __extends(Colonist, _super);

    Colonist.name = 'Colonist';

    function Colonist() {
      return Colonist.__super__.constructor.apply(this, arguments);
    }

    Colonist.prototype.setup = function() {
      this.pocket = [];
      this.suit = false;
      this.oxygen = 1200;
      this.max_oxygen = this.oxygen;
      this.state = 'idle';
      this.init_voice();
      return this.goal_actions = {
        oxygen: ['']
      };
    };

    Colonist.prototype.update = function(delta) {
      var tile, w;
      if (this.oxygen != null) {
        tile = window.Map.get('floor', this.tile_pos[0], this.tile_pos[1]);
        if (tile && tile.built) {
          this.oxygen += 5;
        }
        if (this.oxygen > this.max_oxygen) {
          this.oxygen = this.max_oxygen;
        }
        this.oxygen -= 1;
        if (this.oxygen < this.max_oxygen * .9) {
          window.Draw.use_layer('view');
          w = 32 * (this.oxygen / this.max_oxygen);
          window.Draw.draw_box(16 + this.pos[0] - w * .5, this.pos[1] + 30, w, 5, {
            fillStyle: 'red',
            strokeStyle: 'rgba(' + 32 - w + ',' + w + ',' + w + ',.4)',
            lineWidth: 0
          });
        }
        if (this.oxygen < 0) {
          this.die();
        }
      }
    };

    Colonist.prototype.die = function() {
      var corpse;
      corpse = new Thing('a corpse', 'corpse', this.pos);
      return this.destroy();
    };

    Colonist.prototype.pause = function() {};

    Colonist.prototype.idle = function() {
      var use;
      if ((this.state_que != null) && this.state_que.length > 0) {
        use = this.state_que[0];
        this.state_que = this.state_que.slice(1, this.state_que.length);
        this.state = use;
        return;
      }
      if (!this.suit) {
        this.want = 'suit';
        this.state_que.push('find_object');
        this.state_que.push('pickup');
        this.state_que.push('wear_suit');
        return;
      }
      if (this.oxygen < this.max_oxygen * .9) {
        if (this.oxygen < 260) {
          this.state = 'asphyxiation';
          return;
        }
        if (this.oxygen < this.max_oxygen * .8) {
          this.want = 'airtanks';
          this.state_que.push('find_object');
          this.state_que.push('use_object');
          return;
        }
      }
      return this.state = 'work';
    };

    Colonist.prototype.asphyxiation = function() {
      return this.say('help');
    };

    Colonist.prototype.use_object = function() {
      var found, obj, r, _i, _len;
      r = window.Map.get('objects', this.tile_pos[0], this.tile_pos[1]);
      found = false;
      if (r && r.length > 0) {
        for (_i = 0, _len = r.length; _i < _len; _i++) {
          obj = r[_i];
          if (obj.nombre === this.want) {
            found = true;
            if (obj.use) {
              if (obj.use(this)) {
                this.state = 'idle';
                this._forget(this.want, this.tile_pos);
                return;
              } else {
                return;
              }
            }
          }
        }
        if (!found) {
          this._forget(this.want, this.tile_pos);
          this.state_que = [];
          this.state = 'idle';
        }
      }
      this.state_que = [];
      return this.state = 'idle';
    };

    Colonist.prototype.find_object = function() {
      var loc, _i, _len, _ref;
      if ((this.memory.objects[this.want] != null) && this.memory.objects[this.want].length > 0) {
        _ref = this.memory.objects[this.want];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          loc = _ref[_i];
          if (this.path_to(loc)) {
            console.log(this.path);
            this.state_que = ['moving'].concat(this.state_que);
            this.state = 'idle';
            return;
          }
        }
      }
      this.say('need', this.want);
      this.state_que = [];
      return this.state = 'inventory';
    };

    Colonist.prototype.pickup = function() {
      var found, obj, r, _i, _len;
      r = window.Map.get('objects', this.tile_pos[0], this.tile_pos[1]);
      found = false;
      if (r && r.length > 0) {
        for (_i = 0, _len = r.length; _i < _len; _i++) {
          obj = r[_i];
          if (obj.nombre === this.want) {
            console.log('pickup', obj.nombre);
            this._forget(this.want, this.tile_pos);
            this.say('forget', this.want, this.tile_pos);
            found = true;
            r.remove(obj);
            obj.hide();
            this.pocket.push(obj);
            obj.pos = this.pos;
            this.want = false;
            this.state = 'idle';
            return;
          }
        }
      }
      if (!found) {
        this.state_que = [];
        this.state = 'idle';
        if (this._forget(this.want, this.tile_pos)) {
          this.say('forget', this.want, this.tile_pos);
          this.want = false;
        }
      }
    };

    Colonist.prototype._forget = function(nombre, pos) {
      var loc, _i, _len, _ref;
      if (this.memory.objects[nombre]) {
        _ref = this.memory.objects[nombre];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          loc = _ref[_i];
          if (loc[0] === pos[0] && loc[1] === pos[1]) {
            this.memory.objects[nombre].remove(loc);
            return true;
          }
        }
      }
    };

    Colonist.prototype.wear_suit = function() {
      this.suit = true;
      this.oxygen = 6000;
      this.max_oxygen = 6000;
      this.image = 'engineer';
      return this.state = 'idle';
    };

    Colonist.prototype.work = function() {
      return this.state = 'break';
    };

    Colonist.prototype["break"] = function() {
      var guy, near, _i, _len, _ref;
      if (Math.random() < .6) {
        if (Math.random() < .3) {
          this.wander_dist = 10;
          return this.state = 'wander';
        } else {
          return this.path_to([parseInt(window.Map.width / 2 + (Math.random() * 6) - 3), parseInt(window.Map.height / 2 + (Math.random() * 6) - 3)]);
        }
      } else {
        near = window.Entities.sentient_hash.get_within(this.pos, 80);
        if (near) {
          for (_i = 0, _len = near.length; _i < _len; _i++) {
            guy = near[_i];
            if (!this.memory.entities[guy.nombre]) {
              if ((_ref = guy.state) === 'idle' || _ref === 'wait' || _ref === 'break') {
                this.memory.entities[guy.nombre] = true;
                this.say('greet', guy.nombre);
                this.conversation_partner = guy;
                this.state = 'converse';
                return;
              }
            }
          }
        }
      }
    };

    return Colonist;

  })(Talker);

  Engineer = (function(_super) {

    __extends(Engineer, _super);

    Engineer.name = 'Engineer';

    function Engineer() {
      return Engineer.__super__.constructor.apply(this, arguments);
    }

    Engineer.prototype.work = function() {
      var obj, obj_in_map, p, tile, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      if (this.remove_order) {
        if (this.n_tiles_away(this.tile_pos, this.remove_order.tile_pos, 2)) {
          this.remove_order.destroy();
          return this.remove_order = false;
        } else {

        }
      } else if (this.build_order) {
        if (this.n_tiles_away(this.tile_pos, [this.build_order.x, this.build_order.y], 2)) {
          this.build_order.build(this.delta_time * 3);
          if (this.build_order.built) {
            if (!this.build_order.is_wall()) {
              window.Map.set("pathfinding", this.x, this.y, 0);
            }
            console.log('tile built');
            return this.build_order = false;
          }
        } else {
          console.log('not close enough to build');
          window.Tiles.under_construction.push(this.build_order);
          return this.build_order = false;
        }
      } else {
        if (window.Tiles && window.Tiles.under_construction && window.Tiles.under_construction.length > 0) {
          tile = window.Tiles.under_construction[0];
          if (this.path_to([tile.x, tile.y])) {
            this.build_order = tile;
            window.Tiles.under_construction.remove(tile);
            this.state = 'moving';
          } else {
            obj_in_map = window.Map.get('objects', tile.x, tile.y);
            if (obj_in_map && obj_in_map.length) {
              for (_i = 0, _len = obj_in_map.length; _i < _len; _i++) {
                obj = obj_in_map[_i];
                if (obj.no_path) {
                  if (!obj.claimed) {
                    _ref = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                      p = _ref[_j];
                      if (this.path_to([p[0] + tile.x, p[1] + tile.y])) {
                        this.remove_order = obj;
                        this.state = 'moving';
                        obj.claimed = true;
                        return;
                      }
                    }
                  }
                  window.Tiles.under_construction.remove(tile);
                  window.Tiles.under_construction.push(tile);
                  this.state = 'wander';
                  return;
                }
              }
            }
          }
          _ref1 = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            p = _ref1[_k];
            if (this.path_to([p[0] + tile.x, p[1] + tile.y])) {
              this.build_order = tile;
              window.Tiles.under_construction.remove(tile);
              this.state = 'moving';
              return;
            }
          }
        } else {
          if (Math.random() < .3) {
            return this.state = 'inventory';
          } else {
            return this.state = 'break';
          }
        }
      }
    };

    Engineer.prototype.inventory = function() {
      var i, j, obj, objs, pos, _i, _j, _k, _len;
      for (i = _i = -2; _i <= 2; i = ++_i) {
        for (j = _j = -2; _j <= 2; j = ++_j) {
          objs = window.Map.get('objects', this.tile_pos[0] + i, this.tile_pos[1] + j);
          if (objs) {
            for (_k = 0, _len = objs.length; _k < _len; _k++) {
              obj = objs[_k];
              pos = [obj.tile_pos[0], obj.tile_pos[1]];
              if (this.memory.objects[obj.nombre]) {
                this.memory.objects[obj.nombre].push(pos);
              } else {
                this.memory.objects[obj.nombre] = [pos];
              }
            }
          }
        }
      }
      return this.state = 'wander';
    };

    Engineer.prototype.wander = function() {
      this.target = this.get_random_tile(this.wander_dist);
      return this.path_to(this.target);
    };

    Engineer.prototype.removing_object = function() {
      var x, y;
      x = parseInt(Math.random() * 2) - 1;
      y = parseInt(Math.random() * 2) - 1;
      x += this.remove_order.tile_pos[0];
      y += this.remove_order.tile_pos[1];
      return this.path_to([x, y]);
    };

    return Engineer;

  })(Colonist);

  Hash = (function() {

    Hash.name = 'Hash';

    function Hash(size) {
      this.size = size;
      this.data = {};
      this.members = {};
    }

    Hash.prototype.add = function(obj) {
      var bucket;
      if (!this.members[obj]) {
        bucket = this.pos_to_bucket(obj.pos);
        this.members[obj] = bucket;
        if (!this.data[bucket]) {
          this.data[bucket] = [];
        }
        return this.data[bucket].push(obj);
      }
    };

    Hash.prototype.remove_member = function(obj) {
      if (this.members[obj]) {
        this.remove(this.data[this.members[obj]], obj);
      }
      return delete this.members[obj];
    };

    Hash.prototype.pos_to_bucket = function(pos) {
      var bucket;
      return bucket = [parseInt(pos[0] / this.size), parseInt(pos[0] / this.size)];
    };

    Hash.prototype.put_in_data = function(obj, bucket) {
      if (!this.data[bucket]) {
        this.data[bucket] = [];
      }
      if (__indexOf.call(this.data[bucket], obj) < 0) {
        this.data[bucket].push(obj);
      }
      return this.members[obj] = bucket;
    };

    Hash.prototype.update_member = function(obj) {
      var bucket, without;
      if (this.members[obj] != null) {
        bucket = this.pos_to_bucket(obj.pos);
        if (!this.compare(this.members[obj], bucket)) {
          if (this.data[this.members[obj]]) {
            without = this.remove(this.data[this.members[obj]], obj);
            if (without) {
              this.data[this.members[obj]] = without;
            }
            return this.put_in_data(obj, bucket);
          }
        }
      }
    };

    Hash.prototype.remove = function(listing, obj) {
      var index;
      index = listing.indexOf(obj);
      if (index !== -1) {
        listing = listing.splice(index, 1);
      }
      return false;
    };

    Hash.prototype.compare = function(list1, list2) {
      if (list1[0] === list2[0] && list1[1] === list2[1]) {
        return true;
      }
      return false;
    };

    Hash.prototype.get_within = function(pos, dist) {
      var b_radius, bucket, i, j, results, _i, _j, _ref, _ref1, _ref2, _ref3;
      bucket = this.pos_to_bucket(pos);
      b_radius = Math.floor(dist / this.size);
      if (b_radius === 0) {
        b_radius = 1;
      }
      results = [];
      for (i = _i = _ref = bucket[0] - b_radius, _ref1 = bucket[0] + b_radius; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
        for (j = _j = _ref2 = bucket[1] - b_radius, _ref3 = bucket[1] + b_radius; _ref2 <= _ref3 ? _j <= _ref3 : _j >= _ref3; j = _ref2 <= _ref3 ? ++_j : --_j) {
          if (this.data[[i, j]] != null) {
            results = results.concat(this.data[[i, j]]);
          }
        }
      }
      if (results.length > 0) {
        return results;
      } else {
        return false;
      }
    };

    Hash.prototype.get_closest = function(pos, obj_list) {};

    return Hash;

  })();

  window.Entities = {
    init: function() {
      window.Events.add_listener(this);
      this.classes = {
        Entity: Entity,
        Walker: Walker,
        Thing: Thing,
        Engineer: Engineer,
        Airtank: Airtank
      };
      this.path_finder = new PF.JumpPointFinder();
      this.sentient = [];
      this.objects = [];
      this.sentient_hash = new Hash(64);
      return this.objects_hash = new Hash(64);
    },
    update: function(delta) {
      var thing, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (this.objects != null) {
        _ref = this.objects;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          thing = _ref[_i];
          thing._update(delta);
        }
      }
      if (this.sentient != null) {
        _ref1 = this.sentient;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          thing = _ref1[_j];
          if (thing !== void 0) {
            _results.push(thing._update(delta));
          } else {
            _results.push(void 0);
          }
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
    window.Draw.add_image('colonist', "./textures/astronauts/colonist.png");
    window.Draw.add_image('shadow', "./textures/astronauts/shadow.png");
    window.Draw.add_image('engineer', "./textures/astronauts/engineer.png");
    window.Draw.add_image('rock', "./textures/objects/rock.png");
    window.Draw.add_image('wrench', "./textures/objects/wrench.png");
    window.Draw.add_image('launchpad', "./textures/objects/launchpad.png");
    window.Draw.add_image('corpse', "./textures/astronauts/corpse.png");
    window.Draw.add_image('crate', "./textures/objects/crate_closed.png");
    window.Draw.add_image('airtanks', "./textures/objects/airtanks.png");
    window.Draw.add_image('emptytanks', "./textures/objects/emptytanks.png");
    window.Draw.add_image('solarpanel', "./textures/objects/solarpanel.png");
    window.Draw.add_image('wrench', "./textures/objects/wrench.png");
    return window.Entities.init();
  });

}).call(this);
