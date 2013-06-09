

$(window).ready ->
	window.Draw =

		init: ->
			@images = {}
			@persistant_layers = {}
			@view_layers = {}
			@view_w = $(window).width()
			@view_h = $(window).height()
			@layer_mode = 'view'

			#view properties
			@scroll_x = 0
			@scroll_y = 0
			@zoom = 1.0

			$(window).resize ->
				window.Draw.resize()

		create_layer: (name, persistant=false)->
			canvas = $('<canvas>')
			if persistant
				canvas.attr('width', window.Map.width*window.Map.tilesize)
				canvas.attr('height', window.Map.height*window.Map.tilesize)
				$('#scroll').append canvas
				@persistant_layers[name] = canvas
			else
				canvas.attr('width', @view_w)
				canvas.attr('height', @view_h)
				$('#game_area').append canvas
				@view_layers[name] = canvas


		use_layer: (layer)->
			if @persistant_layers[layer]
				@context = @persistant_layers[layer][0].getContext('2d')
				@layer_mode = 'persistant'
			else if @view_layers[layer]
				@context = @view_layers[layer][0].getContext('2d')
				@layer_mode = 'view'

		resize: ()->
			@view_w = $(window).width()
			@view_h = $(window).height()
			for layer of @view_layers
				@view_layers[layer].attr('width', @view_w)
				@view_layers[layer].attr('height', @view_h)
			@check_scroll(window.Map.last_mouse_pos)
			fake_event =
				originalEvent:
					wheelDeltaY: -120
			@mousewheel( fake_event )

		check_scroll: (mpos)->
			mx = mpos[0]
			my = mpos[1]
			game_w = window.Map.width*window.Map.tilesize * @zoom
			game_h = window.Map.height*window.Map.tilesize * @zoom
			if mx > @view_w-64	
				diff = 64 - (@view_w - mx)
				diff = parseInt(10* (diff/64))
				diff = window.util.constrict(diff, 1, 10)
				if game_w + @scroll_x > @view_w
					@scroll_x -= diff
					if game_w + @scroll_x < @view_w
						@scroll_x = @view_w - game_w
					$('#scroll').css('left', @scroll_x)
			else if mx < 64	
				diff = 64 - mx
				diff = parseInt(10* (diff/64))
				diff = window.util.constrict(diff, 1, 10)
				if @scroll_x < 0
					@scroll_x += diff
					if @scroll_x > 0
						@scroll_x = 0
					$('#scroll').css('left', @scroll_x)

			if my > @view_h-64	
				diff = 64 - (@view_h - my)
				diff = parseInt(10* (diff/64))
				diff = window.util.constrict(diff, 1, 10)
				if game_h + @scroll_y > @view_h
					@scroll_y -= diff
					if game_h + @scroll_y < @view_h
						@scroll_y = @view_h - game_h
					$('#scroll').css('top', @scroll_y)
			else if my < 64	
				diff = 64 - my
				diff = parseInt(10* (diff/64))
				diff = window.util.constrict(diff, 1, 10)
				if @scroll_y < 0
					@scroll_y += diff
					if @scroll_y > 0
						@scroll_y = 0
					$('#scroll').css('top', @scroll_y)

		mousewheel: (e)->
			mx = window.Map.last_mouse_pos[0]
			my = window.Map.last_mouse_pos[1]
			mx -= @scroll_x
			my -= @scroll_y
			ox = mx / @zoom
			oy = my / @zoom


			#find the minimum zoom that doesn't show empty space in the view
			game_w = window.Map.width*window.Map.tilesize
			game_h = window.Map.height*window.Map.tilesize
			min_z = @view_w / game_w
			min_z_h = @view_h / game_h
			if min_z_h > min_z
				min_z = min_z_h
			delta = parseInt(e.originalEvent.wheelDeltaY || -e.originalEvent.detail)
			if delta < 0
				@zoom *= .95
			else if delta > 0
				@zoom *= 1.05
			if @zoom < min_z
				@zoom = min_z
			if @zoom > 3
				@zoom = 3
			if @zoom > .95 and @zoom < 1.05
				@zoom = 1.0

			nox = mx / @zoom
			nox_dif = ox-nox

			noy = my / @zoom
			noy_dif = oy-noy

			$('#scroll').css
				'-moz-transform': 'scale('+@zoom+')'
				'-webkit-transform': 'scale('+@zoom+')'
				'-o-transform': 'scale('+@zoom+')'

			@scroll_x -= nox_dif*@zoom
			exposed_w = @view_w - (game_w*@zoom + @scroll_x)
			if exposed_w > 0
				@scroll_x += exposed_w
			if @scroll_x > 0
				@scroll_x = 0
			$('#scroll').css('left', @scroll_x)

			@scroll_y -= noy_dif*@zoom
			exposed_h = @view_h - (game_h*@zoom + @scroll_y)
			if exposed_h > 0
				@scroll_y += exposed_h
			if @scroll_y > 0
				@scroll_y = 0
			$('#scroll').css('top', @scroll_y)

		update: ()->
			for layer of @view_layers
				@use_layer(layer)
				@clear_box(0,0,@view_w, @view_h)


		add_image: (name, url)->
			img = new Image()
			img.src = url
			$(img).attr('name', name)
			$(img).imagesLoaded ->
				name = this.attr('name')
				if not window.Draw.images[name]
					window.Draw.images[name] = this[0]

		image: (imgname, x,y)->
			w = 32 #@images[imgname].width
			h = 32 #@images[imgname].height

			if @layer_mode is 'view'
				x *= @zoom
				y *= @zoom
				w *= @zoom
				h *= @zoom

				if not @within_view(x,y,w,h)
					#console.log 'not in view'
					return
				else
					x += @scroll_x
					y += @scroll_y

			if @images[imgname]
				@context.drawImage(@images[imgname],x,y, w, h )

		within_view: (x,y,w,h)->
			#takes global pixel values and checks if the draw area is partially visible
			if x+w > -@scroll_x
				if x < @view_w - @scroll_x
					if y+h > -@scroll_y
						if y < @view_h - @scroll_y
							return true

		draw_box: (x=0,y=0,w=100,h=100, options={fillStyle:"transparent", strokeStyle:"rgb(113, 183, 248)", lineWidth:1})->
			

			x += .5 
			y += .5 
			if @layer_mode is 'view'
				x *= @zoom
				y *= @zoom
				w *= @zoom
				h *= @zoom

				if not @within_view(x,y,w,h)
					#console.log 'not in view'
					return
				else
					x += @scroll_x
					y += @scroll_y

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
			@context.fillStyle = options.fillStyle
			@context.strokeStyle = options.strokeStyle
			if options.lineWidth
				@context.lineWidth = options.lineWidth
			@context.beginPath()
			@context.moveTo(x,y)
			@context.lineTo(x2, y2)
			@context.closePath()
			@context.stroke()

		clear_box: (x=0,y=0,w=100,h=100)->
			@context.clearRect(x,y,w,h)


	window.Draw.init()