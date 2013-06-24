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
	
	var i, _i;
	for (i = _i = 0; _i <= 6; i = ++_i) {
		crate = new Crate('Crate', 'crate_closed', [parseInt(Math.random()*window.Map.width)*window.Map.tilesize, parseInt(Math.random()*window.Map.height)*window.Map.tilesize]);

	}

});