$(window).ready ->

  window.Scripter = 
    init: ->
      @watch = false
      @edit_mode = false
      window.Events.add_listener(@)
      @inspect = $('<div id="inspect"></div>')
      $('#UI_overlay').append @inspect
      @vars = $('<div class="script_vars"></div>')
      @inspect.append @vars
      @script = $('<div class="script_display"><div class="linenums"></div><code></code></div>')
      @linenums = @script.find('.linenums')
      for i in [0..200]
        @linenums.append ('<p>'+i+'</p>')
      @code = @script.find('code')
      @editarea = $('<textarea class="tabindent">')
      @messages = $('<div class="messages"></div>')
      @editbutton = $('<div class="codebutton">edit</div>')
      @reference = $('<div class="reference"></div>')
      @reference.hide()
      @inspect.append @messages
      @inspect.append @editbutton
      @inspect.append @script
      @inspect.append @reference

      @editbutton.data('scripter', @)
      @editbutton.click ->
        scripter = $(this).data('scripter')
        scripter.toggle_edit()

    toggle_edit: ->
      if @watch
        if @edit_mode is false
          @inspect.animate {width:510}, 300
          @reference.show()
            
          @editbutton.html 'compile'
          @edit_mode = true
          @editarea.val @watch.script
          @editarea.height @code.height()
          @code.replaceWith @editarea
        else
          
          @watch.run_script @editarea.val()
          if @watch.error
            @show( @watch )
          else
            @reference.hide()
            @inspect.animate({width:330}, 300)
            @editbutton.html 'edit'
            @edit_mode = false
            @editarea.replaceWith @code
            @show @watch

    make_docs: ->
      @reference.html ''
      if @watch

        for prop of @watch.props
          @reference.append '<p class="prop">@'+prop+' = '+@watch.props[prop]+'</p>'


        for prop of @watch
          if typeof @watch[prop] is 'function'
            if prop[0] is '_' and prop[1] isnt '_'
              args = window.get_function_arg_strings @watch[prop]
              if args
                args.join(', ')
              else
                args = ''
              @reference.append '<p class="funct">'+prop.slice(1)+'( '+args+' )'+'</p>'

    show_vars: ->
      if @watch and @watch.script_vars
        @vars.html ''
        for i in [0..4]
          @vars.append $('<div class="column"></div>')

        i = 0
        for type of @watch.script_vars
          $(@vars.children()[i]).append '<p>'+type+'</p>'
          for item in @watch.script_vars[type]

            if item is undefined
              item = ''
            if typeof item is 'object'
              item = item.to_string()
            $(@vars.children()[i]).append $('<div class="entry">'+item+'</div>')
          i += 1

    show: (thing)->
      @watch = thing

      @make_docs()
      

      if thing.script
        @inspect.css('visibility', 'visible')


        @show_vars()
        

      if thing.error
        line = thing.error.line
        column = thing.error.column
        message = thing.error.message
        @code.html @watch.script
        @messages.html message
        @linenums.children().removeClass 'error'
        $(@linenums.children()[line-1]).addClass 'error'

        

      else if thing.script and thing.parsed_script
        @code.html ''
        @messages.html ''
        @linenums.children().removeClass 'error'

        parsed = thing.parsed_script

        make_block = (obj)->
          block = $('<span class="block"></span>')
          if obj.begin
            block.append obj.begin
          for part, i in obj.block
            if part.type in ['action', 'routine', 'conditional']

              sub = make_block(part)
 
              block.append sub
            else
              statement = $('<span class="block statement"></span>')

              chars = 0
              for g in part
                statement.append $('<span class="word">'+g.literal+'</span>')
                chars += g.literal.length

              statement.append obj.literals[i].slice(chars)
              block.append statement
          if obj.end

            block.append obj.end
          return block
        for routine in parsed
          @code.append make_block routine


    update: ->
      if @watch and @script and @watch.parser
        @code.find('.block').removeClass 'current'
        @code.find('.word').removeClass 'chunk'
        start = @code
        for i in [0..@watch.parser.block_level]
          index = @watch.parser.code_index[i]
          start = $(start.children('.block')[index])
        start.addClass 'current'
        cp = @watch.parser.callpoints.get_last()
        if cp
          si = cp.statement_index
          if si?

            $(start.children('.word')[si]).addClass 'chunk'

      ###
      if window.Entities.objects_hash
        mt = window.Events.tile_under_mouse
        local = window.Entities.objects_hash.get_within([mt[0]*32, mt[1]*32], 64)

        for obj in local
          window.Draw.use_layer 'entities'
          window.Draw.draw_box obj.tile_pos[0] * 32, obj.tile_pos[1] * 32, 32, 32,
            fillStyle: "transparent"
            strokeStyle: "red"
            lineWidth: 2
      ###







    mouseup: ->
      t = window.Events.tile_under_mouse
      p = {x:t[0]*32, y:t[1]*32}
      found = window.Entities.sentient_hash.get_within([p.x,p.y], 32)
      results = []
      for guy in found
        if guy.tile_pos[0] is t[0] and guy.tile_pos[1] is t[1]
          results.push guy
      if results.length > 0
        #console.log 'Selected:', results
        @show results[0]

  window.Scripter.init()

  


  class Scripted extends window.Entities.classes.SlowSentient
    init_2: ->
      @speed = 2
      @parsed_script = false
      @parser = false
      @script = false
      @error = false    

      try
        @parsed_script = window.slow_parser.parse @script
      catch error
        console.log 'parse error: ', error, @script
      #console.log @parsed_script
      if @parsed_script
        @parser = new SlowParser(@, @parsed_script)

    update: (delta)->
      if @parser
        @parser.exec()

    run_script: (script)->
      @script = script
      try
        @parsed_script = window.slow_parser.parse @script
        @error = false
      catch error
        @error = {line:error.line, column:error.column, message:error.name+': '+error.found}

      if @parsed_script
        #console.log @parsed_script
        @parser = new SlowParser(@, @parsed_script)
        @script_vars =
        i:[]
        f:[]
        s:[]
        v:[]
        e:[]
        for i in [0..9]
          @script_vars.i.push undefined
          @script_vars.f.push undefined
          @script_vars.s.push undefined
          @script_vars.v.push undefined
          @script_vars.e.push undefined

    walk_path: ->
      if not @path? or @path.length is 0
        return false
      if @path[0].length is 0
        return false


      tilesize = window.Map.tilesize

      p1 = @path[0][0]*tilesize
      p2 = @path[0][1]*tilesize
      @vect_to_target = new Vector((@path[0][0]*tilesize)-@pos[0], (@path[0][1]*tilesize)-@pos[1], 0)
      @dist_to_target = @vect_to_target.length()
      @target_vect = @normalize_vector( @vect_to_target )
      @vector = Vector.lerp(@vector, @target_vect, @turn_speed)
      near = 10
      if @pos[0] > p1-near and @pos[0] < p1+near and @pos[1] > p2-near and @pos[1] < p2+near
        @path = @path.splice(1,@path.length)
        @velocity = .1
        if @path.length is 0
          return true
      else
        @move(1)
      return false

    
  class CallPoint
    constructor: (@index_stack=undefined, @word=undefined, @callee=false, @callee_funct=false, @callee_args=[], @callee_return=undefined)->

  class SlowParser
    constructor: (@self, @json)->
      @scope = false
      @scope_stack = []
      @code_index = [0]
      @block_level = 0
      @routines = {}
      for r in @json
        @routines[r.action] = r

      @conditionals = {} #a conditional can be open per block level, hash to get that based on block level

      @callpoints = []

    enter_block: (block)->
      
      @block_level += 1
      if @code_index.length-1 < @block_level
        @code_index.push 0
      @code_index[@block_level] = 0

      @scope = block
      @scope_stack.push block


    leave_block: ()->
      @code_index[@block_level] = 0
      scope = @scope
      @block_level -= 1
      @code_index[@block_level] += 1

      if @block_level is 0
        @scope = false #top level, should find main
        @code_index[@block_level] = 0
      else
        @scope_stack.pop()
        @scope = @scope_stack[@scope_stack.length-1]




    exec: ->
      if not @scope
        if @routines['main']
          @enter_block @routines['main']
          
      if @callpoints.length > 0
        cp = @callpoints.get_last()

        result = cp.callee[cp.callee_funct](cp.callee_args)
        if result is undefined
          return
        else
          cp.word.result = result
          cp.callee_return = result
          @callpoints.pop()

      if @scope
        lines = @scope.block
        if lines.length > @code_index[@block_level]
          @run_statement lines[@code_index[@block_level]]
        else
          @leave_block()


    run_statement: (line)->
      if line.type? and line.type in ['conditional']
        if line.term is 'if'
          @conditionals[@block_level] = false


        if @conditionals[@block_level] is false
          if line.term is 'else' and line.eval is ''
            @conditionals[@block_level] = true
            @enter_block line
            return
          ev = @calculate( line.eval )
          if ev not in [false, 0, undefined]
            @conditionals[@block_level] = true
            @enter_block line
            return
          else
            @code_index[@block_level] += 1
            return
        else
          @code_index[@block_level] += 1
          return
      else
        if @conditionals[@block_level]?
          delete @conditionals[@block_level]
      


      index = 0
      parts = line.length
      pattern = false



      funct = false
      register = false
      assign = false
      value = undefined
      value_found = false

      args = false
      vars = []

      # determine the type of statement being executed
      # var, function call, if, interrupt

      first = line[0]
      
      if typeof first isnt 'object'
        console.log 'ERROR parsing first token: ', first




      

      result = @calculate line

      if result

        if @assign

          
          #console.log 'assign: ', @self.script_vars[@assign.slot], result
          #console.log typeof result
          if @assign.slot is 'e'
            if result.e
              result = result
            else
              result = result + ''
          if @assign.slot is 's'
            if result.s
              result = result.s
            else
              result = result + ''
          if @assign.slot is 'v'
            if result.v
              result = result.v

          @self.script_vars[@assign.slot][@assign.index] = result
          @assign = false
          window.Scripter.show_vars()

        #we run the code even though there is nothing further to do with the result, included function calls
        @code_index[@block_level] += 1




    store_var: (reg, value)->
      if reg.slot is 'i'
        value = parseInt(value)
      if reg.slot is 'f'
        value = parseFloat(value).toFixed(2)
      @self.script_vars[reg.slot][reg.index] = value


    untoken: (obj, i=0)->
      if typeof obj isnt 'object'
        return undefined
      if obj.type is 'enclosure'
        return @calculate obj.value
      if obj.type is 'number'
        return obj.value
      if obj.type is 'memory'
        mem = @self.script_vars[obj.slot][obj.index]
        if mem is undefined
          mem = false

        return mem
      if obj.type is 'call'
        funct = obj.value.value
        v = @self['_'+funct]
        if @self['_'+funct]? and typeof @self['_'+funct] is 'function'
          if obj.result?
            r = obj.result
            return r
          else

            args = @calculate obj.args
            #console.log args
            stack = @code_index.clone()
            #console.log 'new callpoint', '_'+funct
            point = new CallPoint(stack, obj, @self, '_'+funct, args)
            point.statement_index = i
            @callpoints.push point


      return undefined

    calculate: (tokens)->

      report = ''
      for t in tokens
        report += t.type+' '
      #console.log 'calc:', report
      value = undefined
      valid = false
      operator = false
      for token, i in tokens
        

        if value is undefined
          if not valid
            value = @untoken(token, i)
            valid = true

          else
            return undefined
        else if not operator
          if token.type in ['operator','compare', 'assignment']
            operator = token.value



        else

          next = @untoken(token, i)
          if next?
            #console.log value, operator, next
            if operator is '+'
              value += next
            else if operator is '-'
              value -= next
            else if operator is '*'
              value *= next
            else if operator is '/'
              value /= next
            else if operator is '%'
              value %= next

            else if operator is '=='
              value = (value is next)
            else if operator is '<='
              value = (value <= next)
            else if operator is '>='
              value = (value >= next)
            else if operator is '<'
              value = (value < next)
            else if operator is '>'
              value = (value > next)

            else if operator is '&'
              value = (value and next)
            else if operator is '|'
              value = (value or next)

            else if operator is '='
              #console.log 'calculating assignment', tokens[i-2]
              if tokens[i-2].type is 'memory'
                #we know we are assigning a var, but need to wait untill all the tokens have been calc'd
                value = next
                @assign = tokens[i-2]
                
            operator = false


      for token in tokens
        delete token.result
      
      return value



  window.Entities.classes.Scripted = Scripted
