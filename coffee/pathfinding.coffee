class Guy
	constructor: (name,color)->
		@name = name
		@color = color
		@pos = window.mapper.get_random_pos()
		@state = 'idle'

	update: ->
		if @state is 'idle'
			@state = 'has_target'
			@target = window.mapper.get_random_pos()
			console.log @pos[0], @pos[1], @target[0], @target[1]
			@path = window.mapper.path_finder.findPath(@pos[0], @pos[1], @target[0], @target[1], window.mapper.path_map);
			for point in @path
				window.mapper.draw_box(point[0]*16, point[1]*16, 16, 16, {fillStyle:@color})


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
			for i in [0..@grid_h-1]
				@map.push []
				for j in [0..@grid_w-1]
					@map[i].push 0

			@path_map = new PF.Grid(@grid_w, @grid_h, @map)
			@path_finder = new PF.JumpPointFinder()

			@canvas.mousedown (e)->
				window.mapper.mousedown e
			@canvas.mousemove (e)->
				window.mapper.mousemove e
			$(window).mouseup (e)->
				window.mapper.mouseup e

			@guys = []
			colors = ['silver','pink','blue','cyan','green','#bada55']
			for i in [0..1]
				@guys.push new Guy('anon', colors[i])

			@draw()
			for guy in @guys
				guy.update()


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

		get_random_pos: ->
			x = Math.random()*(@grid_w-1)
			y = Math.random()*(@grid_h-1)
			return [parseInt(x), parseInt(y)]


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