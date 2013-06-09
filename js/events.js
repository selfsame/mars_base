
window.Events = {
	last_mouse_pos: [0,0],
	tile_under_mouse: [0,0],
	listeners: [],
	init: function(){

		// route mouse events
		$('#game_area').mousedown(function(e){
			window.Events.mousedown(e);
		});
		$(window).mousemove(function(e){
			window.Events.mousemove(e);
		});
		$(window).mouseup(function(e){
			window.Events.mouseup(e);
		});
		$(window).bind('mousewheel DOMMouseScroll MozMousePixelScroll', function(e){
			window.Events.mousewheel(e);
		});
		$(window).mouseleave(function(e){
			window.Events.mousemove(e);
		});
		$(window).keydown(function(e){
			window.Events.keydown(e);
		});
		$(window).keyup(function(e){
			window.Events.keyup(e);
		});
		this.update();

	},
	add_listener: function(object){
		this.listeners.push(object);
	},
	delegate: function(eventname, arglist){
		for (_i = 0, _len = this.listeners.length; _i < _len; _i++) {
			object = this.listeners[_i];
			if (typeof object !== "undefined" && object !== null){
				if (typeof object[eventname] !== "undefined" && object[eventname] !== null){
					if (arglist == null){
						object[eventname]();
					} else if (arglist.length == 1){
						object[eventname](arglist[0]);
					} else if (arglist.length == 2){
						object[eventname](arglist[0],arglist[1]);
					} else if (arglist.length == 3){
						object[eventname](arglist[0],arglist[1],arglist[2]);
					}
				}
			}
		}
	},
	mousedown: function(e){
		this.tile_clicked = this.tile_under_mouse;
		this.delegate('mousedown',[e]);
	},
	mousemove: function(e){
		x = e.clientX
		y = e.clientY
		this.last_mouse_pos = [x,y]
		this.delegate('mousemove',[e]);
	},
	mouseup: function(e){
		this.delegate('mouseup',[e]);
	},
	mousewheel: function(e){
		this.delegate('mousewheel',[e]);
	},
	keyup: function(e){
		this.delegate('keyup',[e]);
	},
	keydown: function(e){
		this.delegate('keydown',[e]);
	},
	update: function(){
		
		mtile = window.Events.mouse_to_tile(window.Events.last_mouse_pos[0], window.Events.last_mouse_pos[1]);
		if (mtile){
			window.Events.tile_under_mouse = mtile;
		}

		window.Events.delegate('update');
		window.requestAnimFrame( window.Events.update );
	},
	mouse_to_tile: function(x,y){
		//converts mouse position to tile coords
		if (typeof Draw == "undefined" || Draw == null){
			return false;
		}
		tilesize = window.Map.tilesize
		map_w = window.Map.width
		map_h = window.Map.height
		x -= window.Draw.scroll_x
		y -= window.Draw.scroll_y
		x /= window.Draw.zoom
		y /= window.Draw.zoom
		x = parseInt(x/tilesize);
		y = parseInt(y/tilesize);
		if (x >= 0 && x < map_w && y >= 0 && y < map_h){
			return [x,y];
		} else {
			return false;
		}
	}


}




$(window).ready( function(){	
	window.Events.init();
});

