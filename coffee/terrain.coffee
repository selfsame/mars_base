$(window).load ->

  

  window.Terrain = 
    init: ->
      @width = window.Map.width
      @height = window.Map.height
      @tilesize = window.Map.tilesize
      @perlin = new PERLIN.Generator()
      @perlin.octaves = 9
      @perlin.frequency = .09
      @zones = {}


    draw_terrain: ->
      console.log "terrain drawing"
      window.Draw.use_layer('background');

      @perlin.generate [0,0], [@width, @height], (point, value)->
        sx = (point[0] + parseInt(point[0] / 16 ) + parseInt(point[1] / 8 ) ) % 8;
        sy = 7 - (point[1] + parseInt(point[1] / 16 ) ) % 8;
        #sx = (parseInt(point[0]) ) % 8;
        #sy = (parseInt(point[1]) ) % 8;
        window.Draw.context.globalAlpha = 1.0
        rot = false
        #if Math.random() < .1
        #  rot = (Math.PI / 2) * (parseInt(point[0] / 8 ) % 4)
        window.Draw.sub_image('terrain3',point[0]*32,point[1]*32, 32, 32, 32, [sx,sy], rot  )


        sx = (parseInt(point[0]) ) % 16;
        sy = (parseInt(point[1]) ) % 16;
        window.Draw.context.globalAlpha = value*value 
        window.Draw.sub_image('terrain',point[0]*32,point[1]*32, 32, 32, 16, [sx,sy]  )



      




      @perlin.octaves = 5
      @perlin.frequency = .6
      
      

      @do_zone('dark')

      for column, j in @zones['dark']
        for row,  i in column
          draw = false
          

          TL = id & 1
          T = id & 2
          TR = id & 4
          L = id & 8
          R = id & 16
          BL = id & 32
          B = id & 64
          BR = id & 128
          M = id & 256

          DTL = [0,0]
          DT = [1,0]
          DTR = [2, 0]
          DL = [0,1]
          DR = [2, 1]
          DBL = [0,2]
          DB = [1, 2]
          DBR = [2, 2]

          DTLI = [1,4]
          DTRI = [2,4]
          DBLI = [1,5]
          DBRI = [2,5]
          DH = [0,4]
          DV = [0,5]

          CAPN = [1,7]
          CAPS = [0,6]
          CAPE = [0,7]
          CAPW = [1,6]
          HOLE = [0,5]

          draw = false

          #(8 | 1 | 16 | 4) & 13
          id = @get_identity 'zone_dark', [i  ,j], (v)->
            if v > .5
              return true


          if M
            if B and !T and L and R 
              draw = DT
            if T and !B and L and R
              draw = DB

            #else if R and not L
            #  draw = DL 

            if L and !R and T and B
              draw = DR
            if R and !L and T and B
              draw = DL
            

            if T and R and (!L and !B)
              draw = DBL
            if T and L and (!R and !B)
              draw = DBR

            if B and R and (!L and !T)
              draw = DTL
            if B and L and (!R and !T)
              draw = DTR

            if T and B and R and L
              if !TL and TR and BL and BR
                draw = DBRI
              if !TR and TL and BL and BR
                draw = DBLI
              if !BL and TR and TL and BR
                draw = DTRI
              if !BR and TR and TL and BL
                draw = DTLI

            if (L or R) and !T and !B
              draw = DV

            if !L and !R and (T or B)
              draw = DH

            if !L and !R and !T and !B
              draw = HOLE

            if !L and !R and B and !T
              draw = CAPN
            if !L and !R and !B and T
              draw = CAPS
            if !L and R and !B and !T
              draw = CAPE
            if L and !R and !B and !T
              draw = CAPW




          window.Draw.use_layer('background');
          
          window.Draw.context.globalAlpha = 1.0
          if draw
            window.Draw.context.globalAlpha = row + .1
            window.Draw.sub_image('zone01',(i ) *32,j*32, 32, 32, 32, draw ) 
            #window.Draw.draw_box((i ) *32,j*32, 32, 32)
          else if M
            sx = Math.floor(Math.random()*4);
            sy = Math.floor( Math.random()*6);
            window.Draw.context.globalAlpha = (row+.1)* .8
            window.Draw.sub_image('zone01',(i )*32,j*32, 32, 32, 32, [sx + 3, sy] ) 





      @perlin = new PERLIN.Generator()
      @perlin.octaves = 2
      @perlin.frequency = .07
      @perlin.persistance = .2
      @perlin.generate [0,0], [@width, @height], (point, value)->

        if value > 0
          window.Draw.use_layer('background');
          sx = point[0] % 16;
          sy = point[1] % 16;
          window.Draw.context.globalAlpha = (1-value)*(1-value)
          window.Draw.sub_image('terrain2',point[0]*32,point[1]*32, 32, 32, 32, [sx,sy] ) 


 


    get_identity: (map, pos, threshold = false)->
      if not threshold
        threshold = (v)->
          if v > 0
            return true
          false
      TL = 1
      T = 2
      TR = 4
      L = 8
      R = 16
      BL = 32
      B = 64
      BR = 128
      M = 256

      id = 0
      if threshold window.Map.get(map, pos[0], pos[1] ) 
        id += M
      if threshold window.Map.get(map, pos[0]-1, pos[1]-1 ) 
        id += TL
      if threshold window.Map.get(map, pos[0], pos[1]-1 ) 
        id += T
      if threshold window.Map.get(map, pos[0]+1, pos[1]-1 ) 
        id += TR
      if threshold window.Map.get(map, pos[0]-1, pos[1] ) 
        id += L
      if threshold window.Map.get(map, pos[0]+1, pos[1] ) 
        id += R
      if threshold window.Map.get(map, pos[0]-1, pos[1]+1 ) 
        id += BL
      if threshold window.Map.get(map, pos[0], pos[1]+1 ) 
        id += B
      if threshold window.Map.get(map, pos[0]+1, pos[1]+1 ) 
        id += BR
      return id


    do_zone: (name)->
      @zones[name] = window.Map.create_layer( 'zone_'+name, 0)
      window.Draw.context.globalAlpha = 1
      @perlin.octaves = 12
      @perlin.frequency = .09
      @perlin.generate [0,0], [@width, @height], (point, value)->
        window.Map.set( 'zone_'+name, point[0], point[1], value )


  window.Terrain.init()