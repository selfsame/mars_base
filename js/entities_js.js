

$(window).ready(function() {
  // create a new class with an ancestor
  Rover = window.Entities.add_class('Rover', 'Walker');

  // adding a method to the new class
  Rover.prototype.setup = function() {
      this.speed = 1;
    };

  // creating an instance, and adding it to the list of entities that get updated.
  spirit = new Rover('Spirit', 'spirit', [600,100]);
  spirit.setup();
  window.Entities.sentient.push( spirit );

});


