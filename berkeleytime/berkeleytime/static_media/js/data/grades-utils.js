// grades-utils.js
// functions for the grades page of berkeleytime, including updating information on the page, etc
// dependencies - jQuery
/**
 * Note: some of the documentation in this file was written a long time ago: you can tell by
 * the Arguments: Return: format rather than @param @return format. However, it should still be
 * up to date.
 *
 * This file basically contains all the functionality that the grades page performs.
 *
 * Basic introduction: this page enables the user to choose different sections to display the grade
 * data for. A section is not a class: you might compare CS 61A with Denero in 2013 Fall to CS 61A with
 * Hilfinger in 2014 Spring. A section has a number (e.g. 001), and instructor, a semester, and a year.
 */

var grades = {};

(function (window, $, console, _, d3, utils, ga, colorstore, tour) {
"use strict";

// Arguments: any arbitrary variables
// Return: true if any of the arguments are undefined, false otherwise
var ndef = function () {
    for (var i=0; i<arguments.length; i++) {
        if (arguments[i] === undefined) {
            return true;
        }
    }
    return false;
};

if (ndef(window, $, console, _, d3, utils)) {
    return null;
}

// Arguments: num, not necessarily a number
// Return: true is the number corresponds to a number we can use to store section data
//         ie, if the number is actually a number and is between one and four
// Note: We use this to check, given a number, if we can actually retreive section data
//       using that number.
/**
 * The point of doing this check is that we store data in the window object corresponding
 * to the classes for which grade information is displayed. We can only display four courses,
 * so we only allow 1-4 as the keys for the dict which has values that are the actual grades
 * data.
 */
var isValidSectionNum = function (num) {
    return !(typeof num !== "number" || num > 4 || num < 1);
};

grades.colors = [
    colorstore.berkeleytime.blue.highlight,
    colorstore.berkeleytime.pink.highlight,
    colorstore.berkeleytime.green.highlight,
    colorstore.berkeleytime.purple.highlight
];
// Arguments: a number, the index of section data that we are storing in the window
// Return: the correct background color to give that section header (the section header being
//         the bar at the top of the screen which tells you about the section information, if
//         you have a section selected). If you have two sections selected, there will be two
//         section headers, up to a max of 4.
// Note: these are totally arbitrary, and we can change them if needed. These are also
//       Berkeleytime Standard colors.
var sectionNumToColor = function (num) {
    if (!isValidSectionNum(num)) {
        return "#999999";
    } else {
        return grades.colors[num - 1];
    }
};

// Arguments: grade, a valid grade string (like 'A+', 'D-', or 'NP')
// Return: a two-tuple of strings representing the grades before and after
//         the provided grade on the grade scale. Elements of this tuple will be
//         null if there is no grade above or below the grade provided: e.g, 'A+' will
//         return [null, 'A'] and 'NP' will return ['P', null]
var beforeAndAfterGrades = function (grade) {
    if (grade === "P") {
        return ["NP", null];
    }
    if (grade === "NP") {
        return ["P", null];
    }

    var i = utils.gradeList.indexOf(grade);
    if (i === -1) {
        return [null, null];
    } else {
        if (i === 0) {
            return [null, utils.gradeList[i+1]];
        } else if (i === utils.gradeList.length - 1) {
            return [utils.gradeList[i - 1], null];
        } else {
            return [utils.gradeList[i-1], utils.gradeList[i+1]];
        }
    }
};

/**
 * Return the given section objects sorted by instructor's name.
 */
var averageByInstructor = function (sections) {
    return _.sortBy(sections, function (s) { return s.instructor; });
};

// Arguments: a list of section objects, as retrived from AJAX
// Return: the same sections, sorted by section_number, then instructor, then semester, then year
var averageBySemester = function (sections) {
    return sortByCustomDesc(sortByCustomAsc(sortByCustomAsc(sortByCustomAsc(sections, "section_number"), "instructor"), "semester"), "year");
};

// Arguments: sections, a list of section data as returned from AJAX
//            field, the string of a field to sort by, like "section_number" or "semester"
// Return: the sections, sorted by the key delineated by field.
var sortByCustomAsc = function (sections, field) {
    return _.sortBy(sections, function (s) { return s[field];} );
};

// Arguments: same as above
// Return: the sections, sorted descending by the key delineated by field
var sortByCustomDesc = function (sections, field) {
    return _.sortBy(sections, function(s) { return -s[field]; } );
};

// Arguments: i, the instructor's name
// Return: the instructor's name, properly formatted
/**
 * This function is useful for standardizing names: for example, there may be SONG, DAWN X
 * and DAWN X SONG: we want those to map to SONG, DAWN.
 */
var sanitizeInstructor = function (i) {
    var lastFirst = i.split(",");
    if (lastFirst.length !== 2) {
        return i;
    }
    var initials = _.reject(lastFirst[1].split(" "), function (i) {return i === "";});
    if (initials.length < 2) {
        return i;
    }
    var sortedInitials = _.sortBy(initials, _.identity);
    return lastFirst[0] + ", " + sortedInitials.join(" ");
};

var onTypeChange = function () {
    if (grades.sections) {
        grades.populateFieldsFromSections(grades.sections, grades.checkAlreadyAdded);
    }
};

var onCourseChange = function () {
    grades.getSectionsAndUpdateFields(grades.checkAlreadyAdded);
};

var onPrimaryChange = function () {
    grades.narrowSecondary();
    grades.checkAlreadyAdded();
};

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

grades.initCourseSelect = function () {
    var $courses = $("#select_course");
    $.fn.select2.amd.require(['select2/compat/matcher'], function (oldMatcher) {
        $courses.select2({
            width: "100%",
            placeholder: "Search for a class...",
            matcher: oldMatcher(matcher),
            containerCssClass: "select_wrapper"
        })
    });
    $courses.on("select2:select", onCourseChange);
};

grades.initTypeSelect = function () {
    var $type = $("#select_type");
    $type.select2({
        width: "100%",
        placeholder: "Select a semester...",
        containerCssClass: "select_wrapper"
    });
    $type.on("select2:select", onTypeChange);
};

grades.initPrimarySelect = function (destroyPrevious) {
    var $primary = $("#select_primary");
    if (destroyPrevious) {
        $primary.select2("destroy");
    }
    $primary.select2({
        width: "100%",
        placeholder: "Select a semester...",
        containerCssClass: "select_wrapper",
    });
    $primary.on("select2:select", onPrimaryChange);
};

grades.initSecondarySelect = function (destroyPrevious) {
    var $secondary = $("#select_secondary");
    if (destroyPrevious) {
        $secondary.select2("destroy");
    }
    $secondary.select2({
        width: "100%",
        placeholder: "Select a section...'",
        containerCssClass: "select_wrapper",
    });
    $secondary.on("select2:select", function (evt) {
    // this is necessary because otherwise checkAlreadyAdded will be passed an event. bad.
    grades.checkAlreadyAdded();
    });
};

// Arguments: $item, the jQuery item to change
//            enabled, whether the item should be enabled or disabled
// SideEffects: enables/disables $item, and updates the dropdown lists.
var setEnabled = function ($item, enabled) {
    $item.prop("disabled", !enabled);
};

// Arguments: $item, the jQuery dropdown to change
// SideEffects: removes the selected item from the box, and makes it default to "All Sections" or "All Semesters"
//              or whatever.
var setDefault = function ($dropdown) {
    $dropdown.children(":selected").prop("selected", false);
    $dropdown.trigger("change");
};

/**
 * Returns the HTML for options in the secondary select, based on the passed in section object.
 * @param  {Object} section   Object describing the section. See grades.sections for examples.
 * @param  {String} innerText The string to be displayed inside the option
 * @return {String}           An HTML string of the option
 */
var sectionToOptionHtml = function (section, innerText) {
    var html = "<option data-self-type='section'";
    html += " data-instructor='" + section.instructor;
    html += "' data-semester='" + section.semester + section.year;
    html += "' value='" + section.grade_id;
    html += "'>" + innerText + "</option>";
    return html;
};

/**
 * Changes the last select box (sections) to reflect the choices of the previous boxes (semester/instructor)
 * @param {function} callback: a callback function to execute when the boxes are updated.
 */
grades.narrowSecondary = function (callback) {
    var type = $("#select_type").val(); // either "instructor" or "semester"
    var $primary = $("#select_primary");
    var $secondary = $("#select_secondary");
    var $options = $secondary.children("option");
    var primaryVal = $primary.children(":selected").val();
    var html = "";
    var filteredSections;
    setEnabled($secondary, true);

    if (type === "instructor") {
        if ($primary.children(":selected").val() === "all") {
            setDefault($secondary);
            return;
        }

        filteredSections = _.filter(grades.sortedSections, function (item) {
            return sanitizeInstructor(item.instructor) === sanitizeInstructor(primaryVal);
        });
        _.each(filteredSections, function (item, i, list) {
            html += sectionToOptionHtml(item,
                item.semester.capitalize() + " " + item.year + " / " + item.section_number);
        });
        $secondary.html(html);
        grades.initSecondarySelect(true);
    } else if (type === "semester") {
        if ($primary.children(":selected").val() === "all") {
            setDefault($secondary);
            return;
        }

        filteredSections = _.filter(grades.sortedSections, function (item) {
            return item.semester+item.year === primaryVal;
        });
        _.each(filteredSections, function (item, i, list) {
            html += sectionToOptionHtml(item, item.instructor + " / " + item.section_number);
        });
        $secondary.html(html);
        grades.initSecondarySelect(true);
    }
    if (callback) {
        callback();
    }
};

/**
 * Populates the select boxes at the top of the page with all the data from the given list
 * of section objects (as retrieved from AJAX).
 */
// Arguments: sections, a list of sections to display
//            callback, a callback function to run at the end (optional)
grades.populateFieldsFromSections = function (sections, callback) {
    var type = $("#select_type").val(); // either "instructor" or "semester"
    var $primary = $("#select_primary");
    var $secondary = $("#select_secondary");
    var html = "";
    var html2 = "";
    if (type === "instructor") {
        html += "<option value='all'>All Instructors</option>";
        grades.sortedSections = averageByInstructor(sections);
        _.each(_.uniq(grades.sortedSections, true, function (item) {return sanitizeInstructor(item.instructor);}),
            function (item, i, list) {
                html += "<option data-self-type='instructor' value='" + item.instructor;
                html += "'>" + item.instructor + "</option>";
        });

        html2 += "<option data-instructor='All Instructors' data-semester='All Semesters' value='all'>All Sections</option>";
        _.each(grades.sortedSections, function (item, i, list) {
            html2 += sectionToOptionHtml(item,
                item.semester.capitalize() + " " + item.year + " / " + item.section_number);
        });

        $primary.html(html);
        setEnabled($primary, true);
        grades.initPrimarySelect(true);
        $secondary.html(html2);
        setEnabled($secondary, true);
        grades.initSecondarySelect(true);

        grades.narrowSecondary(callback);
    } else if (type === "semester") {
        html += "<option value='all'>All Semesters</option>";
        grades.sortedSections = averageBySemester(sections);
        _.each(_.uniq(grades.sortedSections, true, function (item) {return item.semester + item.year;}),
            function (item, i, list) {
                html += "<option data-self-type='semester' value='" + item.semester + item.year;
                html += "'>" + item.semester.capitalize() + " " + item.year + "</option>";
        });

        html2 += "<option data-instructor='All Instructors' data-semester='All Semesters' value='all'>All Sections</option>";
        _.each(grades.sortedSections, function (item, i, list) {
            html2 += sectionToOptionHtml(item, item.instructor + " / " + item.section_number);
        });

        $primary.html(html);
        grades.initPrimarySelect(true);
        $secondary.html(html2);
        grades.initSecondarySelect(true);

        grades.narrowSecondary(callback);
    }
};

// Return: the currently selected grades
grades.getSelectedGrades = function () {
    if ($("#select_course").children(":selected").val() === "") {
        $("#select_add_button").popover("show");
        return [];
    }
    var $secondary = $("#select_secondary");
    var $selected = $secondary.children(":selected");
    if ($selected.val() !== "all") {
        return [$selected.val()];
    } else {
        var rtn = [];
        $.each($secondary.children("option").filter(function () {return $(this).css("display") !== "none";}),
            function (index, option) {
                if ($(option).val() === "all") {
                    return;
                }
                rtn.push($(option).val());
            });
        return rtn;
    }
};

// Return: the currently selected instructor's name (or "All Instructors")
var getSelectedInstructor = function () {
    var type = $("#select_type").children(":selected").val();
    if (type === "instructor") {
        var section = "";
        var $selected = $("#select_secondary").children(":selected");
        if ($selected.val() !== "all") {
            section = " / " + $selected.html().split(" / ")[1];
        } else {
            section = "";
        }
        return $("#select_primary").children(":selected").html() + section; //get the actual html, not "all"
    } else if (type === "semester") {
        return $("#select_secondary").children(":selected").html();
    }
};

// Return: the currently selected semester and year, as formatted in the HTML.
var getSelectedSemesterYear = function () {
    var type = $("#select_type").children(":selected").val();
    if (type === "instructor") {
        return $("#select_secondary").children(":selected").html().split(" / ")[0]; //get the actual html, not "all"
    } else if (type === "semester") {
        return $("#select_primary").children(":selected").html();
    }
};

// Return: the currently selected semester as a string
var getSelectedSemester = function () {
    return getSelectedSemesterYear().split("-")[0];
};

// Return: the currently selected year as a string
var getSelectedYear = function () {
    return getSelectedSemesterYear().split("-")[1];
};

// Return: {array} a two-tuple of the instructor and semesterYear, to be displayed in the .section-container
// for example, ["SONG, DAWN", "Spring 2014"]
grades.getBarText = function () {
    return [getSelectedInstructor(), getSelectedSemesterYear()];
};

/**
 * Based on the course that is selected from the first select box, get the relevant sections for that course
 * and populate the other select boxes with the relevant information from them
 * @param  {Function} callback (optional) callback to call at the end
 */
grades.getSectionsAndUpdateFields = function (callback) {
    var $selected = $("#select_course option:selected");
    var courseID = $selected.val();
    if (courseID === "") {
        return;
    }

    $.when($.getJSON("/grades/course_grades/" + courseID + "/", function (json) {
        grades.sections = json;
        grades.populateFieldsFromSections(json);
    })).done(function () {
        if (callback !== undefined) {
            callback();
        }
    });
};

// Arguments: title, the title of the section, e.g. "COMPSCI 61B"
//            instructor, e.g. "Shewchuck, J"
//            setion, e.g. "Fall 2012 / 001"
//            bgcolor, the color of the box, e.g. "#4545e2"
// Return: A new jquery object representing the section.
var newSectionHTML = function (title, instructor, section, bgcolor) {
    var html = "";
    html += "<div class='section-container'>";
    html += "<span class='section-info'>";
    html += "<span class='title'>" + title + "</span>";
    html += "<span class='instructor'>" + instructor + "</span>";
    html += "<span class='section'>" + section + "</span>";
    html += "</span>";
    html += "<div class='section-controls'>";
    html += "<div class='section-remove-button'><i class='icon-remove-sign'></i></div>";
    html += "</div>";

    var $elem = $(html);
    $elem.css("border-left-color", bgcolor);

    return $elem;
};

// Arguments: title, the title of the section, e.g. "COMPSCI 61B"
//            instructor, e.g. "Shewchuck, J"
//            setion, e.g. "Fall 2012 / 001"
//            bgcolor, the color of the box, e.g. "#4545e2"
// Side effects: Adds a new section header to the top of the DOM, and
//               does nothing else (i.e., graph is not updated, etc)
var addSectionHTML = function (title, instructor, section, bgcolor, id) {
    var $elem = newSectionHTML(title, instructor, section, bgcolor);
    $elem.attr("data-section-id", id);
    if (noSectionsSelected()) {
        $("#container").prepend($elem);
    } else {
        $("#container").children(".section-container").last().after($elem);
    }
    return $elem;
};

// Arguments: $elem, the jquery object representing the .section-container element
//                   to be edited.
//            title, instructor, section, bgcolor, the properties of the section.
// SideEffects: The $elem will be updated with the new info.
var editSectionHTML = function ($elem, title, instructor, section, bgcolor) {
    $elem.find(".title").html(title);
    $elem.find(".instructor").html(title);
    $elem.find(".section").html(section);
    $elem.css("background-color", bgcolor);
};

// Arguments: ajaxData, Raw AJAX data containing information about an added section.
//            barText, a two-tuple containing the text for the instructor and semester
//                     sections of the bar describing the added section
// Return: the same section, with extra data added for the top bar, graph, and info section.
var compileSectionData = function (ajaxData, barText) {
    var phigh = ajaxData.percentile_high;
    var plow = ajaxData.percentile_low;
    var courseGPA = ajaxData.course_gpa;
    var sectionGPA = ajaxData.section_gpa;

    var sectionData = ajaxData;

    var nullRef = -1; //could be "NULL"

    for (var letter in ajaxData) {
        if (!ndef(ajaxData[letter].percent)) {
            if (sectionData[letter].numerator === nullRef || sectionData[letter].numerator < 0) {
            sectionData[letter].percentile_high = "0th";
            sectionData[letter].percentile_low = "0th";
            sectionData[letter].percent = 0.00;
            sectionData[letter].numerator = 0;
            } else {
                sectionData[letter].percentile_low = utils.ordinal(Math.round(sectionData[letter].percentile_low*100)) + "&nbsp; - &nbsp;";
                sectionData[letter].percentile_high = utils.ordinal(Math.round(sectionData[letter].percentile_high*100)) + " Percentile";

                sectionData[letter].percent = Math.round(sectionData[letter].percent*100*100)/100;
            }
            sectionData[letter].denominator = sectionData.denominator;
        }
    }

    sectionData.section_gpa = Math.round(sectionGPA * 100)/100;
    sectionData.course_gpa = Math.round(courseGPA * 100)/100;

    sectionData.instructor = barText[0];
    sectionData.semester = barText[1];

    return sectionData;
};

// Arguments: a number representing where to store section data
// Return: the key of the dictionary to store in the window object.
/**
 * As you might expect, this is a dumb way to store data.
 * TODO: refactor this to just use the number instead of converting
 * to a string.
 */
var numToWindowKey = function (num) {
    var keys = ["one", "two", "three", "four"];
    return keys[num - 1];
};

// Return: the first empty value of the grades.section_data
/**
 * Note: grades.section_data is the global we use to store data that appears on
 * the page. For example, if you had two sections selected, you would have grades.section_data = {
 *     "one": {...},
 *     "four": {...}
 * }
 * That would happen if the user had four sections up, but then deleted two of them.
 * The keys may not be in order (that is, if you have two sections, the keys may not be "one" and "two").
 * This function returns the next one that is available.
 */
var getNextSectionDataPosition = function () {
    if (grades.section_data === undefined) {
        return 1;
    } else {
        var list = ["one", "two", "three", "four"];
        for (var i=0; i<list.length; i++) {
            if (grades.section_data[list[i]] === null) {
                return list.indexOf(list[i]) + 1;
            }
        }
        return false;
    }
};

// Arguments: ajaxData, the object of data for a section
//            num, a section index (1-4)
// SideEffects: stores a section from ajaxData corresponding to num
/**
 * @return true if the data was stored, false otherwise
 */
var storeSectionData = function (ajaxData, num) {
    if (!isValidSectionNum(num) || typeof ajaxData !== "object") {
        return false;
    }
    if (grades.section_data === undefined) {
        grades.section_data = {"one": null, "two": null, "three": null, "four": null};
    }
    var key = numToWindowKey(num);
    grades.section_data[key] = ajaxData;
    return true;
};

// Arguments: num, a section index (1-4)
// Returns: the section data corresponding to num
var getSectionData = function (num) {
    if (!isValidSectionNum(num)) {
        return false;
    }

    var key = numToWindowKey(num);
    // 1 is now mapped to one, etc.
    if (grades.section_data === undefined) {
        return false;
    } else {
        return grades.section_data[key];
    }
};

// Arguments: num, a section index (1-4)
// SideEffects: removes the section corresponding to num
var removeSectionData = function (num) {
    if (!isValidSectionNum(num) || grades.section_data === undefined) {
        return false;
    } else {
        var key = numToWindowKey(num);
        if (grades.section_data[key] === null || grades.section_data[key] === undefined) {
            return false;
        }

        grades.section_data[key] = null;
    }
};

// Return: the number of sections stored. (max of 4)
var countSectionData = function () {
    if (grades.section_data === undefined)
        return 0;
    var count = 0;
    $.each(grades.section_data, function (index, val) {
        if (val !== null)
            count++;
    });
    return count;
};

// Return: whether any sections are selected.
var noSectionsSelected = function () {
    return $(".section-container").length === 0;
};

// Return: whether any grades are shown.
var noGradesShown = function () {
    return $("#in_depth_grades").length === 0;
};

// Arguments: sectionData, the data for a particular section
// SideEffect: Updates the top of the info section with the section information
/**
 * Note that here the info section is the section on the bottom right side of the screen
 * with various info about the course's average grade, the percentages of different grades,
 * etc.
 */
var updateSectionInfo = function (sectionData) {
    if (noSectionsSelected()) {
        $("#section_info_container").html("");
        var html = "";
        html += "<div class='average-box' id='course_averages'>";
            html += "<div class='title-container'>";
                html += "<div class='title' id='course_title'></div>";
                html += "<div class='card-link' data-id='" + sectionData.course_id + "'>(info)</div>";
            html += "</div>";
            html += "<div class='subtitle' id='course_subtitle'></div>";
            html += "<div class='average' id='course_average'>";
                html += "<span class='average-text'>Course Avg. GPA:</span>&nbsp;&nbsp;";
                html += "<span class='average-gpa'></span>&nbsp;&nbsp;";
                html += "<span class='average-letter'></span>&nbsp;&nbsp;";
            html += "</div>";
        html += "</div>";
        html += "<div class='average-box' id='section_averages'>";
            html += "<div class='title' id='section_title'></div>";
            html += "<div class='average' id='section_average'>";
                html += "<span class='average-text'>Section Avg. GPA:</span>&nbsp;&nbsp;";
                html += "<span class='average-gpa'></span>&nbsp;&nbsp;";
                html += "<span class='average-letter'></span>&nbsp;&nbsp;";
            html += "</div>";
        html += "</div>";

        $("#section_info_container").append(html);

        $("#grades_info_container").empty();
        $("#info .card-link").click(function () {
            courseBox.initCourseBox("overview", $(this).data("id"));
        });
    }
    
    utils.updateHTML("#info #course_averages #course_title", sectionData.title);
    utils.updateHTML("#info #course_averages #course_subtitle", sectionData.subtitle);
    if (sectionData.course_gpa > 0) {
        utils.updateHTML("#info #course_averages #course_average .average-gpa", utils.formatGPA(sectionData.course_gpa));
    } else {
        utils.updateHTML("#info #course_averages #course_average .average-gpa", "");
    }
    
    utils.updateHTML("#info #course_averages #course_average .average-letter", sectionData.course_letter);
    $("#info #course_averages #course_average").css("background-color", utils.gradeToColor(sectionData.course_letter));
    $("#info .card-link").data("id", sectionData.course_id);

    var instructor = sectionData.instructor === "all" ? "All Instructors" : maxifyInstructor(sectionData.instructor);
    var semester = sectionData.semester === "all" ? "All Semesters" : maxifySemester(sectionData.semester);
    
    if (sectionData.section_gpa > 0) {
        utils.updateHTML("#info #section_averages #section_average .average-gpa", utils.formatGPA(sectionData.section_gpa));
    } else {
        utils.updateHTML("#info #section_averages #section_average .average-gpa", "");
    }

    utils.updateHTML("#info #section_averages #section_title", instructor + " - " + semester);
    utils.updateHTML("#info #section_averages #section_average .average-letter", sectionData.section_letter);
    $("#info #section_averages #section_average").css("background-color", utils.gradeToColor(sectionData.section_letter));
};

// Arguments: num, a section index (1-4)
// SideEffects: updates the sidebar with the section info in grades.section_data at the given section index
// Return: true if it succeeds, false if not.
var updateSectionInfoFromIndex = function (num) {
    if (!isValidSectionNum(num)) {
        var key = numToWindowKey(num);
        // 1 is now mapped to one, etc.
        if (grades.section_data === undefined || grades.section_data[key] === null) {
            return false;
        } else {
            updateSectionInfo(grades.section_data[key]);
            return true;
        }
    }
};

/**
 * When a section is removed, call this function with the removed section's id. This will,
 * if the section was the first one, take care of updating the sidebar with the new first
 * section header's grade info. Otherwise, it will hide the graph and show the welcome message.
 */
// SideEffects: If there is no section, add a message telling the user to add one.
//              If there is are sections left, update the sidebarInfo to reflect the first one.
// TODO: update the name of this function, it doesn't actually remove anything.
var smartRemoveSectionInfo = function (id) {
    if (noSectionsSelected()) {
        $("#section_info_container").empty();
        $("#grades_info_container").empty();
        $(".welcome").show();
    } else if (grades.info_num === parseInt(id)) {
        var num = parseInt($(".section-container").first().attr("data-section-id"));
        updateInfo(num, getSectionData(num).section_letter);
    }
};

// Arguments: selector, the "id" of the box showing one of the grades in the sidebar
//            gData, the grade data
//            letter, the letter grade,
//            withCSS, whether to change the background-color or not (is it the middle?)
// SideEffects: updates the grade box corresponding to the selector with the info in gData and letter.
var updateOneGrade = function (selector, gData, letter, withCSS) {
    
    utils.updateHTML(selector + " .percentile-high", gData.percentile_high);
    utils.updateHTML(selector + " .percentile-low", gData.percentile_low);
    utils.updateHTML(selector + " .grade", letter);
    utils.updateHTML(selector + " .grade-detail .grade-percentage", gData.percent + "%");
    utils.updateHTML(selector + " .grade-detail .grade-fraction", gData.numerator + " / " + gData.denominator);

    if (withCSS) {
        $(selector).css("background-color", utils.gradeToColor(letter));
    }
};

// Arguments: selector, the "id" of the box showing one of the grades in the sidebar
// SideEffects: clears the box corresponding to the selector.
var clearGrade = function (selector) {
    utils.updateHTML(selector + " .percentile-high", "");
    utils.updateHTML(selector + " .percentile-low", "");
    utils.updateHTML(selector + " .grade", "");
    utils.updateHTML(selector + " .grade-detail .grade-percentage", "");
    utils.updateHTML(selector + " .grade-detail .grade-fraction", "");
    $(selector).css("background-color", "white");
};

// Arguments: g1, the top grade info
//            g2, the middle grade info
//            g3, the bottom grade info
//            letter{1,2,3}: the corresponding letter for the {top,middle,bottom} grade info
// SideEffects: updates the grades displayed on the sidebar.
var updateGradeInfo = function (g1, g2, g3, letter1, letter2, letter3) {
    if (noGradesShown()) {
        $("#grades_info_container").html("");
        var html = "";
        html += "<div id='in_depth_grades'>";
            html += "<div class='grade-info' id='info_1'>";
                html += "<div class='percentile-container'>";
                    html += "<div class='percentile percentile-low'></div>";
                    html += "<div class='percentile percentile-high'></div>";
                html += "</div>";
                html += "<div class='grade'></div>";
                html += "<div class='grade-detail'>";
                    html += "<div class='grade-fraction'></div>";
                    html += "<div class='grade-percentage'></div>";
                html += "</div>";
            html += "</div>";
            html += "<div class='grade-info' id='info_2'>";
                html += "<div class='percentile-container'>";
                    html += "<div class='percentile percentile-low'></div>";
                    html += "<div class='percentile percentile-high'></div>";
                html += "</div>";
                html += "<div class='grade'></div>";
                html += "<div class='grade-detail'>";
                    html += "<div class='grade-fraction'></div>";
                    html += "<div class='grade-percentage'></div>";
                html += "</div>";
            html += "</div>";
            html += "<div class='grade-info' id='info_3'>";
                html += "<div class='percentile-container'>";
                    html += "<div class='percentile percentile-low'></div>";
                    html += "<div class='percentile percentile-high'></div>";
                html += "</div>";
                html += "<div class='grade'></div>";
                html += "<div class='grade-detail'>";
                    html += "<div class='grade-fraction'></div>";
                    html += "<div class='grade-percentage'></div>";
                html += "</div>";
            html += "</div>";
        html += "</div>";
        $("#grades_info_container").append(html);
    }

    if (g1 !== null) {
        updateOneGrade("#info_1", g1, letter1, false);
    } else {
        clearGrade("#info_1");
    }

    if (g2 !== null) {
        updateOneGrade("#info_2", g2, letter2, false);
    } else {
        clearGrade("#info_2");
    }
    
    if (g3 !== null) {
        updateOneGrade("#info_3", g3, letter3, false);
    } else {
        clearGrade("#info_3");
    }
    
    if (letter1 === "P" || letter1 === "NP") {
        $("#info #in_depth_grades .grade-info:first-child, #info #in_depth_grades .grade-info:last-child").css("color", "black");
    } else {
        $("#info #in_depth_grades .grade-info:first-child, #info #in_depth_grades .grade-info:last-child").css("color", "#999");
    }
};

// Arguments: num, the number corresponding to the stored section in the grades object.
//            grade, the grade you want to display the sidebar (A, B, B-, C+, etc)
// SideEffects: updates the sidebar with the proper info
var updateInfo = function (num, grade) {
    grades.info_num = num;
    var d = getSectionData(num);
    if (d) {
        updateSectionInfo(d);
        
        if (d["course_letter"] !== "N/A") {
            var otherGrades = beforeAndAfterGrades(grade);
            var g1 = d[otherGrades[0]] !== undefined ? d[otherGrades[0]] : null,
                g2 = d[grade],
                g3 = d[otherGrades[1]] !== undefined ? d[otherGrades[1]] : null;
            updateGradeInfo(g1, g2, g3, otherGrades[0], grade, otherGrades[1]);            
        } else {
            updateGradeInfo(d["P"], d["NP"], null, "P", "NP", null);
        }
        
    } else {
        console.log("*** Error: could not find stored section data for: " + num);
    }
};

// SideEffects: creates bindings for:
//              - Section bar hover: when you hover over a section bar, its info
//                should show up in the right sidebar
//              - Remove button: when you press the X button on a section, it should
//                properly remove the section.
var bind = function () {
    $(".section-remove-button").unbind("click").click(function () {
        removeSection($(this).parent().parent());
    });
    $(".section-container").unbind("hover").hover(function () {
        var sectionID = parseInt($(this).data("section-id"));
        updateInfo(sectionID, getSectionData(sectionID).section_letter);
    });
};

// Arguments: sectionData, the AJAX data from the server about the section
// Return: a jQuery object containing information about the section
var addSection = function (sectionData) {
    var next = getNextSectionDataPosition();
    if (next) {
        var title = sectionData.title;
        var instructor = sectionData.instructor;
        var semester = sectionData.semester;
        var bgcolor = sectionNumToColor(next);
        storeSectionData(sectionData, next);
        updateSectionInfo(sectionData);
        updateInfo(next, sectionData.section_letter);
        var $added = addSectionHTML(title, instructor, semester, bgcolor, next);
        bind();
        updateURL();
        return $added;
    } else {
        console.log("*** Error: No more sections can be added.");
    }
};

// Arguments: sectionIDs (optional), a list of sectionIDs
// SideEffects: Checks whether the currently selected section (or sections in sectionIDs) has already been added,
//              and flags accordingly.
// Return: The result of the check (T/F)
grades.checkAlreadyAdded = function (sectionIDs) {
    if (!ndef($("#select_course option:selected").size) && $("#select_course option:selected").size() === 1 && (grades.sections === undefined || grades.sections.length === 0)) {
        $(".select-button").hide();
        $("#select_question_button_3").show();
        return;
    }
    var gradeString = sectionIDs ? sectionIDs : _.sortBy(grades.getSelectedGrades(), function (i) {return parseInt(i, 10);}).join("&");
    var already = $(".section-container").filter(function () {
        return $(this).attr("data-grades") === gradeString;
    }).length !== 0;
    if (already) {
        $(".select-button").hide();
        $("#select_question_button_2").show();
    } else {
        $(".select-button").hide();
        $("#select_add_button").show();
    }
    return already;
};

// Arguments: $section, a jQuery object referring to some section bar
// SideEffects: removes the section completely from the page.
var removeSection = function ($section) {
    var id = $section.attr("data-section-id");
    var num = parseInt(id, 10);
    $section.remove();
    removeSectionData(num);
    updateGraph();
    smartRemoveSectionInfo(id);
    $(".select-button").hide();
    $("#select_add_button").show();
    updateURL();
    grades.checkAlreadyAdded();
};

// Arguments: sectionIDs, a list of section IDs
//            callback, a callback function
//            barText, the text to be added to the section bar on top of the select bar.
// SideEffects: queries the server for the cumulative grade distribution of all of the sections
//              listed in "sectionIDs". Should be called when a section is added.
grades.getGradesAndAddSection = function (sectionIDs, barText, callback) {
    if (sectionIDs.length === 0)
        return;
    var url = sectionIDs.join("&") + "/";
    $.getJSON("/grades/sections/" + url, function (json) {
        
        json.sectionIDs = sectionIDs;
        var sectionData = compileSectionData(json, barText);
        addSection(sectionData).attr("data-grades", _.sortBy(sectionIDs, function (i) {return parseInt(i, 10);}).join("&"));
        updateGraph();
        if (callback) {
            callback();
        }
        if (getNextSectionDataPosition() === false) {
            $(".select-button").hide();
            $("#select_question_button").show();
        }
        grades.checkAlreadyAdded();

        var getSectionEventText = function (section) {
            return [section.title,
                    maxifyInstructor(section.instructor),
                    maxifySemester(section.semester)].join(" - ");
        };

        // event tracking by GA
        ga.trackEvent("Grades", "Add Course", getSectionEventText(sectionData));

        var sectionInfo = [];
        for (var index in grades.section_data) {
            if (grades.section_data[index] !== null) {
                sectionInfo.push(getSectionEventText(grades.section_data[index]));
            }
        }
        ga.trackEvent("Grades", "Added Courses", sectionInfo.sort().join(", "));
    });
};

// SideEffects: Updates the graph based on the currently selected sections.
// Note: Chooses a different color for each graph, and plots each bin side-by-side.
//       functionality is documented further in the code itself.
/**
 * This code is mostly d3.js code. The gist is that, based on the currently selected sections (i.e.,
 * based on how many .section-container divs there are in the html), this function will render
 * the bar graph in the HTML element with id="graph_container".
 */
var updateGraph = function () {
    // if there's an existing graph, delete it.
    $("svg").remove();
    $(".welcome").hide();

    // no sections means no graph
    if ($(".section-container").length === 0)
        return;

    // gather all of the section/color data
    var sectionData = [];
    var colors = [];
    $(".section-container").each(function () {
        var sid = parseInt($(this).attr("data-section-id"), 10);
        sectionData.push({"data": getSectionData(sid), "id": sid});
        colors.push(sectionNumToColor(sid));
    });

    // parse data
    var grades = [];
    var yMax = 0;
    
    for (var i = 0; i < sectionData.length; i++) {
        var section = [];
        
        for (var j = 0; j < utils.gradeList.length; j++) {
            var newPercent = sectionData[i].data[utils.gradeList[j]].percent/100;
            section.push({"grade": utils.gradeList[j], "percent": newPercent, "id": sectionData[i].id});
            if (newPercent > yMax) {
                yMax = newPercent;
            }
        }
        
        grades.push(section);
    }

    // max value is either 102% or 10% higher than the max (if < 100%)
    yMax = d3.min([1.02, yMax + 0.1]);

    // height/width/etc
    var svgWidth = parseInt($("#graph_container").css("width"), 10); // outer width
    var svgHeight = parseInt($("#graph_container").css("height"), 10); // outer height
    var padding = 40; // TODO: Fix this.
    var width = svgWidth; // inner width, less padding than height
    // because graph element already has padding
    var height = svgHeight - padding / 2; // inner height

    // x scale (scale for the whole chart)
    var x0 = d3.scale.ordinal()
            .domain(utils.gradeList)
            .rangeRoundBands([padding, width], 0.1);

    // x scale (scale for each grade)
    var x1 = d3.scale.ordinal()
        .domain(d3.range(sectionData.length))
        .rangeRoundBands([0, x0.rangeBand()], 0.1);

    // y scale
    var y = d3.scale.linear()
        .domain([0, yMax])
        .range([height, 0]); //0 because we want to go all the way to the top

    // create svg element
    var svg = d3.select("div#graph_container")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // grid lines
    svg.selectAll("line.y")
        .data(y.ticks(10))
        .enter().append("line")
            .attr("class", "y")
            .attr("x1", padding)
            .attr("x2", width)
            .attr("y1", y)
            .attr("y2", y);

    // initialize shifted graph for each section
    var sections = svg.selectAll("g")
        .data(grades)
        .enter().append("g")
            .attr("fill", function (d, i) { return colors[i]; })
            .attr("transform", function (d, i) { return "translate(" + x1(i) + ")"; });

    // insert data into each graph
    var groups = sections.selectAll("rect")
        .data(Object) // using each section's own data
        .enter().append("rect")
            .attr("x", 0)
            .attr("y", function (d) { return y(d.percent); })
            .attr("width", x1.rangeBand())
            .attr("height", function (d) { return height - y(d.percent); })
            .attr("transform", function (d, i) { return "translate(" + x0(d.grade) + ")"; })
            // handle clicks
            .on("mouseover", function (d) {
                updateInfo(d.id, d.grade);
            });

    // x axis
    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "axis")
        .call(xAxis);

    // y axis
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format("%"));
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);
};

