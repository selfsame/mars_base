class Guy
	constructor: (name,color)->
		@name = name
		@color = color
		@pos = window.mapper.get_random_pos()
		@state = 'idle'
		@guy_image = window.mapper.guy_image

	update: ->
		if @state is 'idle'
			
			@target = window.mapper.get_random_pos()
			if @target and @pos
				if window.mapper.map[@target[1]][@target[0]] is 0
					
					try
						@path = window.mapper.get_path(@pos[0], @pos[1], @target[0], @target[1])
						@path = @path.reverse()
						@state = 'has_target'
					catch e
						console.log 'nope', e
						console.log @pos, @target


		if @state is 'has_target'
			mx = 0
			my = 0
			k = @path.length-1
			if @path[k]?
				if @pos[0] < @path[k][0]
					@pos[0] += 1
					mx = 1
				if @pos[0] > @path[k][0]
					@pos[0] -= 1
					mx = 1

				if @pos[1] < @path[k][1]
					@pos[1] += 1
					my = 1
				if @pos[1] > @path[k][1]
					@pos[1] -= 1
					my = 1

				if @pos[0] is @path[k][0] and @pos[1] is @path[k][1]
					if @path.length > 0
						@path.pop(0)
			else
				@state = 'idle'


		for point, i in @path
			if i < @path.length

				point2 = @path[i+1]
				window.mapper.draw_box(3+point[0]*16, 3+point[1]*16, 10,10, {fillStyle:'transparent', strokeStyle:@color,lineWidth:1})
				if point2
					#console.log i, point, point2
					window.mapper.draw_line(8+point[0]*16, 8+point[1]*16, 8+point2[0]*16, 8+point2[1]*16, {strokeStyle:@color,lineWidth:2})
				else
					#console.log @path
					n = 0

				if i is @path.length-1
					window.mapper.draw_line(8+point[0]*16, 8+point[1]*16, 8+@pos[0]*16, 8+@pos[1]*16, {strokeStyle:@color,lineWidth:2})
		

		

		

			

			#point = @path[0]
			#if point?
			#	window.mapper.draw_line(@pos[0]*16, @pos[1]*16, point[0]*16, point[1]*16, {strokeStyle:'white',lineWidth:2})


		img = window.mapper.guy_image
		if img?
			window.mapper.context.drawImage(img, @pos[0]*16, @pos[1]*16)


$(window).ready ->
	window.mapper =
		mouse_is_down: 0
		init: ->
			@canvas = $('#game_canvas')
			@context = @canvas[0].getContext("2d")

			@grid_w = 71
			@grid_h = 50
			@grid_size = 16
			# grid rows are x, columns y
			@map = []
			for i in [0..@grid_h-1]
				@map.push []
				for j in [0..@grid_w-1]
					if j < 1 or j is @grid_w-1 or i < 1 or i is @grid_h-1
						@map[i].push 1
					else
						@map[i].push 0

			
			@path_finder = new PF.JumpPointFinder()

			@canvas.mousedown (e)->
				window.mapper.mousedown e
			@canvas.mousemove (e)->
				window.mapper.mousemove e
			$(window).mouseup (e)->
				window.mapper.mouseup e

			@guys = []
			colors = ['silver','pink','blue','cyan','green','#bada55']
			for i in [0..5]
				@guys.push new Guy('anon', colors[i])

			#Load some images
			@guy_image = new Image()
			@guy_image.src = "./astronaut.png"

			@animate()
			
		get_path: (x,y,x2,y2)->
			grid = new PF.Grid(@grid_w, @grid_h, @map)
			return @path_finder.findPath(x, y, x2, y2, grid)

		mousedown: (e)->
			@mouse_is_down = 1

		mousemove: (e)->
			if @mouse_is_down
				pos = @mouse_to_grid e.clientX, e.clientY
				@map[pos[1]][pos[0]] = 1



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
 
			xy = [parseInt(x), parseInt(y)]
			if @map[xy[1]][xy[0]] isnt 1
				return xy
			else
				@get_random_pos()


		draw: ()->
			@context.clearRect(0,0,@canvas.width(), @canvas.height())
			for row,i in @map
				for column,j in row
					if column is 0
						@draw_box(j*16, i*16, 16, 16, {fillStyle:"transparent", strokeStyle:"rgba(130, 110, 80,.5)", lineWidth:1})
					else
						@draw_box(j*16, i*16, 16, 16, {fillStyle:"silver"})
			for guy in @guys
				guy.update()

		animate: ()->
			#scope here is window
			window.mapper.draw()
			window.requestAnimFrame window.mapper.animate



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

		draw_line: (x=0,y=0,x2=0,y2=0, options={fillStyle:"transparent", strokeStyle:"rgb(113, 183, 248)", lineWidth:1})->


			x += .5 
			y += .5 
			x2 += .5 
			y2 += .5 

			#console.log 'draw_line: ['+x+','+y+']'+'['+x2+','+y2+']'

			@context.fillStyle = options.fillStyle
			@context.strokeStyle = options.strokeStyle
			if options.lineWidth
				@context.lineWidth = options.lineWidth


			@context.beginPath()
			@context.moveTo(x,y)
			@context.lineTo(x2, y2)
			@context.closePath()
			@context.stroke()

	window.mapper.init()