
window.Map = {
	width: 35,
	height: 25,
	tilesize: 32,
	arrays: {},
	background_drawn: 0,
	init: function(){
		$('#canvas_background, #canvas_view').attr('width', this.width*this.tilesize);
		$('#canvas_background, #canvas_view').attr('height', this.height*this.tilesize);

		// Using array[y][x] so it syncs with how pathfinding works, but our get and set functions will be (x,y)
		this.arrays['background'] = []
		for (i = 0; i <= this.height-1; i += 1) {
			this.arrays['background'].push([]);
			for (j = 0; j <= this.width-1; j += 1) {
				tile = 0;
				if (Math.random() < .4) {
					tile = 1;
				}
				if (Math.random() < .1) {
					tile = 2;
				}
				this.arrays['background'][i].push(tile);
			}
		}

		this.update();

	},
	draw: function(){
		this.draw_background();
	},
	update: function(){
		// will be called every time the window is ready for a new frame
		window.Map.draw();
		window.requestAnimFrame( window.Map.update );
	},
	get: function(layer,x,y){
		if (this.arrays[layer]){
			a = this.arrays[layer]
			if (y >= 0 && y <= this.height-1){
				if (x >= 0 && x <= this.width-1){
					return a[y][x]
				
				}
			}
		}
	},
	draw_background: function(){
		// sloppy check if images are loaded
		if (this.background_drawn == 0 && window.Draw.images.dirt && window.Draw.images.dirt2 && window.Draw.images.dirt3){
			this.background_drawn = 1
			window.Draw.use_background();
			console.log('drawing background', window.Draw.images.dirt);
			for (i = 0; i <= this.height-1; i += 1) {
				for (j = 0; j <= this.width-1; j += 1) {
					tile = this.get('background', j,i)
					tiles = ['dirt','dirt2','dirt3']
					window.Draw.image(tiles[tile],j*this.tilesize,i*this.tilesize);
				}
			}
		}
	}


}




$(window).ready( function(){	
	window.Draw.add_image('dirt', "./textures/ground/dirt.png");
	window.Draw.add_image('dirt2', "./textures/ground/dirt2.png");
	window.Draw.add_image('dirt3', "./textures/ground/dirt3.png");
	window.Draw.add_image('medical', "./textures/ground/room_medical.png");
	window.Draw.add_image('corridor', "./textures/ground/room_corridor.png");
	window.Draw.add_image('rock', "./textures/objects/rock.png");
	window.Draw.add_image('alpha', "./textures/objects/alphasquare.png");
	
	window.Map.init();
});