// SideEffects: starts the tour
grades.tour = function () {
    var highlights = {
        ".section-container:nth-child(2)": {
            text: "Selected courses are here. Hover over one to see its info. Choose up to 4 using the dropdowns.",
            angle: 85,
            distance: 170
        },
        "g:first rect:nth-child(5)": {
            text: "Hover over a bar to see sidebar info."
        },
        "#course_average": {
            text: "Information about the course is displayed here.",
            angle: 270,
            distance: 130
        },
        "#info_2": {
            text: "Percentile info for every possible grade.",
            angle: 270,
            distance: 100
        }
    };
    var preTour = function (displayTour) {
        var selectCourse = function (courseTitle) {
            $("#select_course").prop("selectedIndex", $("#select_course option[data-title='" + courseTitle + "']").index());
            $("#select_course").trigger("change");
        };

        selectCourse("COMPSCI 61A");
        grades.getSectionsAndUpdateFields(function () {
            grades.getGradesAndAddSection(grades.getSelectedGrades(), grades.getBarText(), function () {
                selectCourse("ENGLISH R1A");
                grades.getSectionsAndUpdateFields(function () {
                    grades.getGradesAndAddSection(grades.getSelectedGrades(), grades.getBarText(), function () {
                        displayTour();
                    });
                });
            });
        });
    };
    var postTour = function () {
        $(".section-container").each(function () {
            removeSection($(this));
        });
    };
    tour.startTour(highlights, preTour, postTour);
};

