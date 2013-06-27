// Generated by CoffeeScript 1.3.3
(function() {

  window.Placer = {
    init: function() {
      this.build_mode = false;
      this.type = false;
      this.valid = false;
      this.available = {};
      this.icons = {};
      this.jobs = [];
      this.job_visuals = [];
      return window.Events.add_listener(this);
    },
    update: function(delta) {
      var color, job, pos, x, y, _i, _len, _ref, _results;
      window.Draw.use_layer('entities');
      if (this.build_mode && this.type) {
        pos = [window.Events.tile_under_mouse[0] * window.Map.tilesize, window.Events.tile_under_mouse[1] * window.Map.tilesize];
        if (this.valid) {
          color = "rgba(0, 255, 255, .5)";
        } else {
          color = "rgba(255, 20, 10, .5)";
        }
        window.Draw.draw_box(pos[0], pos[1], window.Map.tilesize, window.Map.tilesize, {
          fillStyle: color,
          strokeStyle: color,
          lineWidth: 2
        });
      }
      _ref = this.job_visuals;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        job = _ref[_i];
        x = job[2][0] * window.Map.tilesize;
        y = job[2][1] * window.Map.tilesize;
        _results.push(window.Draw.image(job[1], x, y, window.Map.tilesize, window.Map.tilesize, false, .5));
      }
      return _results;
    },
    register: function(object) {
      if (!this.available[object.nombre]) {
        this.available[object.nombre] = 1;
      } else {
        this.available[object.nombre] += 1;
      }
      if (!this.icons[object.nombre]) {
        return this.icons[object.nombre] = object.image;
      }
    },
    mousemove: function(e) {
      var bottom, center, left, pos, right, top, _ref;
      if (this.build_mode && this.type) {
        pos = [window.Events.tile_under_mouse[0], window.Events.tile_under_mouse[1]];
        left = window.Map.get('tiles', pos[0] - 1, pos[1]);
        right = window.Map.get('tiles', pos[0] + 1, pos[1]);
        top = window.Map.get('tiles', pos[0], pos[1] - 1);
        bottom = window.Map.get('tiles', pos[0], pos[1] + 1);
        center = window.Map.get('tiles', pos[0], pos[1]);
        this.valid = false;
        if (this.type === 'door') {
          if (left && left.is_wall() && right && right.is_wall()) {
            return this.valid = 'door_h';
          } else if (top && top.is_wall() && bottom && bottom.is_wall()) {
            return this.valid = 'door_v';
          } else {
            return this.valid = false;
          }
        } else if ((_ref = this.type) === 'poop') {
          if (center && !center.is_wall()) {
            return this.valid = true;
          }
        } else {
          return this.valid = true;
        }
      }
    },
    update_menu: function() {
      var key, option, _results;
      $('#place').find('#menu').html('');
      _results = [];
      for (key in this.available) {
        if (this.available[key] > 0) {
          option = $('<div class="ui_menu_option"><p class="">' + key + ': ' + this.available[key] + '</p><img src="' + window.Draw.images[this.icons[key]].src + '"></div>');
          option.attr('value', key);
          if (this.type && this.type === key) {
            option.addClass('active');
          }
          option.click(function(e) {
            $(this).parent().children().removeClass('active');
            $(this).addClass('active');
            return window.Placer.type = $(this).attr('value');
          });
          _results.push($('#place').find('#menu').append(option));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    mouseup: function(e) {
      var pos;
      if (!$('#UI_overlay').is($(e.target).parents())) {
        if (this.build_mode && this.type && this.valid) {
          pos = [window.Events.tile_under_mouse[0], window.Events.tile_under_mouse[1]];
          this.jobs.push([this.type, pos]);
          this.job_visuals.push([this.type, this.icons[this.type], pos]);
          if (this.available[this.type]) {
            this.available[this.type] -= 1;
          }
          if (this.available[this.type] <= 0) {
            this.available[this.type] = 0;
            this.type = false;
          }
          return this.update_menu();
        }
      }
    },
    confirm: function() {
      var pos, temp;
      pos = [window.Events.tile_under_mouse[0] * window.Map.tilesize, window.Events.tile_under_mouse[1] * window.Map.tilesize];
      return temp = new window.Entities.classes.Door('Door', this.valid, pos);
    },
    job_done: function(order) {
      var job, _i, _len, _ref;
      console.log("PLACER JOB DONE");
      _ref = this.job_visuals;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        job = _ref[_i];
        if (job[0] === order[0] && job[2][0] === order[1][0] && job[2][1] === order[1][1]) {
          this.job_visuals.remove(job);
          return;
        }
      }
    }
  };

  $(window).ready(function() {
    return window.Placer.init();
  });

}).call(this);
