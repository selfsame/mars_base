// Generated by CoffeeScript 1.3.1
(function() {

  window.Placer = {
    init: function() {
      this.build_mode = false;
      this.type = false;
      this.valid = false;
      return window.Events.add_listener(this);
    },
    update: function(delta) {
      var color, pos;
      if (this.build_mode && this.type) {
        pos = [window.Events.tile_under_mouse[0] * window.Map.tilesize, window.Events.tile_under_mouse[1] * window.Map.tilesize];
        if (this.valid) {
          color = "rgba(0, 255, 255,.5)";
        } else {
          color = "rgba(255, 20, 10,.5)";
        }
        return window.Draw.draw_box(pos[0], pos[1], window.Map.tilesize, window.Map.tilesize, {
          fillStyle: color,
          strokeStyle: color,
          lineWidth: 2
        });
      }
    },
    mousemove: function(e) {
      var bottom, left, pos, right, top;
      if (this.build_mode && this.type) {
        pos = [window.Events.tile_under_mouse[0], window.Events.tile_under_mouse[1]];
        left = window.Map.get('tiles', pos[0] - 1, pos[1]);
        right = window.Map.get('tiles', pos[0] + 1, pos[1]);
        top = window.Map.get('tiles', pos[0], pos[1] - 1);
        bottom = window.Map.get('tiles', pos[0], pos[1] + 1);
        if (left && left.is_wall() && right && right.is_wall()) {
          return this.valid = 'door_h';
        } else if (top && top.is_wall() && bottom && bottom.is_wall()) {
          return this.valid = 'door_v';
        } else {
          return this.valid = false;
        }
      }
    },
    mouseup: function(e) {
      var pos, temp;
      if (this.build_mode && this.type) {
        if (this.valid) {
          pos = [window.Events.tile_under_mouse[0] * window.Map.tilesize, window.Events.tile_under_mouse[1] * window.Map.tilesize];
          return temp = new window.Entities.classes.Door('Door', this.valid, pos);
        }
      }
    },
    confirm: function() {
      var pos, temp;
      pos = [window.Events.tile_under_mouse[0] * window.Map.tilesize, window.Events.tile_under_mouse[1] * window.Map.tilesize];
      return temp = new window.Entities.classes.Door('Door', this.valid, pos);
    }
  };

  $(window).ready(function() {
    return window.Placer.init();
  });

}).call(this);
