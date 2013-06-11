function floor_tile(x, y, state) {
	this.x = x;
	this.y = y;
	this.state = state;
	this.style = "corridor";
	this.draw = draw;
	this.check_clear = check_clear;
	this.confirm = confirm;
	this.set_state = set_state;
	this.toggle = toggle;
	this.build = build;
	this.cancel = cancel;
	this.timer = 0;
	
	function toggle(style) { // called when the tile is clicked on
		if (this.state == 0) { // the tile is empty
			this.style = style;
			if (this.check_clear()) {
				this.set_state(1);
			} else {
				this.set_state(2);
			}
		} else if (this.state == 1) { // the tile will be built
			this.set_state(0);
		} else if (this.state == 2) { // the tile is invalid
			this.set_state(0);
		} else if (this.state == 3) { // the tile will be removed
			this.set_state(4);
		} else if (this.state == 4) { // The tile was already build
			this.set_state(3);
		} else if (this.state == 5) { // the tile is being built
			this.set_state(6);
		} else if (this.state == 6) { // the tile is being removed
			this.set-state(5)
		}
	}
	
	function build(delta) { // simulates being worked on by an astronaut, for now. 200ms per build.
		
		this.timer += delta;
		if(this.timer >= 6000) {
			if(this.state == 5) {
				this.set_state(4)
			} else if (this.state == 6) {
				this.set_state(0);
			}
			this.timer = 0;
			window.Floors.under_construction.remove(this);
		}
	}
	
	function set_state(new_state) { // change the tiles state and redraw
		old_state = this.state;
		if (old_state != new_state) {
			this.state = new_state;
			this.draw();
		}
	}
	
	function check_clear() { // check to make sure it is ok to build here
		// THIS IS WHERE YOU CHECK FOR AN OBSTACLE
		return true;
	}
	
	function confirm() { // confirm the build orders
		if (this.state == 1) { // "BUILD"
			window.Floors.under_construction.push(this);
			this.set_state(5);
			return true;
		} else if (this.state == 3) { // "REMOVE'
			window.Floors.under_construction.push(this);
			this.set_state(6);
			return true;
		} else {
			return false;
		}
	}
	
	function cancel() { // cancel all changes to the blueprint
		if (this.state == 1 || this.state == 2 || this.state == 3) {
			this.set_state(0);
		}
	}
	
	function set_style(style) { // change the style (texture/type)
		this.style = style;
		this.draw();
	}
	
	function draw() { // redraw to the blueprint layer
		tilesize = window.Map.tilesize;
		
		if (this.state == 0) { // "EMPTY"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.use_layer("floor");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
		} else if (this.state == 1) { // "BUILD"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint1", this.x * tilesize, this.y * tilesize);
		} else if (this.state == 2) { // "INVALID"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint2", this.x * tilesize, this.y * tilesize);
		} else if (this.state == 3) { // "REMOVE"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint3", this.x * tilesize, this.y * tilesize);
			window.Draw.use_layer("floor");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
		} else if (this.state == 4) { // "BUILT"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint4", this.x * tilesize, this.y * tilesize);
			window.Draw.use_layer("floor");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
		} else if (this.state == 5) { // "BEING BUILT"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint4", this.x * tilesize, this.y * tilesize);
			window.Draw.use_layer("floor");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image("construction", this.x * tilesize, this.y * tilesize);
		} else if (this.state == 6) { // "BEING REMOVED"
			window.Draw.use_layer("blueprint");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image(this.style, this.x * tilesize, this.y * tilesize);
			window.Draw.image("blueprint3", this.x * tilesize, this.y * tilesize);
			window.Draw.use_layer("floor");
			window.Draw.clear_box(this.x * tilesize, this.y * tilesize, tilesize, tilesize);
			window.Draw.image("construction", this.x * tilesize, this.y * tilesize);
		}
	}
}

window.Floors = {
	init: function() {
		this.edit_mode = false;
		this.edit_style = "corridor";
		this.under_construction = [];
		
		// ask for events
		window.Events.add_listener(this);
	
		// load floor images
		window.Draw.add_image('medical', "./textures/ground/room_medical.png");
		window.Draw.add_image('corridor', "./textures/ground/room_corridor.png");
		window.Draw.add_image('laboratory', "./textures/ground/room_laboratory.png");
		window.Draw.add_image('commons', "./textures/ground/room_commons.png");
		window.Draw.add_image('greenhouse', "./textures/ground/room_greenhouse.png");
		window.Draw.add_image('power', "./textures/ground/room_power.png");
		window.Draw.add_image('supply', "./textures/ground/room_supply.png");
		window.Draw.add_image('construction', "./textures/ground/under_construction.png");
		
		// load blueprint images
		window.Draw.add_image('blueprint1', "./textures/ground/blueprint_build.png");
		window.Draw.add_image('blueprint2', "./textures/ground/blueprint_invalid.png");
		window.Draw.add_image('blueprint3', "./textures/ground/blueprint_remove.png");
		window.Draw.add_image('blueprint4', "./textures/ground/blueprint_built.png");
		
		// THIS IS WHERE YOU WOULD CALL A FUNCTION TO FILL THE FLOOR TILE ARRAY
		// fill map layers
		floor_tiles = [];
		blueprint_tiles = [];
		for (i = 0; i <= window.Map.height-1; i++) {
			floor_tiles.push([]);
			for (j = 0; j <= window.Map.width-1; j++) {
				tile = new floor_tile(j, i, 0);
				floor_tiles[i].push(tile);
			}
		}
		
		// create map layers
		window.Map.arrays["floor"] = floor_tiles;
		
		// create draw layers
		window.Draw.create_layer("floor", true);
		window.Draw.create_layer("blueprint", true);
		alert("init");
	},
	confirm_all: function() { // confirm all blueprints
		for(i = 0; i < window.Map.arrays["floor"].length; i++) {
			for(j = 0; j < window.Map.arrays["floor"][i].length; j++) {
				window.Map.arrays["floor"][i][j].confirm();
			}
		}
		console.log("tiles to be built: " + this.under_construction.length);
	},
	mousedown: function(e){
		if (this.edit_mode) {
			// get the tile the user clicked
			tile_coords = window.Events.tile_under_mouse;
			tile = window.Map.get("floor", tile_coords[0], tile_coords[1]);
			tile.toggle(this.edit_style);
		}
	},
	keydown: function(e){
		if (e.keyCode == 49) { // 1
			this.edit_style = "corridor";
		} else if (e.keyCode == 50) { // 2
			this.edit_style = "supply";
		} else if (e.keyCode == 51) { // 3
			this.edit_style = "greenhouse";
		} else if (e.keyCode == 52) { // 4
			this.edit_style = "commons";
		} else if (e.keyCode == 53) { // 5
			this.edit_style = "laboratory";
		} else if (e.keyCode == 54) { // 6
			this.edit_style = "medical";
		} else if (e.keyCode == 55) { // 7
			this.edit_style = "power";
		} else if (e.keyCode == 66) { // b
			if(this.edit_mode) {
				console.log("confirming blueprint orders");
				this.confirm_all();
			}
		} else if (e.keyCode == 86) { // v
			if (this.edit_mode) {
				this.edit_mode = false;
				console.log("Switching view mode to no-edit!");
				window.Draw.hide_layer("blueprint");
			} else {
				this.edit_mode = true;
				console.log("Switching view mode to edit!");
				window.Draw.show_layer("blueprint");
			}
		}
	},
	update: function(delta) {
		for(i = 0; i < this.under_construction.length; i++) {
			this.under_construction[i].build(delta);
		}
	}
}


$(window).ready( function() {
	window.Floors.init();
});