// SideEffects: updates the document's URL based on the currently selected sections.
//              It should happen every time you add/remove a section.
// Note: The format of each option should be:
//       <course_id>-<instructor>-<semester>
//       - course_id is just the number corresponding to the course
//       - instructor is in the format "SMITH,J.E" if semester is set to "all",
//         and in the format "SMITH,J.E_001" if semester is set to "<semester>_<year>".
//         Additionally, instructor can be set to "all".
//       - semester can either be set to "all" or "<semester>_<year>" (e.g. "spring_2012")
var updateURL = function () {
    var constructURLFromSections = function () {
        var count = 0;
        return "/grades/?" + $.map(grades.section_data, function (section, index) {
            if (section === null)
                return null;
            section.instructor = minifyInstructor(section.instructor);
            section.semester = minifySemester(section.semester);
            count += 1;
            return "course" + count.toString() + "=" + section.course_id + "-" + section.instructor + "-" + section.semester;;
        }).join("&");
    };
    if (window.history.replaceState) {
        if (countSectionData() === 0) {
            window.history.pushState(null, null, "/grades/");
            return;
        }
        var pageURL = constructURLFromSections();
        window.history.replaceState(null, null, pageURL);
    }
};

/**
* Given the portion of the URL after the ?, makes sure that it is a valid enrollment query.
* The keys of the params should be course(1|2|3|4) and the values should be of the form:
* <course_id>-<instructor>-<semester> where semester can either be set to "all" or
* "<semester>_<year>" (e.g. "spring_2012")
* @param {string} getParams the GET parameters passed to the URL, as a string (no "?")
* @return {boolean} whether the params are valid or not
*/
// TODO: semester formatting is not consistent between grades and enrollment
grades.validateURL = function (getParams) {
    var params = getParams.split("&");
    var errorFound = false;
    $.each(params, function (index, param) {
        var keyValue = param.split("=");
        if (keyValue.length !== 2 ||
            !keyValue[0].match(/course[1|2|3|4]/) ||
            !keyValue[1].match(/(\d+)-(.+)-(((fall|spring)_(\d+))|(all))/)) {
            errorFound = true;
            return false; // break the each loop
        }
    });
    return !errorFound;
};

