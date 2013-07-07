$(window).ready(function() {

	window.Draw.add_image('crate_open', "./textures/objects/crate_open.png");
	window.Draw.add_image('crate_closed', "./textures/objects/crate_closed.png");

	Crate = window.Entities.add_class('Crate', 'Placeable');
	
	Crate.prototype._open = function(){
		this.image = 'crate_open';
	};
	Crate.prototype._close = function(){
		this.image = 'crate_closed';
	};
});