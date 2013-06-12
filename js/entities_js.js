

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


});


