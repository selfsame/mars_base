

$(window).ready(function() {

  // add some rocks
  Rock = window.Entities.add_class('Rock', 'Thing');

  // adding a method to the new class
  Rock.prototype.setup = function() {
      window.Map.set("pathfinding", this.tile_pos[0], this.tile_pos[1], 1);
      this.no_path = false;
      
    };

  var i, _i;
  for (i = _i = 0; _i <= 270; i = ++_i) {
    rock = new Rock('rock', 'rock', [parseInt(Math.random()*window.Map.width)*window.Map.tilesize, parseInt(Math.random()*window.Map.height)*window.Map.tilesize]);
    rock.setup();
  }
  
  


});


