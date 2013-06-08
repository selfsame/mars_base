
window.Map = {
	width: 35,
	height: 25,
	view_w_px: 640,
	view_h_px: 480,
	tilesize: 32,
	arrays: {},
	background_drawn: 0,
	tile_under_mouse: 0,
	scroll_x: 0,
	scroll_y: 0,
	init: function(){

		// route mouse events
		$('#canvas_view').mousedown(function(e){
			window.Map.mousedown(e);
		});
		$(window).mousemove(function(e){
			window.Map.mousemove(e);
		});
		$(window).mouseup(function(e){
			window.Map.mouseup(e);
		});

		$('#canvas_background').attr('width', this.width*this.tilesize);
		$('#canvas_background').attr('height', this.height*this.tilesize);

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
				}
				this.arrays['background'][i].push(tile);
			}
		}

		this.update();

	},
	draw: function(){
		this.draw_background();

		// check if need scroll
		//this.scroll_view();

		// clear the view
		window.Draw.use_view();
		window.Draw.clear_box(0,0,this.width*this.tilesize, this.height*this.tilesize);

		// indicate the tile under the mouse
		if (this.tile_under_mouse){
			x = this.tile_under_mouse[0] 
			y = this.tile_under_mouse[1]
			window.Draw.draw_box(x*tilesize - this.scroll_x, y*tilesize - this.scroll_y, tilesize, tilesize, {fillStyle:'transparent',strokeStyle:'#BADA55',lineWidth:1});
		}
		
	},
	new_layer: function(name, base) {
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
		// will be called every time the window is ready for a new frame
		window.Map.draw();
		window.requestAnimFrame( window.Map.update );
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
			a = this.arrays[layer]
			if (y >= 0 && y <= this.height-1){
				if (x >= 0 && x <= this.width-1){
					return a[y][x]
				
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
			window.Draw.use_background();
			console.log('drawing background', window.Draw.images.dirt);
			for (i = 0; i <= this.height-1; i += 1) {
				for (j = 0; j <= this.width-1; j += 1) {
					tile = this.get('background', j,i)
					tiles = ['dirt','dirt2','dirt3', 'dirt4']
					window.Draw.image(tiles[tile],j*this.tilesize,i*this.tilesize);
				}
			}
			window.Draw.use_view();
		}
	},
	draw_blueprint_tile: function(name, x, y) {
		// draw the given blueprint square over the map
		if (this.background_drawn == 1 && window.Draw.images.blueprint1 && window.Draw.images.blueprint2){
			window.Draw.use_background();
			tile = this.get(name, x, y);
			if(tile == 1) {
				console.log('drawing blueprint tile', window.Draw.images.blueprint1);
				window.Draw.image("blueprint1", x*this.tilesize, y*this.tilesize);
			} else if (tile == 2 || tile == 3) {
				console.log('drawing blueprint tile', window.Draw.images.blueprint2);
				window.Draw.image("blueprint2", x*this.tilesize, y*this.tilesize);
			} else if (tile == 0) { // kind of a hack for now
				console.log('drawing blueprint tile', window.Draw.images.dirt);
				window.Draw.image("dirt", x*this.tilesize, y*this.tilesize);
			}
			window.Draw.use_view();
		}
	},
	mouse_to_tile: function(x,y){
		//converts mouse position to tile coords
		view_offset = $('#canvas_view').offset();
		x -= view_offset.left;
		y -= view_offset.top;

		x += this.scroll_x
		y += this.scroll_y

		x = parseInt(x/this.tilesize);
		y = parseInt(y/this.tilesize);
		if (x >= 0 && x < this.width && y >= 0 && y < this.height){
			return [x,y];
		} else {
			return false;
		}

	},
	mousedown: function(e){
		this.tile_clicked = this.tile_under_mouse;
		window.Blueprints.toggle('blues1', this.tile_clicked[0], this.tile_clicked[1]);
	},
	mousemove: function(e){
		
		tilesize = window.Map.tilesize
		x = e.clientX
		y = e.clientY
		this.tile_under_mouse = this.mouse_to_tile(x,y)

	},
	mouseup: function(e){

	},
	scroll_view: function(){
		// if the mouse is near the edge of the view and it can scroll, scroll it
		// probably temporary
		sx = parseInt($('#canvas_background').css('left'));
		sy = parseInt($('#canvas_background').css('top'));
		mtile = this.tile_under_mouse
		if (mtile){
			if (mtile[0]*this.tilesize > this.view_w_px-64){
				if ( (this.width*this.tilesize + sx > this.view_w_px) ){
					$('#canvas_background').css('left', sx-5)
					this.scroll_x -= 5;
				}
			}
		}
	}


}




$(window).ready( function(){	
	window.Draw.add_image('dirt', "./textures/ground/dirt.png");
	window.Draw.add_image('dirt2', "./textures/ground/dirt2.png");
	window.Draw.add_image('dirt3', "./textures/ground/dirt3.png");
	window.Draw.add_image('dirt4', "./textures/ground/dirt4.png");
	window.Draw.add_image('blueprint1', "./textures/ground/blueprint_valid.png");
	window.Draw.add_image('blueprint2', "./textures/ground/blueprint_invalid.png");
	window.Draw.add_image('medical', "./textures/ground/room_medical.png");
	window.Draw.add_image('corridor', "./textures/ground/room_corridor.png");
	
	window.Map.init();
});

