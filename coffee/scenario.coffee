names = ['Jack','Rupert',
'Iona',
'Jennie',
'Casie',
'Numbers',
'Naomi',
'Milissa',
'Janina',
'Lauren',
'Herman',
'Tawnya',
'Bernadine',
'Marjory',
'Jennell',
'Ricardo',
'Rita',
'Coreen',
'Tennille',
'Shondra',
'Donny',
'Florine']


$(window).ready ->

  E = window.Entities.classes

  cx =(window.Map.width*32)/2
  cy = (window.Map.height*32)/2

  launchpad = new E.Launchpad('Launchpad', 'launchpad', [cx, cy])
  launchpad.sprite_size = 128
  launchpad.sprite_offset = [-64,-64]



  wrench = new E.Thing('wrench', 'wrench', [cx-(4*32), cy+(0*32)])
  solarpanel = new E.Thing('solarpanel', 'solarpanel', [cx-(2*32), cy-(8*32)])


  for i in [5..8]
    for j in [0..1]
      door = new E.Door('door', 'door', [cx+((i-2)*32), cy+((j-2)*32)])
      door.placed_image = 'door_h'

  for i in [5..8]
    for j in [5..5]
      door = new E.Airtank('airtanks', 'airtanks', [cx+((i-2)*32), cy+((j-2)*32)])

  for i in [-5..-1]
    for j in [3..4]
      door = new E.Locker('locker', 'locker', [cx+((i-2)*32), cy+((j-2)*32)])


  for i in [0..3]
    for j in [-3..-2]
      suit = new E.Thing('suit', 'engineer', [cx+((i-2)*32), cy+((j-2)*32)])

  for i in [0..7]
    x = parseInt(Math.random()*600+(window.Map.width*window.Map.tilesize / 2 )-300)
    y = parseInt(Math.random()*600+ (window.Map.width*window.Map.tilesize / 2)-300)
    name = names[parseInt(Math.random()*names.length)]
    advanced = new E.Engineer(name, 'barewalk', [x,y])
    advanced.speed = 1.5

    advanced.sprite_offset = [0, 0]
    advanced.sprite_size = 32

  slow = new E.Scripted('Norm', 'spirit', [400,400])

  slow.speed = 2
  slow.footprint_img = 'tracks';
  slow.run_script "
main: (   \n
  
  if $i0 > 5 : ( $i9 = -1; )\n
  if $i9 == -1 :(\n
    drop_stuff();\n
  ) else $i0 > 0 :(\n
    gather_stuff();\n
  )else:(\n
    $i0 = 1;\n
    $v9 = @pos;\n
  )\n
  
)\n

gather_stuff: (
  $e0 = search(128); wait(10);\n
  $v0 = $e0; wait(10);\n
  $s0 = $e0; wait(10);\n
  \n
  if $v0:(\n
    go_near( $v0);\n
    wait(10);\n

    if pickup($s0) : (\n
      $i0 = $i0 + 1; wait(10);\n
    )\n
    DELETE $e0; wait(10);\n
    DELETE $v0; wait(10);\n
    DELETE $s0; wait(10);\n
      )\n
  else:(\n
    wander(10);\n
  )\n
)\n

drop_stuff: (\n
  go_near( $v9);\n
  if drop(0):(\n
    $i0 = $i0 - 1;\n
  ) else : (\n
    wander(5);\n
  )\n
  if $i0 <= 0 : (\n
    $i9 = 1;\n
  )\n
)\n

"

    
###
main: (   \n
  wait(30);\n
  if wait(30) & wait(40):(\n
    wait(30);\n
  )\n
  if $i0 > 0 :()else:(\n
    $s8 = @name;\n
    $i0 = 1;\n
    $i4 = 1;)\n
\n
  $e0 = search(64); wait(10);\n
  $v0 = $e0; wait(10);\n
  $s0 = $e0; wait(10);\n
  \n
  if $v0:(\n
    go_near( $v0);\n
    wait(10);\n
    $i9 = pickup($s0);\n
    if $i9 > 0:(\n
      $i0 = $i0 + 1; wait(10);\n
    )\n
    DELETE $i9; wait(10);\n
    DELETE $e0; wait(10);\n
    DELETE $v0; wait(10);\n
    DELETE $s0; wait(10);\n
      )\n
  else:(\n
    wander(10);\n
      $i4 = $i4 + 1;  )\n
)\n

"

  ###
