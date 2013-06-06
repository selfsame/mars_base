

$(window).ready ->
	window.Draw =

		init: ->
			@view = $('#canvas_view')
			@view_context = @view[0].getContext("2d")
			@background = $('#canvas_background')
			@background_context = @background[0].getContext("2d")
			@use_view()
			@images = {}

		use_background: ->
			@context = @background_context
		use_view: ->
			@context = @view_context

		add_image: (name, url)->
			img = new Image()
			img.src = url
			$(img).attr('name', name)
			$(img).imagesLoaded ->
				name = this.attr('name')
				if not window.Draw.images[name]
					window.Draw.images[name] = this[0]



		image: (imgname, x,y)->
			if @images[imgname]
				@context.drawImage(@images[imgname],x,y )

		draw_box: (x=0,y=0,w=100,h=100, options={fillStyle:"transparent", strokeStyle:"rgb(113, 183, 248)", lineWidth:1})->

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
			@context.fillStyle = options.fillStyle
			@context.strokeStyle = options.strokeStyle
			if options.lineWidth
				@context.lineWidth = options.lineWidth
			@context.beginPath()
			@context.moveTo(x,y)
			@context.lineTo(x2, y2)
			@context.closePath()
			@context.stroke()


	window.Draw.init()