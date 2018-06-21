courseBox = {};

(function(window, $, _, utils, ga) {
    "use strict";

/**
* Close the course box.
*/
courseBox.close = function() {
    $(".course-box").modal("hide");
};

/** @private */
var _courseID;
var _isSchedule;

/**
* Initializes a course box.
* @param {string} defaultTab: which tab to initially display
* @param {int} courseID: the ID of the course to load
* @param {boolean} isSchedule: whether or not we are displaying the course box on the schedule page
* @param {Array} selectedSections: Only relevant if (isSchedule === true). The list of selected sections.
*/
courseBox.initCourseBox = function(defaultTab, courseID, semester, year, isSchedule, selectedSections) {
    _courseID = courseID;
    _isSchedule = isSchedule;
    var requestURL = "/catalog/course_box/?course_id=" + _courseID;
    if (semester && year) {
        requestURL += "&semester=" + semester + "&year=" + year;
    }
    if ($(".course-box").length === 0) {
        $("<div>").addClass("modal")
            .addClass("hide")
            .addClass("course-box")
            .addClass("flat")
            // .addClass("fade")
            .hide()
            .appendTo("#container");
    }

    if (!isNaN(_courseID)) {
        $(".course-box").load(requestURL, _makeBoxInitializer(defaultTab, selectedSections, requestURL));
    }
};

/**
* Returns the ID of the displayed course.
* @return {int}
*/
courseBox.getCourseID = function () {
    return _courseID;
};

/**
* Returns a function to initialize the course box and set up bindings, etc.
* This returns a function because it's used only as a callback when the courseBox has loaded
* @param {string} defaultTab: which tab to initially display
* @param {Array} selectedSections: ONLY RELEVANT IF (isSchedule === true). The list of selected sections.
* @param {string} requestURL: url for Google Analytics.
* @return {function}
*/
var _makeBoxInitializer = function(defaultTab, selectedSections, requestURL) {
    return function() {
        if (!_isSchedule) {
            $(".save-to-schedule").hide();
        }

        $(".course-box").modal("show");
        if (_isSchedule) {
            $(".section-row").addClass("schedule");
            _bindScheduleEvents();
            _initSectionOptions();
            if (selectedSections) {
                _selectSections(selectedSections);
            } else {
                _selectAllSections();
            }

            $(".section-row").click(function() {
                _unselectAllSectionOptions();
            });
        }
        //must bind default events last or elements introduced by
        //isSchedule won't be binded
        _bindDefaultEvents();
        $(".course-box-tab[data-tab=" + defaultTab + "]").click();

        ga.trackEvent("Course Card", "View Course", $(".course-box .title").html());

        var $boxTextbookActionArea = $(".box-textbook-container .textbook-action-area");

        $boxTextbookActionArea.click(function(event) {
            if ($(this).data("amazon-affiliate-url")) {
                window.open($(this).data("amazon-affiliate-url"),'_blank');
            }

            var isbn = $(this).data("isbn") || null;
            ga.trackEvent("Course Card Textbook", "Click", isbn);
            event.stopPropagation();
        });

        $boxTextbookActionArea.mouseover(function(event) {
            var isbn = $(this).data("isbn") || null;
            ga.trackEvent("Course Card Textbook", "Hover", isbn);
            event.stopPropagation();
        });
    };
};

/**
* Selects the given list of sections.
* @param {Array} selectedSections
*/
var _selectSections = function (selectedSections) {
    if (selectedSections === "all") {
        _selectSectionsByOptions("all");
        return;
    }
    $.each(selectedSections, function (index, sectionID) {
        $(".section-row[data-id=" + sectionID + "]").toggleClass("active");
    });
};

var _selectAllSections = function () {
    $(".section-row").toggleClass("active");
};

/**
* Handles bindings for switching tabs and favoriting.
*/
var _bindDefaultEvents = function() {
    $(".course-box-tab").click(_switchTabs);
    $(".favorite-icon").click(courseBox.toggleFavorite);
};

/**
* Handles schedule-specific bindings for selecting sections and saving selected sections to a schedule.
*/
var _bindScheduleEvents = function () {
    $(".section-row").click(function() {
        $(this).toggleClass("active");
    });
    $(".save-to-schedule").click(function () {
        schedule.currentState.captureSelected(_courseID, _getSelectedSections(), function () {
            courseBox.close();
            schedule.displayExistingSchedule();
        });
    });
};

/**
* Returns the IDs of the selected sections.
* @return {Array}
*/
var _getSelectedSections = function () {
    return $(".section-row&.active").get().map(function (row) { return parseInt($(row).attr("data-id")); });
};

/**
* Switches tabs based on the class of a clicked element.
* @param {Event}
*/
var _switchTabs = function(e) {
	e.preventDefault();
	var $this = $(this);
	if (!$this.hasClass("active")) {
		$(".course-box-tab").removeClass("active");
		$(".box-content").hide();
		$(".box-content." + $this.attr("data-tab")).show();
		$this.addClass("active");
        //we "show" section options regardless of whether it was initialized
		_handleSpecialTabFunctionality($this.data("tab"));
	}
}

/**
* Toggles the "favorite" option for a course.
* @param {Event} event
*/
courseBox.toggleFavorite = function(event) {
    if (event.data && event.data.id) {
        _courseID = event.data.id;
    }
    _postFavorite(!$(this).hasClass("favorited"));
};

/**
* Performs the POST request for favoriting.
* @param {boolean} toFavorite: whether to favorite (true), or unfavorite (false) the course.
*/
var _postFavorite = function(toFavorite) {
    var action = toFavorite ? "favorite" : "unfavorite";
    $.post(
        "/catalog/favorite/",
        {course_id: _courseID, action: action},
        function(data) {
            if (toFavorite) {
                $(".favorite-icon").addClass("favorited");
            } else {
                $(".favorite-icon").removeClass("favorited");
            }
            if (_isSchedule) {
                schedule.reloadFavorites();
            }
        }
    );
};

// var _getFriends = function() {
//     $.ajax({
//         url: "/catalog/friends",
//         data: {course_id: _courseID},
//         success: function(data) {
//             console.log(data.current);
//             console.log(data.past);
//             // $(".box-content.friends").html("<div class='facebook-header'>friends with this course in their schedule</div>");
//             $(".box-content.friends").html(_friendsListToHTML(data.current));
//             $(".facebook-info").css("font-weight", "400");
//             $(".box-content.friends").append(_friendsListToHTML(data.past));
//         },
//         error: function() {
//             $(".box-content.friends").html("TODO (Yuxin) Need to fix this");
//         },
//         dataType: "json",

//     })
// }

// var _friendsListToHTML = function(friends) {
//     var html = "";
//     var rowCounter = 0;
//     $.each(friends, function(index, friend) {
//         if (rowCounter === 0) {
//             html += "<div class='friend-row row-fluid'>"
//         }
//         html += _friendToHTML(friend);
//         if (rowCounter === 3) {
//             html += "</div>"
//             rowCounter = 0;
//         } else {
//             rowCounter += 1;
//         }
//     });
//     // console.log(html);
//     return html;
// }

// var _friendToHTML = function(friend) {
//     var backgroundURL = "url(http://graph.facebook.com/" + friend.facebook_id + "/picture?type=large)"
//     var html = "" +
//     "<div class='facebook-friend span3'>" +
//         "<div class='facebook-picture'" +
//         "style='background:" + backgroundURL + "no-repeat center center;" +
//         "background-size: cover;'></div>" +
//         "<div class='facebook-text'>" +
//             "<div class='facebook-name'>" + friend.name + "</div>" +
//             "<div class='facebook-info'>" + friend.info + "</div>" +
//         "</div>" +
//     "</div>"
//     return html;
// }
/**
* Initializes the HTML of the section options, and appends it to the bottom of the
* courseBox, binds click event which binds options functionality
*/
var _initSectionOptions = function() {
	var html = "" +
	"<div class='section-options-container' style='display: none'>" +
		"<div class='section-option' data-option='all'>select all</div>" +
		"<div class='section-option' data-option='none'>none</div>" +
		"<div class='section-option' data-option='open seats'>open seats</div>" +
	"</div>";
	$(".course-box").append(html);

	$(".section-option").click( function() {
		$('.section-option').removeClass("active");
		_selectSectionsByOptions($(this).data("option"));
	});
}

/**
* Enables special behaviors for different selected tabs
* @param {String} the data-tab field of the selected tab
*/
var _handleSpecialTabFunctionality = function(tab) {
	if (tab === "sections") {
		_showSectionOptions();
	} else {
		_hideSectionOptions();
	}

    // if (tab === "friends") {
    //     _getFriends();
    // }
};

/**
* Hides the section options via a sliding animation
*/
var _hideSectionOptions = function() {
	$(".section-options-container").slideUp("fast");
};

/**
* Shows the section options via a sliding animation
*/
var _showSectionOptions = function() {
	$('.section-options-container').slideDown("fast");
};

/**
* Deactivates all options in section options. Namely, when a user clicks on a section
* after selecting a section option, the section option that is active is most likely
* no longer valid
*/
var _unselectAllSectionOptions = function() {
	$(".section-option").removeClass("active");
};

/**
* Selects the sections in the section list of the courseBox which correspond to the
* option selected in the section options dropdown
* @param {String} the data-tab field of the selected tab
*/
var _selectSectionsByOptions = function(option) {
    $(".section-option[data-option='" + option + "']").addClass("active");

	$(".section-row").removeClass("active");
	if (option === "all") {
		$(".section-row").addClass("active");
	} else if (option === "none") {
		$(".section-row").removeClass("active");
	} else if (option === "open seats") {
		$.each($(".section-row"), function (index, section) {
			var $section = $(section);
			console.log($section.data("enrolled"));
			console.log($section.data("enrolled-max"));
			if ($section.data("enrolled") < $section.data("enrolled-max")) {
				$section.addClass("active");
			}
		});
	}
};

})(window, $, _, bt_utils, bt_ga);
