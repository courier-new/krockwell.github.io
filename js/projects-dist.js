"use strict";

$(document).ready(function () {

	var projData;
	getProjects();
	setTimeout(function () {
		addProjects();
	}, 200);

	var lorem = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odio voluptatibus enim esse quis quaerat quam suscipit necessitatibus provident, nostrum perspiciatis voluptatem perferendis dolor, hic officia ipsam laboriosam possimus doloremque tenetur atque aspernatur.";
	var lorem2 = " Nesciunt ad ratione quis consequuntur doloribus animi in architecto itaque delectus esse consectetur iste nobis voluptatum, quibusdam alias eveniet enim rerum eos debitis odit.";
	var lorem3 = "Saepe quisquam nobis, magni voluptate asperiores molestiae recusandae excepturi officia porro, nam maxime architecto corporis id nulla omnis, possimus adipisci eum animi alias cumque mollitia fuga dignissimos commodi odio. Quisquam, ullam consectetur quasi, exercitationem sint soluta quae pariatur.";

	function getProjects() {
		$.getJSON('./js/projects.json', function (data) {
			projData = data;
		});
	}

	function addProjects() {
		var currProjList = "";
		var oldProjList = "";
		$(projData.projects).each(function () {
			var curr = $(this)[0];
			var output = "<li class='project-card'>\n";
			output += "<div>\n";
			output += "<span class='project-img' style='background-image:url(\"";
			output += curr.logo;
			output += "\");'></span>\n";
			output += "<div>\n";
			output += "<h1>" + curr.name + "</h1>\n";
			output += "<span>" + curr.short + "</span>\n";
			output += "</div>\n</div>\n</div>\n</li>\n";
			if (curr.type === "current") {
				currProjList += output;
			} else {
				oldProjList += output;
			}
		});
		$('.projects-list.current').html(currProjList);
		$('.projects-list.old').html(oldProjList);
	}

	function toggleInfo(dir, proj) {
		var card;
		// Find matching project card
		$('.project-card h1').each(function () {
			if ($(this).text() == proj) {
				card = $(this).closest('.project-card');
			}
		});
		// Find data in projData from json
		var projObj;
		for (var i = 0; i < projData.projects.length; i++) {
			if (projData.projects[i].name === proj) {
				projObj = projData.projects[i];
			}
		}
		var cardPos = card.position();
		var middle = [];
		middle.top = cardPos.top + card.height() / 2;
		middle.left = cardPos.left + card.width() / 2;

		if (dir == "out") {
			// Form content of infoview
			var content = "<span class='exit'>✖</span>\n";
			content += "<div>\n";
			content += "<h1><strong>" + proj;
			if (projObj.link !== "") {
				content += "<a href='" + projObj.link + "' target='_blank'>";
				content += "<i class='fa fa-external-link' aria-hidden='true'></i>";
				content += "</a>";
			}
			content += "</strong>" + projObj.subtitle + "</h1>\n";
			content += "<div class='stats'>\n";
			content += "<div class='timescale'><div class= 'mini-head'><h2>Timescale</h2></div></div>";
			content += "<div class='team'><div class= 'mini-head'><h2>Team</h2></div></div>";
			content += "<div class='tags'><div class= 'mini-head'><h2>Tags</h2></div></div>";
			content += "<div class='timescale'><span>";
			var tsFormatted = projObj.timescale.split(" - ");
			content += tsFormatted[0] + " -<br>";
			content += tsFormatted[1] + "</span></div>\n";
			content += "<div class='team'><span>";
			content += projObj.team + "</span></div>\n";
			content += "<div class='tags'><span>";
			content += projObj.tags + "</span></div>\n";
			content += "</div>\n";
			content += "<p>" + projObj.short + "</p>\n";
			var descArr = projObj.desc.split("\n");
			for (var j = 0; j < descArr.length; j++) {
				content += "<p>" + descArr[j] + "</p>\n";
				if (descArr.length === 1) {
					content += "<p>" + lorem + "</p>\n";
					content += "<p>" + lorem2 + "</p>\n";
					content += "<p>" + lorem3 + "</p>\n";
				}
			}
			content += "</div>";

			$('.extra-info').html(content);
			$('.extra-info').css({
				'top': middle.top,
				'left': middle.left
			}).animate({
				'top': '-=' + middle.top,
				'left': '-=' + middle.left,
				'width': 'toggle',
				'height': 'toggle'
			}).toggleClass('hidden');
			$('.extra-info *').animate({
				'opacity': 1
			});
		} else {
			$('.extra-info *, .exit').animate({
				'opacity': 0
			});
			$('.extra-info').animate({
				'top': '+=' + middle.top,
				'left': '+=' + middle.left,
				'width': 'toggle',
				'height': 'toggle'
			}).toggleClass('hidden');
			$('.left-side .overlay-container').animate({
				'opacity': '0'
			});
		}
	}

	$('.nav-item').not('.active').click(function () {
		// Make sure project infoview is not open when trying to switch section
		if (!$('.extra-info').is('.hidden')) {
			// If it is, toggle it
			var proj = $('.extra-info').find('h1 strong').text();
			toggleInfo("in", proj);
		}
	});

	// Open infoview
	$('body').on('click', '.project-card', function () {
		var proj = $(this).find('h1').text();
		toggleInfo("out", proj);
	});

	// Close infoview
	$('body').on('click', '.extra-info .exit', function () {
		var proj = $(this).parent().find('h1 strong').text();
		toggleInfo("in", proj);
	});

	$('body').on('mouseenter', '.project-card', function () {
		// Get overlay container
		var dest = $('.left-side .overlay-container');
		// Get name of hovered project
		var head = $(this).find('h1').text();
		// Only allow changing background if info view is hidden
		if ($('.extra-info').not('.hidden').length === 0) {
			// Cut any ongoing animations short
			dest.stop(true);
			// Search for hovered project's data
			$(projData.projects).each(function () {
				var curr = $(this)[0];
				// When project is found
				if (head === curr.name) {
					// Set overlay's background image to url stored in data
					dest.css('background-image', 'url("' + curr.screen + '")');
					dest.find('.overlay-caption').html(curr.caption).animate({});
				}
			});
			// Bring overlay to full opaqueness
			dest.animate({
				'opacity': '1'
			});
		}
	});

	$('body').on('mouseleave', '.project-card', function () {
		// Get overlay container
		var dest = $('.left-side .overlay-container');
		// Only allow changing background if info view is hidden
		if ($('.extra-info').not('.hidden').length === 0) {
			// Reduce overlay to full transparency
			dest.animate({
				'opacity': '0'
			});
		}
	});
});