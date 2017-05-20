$(document).ready(function() {
	
	const MOBILE_SIZE = 800
	var sections = [];
	var mobile = false;
	addNavs();

	function checkWidths() {
		// remember window width
		let $windowWidth = $(window).width();
		// if window is mobile size but mobile view is not yet enabled
		if ($windowWidth <= MOBILE_SIZE && !mobile) {
			// remember that mobile view is active
			mobile = true;
			// show each section
			$('.inner-col').each(function() {
				// make section visible and add "mobile" class to make each display in a line at static positions
				$(this).removeClass('hidden').addClass('mobile').css('display', 'block');
			});
		// if window is full size and mobile view is currently enabled
		} else if ($windowWidth > MOBILE_SIZE && mobile) { 
			// remember that mobile view is no longer active
			mobile = false;
			// hide each section except the home section
			$('.inner-col').not('.home').each(function() {
				// make section hidden and remove "mobile" class
				$(this).removeClass('mobile').addClass('hidden').css('display', 'none');
			});
			// reset home section to top middle position and remove "mobile" class
			$('.inner-col.home').removeClass('mobile').css('top', '50%');
		}	
	}
	$(window).resize(function(){
		checkWidths();
	});
	checkWidths();

	$('#logo-holder img').hover(function() {
		var transform = "";
		if (!$(this).closest('.right-side').is('.mob')) {
			transform += "translate(-50%, -50%)";
		}
		if ($(this).is('.hovering')) {
			transform += " rotateY(360deg)";				
			$(this).removeClass('hovering');
		} else {
			transform += " rotateY(180deg)";			
			$(this).addClass('hovering');
		}
		$(this).css('transform', transform);
	});

	function showSection(sectionName, dir) {
		// only for non-mobile
		if (!mobile) {
			// get window height
			var offScreen = $(document).height();
			$('.inner-col').not('.hidden').each(function() {
				// get column height
				var colHeight = $(this).outerHeight();
				// remember column should be hidden
				$(this).addClass('hidden');
				// move column to just off screen
				var move = (dir === "up") ? {top: (offScreen + colHeight/1.5) + "px"} : {top: "-" + colHeight/1.5  + "px"};
				$(this).animate(move, '3s');
			});
			$('.inner-col.' + sectionName).removeClass('hidden');
			setTimeout(function() {
				$('.inner-col.hidden').each(function() {
					$(this).css('display', 'none');
				 });
			}, 500);
			$('.inner-col').not('.hidden').each(function() {
				// get column height
				var colHeight = $(this).outerHeight();
				// move column to just off screen
				var move = (dir === "up") ? "-" + colHeight/1.5 : offScreen + colHeight/1.5;
				$(this).css('top', move + "px");
				// make column visible
			  	$(this).css('display', 'block');
			  	$(this).animate({top: 50 + "%"}, '3s');
			});
		}
	}

	$('#intro h3').click(function() {
		showSection("about", "down");
	});

	$('.nav-item').not('.active').click(function() {
		var selSection = $(this).attr('class').split(" ")[1];
		var currSection = "";
		$(this).siblings().each(function() {
			currSection += ($(this).is('.active')) ? $(this).attr('class').split(" ")[1] : "";
		});
		// check whether moving to section before (up) or after (down) current section
		var dir = (sections.indexOf(currSection) > sections.indexOf(selSection)) ? "up" : "down";
		showSection(selSection, dir);
	});


	function addNavs() {
		let nav = "";
		let count = 1;
		$('.inner-col').each(function() {
			let className = $(this).attr('class').split(" ")[1];
			// remember all the sections for directional navigation
			sections.push(className);
			nav += "<div class='nav-item " + className + "'>\n";
			nav += className;
			nav += "\n</div>\n";
			if (count !== $('.inner-col').length) { // for all but the last nav item
				nav += "<span> ♦ </span>\n";
			}
			count++;
		});

		$('.nav').each(function() {
			$(this).html(nav);
			let className = $(this).closest('.inner-col').attr('class').split(" ")[1];
			$(this).find('.nav-item.' + className).each(function() {$(this).addClass('active');});
		});
	}

	function switchMeters(boxToShow) {
		// set all boxes to hidden except boxToShow's
		$('.about .box').each(function() {
			if ($(this).is('.' + boxToShow)) {
				$(this).removeClass('hidden').css('display', 'block');
			} else {
				$(this).addClass('hidden').css('display', 'none');
			}
		});
		// set all meter headers to inactive except boxToShow's
		$('#meters span').each(function() {
			if ($(this).is('.' + boxToShow)) {
				$(this).removeClass('inactive').addClass('active');
			} else {
				$(this).removeClass('active').addClass('inactive');
			}
		});
	}

	$('#meters span').click(function() {
		if ($(this).is('.inactive')) {
			// identify choice of next meters
			let choice = $(this).attr('class').split(" ")[0];
			// switch to choice of meters
			switchMeters(choice);
		}
	});

	$('.box').click(function() {
		let curr = $(this).attr('class').split(" ")[0]
		let next = '';
		// rotate to next meters
		if (curr === 'skills') {
			next = 'qualities';
		} else if (curr === 'qualities') {
			next = 'interests';
		} else {
			next = 'skills'
		}
		// switch to next meters
		switchMeters(next);
	})

});