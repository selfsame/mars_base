
window.Map = {
	width: 64,
	height: 64,
	view_w_px: 640,
	view_h_px: 480,
	tilesize: 32,
	arrays: {},
	background_drawn: 0,
	init: function(){
		// ask for events
		window.Events.add_listener( this );
	
		// create the canvas layers
		window.Draw.create_layer('background', true);
		window.Draw.create_layer('blueprint', true);
		window.Draw.create_layer('entities', false);

		// create pathfinding map
		this.create_layer('pathfinding', 0);

		// Using array[y][x] so it syncs with how pathfinding works, but our get and set functions will be (x,y)
		this.arrays['background'] = []
		for (i = 0; i <= this.height-1; i += 1) {
			this.arrays['background'].push([]);
			for (j = 0; j <= this.width-1; j += 1) {
				tile = 0;
				if (Math.random() < .5) {
					tile = 3;
				}
				if (Math.random() < .3) {
					tile = 1;
				}
				if (Math.random() < .05) {
					tile = 2;
					//this.arrays.pathfinding[i][j] = 1
				}
				this.arrays['background'][i].push(tile);
			}
		}
	},
	draw: function(){
		this.draw_background();
		// indicate the tile under the mouse
		window.Draw.use_layer('entities');
		mtile = window.Events.tile_under_mouse;
		if (mtile){
			x = mtile[0] ;
			y = mtile[1];
			window.Draw.draw_box(x*this.tilesize, y*this.tilesize, this.tilesize, this.tilesize, {fillStyle:'transparent',strokeStyle:'#BADA55',lineWidth:1});
		}
		
	},
	create_layer: function(name, base) {
		// it will create a layer with name "name" of base objects
		this.arrays[name] = [];
		for (i = 0; i <= this.height-1; i++) {
			this.arrays[name].push([]);
			for (j = 0; j <= this.width-1; j++) {
				this.arrays[name][i].push(base);
			}
		}
	},
	update: function(){		
		this.draw();
	},
	get_neighbors: function(layer, x, y) {
		// starts at top left and goes clockwise
		neighbors = [this.get(layer, x-1, y-1), this.get(layer, x, y-1), this.get(layer, x+1, y-1), this.get(layer, x+1, y), 
					 this.get(layer, x+1, y+1), this.get(layer, x, y+1), this.get(layer, x-1, y+1), this.get(layer, x-1, y)];
		return neighbors;
	},
	get_immediate_neighbors: function(layer, x, y) {
		// returns an array of tiles [top, right, bottom, left] with respect to given x, y
		neighbors = [this.get(layer, x, y-1), this.get(layer, x+1, y), this.get(layer, x, y+1), this.get(layer, x-1, y)];
		return neighbors;
	},
	get: function(layer,x,y){
		if (this.arrays[layer]){
			a = this.arrays[layer];
			if (y >= 0 && y <= this.height-1){
				if (x >= 0 && x <= this.width-1){
					return a[y][x];
				
				}
			}
		}
	},
	set: function(layer, x, y, ob) {
		if (this.arrays[layer]){
			a = this.arrays[layer]
			if (y >= 0 && y <= this.height-1){
				if (x >= 0 && x <= this.width-1){
					a[y][x] = ob;
					return a[y][x];
				}
			}
		}
	},
	draw_background: function(){
		// sloppy check if images are loaded
		if (this.background_drawn == 0 && window.Draw.images.dirt && window.Draw.images.dirt2 && window.Draw.images.dirt3){
			this.background_drawn = 1
			window.Draw.use_layer('background');
			for (i = 0; i <= this.height-1; i += 1) {
				for (j = 0; j <= this.width-1; j += 1) {
					tile = this.get('background', j,i)
					tiles = ['dirt','dirt2','dirt3', 'dirt4']
					window.Draw.image(tiles[tile],j*this.tilesize,i*this.tilesize);
				}
			}
		}
	},
	mousedown: function(e){
		tile_clicked = window.Events.tile_under_mouse;
		window.Blueprints.toggle(tile_clicked[0], tile_clicked[1]);
	}

}




$(window).ready( function(){	
	window.Draw.add_image('dirt', "./textures/ground/dirt.png");
	window.Draw.add_image('dirt2', "./textures/ground/dirt2.png");
	window.Draw.add_image('dirt3', "./textures/ground/dirt3.png");
	window.Draw.add_image('dirt4', "./textures/ground/dirt4.png");
	window.Draw.add_image('medical', "./textures/ground/room_medical.png");
	window.Draw.add_image('corridor', "./textures/ground/room_corridor.png");
	window.Draw.add_image('sprite', "./textures/astronauts/sprite.png");
	window.Draw.add_image('spirit', "./textures/astronauts/spirit.png");
	window.Map.init();
});

