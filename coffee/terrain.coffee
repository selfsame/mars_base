$(window).load ->
  window.Terrain = 
    init: ->
      @width = window.Map.width
      @height = window.Map.height
      @tilesize = window.Map.tilesize
      @perlin = new PERLIN.Generator()
      @perlin.octaves = 6
      @perlin.frequency = .04


    draw_terrain: ->
      console.log "terrain drawing"
      window.Draw.use_layer('background');

      @perlin.generate [0,0], [@width, @height], (point, value)->
        sx = (point[0] + parseInt(point[0] / 16 ) + parseInt(point[1] / 8 ) ) % 8;
        sy = 7 - (point[1] + parseInt(point[1] / 16 ) ) % 8;
        window.Draw.context.globalAlpha = 1.0
        rot = false
        if Math.random() < .1
          rot = (Math.PI / 2) * (parseInt(point[0] / 8 ) % 4)
        window.Draw.sub_image('terrain3',point[0]*32,point[1]*32, 32, 32, 32, [sx,sy], rot  )


        sx = (point[0] + parseInt(point[0]/8) ) % 4;
        sy = (point[1] + parseInt(point[1]/8) ) % 4;
        window.Draw.context.globalAlpha = value
        window.Draw.sub_image('terrain2',point[0]*32,point[1]*32, 32, 32, 32, [sx,sy], Math.pi / 4 * (point[0] / 16 ) % 4 )


      @perlin.octaves = 8
      @perlin.frequency = .02

      @perlin.generate [0,0], [@width, @height], (point, value)->
        if value > .5
          window.Draw.use_layer('background');
          sx = point[0] % 16;
          sy = point[1] % 16;
          window.Draw.context.globalAlpha = (value - .5)*2
          window.Draw.sub_image('terrain',point[0]*32,point[1]*32, 32, 32, 16, [sx,sy] )
  window.Terrain.init()