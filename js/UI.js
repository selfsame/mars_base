build = '<div class="ui_button"><p class="group2">Build<br></p><div id="menu" class="ui_menu_dropdown"></div></div>'


$(window).ready( function(){	
	$('#UI_overlay').append( build );
	var menu = $('#UI_overlay').find('#menu');
	var m_button = $('#UI_overlay').find('.ui_button').children().first();
	var thing, _i, _len;
	var stuff = ["corridor","supply","greenhouse","commons","laboratory","medical","power"];



	for (_i = 0, _len = stuff.length; _i < _len; _i++) {
	 	thing = stuff[_i];
	 	
	 	var option = $('<div class="ui_menu_option"><p class="">'+thing+'</p><img ></div>');
	 	option.attr('value', thing);

	 	option.click(function(e){
	 		$(this).parent().children().removeClass('active');
	 		$(this).addClass('active');
	 		window.Tiles.edit_style = $(this).attr('value');
	 		

	 	});
	  	menu.append(option);
	}
	m_button.click(function(e){
		if ( $(this).data('active') ){
			$(this).data('active', false);
			$(this).parent().find('.ui_menu_dropdown').animate({'height':'0px', opacity:.2},500);
			window.Tiles.edit_mode = false;
			window.Draw.show_layer("wall_shadows");
			window.Draw.hide_layer("blueprints");
		} else {
			$(this).data('active', true);
			$(this).parent().find('.ui_menu_dropdown').animate({'height':'500px', opacity:1.0},500);
			window.Tiles.edit_mode = true;
			window.Draw.hide_layer("wall_shadows");
			window.Draw.show_layer("blueprints");
			
		}

		$(this).parent().find('.ui_menu_option').each(function(){
			if ( !$(this).find('img').attr('src') ){
	 			$(this).find('img').replaceWith(window.Draw.images[$(this).attr('value')]);
	 		}
		});
		
	});
	menu.append( '<div id="confirm_build" class="ui_menu_option"><p class="">CONFIRM</p></div>' );
	$('#confirm_build').click(function(e){

		window.Tiles.confirm_blueprints()
		m_button.click();
	});
});