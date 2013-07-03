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

      @saveload = $('<div class="saveload"><input id="file">
        <div id="pause"class="codebutton">||</div>
          <div id="step"class="codebutton">|></div>
            <div class="codebutton" id="save">save</div><div class="codebutton" id="load">load</div></div>')

      @saveload.find('#save').click ()->
        window.Scripter.save_script window.Scripter.saveload.find('input').val()
      @saveload.find('#load').click ()->
        window.Scripter.load_script window.Scripter.saveload.find('input').val()

      @reference = $('<div class="reference"></div>')
      @reference.hide()
      @tileinfo = $('<div class="tileinfo"></div>')
      @tileinfo.hide()
      @inspect.append @messages
      @inspect.append @editbutton
      @inspect.append @saveload
      @inspect.append @script
      @inspect.append @tileinfo
      @inspect.append @reference

      @saveload.find('#pause').click ()->
        if not window.pause_code
          window.pause_code = true
          
        else
          window.pause_code = false

      @saveload.find('#step').click ()->
        window.next_frame = true
       
          

      @editbutton.data('scripter', @)
      @editbutton.click ->
        scripter = $(this).data('scripter')
        scripter.toggle_edit()

    save_script: (filename)->
      if @watch and @watch.script and filename and filename isnt ''
        filename = 'SLOWCODE'+filename
        script = @editarea.val()
        localStorage[filename] = script
        console.log 'saved: ', localStorage[filename]

    load_script: (filename)->
      if @watch and @watch.script and filename and filename isnt ''
        filename = 'SLOWCODE'+filename
        if localStorage[filename]?
          script = localStorage[filename]
          @editarea.val(script)


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
          console.log localStorage
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
          data = @watch.props[prop]
          v = '?'
          if typeof data is 'object'
            if data.type?
              v = data.type
          else if typeof data is 'string'
            v = 's'
          else if typeof data is 'string'
            v = 's'
          else if typeof data is 'number'
            if '.' in v+''
              v = 'f'
            else
              v = 'i'

          @reference.append '<p class="prop">@'+prop+' = '+v+'</p>'


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
        @script.show()
        @messages.show()
        @vars.show()
        @tileinfo.hide()
        @saveload.show()
        @code.html ''
        @messages.html ''
        @linenums.children().removeClass 'error'

        parsed = thing.parsed_script

        make_block = (obj)->
          block = $('<span class="block"></span>')
          if obj.begin
            begin = obj.begin
            if obj.bfirst
              group = ''
              for b in obj.eval
                group += '<span class="word">'+b.literal+'</span>'
              begin = obj.bfirst+group+obj.blast

            head = $('<span class="head">'+begin+'</span>')
            obj._html_head = block
            head.data('codeblock', obj)
            head.click ()->
              console.log 'BLOCK: ', $(this).data('codeblock')
            block.append head
          for part, i in obj.block
            if part.type in ['action', 'routine', 'conditional']

              sub = make_block(part)

              part._html_head = sub
              sub.data('codeblock', part)
              sub.click ()->
                console.log 'BLOCK: ', $(this).data('codeblock')
 
              block.append sub
            else
              statement = $('<span class="block statement"></span>')
              part._html_line = statement
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

      else
        @script.hide()
        @messages.hide()
        @vars.hide()



    update: ->
      if @watch and @script and @watch.parser
        @code.find('.block, .head').removeClass 'current'
        @code.find('.word').removeClass 'chunk'
        @code.find('.block, .head').removeClass 'active_head'

        report = ''
        
        cp = @watch.parser.callpoints
        if cp.length > 0


          for p, i in cp
            if p.call._html_head?
              p.call._html_head.children('.head').addClass 'active_head'
              index = p.index

              statement = $( p.call._html_head.children('.block')[index])
              statement.addClass 'current'
              p.call._html_head.removeClass 'current'

              last_slow_call = p
              last_slow_statement = statement

            report += p.to_string()




          si = last_slow_call.token_index
          
          if si?
            if last_slow_statement.children('.head').length > 0
              word = $(last_slow_statement.children('.head').find('.word')[si])
            else
              word = $(last_slow_statement.find('.word')[si])
            word.addClass 'chunk'
            

        @messages.html   'callpoints:'+ report+' token_index='+si





    show_tile: (x,y)->
      @watch = false
      @script.hide()
      @messages.hide()
      @vars.hide()
      @saveload.hide()
      @tileinfo.show()
      stats = $('<p>'+x+','+y+'</p>')
      obs = window.Map.get('objects', x, y)
      obd = $('<ul></ul>')
      if obs
        for ob in obs
          obd.append '<li>'+ob.nombre+'</li>'

      @tileinfo.html ''
      @tileinfo.append stats
      @tileinfo.append obd


    mouseup: (e)->
      if not $('#UI_overlay').is $(e.target).parents()
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
        else
          @show_tile( t[0], t[1])

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
      if not @path?
        @target = false
        return false

      if @path.length is 0
        @target = false
        @path = false
        return false
      try
        if @path[0].length is 0
          @target = false
          @path = false
          return false
      catch error
        console.log 'bad bad bad ', @path


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
      return undefined

    
  class CallPoint
    constructor: ()->
      @type = 'slow' # or 'native'
      @index = 0
      @call_token = undefined # the parse object that called me
      @call = undefined # the parse block or native object to call
      @call_funct = undefined # the string function name to call
      @call_args = undefined #
      @_return = undefined
      @if_group = false # is true if a condition has been met, and we can ignore consecutive elses
      @token_index = 0


    to_string: ()->
      if @type is 'native'
        index = @index
      else
        index = @index 
      return @call_funct+' ['+index+']: '


    return: (result=undefined)->
      if @call_token?
        if result?
          @call_token.result = result
        else
          @call_token.result = @_return



  class SlowException
    constructor: (@message)->
      @error = true
    to_string: ->
      'ERROR'

  class ESCAPE
    constructor: ()->
      @escape = true

  class SlowParser
    constructor: (@self, @json)->

      @routines = {}
      for r, i in @json
        r.routine_index = i
        @routines[r.action] = r

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
      if not window.pause_code or window.pause_code and window.next_frame

        if not @callpoints.get_last()
          if @routines['main']
            cp = new CallPoint()
            cp.type = 'slow'
            cp.call = @routines['main']
            cp.call_funct = 'main'
            cp.index = 0
            @callpoints.push cp
            #console.log 'EOF, creating: ', cp.to_string()

            
        if @callpoints.length > 0
          cp = @callpoints.get_last()

          if cp.type is 'native'
            #console.log 'native cp'
            result = cp.call[cp.call_funct](cp.call_args)
            if result is undefined
              return
            else
              #console.log 'leaving: ', cp.to_string()
              cp.return result
              @callpoints.pop()
          else
            #console.log 'slow cp'
            lines = cp.call.block
            #console.log cp.index+'/'+ lines.length
            if lines.length > cp.index
              target = lines[cp.index]

              result = @run_statement lines[cp.index]
              if typeof result is 'object' and result.escape is true
                return
              else
                cp.index += 1
                cp.token_index = 0
                if window.pause_code
                  window.next_frame = false


            else
              #console.log 'leaving: ', cp.to_string()
              @recurse_clean_line cp.call.block
              cp.return true
              @callpoints.pop()

    recurse_clean_line: (obj)->
      if not obj?
        return

      if obj instanceof Array
        for part in obj
          @recurse_clean_line part
      
      
      if obj.type is 'enclosure'
        for part in obj.value
          @recurse_clean_line part
      if obj.result?
        #console.log obj.type, ':delete result'
        delete obj.result
      if obj.block?
        for part in obj.block
          @recurse_clean_line part
      if obj.eval?
        for part in obj.eval
          @recurse_clean_line part
      if obj.args?
        for part in obj.args
          @recurse_clean_line part

    run_statement: (line)->
      cp = @callpoints.get_last()
      cp.token_index = -1
      if line.type? and line.type in ['conditional']
        
        if line.term is 'if'
          cp.if_group = false


        if cp.if_group is false
          if line.result?
            return true
          if line.term is 'else' and line.eval is ''
            cp.if_group = true
            cp.index += 1


            cp = new CallPoint()
            cp.type = 'slow'  
            cp.call = line
            cp.call_funct = line.term
            cp.call_token = line

            @callpoints.push cp


            return new ESCAPE()
          ev = @calculate( line.eval )
          #console.log line.term + ' is ' , ev
          if ev.escape?
            return ev
          if ev not in [false, 0, undefined]
            
            cp.if_group = true
            cp.index += 1


            cp = new CallPoint()
            cp.type = 'slow'  
            cp.call = line
            cp.call_funct = line.term
            cp.call_token = line
            @callpoints.push cp
            return new ESCAPE()
          else
            return true
        else
          return true
      else
        if cp.if_group
          cp.if_group = false
      
      first = line[0]
      
      if typeof first isnt 'object'
        console.log 'ERROR parsing first token: ', first
        return true

      if first.type? and first.type in ['reserved']
        if first.value.toLowerCase() is 'delete'
          slot = line[1]
          if slot.type is 'memory'
            @delete_var(slot)
            window.Scripter.show_vars()
            return true

      cp.token_index = -1
      result = @calculate line, true
      if result.escape? or result.error?
        return result
      else
        if @assign
          @store_var(@assign, result)
          @assign = false
          window.Scripter.show_vars()

      return true





    store_var: (reg, value)->
      if reg.slot is 'e'
        if value.e
          value = value
        else
          result = result + ''
      if reg.slot is 's'
        if value.s
          value = value.s
        else
          value = value + ''
      if reg.slot is 'v'
        if value.v
          value = value.v

      if reg.slot is 'i'
        if typeof value is 'object' or value is true
          value = 1
        else if value is false
          value = 0
        else
          value = parseInt(value)
      if reg.slot is 'f'
        if typeof value is 'object' or value is true
          value = 1
        else if value is false
          value = 0
        else
          value = parseFloat(value).toFixed(2)

      @self.script_vars[reg.slot][reg.index] = value

    delete_var: (reg)->
      try
        @self.script_vars[reg.slot][parseInt(reg.index)] = undefined
      catch error
        console.log 'cant delete register ', reg, error


    untoken: (obj, i=0)->
      if typeof obj isnt 'object'
        return undefined
      if obj.type is 'enclosure'
        return @calculate obj.value
      if obj.type is 'number'
        return obj.value
      if obj.type is 'self'
        if @self.props[obj.value]?
          return @self.props[obj.value]
      if obj.type is 'memory'
        mem = @self.script_vars[obj.slot][parseInt(obj.index)]
        if mem is undefined
          mem = false

        return mem
      if obj.type is 'call'

        if obj.result?
          r = obj.result
          return r

        funct = obj.value.value

        if @self['_'+funct]? and typeof @self['_'+funct] is 'function'

          args = @calculate obj.args

          cp = new CallPoint()
          cp.type = 'native' 
          cp.call_token = obj 
          cp.call = @self 
          cp.call_funct = '_'+funct 
          cp.call_args = args 
          @callpoints.push cp
          return new ESCAPE()

        else if @routines[funct]?
          cp = new CallPoint()
          cp.type = 'slow' 
          cp.call_token = obj 
          cp.call = @routines[funct] 
          cp.call_funct = funct 
          cp.call_args = 0 
          @callpoints.push cp
          return new ESCAPE()
        

      return undefined

    calculate: (tokens, top=false)->
      cp = @callpoints.get_last()
      report = ''
      for t in tokens
        report += t.type+' '
      #console.log 'calc:', report
      value = undefined
      valid = false
      operator = false
      for token, i in tokens
        if top
          cp.token_index += 1
        

        if value is undefined
          if not valid
            value = @untoken(token, i)
            if value.error? or value.escape?
              return value

            valid = true

          else
            return undefined

        else if not operator
          if token.type in ['operator','compare', 'assignment']
            operator = token.value



        else

          next = @untoken(token, i)
          if next.error? or next.escape?
            return next
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


      
      
      return value



  window.Entities.classes.Scripted = Scripted
