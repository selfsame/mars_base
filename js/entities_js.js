

$(window).ready(function() {
  // create a new class with an ancestor
  Rover = window.Entities.add_class('Rover', 'Walker');

  // adding a method to the new class
  Rover.prototype.setup = function() {
      this.speed = 1;
      this.turn_speed = .005;
      this.footprint_img = 'tracks';
      
    };

  // creating an instance, and adding it to the list of entities that get updated.
  spirit = new Rover('Spirit', 'spirit', [900,1000]);
  spirit.setup();



  // add some rocks
  Rock = window.Entities.add_class('Rock', 'Thing');

  // adding a method to the new class
  Rock.prototype.setup = function() {
      window.Map.set("pathfinding", this.tile_pos[0], this.tile_pos[1], 1);
      this.no_path = true;
      
    };

  var i, _i;
  for (i = _i = 0; _i <= 200; i = ++_i) {
    rock = new Rock('a rock', 'rock', [parseInt(Math.random()*window.Map.width)*window.Map.tilesize, parseInt(Math.random()*window.Map.height)*window.Map.tilesize]);
    rock.setup();
  }
  
  


});


