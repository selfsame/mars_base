// Generated by CoffeeScript 1.3.3
(function() {

  window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
      return window.setTimeout(callback, 1000 / 60);
    };
  })();

  Array.prototype.remove = function(item) {
    var indx;
    indx = this.indexOf(item);
    if (indx !== -1) {
      return this.splice(indx, 1);
    }
  };

  Array.prototype.get_last = function() {
    return this[this.length - 1];
  };

  Array.prototype.set_last = function(value) {
    return this[this.length - 1] = value;
  };

  Array.prototype.clone = function() {
    var i, r, _i, _len;
    r = [];
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      i = this[_i];
      r.push(i);
    }
    return r;
  };

  window.get_function_arg_strings = function(func) {
    var funStr, results;
    funStr = func.toString();
    results = funStr.slice(funStr.indexOf("(") + 1, funStr.indexOf(")")).match(/([^\s,]+)/g);
    console.log(results);
    return results;
  };

  window.unique_id_counter = 0;

  window.get_unique_id = function() {
    window.unique_id_counter += 1;
    return window.unique_id_counter;
  };

  $(document).delegate("textarea.tabindent", "keydown", function(e) {
    var end, keyCode, start;
    keyCode = e.keyCode || e.which;
    if (keyCode === 9) {
      e.preventDefault();
      start = $(this).get(0).selectionStart;
      end = $(this).get(0).selectionEnd;
      $(this).val($(this).val().substring(0, start) + "\t" + $(this).val().substring(end));
      return $(this).get(0).selectionStart = $(this).get(0).selectionEnd = start + 1;
    }
  });

  window.util = {
    considered: 0,
    last_click: 0,
    disabled: [],
    double_click: function(element) {
      var date, t;
      element = $(element)[0];
      date = new Date();
      t = date.getTime();
      console.log("click check: ", element, this.considered);
      if (this.considered === element) {
        if (t - this.last_click < 400) {
          console.log("[double_click]: ", this.considered, t - this.last_click);
          this.considered = 0;
          this.last_click = 0;
          return true;
        } else {
          this.considered = element;
          this.last_click = t;
          return false;
        }
      } else {
        this.considered = element;
        this.last_click = t;
        return false;
      }
    },
    disable: function(jq) {
      var element, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = jq.length; _i < _len; _i++) {
        element = jq[_i];
        this.disabled.push(element);
        _results.push($(element).css({
          'opacity': .15,
          'pointer-events': 'none'
        }));
      }
      return _results;
    },
    enable_all: function() {
      var element, _i, _len, _ref;
      _ref = this.disabled;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        $(element).css({
          'opacity': "",
          'pointer-events': ""
        });
      }
      return this.disabled = [];
    },
    constrict: function(value, lower, higher) {
      if (value < lower) {
        value = lower;
      } else if (value > higher) {
        value = higher;
      }
      return value;
    },
    rect_intersect: function(r1, r2) {
      return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
    },
    rect_contains: function(r2, r1) {
      return r2.left > r1.left && r2.right < r1.right && r2.top > r1.top && r2.bottom < r1.bottom;
    }
  };

}).call(this);
