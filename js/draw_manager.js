// Generated by CoffeeScript 1.3.3
(function() {

  $(window).ready(function() {
    window.Draw = {
      init: function() {
        window.Events.add_listener(this);
        this.images = {};
        this.persistant_layers = {};
        this.view_layers = {};
        this.view_w = $(window).width();
        this.view_h = $(window).height();
        this.layer_mode = 'view';
        this.rotation_sheets = {};
        this.scroll_x = 0;
        this.scroll_y = 0;
        this.zoom = 1.0;
        $(window).resize(function() {
          return window.Draw.resize();
        });
        return $('#scroll').css({
          '-moz-transform': 'scale(' + this.zoom + ')',
          '-webkit-transform': 'scale(' + this.zoom + ')',
          '-o-transform': 'scale(' + this.zoom + ')'
        });
      },
      create_layer: function(name, persistant) {
        var canvas;
        if (persistant == null) {
          persistant = false;
        }
        canvas = $('<canvas>');
        if (persistant) {
          canvas.attr('width', window.Map.width * window.Map.tilesize);
          canvas.attr('height', window.Map.height * window.Map.tilesize);
          $('#scroll').append(canvas);
          return this.persistant_layers[name] = canvas;
        } else {
          canvas.attr('width', this.view_w);
          canvas.attr('height', this.view_h);
          $('#background_clip').append(canvas);
          return this.view_layers[name] = canvas;
        }
      },
      use_layer: function(layer) {
        if (this.persistant_layers[layer]) {
          this.context = this.persistant_layers[layer][0].getContext('2d');
          this.layer_mode = 'persistant';
        } else if (this.view_layers[layer]) {
          this.context = this.view_layers[layer][0].getContext('2d');
          this.layer_mode = 'view';
        }
        this.context.imageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        return this.context.webkitImageSmoothingEnabled = false;
      },
      hide_layer: function(layer) {
        if (this.persistant_layers[layer]) {
          return this.persistant_layers[layer].hide();
        } else if (this.view_layers[layer]) {
          return this.view_layers[layer].hide();
        }
      },
      show_layer: function(layer) {
        if (this.persistant_layers[layer]) {
          return this.persistant_layers[layer].show();
        } else if (this.view_layers[layer]) {
          return this.view_layers[layer].show();
        }
      },
      resize: function() {
        var fake_event, layer;
        this.view_w = $(window).width();
        this.view_h = $(window).height();
        for (layer in this.view_layers) {
          this.view_layers[layer].attr('width', this.view_w);
          this.view_layers[layer].attr('height', this.view_h);
        }
        this.check_scroll(window.Events.last_mouse_pos);
        fake_event = {
          originalEvent: {
            wheelDeltaY: -120
          }
        };
        return this.mousewheel(fake_event);
      },
      check_scroll: function(mpos) {
        var diff, game_h, game_w, mx, my;
        mx = mpos[0];
        my = mpos[1];
        game_w = window.Map.width * window.Map.tilesize * this.zoom;
        game_h = window.Map.height * window.Map.tilesize * this.zoom;
        if (mx > this.view_w - 64) {
          diff = 64 - (this.view_w - mx);
          diff = parseInt(10 * (diff / 64));
          diff = window.util.constrict(diff, 1, 10);
          if (game_w + this.scroll_x > this.view_w) {
            this.scroll_x -= diff;
            if (game_w + this.scroll_x < this.view_w) {
              this.scroll_x = this.view_w - game_w;
            }
            $('#scroll').css('left', this.scroll_x);
          }
        } else if (mx < 64) {
          diff = 64 - mx;
          diff = parseInt(10 * (diff / 64));
          diff = window.util.constrict(diff, 1, 10);
          if (this.scroll_x < 0) {
            this.scroll_x += diff;
            if (this.scroll_x > 0) {
              this.scroll_x = 0;
            }
            $('#scroll').css('left', this.scroll_x);
          }
        }
        if (my > this.view_h - 64) {
          diff = 64 - (this.view_h - my);
          diff = parseInt(10 * (diff / 64));
          diff = window.util.constrict(diff, 1, 10);
          if (game_h + this.scroll_y > this.view_h) {
            this.scroll_y -= diff;
            if (game_h + this.scroll_y < this.view_h) {
              this.scroll_y = this.view_h - game_h;
            }
            return $('#scroll').css('top', this.scroll_y);
          }
        } else if (my < 64) {
          diff = 64 - my;
          diff = parseInt(10 * (diff / 64));
          diff = window.util.constrict(diff, 1, 10);
          if (this.scroll_y < 0) {
            this.scroll_y += diff;
            if (this.scroll_y > 0) {
              this.scroll_y = 0;
            }
            return $('#scroll').css('top', this.scroll_y);
          }
        }
      },
      mousewheel: function(e) {
        var delta, exposed_h, exposed_w, game_h, game_w, min_z, min_z_h, mx, my, nox, nox_dif, noy, noy_dif, ox, oy;
        mx = window.Events.last_mouse_pos[0];
        my = window.Events.last_mouse_pos[1];
        mx -= this.scroll_x;
        my -= this.scroll_y;
        ox = mx / this.zoom;
        oy = my / this.zoom;
        game_w = window.Map.width * window.Map.tilesize;
        game_h = window.Map.height * window.Map.tilesize;
        min_z = this.view_w / game_w;
        min_z_h = this.view_h / game_h;
        if (min_z_h > min_z) {
          min_z = min_z_h;
        }
        delta = parseInt(e.originalEvent.wheelDeltaY || -e.originalEvent.detail);
        if (delta < 0) {
          this.zoom *= .95;
        } else if (delta > 0) {
          this.zoom *= 1.05;
        }
        if (this.zoom < min_z) {
          this.zoom = min_z;
        }
        if (this.zoom > 3) {
          this.zoom = 3;
        }
        if (this.zoom > .95 && this.zoom < 1.05) {
          this.zoom = 1.0;
        }
        nox = mx / this.zoom;
        nox_dif = ox - nox;
        noy = my / this.zoom;
        noy_dif = oy - noy;
        $('#scroll').css({
          '-moz-transform': 'scale(' + this.zoom + ')',
          '-webkit-transform': 'scale(' + this.zoom + ')',
          '-o-transform': 'scale(' + this.zoom + ')'
        });
        this.scroll_x -= nox_dif * this.zoom;
        exposed_w = this.view_w - (game_w * this.zoom + this.scroll_x);
        if (exposed_w > 0) {
          this.scroll_x += exposed_w;
        }
        if (this.scroll_x > 0) {
          this.scroll_x = 0;
        }
        $('#scroll').css('left', this.scroll_x);
        this.scroll_y -= noy_dif * this.zoom;
        exposed_h = this.view_h - (game_h * this.zoom + this.scroll_y);
        if (exposed_h > 0) {
          this.scroll_y += exposed_h;
        }
        if (this.scroll_y > 0) {
          this.scroll_y = 0;
        }
        return $('#scroll').css('top', this.scroll_y);
      },
      update: function() {
        var layer;
        for (layer in this.view_layers) {
          this.use_layer(layer);
          this.clear_box(0, 0, this.view_w, this.view_h);
        }
        return this.check_scroll(window.Events.last_mouse_pos);
      },
      add_image: function(name, url) {
        var img;
        img = new Image();
        img.src = url;
        $(img).attr('name', name);
        return $(img).imagesLoaded(function() {
          name = this.attr('name');
          if (!window.Draw.images[name]) {
            return window.Draw.images[name] = this[0];
          }
        });
      },
      image: function(imgname, x, y, w, h, rotation, opacity) {
        if (w == null) {
          w = 32;
        }
        if (h == null) {
          h = 32;
        }
        if (rotation == null) {
          rotation = false;
        }
        if (opacity == null) {
          opacity = false;
        }
        if (opacity) {
          this.context.globalAlpha = parseFloat(opacity);
        }
        if (this.layer_mode === 'view') {
          x *= this.zoom;
          y *= this.zoom;
          w *= this.zoom;
          h *= this.zoom;
          if (!this.within_view(x, y, w, h)) {
            return;
          } else {
            x += this.scroll_x;
            y += this.scroll_y;
          }
        }
        if (this.images[imgname]) {
          if (rotation) {
            this.context.save();
            this.context.translate(x + (w / 2), y + (h / 2));
            this.context.rotate(rotation);
            this.context.drawImage(this.images[imgname], -(w / 2), -(h / 2), w, h);
            this.context.restore();
          } else {
            this.context.drawImage(this.images[imgname], x, y, w, h);
          }
          this.context.globalAlpha = 1.0;
          return true;
        } else {
          this.context.globalAlpha = 1.0;
          return false;
        }
      },
      within_view: function(x, y, w, h) {
        if (x + w > -this.scroll_x) {
          if (x < this.view_w - this.scroll_x) {
            if (y + h > -this.scroll_y) {
              if (y < this.view_h - this.scroll_y) {
                return true;
              }
            }
          }
        }
      },
      draw_box: function(x, y, w, h, options) {
        if (x == null) {
          x = 0;
        }
        if (y == null) {
          y = 0;
        }
        if (w == null) {
          w = 100;
        }
        if (h == null) {
          h = 100;
        }
        if (options == null) {
          options = {
            fillStyle: "transparent",
            strokeStyle: "rgb(113, 183, 248)",
            lineWidth: 1
          };
        }
        x += .5;
        y += .5;
        if (this.layer_mode === 'view') {
          x *= this.zoom;
          y *= this.zoom;
          w *= this.zoom;
          h *= this.zoom;
          if (!this.within_view(x, y, w, h)) {
            return;
          } else {
            x += this.scroll_x;
            y += this.scroll_y;
          }
        }
        this.context.fillStyle = options.fillStyle;
        this.context.strokeStyle = options.strokeStyle;
        this.context.lineWidth = options.lineWidth;
        this.context.beginPath();
        this.context.moveTo(x, y);
        this.context.lineTo(x + w, y);
        this.context.lineTo(x + w, y + h);
        this.context.lineTo(x, y + h);
        this.context.lineTo(x, y);
        this.context.closePath();
        this.context.fill();
        if (options.lineWidth > 0) {
          return this.context.stroke();
        }
      },
      draw_lines: function(set, options) {
        var p, _i, _j, _len, _len1;
        if (options == null) {
          options = {
            fillStyle: "transparent",
            strokeStyle: "rgb(113, 183, 248)",
            lineWidth: 1
          };
        }
        for (_i = 0, _len = set.length; _i < _len; _i++) {
          p = set[_i];
          p[0] += .5;
          p[1] += .5;
          if (this.layer_mode === 'view') {
            p[0] *= this.zoom;
            p[1] *= this.zoom;
            if (!this.within_view(p[0], p[1], p[0], p[1])) {
              return;
            } else {
              p[0] += this.scroll_x;
              p[1] += this.scroll_y;
            }
          }
        }
        this.context.fillStyle = options.fillStyle;
        this.context.strokeStyle = options.strokeStyle;
        if (options.lineWidth) {
          this.context.lineWidth = options.lineWidth;
        }
        this.context.beginPath();
        this.context.moveTo(p[0], p[1]);
        for (_j = 0, _len1 = set.length; _j < _len1; _j++) {
          p = set[_j];
          this.context.lineTo(p[0], p[1]);
        }
        this.context.closePath();
        this.context.fill();
        return this.context.stroke();
      },
      draw_line: function(x, y, x2, y2, options) {
        if (x == null) {
          x = 0;
        }
        if (y == null) {
          y = 0;
        }
        if (x2 == null) {
          x2 = 0;
        }
        if (y2 == null) {
          y2 = 0;
        }
        if (options == null) {
          options = {
            fillStyle: "transparent",
            strokeStyle: "rgb(113, 183, 248)",
            lineWidth: 1
          };
        }
        x += .5;
        y += .5;
        x2 += .5;
        y2 += .5;
        this.context.fillStyle = options.fillStyle;
        this.context.strokeStyle = options.strokeStyle;
        if (options.lineWidth) {
          this.context.lineWidth = options.lineWidth;
        }
        this.context.beginPath();
        this.context.moveTo(x, y);
        this.context.lineTo(x2, y2);
        this.context.closePath();
        return this.context.stroke();
      },
      draw_text: function(string, x, y, options) {
        if (options == null) {
          options = {
            fillStyle: 0,
            font: 'arial',
            fontsize: 24,
            scale: true,
            rulerw: 16,
            use_scroll: true
          };
        }
        if (this.layer_mode === 'view') {
          x *= this.zoom;
          y *= this.zoom;
          x += this.scroll_x;
          y += this.scroll_y;
        }
        x += .5;
        y -= .5;
        if (options.fillStyle) {
          this.context.fillStyle = options.fillStyle;
        }
        if (options.font) {
          if (this.layer_mode === 'view') {
            options.fontsize *= this.zoom;
          }
          this.context.font = parseInt(options.fontsize) + 'px ' + options.font + ' ';
        }
        return this.context.fillText(string, x, y);
      },
      clear_box: function(x, y, w, h) {
        if (x == null) {
          x = 0;
        }
        if (y == null) {
          y = 0;
        }
        if (w == null) {
          w = 100;
        }
        if (h == null) {
          h = 100;
        }
        return this.context.clearRect(x, y, w, h);
      },
      sub_image: function(imgname, x, y, w, h, clipsize, offset, rotation) {
        var sx, sy;
        if (clipsize == null) {
          clipsize = 32;
        }
        if (offset == null) {
          offset = [0, 0];
        }
        if (rotation == null) {
          rotation = false;
        }
        if (this.layer_mode === 'view') {
          x *= this.zoom;
          y *= this.zoom;
          w *= this.zoom;
          h *= this.zoom;
          if (!this.within_view(x, y, w, h)) {
            return;
          } else {
            x += this.scroll_x;
            y += this.scroll_y;
          }
        }
        if (this.images[imgname]) {
          sx = offset[0] * clipsize;
          sy = offset[1] * clipsize;
          if (rotation) {
            this.context.save();
            this.context.translate(x + (w / 2), y + (h / 2));
            this.context.rotate(rotation);
            this.context.drawImage(this.images[imgname], sx, sy, clipsize, clipsize, -(w / 2), -(h / 2), w, h);
            this.context.restore();
          } else {
            this.context.drawImage(this.images[imgname], sx, sy, clipsize, clipsize, x, y, w, h);
          }
          return true;
        } else {
          return false;
        }
      }
    };
    return window.Draw.init();
  });

}).call(this);
