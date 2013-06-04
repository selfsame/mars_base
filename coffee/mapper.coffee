

$(window).ready ->
	window.mapper =
		mouse_is_down: 0
		init: ->
			@canvas = $('#game_canvas')
			@context = @canvas[0].getContext("2d")



			@grid_w = 30
			@grid_h = 30
			@grid_size = 16
			# grid rows are x, columns y
			@map = []
			for i in [0..@grid_h]
				@map.push []
				for j in [0..@grid_w]
					@map[i].push 0

			@canvas.mousedown (e)->
				window.mapper.mousedown e
			@canvas.mousemove (e)->
				window.mapper.mousemove e
			$(window).mouseup (e)->
				window.mapper.mouseup e

			@draw()



		mousedown: (e)->
			@mouse_is_down = 1

		mousemove: (e)->
			if @mouse_is_down
				pos = @mouse_to_grid e.clientX, e.clientY
				@map[pos[0]][pos[1]] = 1
				@draw()

		mouseup: (e)->
			@mouse_is_down = 0

		mouse_to_grid: (x, y)->
			c_o = @canvas.offset()
			x -= c_o.left
			y -= c_o.top
			x = parseInt(x/16)
			y = parseInt(y/16)
			x = window.util.constrict(x,0, @grid_w)
			y = window.util.constrict(y,0, @grid_h)
			return [x, y]

		draw: ()->
			for row,i in @map
				for column,j in row
					if column is 0
						@draw_box(i*16, j*16, 16, 16)
					else
						@draw_box(i*16, j*16, 16, 16, {fillStyle:"red"})
		draw_box: (x=0,y=0,w=100,h=100, options={fillStyle:"transparent", strokeStyle:"rgb(113, 183, 248)", lineWidth:1})->
			#if options.scale isnt false
			#	x = parseInt(x*window.doc_zoom)
			#	y = parseInt(y*window.doc_zoom)
			#	w = parseInt(w*window.doc_zoom)
			#	h = parseInt(h*window.doc_zoom)

			x += .5 
			y += .5 

			@context.fillStyle = options.fillStyle
			@context.strokeStyle = options.strokeStyle
			@context.lineWidth = options.lineWidth


			@context.beginPath()
			@context.moveTo(x,y)
			@context.lineTo(x+w, y)
			@context.lineTo(x+w, y+h)
			@context.lineTo(x, y+h)
			@context.lineTo(x, y)
			@context.closePath()

			@context.fill()
			if options.lineWidth > 0
				@context.stroke()

	window.mapper.init()