// SideEffects: reads the current URL, and adds the appropriate sections.
// Note: The format of each option should be:
//       <course_id>-<instructor>-<semester>
//       - course_id is just the number corresponding to the course
//       - instructor is in the format "SMITH,J.E" if semester is set to "all",
//         and in the format "SMITH,J.E_001" if semester is set to "<semester>_<year>".
//         Additionally, instructor can be set to "all".
//       - semester can either be set to "all" or "<semester>_<year>" (e.g. "spring_2012")
grades.parseURL = function () {
    var sections = window.location.search.replace("?", "");
    if (!grades.validateURL(sections)) {
        // show the welcome div instead.
        $(".welcome").show(); // if the welcome div is still here (hasn't been replaced by the graph from the url), show it.
        return;
    }
    sections = sections.split("&");
    $(".loading").show();
    sections = $.map(sections, function (val) {
        return val.split("=")[1];
    });
    var lastID;
    $.each(sections.slice(0,4), function (index, val) {
        // prepare course data from GET parameter
        var split = val.split("-");
        var courseID = split[0];
        var instructor = split[1];
        var hasSection = instructor.split("_").length === 2;
        var semester = split[2];

        // prepare text for the section bar.
        var barText = [];
        if (instructor === "all" && semester === "all") {
            barText = ["All Sections", "All Semesters"];
        } else {
            barText = [maxifyInstructor(instructor), maxifySemester(semester)];
        }

        // get all sections for the course
        $.getJSON("/grades/course_grades/" + courseID + "/", function (json) {
            // prepare id array for all matching sections
            var sectionIDs = $.map(json, function (sec, index) {
                // prepare comparison data
                var inst = minifyInstructor(sec.instructor);
                if (hasSection)
                    inst += "_" + sec.section_number;
                var sem = sec.semester + "_" + sec.year;

                // compare data
                if ((instructor === "all" || instructor === inst) && (semester === "all" || semester === sem))
                    return sec.grade_id;
                // remove element if it"s undefined.
                return undefined;
            });
            if (!grades.checkAlreadyAdded(sectionIDs))
                grades.getGradesAndAddSection(sectionIDs, barText);
            $(".loading").hide();
        });
        lastID = courseID;
    });
    $("#select_course").prop("selectedIndex", $("#select_course option[value=" + lastID + "]").index());
    grades.initCourseSelect();
    $("#select_course").trigger("select2:select");
};

