//seemore.js
//a simple, lightweight plugin for partial text collapse and expand.

$(document).ready(function(){
	//function definitions

	//toggleSeemore - takes a element of class seemore-link that was
	//clicked on, toggles the hidden text based on whether is was
	//shown already or not, and returns the parental element of class
	//seemore.
	function toggleSeemore(queryElementClicked) {
		//if its already showing, hide it
		var done = false;
		var returnParent = undefined;
		$('.seemore-more').each(function() {
			//go through all the 'more' parts
			if ($(this).find(queryElementClicked).size() == 1) {
				$(this).parent('.seemore').find('.seemore-link').show();
				returnParent = $(this).parent('.seemore');
				//if you find the element that was clicked on, hide the entire thing
				$(this).hide();
				//and show the link to show it again
				done = true;
			}
		});
		if (done) {
			return returnParent;
		}
		//else if its not showing yet, hide the link part and show it.
		$('.seemore').each(function() {
			if ($(this).find(queryElementClicked).size() == 1) {
				queryElementClicked.parent().hide();
				$(this).find('.seemore-more').show();
				returnParent = $(this);
			}
		});
		return returnParent;

	}
	//hide the 'more' sections
	function bindEvents() {
		$('.seemore-more').hide(); //works regardless of if they were alaready display: none
		//bind
		$('.seemore-link a').click(function() {
			var seemore = toggleSeemore($(this));
			$.seemoreCallback($(this), seemore);
		});
	}

	bindEvents();

	//extend functionality for callbacks
	//you can say: $.seemore({callback: function(elem, parent) {...;}});
	$.extend({seemore: function(obj) {
		if (obj.callback && typeof obj.callback == 'function') {
			$.extend({seemoreCallback:obj.callback});
		}
	}});

	$.extend({smrebind: function() {
		bindEvents();
	}});
	$.seemore({callback: function() {}});
});