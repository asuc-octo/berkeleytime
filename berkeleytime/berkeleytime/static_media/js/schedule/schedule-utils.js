var schedule = {};

(function (window, $, _, utils, ga) {
    "use strict";

/**
 * Matcher function to allow layman abbreviation matches, e.g. "cs" -> "COMPSCI"
 * @param  {string} term The search term entered by the user
 * @param  {string} text The text in a dropdown item to match
 * @return {boolean}      True if the term matches the text according to our layman
 *                             abbreviations
 */
var matcher = function (term, text) {
  var words = term.trim().toUpperCase().split(" ");
  words[0] = bt_utils.fixClassPseudonym(words[0]);
  return text.indexOf(words.join(" ")) > -1;
};


/**
 * Create a jQuery object for an empty table row that has a dropdown from which the user can select
 * a (non-favorited) course to add to their schedule.
 * @return {jQuery} a jQuery object for an empty table row
 */
var emptyRowHTML = function () {
    var html = "";
    html += "<td><div class='select_container'>";
    html += "<select id='select_course' data-placeholder='Search for a class...'>";
    html += "<option></option>";
    html += "</select></div></td>" // TODO initialize dropdown
    html += "<td id='new_course_units'></td>";
    html += "<td id='new_course_avg' class='grade'></td>";
    html += "<td id='new_course_enrollment'></td>";
    html += "<td id='new_course_waitlisted'></td>";
    html += "<td id='new_course_add'>";
    html += "<div id='select_add_button' class='select-button'>";
    html += "<i class='icon-plus-sign'></i>";
    html += "</div>";
    html += "</td>";

    var $row = $(html);

    return $row;
};


/**
 * Update the last in the schedule table, corresponding to a user-added course
 * @param  {String} courseName         Name of the course to be displayed
 * @param  {String} units              Number of units
 * @param  {String} letterAvg          Average grade of the course, e.g. B+
 * @param  {String} enrolledPercentage Percentage currently enrolled
 * @param  {String} waitlisted         Number of people waitlisted
 * @return {jQuery}                    A jQuery object to be appended to the end of the table
 */
var updateNewCourseHTML = function (courseName, units, letterAvg, enrolledPercentage, waitlisted) {
    $("#new_course_units").text(units);
    $("#new_course_avg").text(letterAvg);
    $("#new_course_enrollment").text(enrolledPercentage);
    $("#new_course_waitlisted").text(waitlisted);
};


/**
 * Based on the course that is selected from the first select box
 * 1. Get the relevant information for that course
 * 2. Update that row with the appropriate information
 */
var updateRowWithSelectedCourse = function () {
    var $selected = $("#select_course option:selected");
    var courseID = $selected.val();
    if (courseID === "") {
        return;
    }
    var selectedCourse = _.find(allCourses, function (course) {
        return course["course_id"] === courseID;
    });

    // updateNewCourseHTML(selectedCourse["name"], selectedCourse["units"],
    //     selectedCourse["letter_average"], selectedCourse["enrollment_percentage"],
    //     selectedCourse["waitlisted"]);
};


/**
 * Create new course dropdown with the appropriate course options.
 * A course will not be displayed in the dropdown if it has already been added to the schedule.
 * @return {None}
 */
var createNewCourseDropdownOptions = function () {
    var $newCourseSelect = $("#select_course");
    var optionsHTML = "<option></option>";

    for (var i = 0; i < allCourses.length; i++) {
        var course = allCourses[i];
        optionsHTML += "<option data-title='" + course["name"] + "' ";
        optionsHTML += "value='" + course["course_id"] + "'>";
        optionsHTML += "<p class='title'>" + course["name"] + "</p>";
        optionsHTML += "</option>";
    }

    $newCourseSelect.html(optionsHTML);
};


/**
 * Initialize new course dropdown by select2-ifying it and adding event listeners.
 * @return {None}
 */
var initializeNewCourseDropdown = function () {
    var $newCourseSelect = $("#select_course");

    $.fn.select2.amd.require(['select2/compat/matcher'], function (oldMatcher) {
      $newCourseSelect.select2({
        width: "100%",
        placeholder: "Add a class to your schedule...",
        matcher: oldMatcher(matcher),
        containerCssClass: "select_wrapper"
      })
    });

    $newCourseSelect.on("select2:select", updateRowWithSelectedCourse);
    $newCourseSelect.on("select2:select", function (e) {
        $("#select_question_button").hide();
        $("#select_add_button").show();
    });
};


/**
 * Solidify the last row, which the user selected
 */
schedule.setNewCourseRow = function () {
    var courseID = $("#select_course option:selected").val();
    var courseName = $("#select_course option:selected").text();
    if (courseID === "" || courseName === "") {
        return;
    }

    // Copy the information from the row into a new htmlString
    var newRowHTML = "<tr>";
    newRowHTML += "<td><input type='checkbox' name='checkbox1' id='checkbox-" + courseID + "' class='css-checkbox' />";
    newRowHTML += "<label for='checkbox-" + courseID + "' class='css-label'></label></td>";
    newRowHTML += "<td id='new_course_name'>" + courseName + "</td>";
    newRowHTML += "<td>" + $("#new_course_units").text() + "</td>";
    newRowHTML += "<td class='grade'>" + $("#new_course_avg").text() + "</td>";
    newRowHTML += "<td>" + $("#new_course_enrollment").text() + "</td>";
    newRowHTML += "<td>" + $("#new_course_waitlisted").text() + "</td>";
    newRowHTML += "<td class='more-info'>(More Info)</td>";
    newRowHTML += "</tr>";
    // Prepend that row to the new course row
    $("#new_course_row").before(newRowHTML);

    // Clear out the existing class row
    $("#select_course").select2("val", "");
    $("#new_course_units").html("");
    $("#new_course_avg").html("");
    $("#new_course_enrollment").html("");
    $("#new_course_waitlisted").html("");

    // Reset the add row button and dropdown
    $("#select_course").val("").change();
    $("#select_add_button").hide();
    $("#select_question_button").show();
};

var events = {};

/**
 * Sorts events' keys alphabetically and returns an array with each key as an entry.
 * @return {Array}
*/
var indexEvents = function() {
	var ind = [];
	for(var e in events) {
		ind.push(e);
	}
	ind.sort(function (a, b) {
		return a == b ? 0 : (a > b ? 1 : -1);
	});
	return ind;
}();

/**
 * Iterates through (either forward or backwards) events JSON and returns an object with the current chosen_section's
 * chosen_section (str), days, start_time, end_time, final_day, final_start, final_end
 * @return {Array}
 */

 var getNewSchedulePermutation = function(currIndex, direction) {
 	currIndex += direction;
 	currSection = indexEvents()[currIndex].chosen_section;
  	return {"title": currSection.course_title,
  			"days": currSection.days,
  			"start": currSection.start_time,
  			"end": currSection.end_time,
  			"fin_day": currSection.final_day,
  			"fin_start": currSection.final_start,
  			"fin_end": currSection.final_end }
 };

// Create link to course info page
function parseCourseName(courseName) {
    var name = {}
    name.dept = "";
    name.number = "";
    for (var i = 0; i < courseName.length - 1; i++) {
        var c = courseName.charAt(i + 1);
        if (c >= '0' && c <= '9') {
            if (courseName.charAt(i).toUpperCase() == 'C'
                || courseName.charAt(i).toUpperCase() == 'W') {
                 name.dept = courseName.substring(0, i).trim();
                 name.number = courseName.substring(i).trim();
             } else {
                 name.dept = courseName.substring(0, i + 1).trim();
                 name.number = courseName.substring(i + 1).trim();
             } break;
         }
     }
     return name;
 }



/**
 * Add options to the select_course dropdown, select2-ify it, and attach appropriate event
 * listeners.
 * @return {None}
 */
schedule.createAndInitializeNewCourseDropdown = function () {
    createNewCourseDropdownOptions();
    initializeNewCourseDropdown();
};


})(window, $, _, bt_utils, bt_ga);