// TODO: "minify" and "maxify" are the the wrong terminology to use here: we should call it "serialize" and "deserialize"
// instead, because that's what it's doing.

// Arguments: instructor, the full name of an instructor, possibly including the section number of the relevant course
// Return: the instructor's name, minified: (e.g. "SMITH, J P / 001" ==> "SMITH,J.P_001")
var minifyInstructor = function (instructor) {
    return instructor.indexOf("All ") !== -1 ? "all" : instructor.replace(", ", ",").replace(" / ", "_").replace(/ /g, ".");
};

// Arguments: inst, the minified name of an instructor, possibly including the section number of the relevant course
// Return: the instructor's name, maxified: (e.g. "SMITH,J.P_001" ==> "SMITH, J P / 001")
var maxifyInstructor = function (instructor) {
    return instructor === "all" ? "All Sections" : instructor.replace(",", ", ").replace("_", " / ").replace(/\./g, " ");
};

// Arguments: semester, the semester and year
// Return: the semester, minified: (e.g. "Fall 2011" ==> "fall_2011")
var minifySemester = function (semester) {
    return semester.indexOf("All ") !== -1 ? "all" : semester.replace(" ", "_").toLowerCase();
};

// Arguments: semester, the minified semester and year
// Return: the semester, maxified: (e.g. "fall_2011" ==> "Fall 2011")
var maxifySemester = function (semester) {
    return semester === "all" ? "All Sections" : semester.replace("_", " ").capitalize();
};

})(window, $, console, _, d3, bt_utils, bt_ga, colorstore, tour);
