/** DEPRECATED. PLEASE SEE SCHEDULE-UTILS.JS FOR CURRENT CODE. */

var schedule = {};

(function (window, $, console, utils) {
    "use strict";

schedule.schedules = [];
schedule.lastQuery = ""; //for course search

/**
* Choose from the following: 'search'
*/
schedule.currentPage = "";

schedule.STANDARD_HOURS = [
    "8:00",
    "9:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00"
];



/********************************************************************************************************************/
/** Left Column *****************************************************************************************************/
/********************************************************************************************************************/

schedule.initializeLeftColumn = function () {
    schedule.dataStore.clearOrCreate(schedule.currentSemester, schedule.currentYear);
    _loadSemesterSchedules(schedule.currentSemester, schedule.currentYear);
};

/**
* Gets the schedules for the given semester.
* @param semester {string} the chosen semester to display schedules from
* @param year {string} the chosen year to display schedules from
* @param callback {function}
* @return undefined
*/
var _loadSemesterSchedules = function (semester, year) {
    $.getJSON("/schedule/semester_schedules", {semester: semester, year: year}, function (data) {
        schedule.schedules = data;
        _displayScheduleList(semester, year);
    });
};

/**
* Loads detailed information about a schedule when the user selects it.
* @param scheduleID {string} representation of the ID of the schedule
* @return undefined
*/
var _loadSchedule = function (scheduleID) {
    $.getJSON("/schedule/schedule/?schedule_id=" + scheduleID, function (json) {
        if (schedule.currentState === undefined)
            schedule.currentState = new schedule.State();
        schedule.currentState.store(json.state, json.id, json.name, json.semester, json.year, json.generated);
        _loadCourses();
    });
};

/**
* Loads any courses in the currentState that aren't present in dataStore.
* @param callback {function} a function to execute after the courses are stored
*/
var _loadCourses = function () {
    schedule.dataStore.ensure(schedule.currentState.getCourseIDs(), schedule.displayExistingSchedule);
};

/**
* Loads all of the schedule choices for the current state
*/
var _loadChoices = function (semester, year, minimize_gap, eliminate_full, minimize_days, early, exclude_voluntary) {
    var postData = {
        state: JSON.stringify(schedule.currentState.getState()),
        semester: semester,
        year: year,
        minimize_gap: minimize_gap,
        eliminate_full: eliminate_full,
        minimize_days: minimize_days,
        early: early,
        exclude_voluntary: exclude_voluntary
    };
    $.post("/schedule/generate/", postData, function (choices) {
        schedule.choices.store(choices);
        if (schedule.choices.countCourses() === 0) {
            schedule.grid.displayNoSchedulesError();
        } else {
            schedule.grid.renderSchedules();
        }
    }, "json");
};

/**
* Display all semesters in the left column
*/
var _displaySemesters = function () {
    _clearLeftColumn();

    var $left = $(".left");

    var html = "<div class='schedule-header'>All Semesters</div>";
    $left.append(html);

    html = "<div class='result-list'>";
    $.each(schedule.semesters, function (index, semester) {
        html +=
        "<div class='semester' data-semester='" + semester.semester + "' data-year='" + semester.year + "'>" +
            "<div class='text'>" + _semesterBlockTitle(semester.semester, semester.year) + "</div>" +
        "</div>";
    });

    html += "</div>";

    var $semesters = $(html);
    $semesters.children(".semester").click(function () {
        var semester = $(this).data("semester"),
            year = $(this).data("year");
        schedule.dataStore.clearOrCreate(semester, year);
        _loadSemesterSchedules(semester, year);
    });

    $left.append($semesters);
};

/**
* Returns whether the user has any schedules.
*/
var _hasSchedules = function () {
    return schedule.schedules.length > 0;
}

/**
* Displays the list of schedules in the sidebar for a given semester/year.
* @param semester {string} the semester (e.g. "fall")
* @param year {string} the year (e.g. "2013")
* @return undefined
*/
var _displayScheduleList = function (semester, year) {
    _clearLeftColumn();
    var $left = $(".left");

    //header
    $left.html("<div class='schedule-header'><span class='bold'>" + semester + "</span> " + year + "</div>");

    //back-button
    $left.append("<div class='single-option-bar back-semesters'>Switch Semesters</div>");
    $(".back-semesters").click(_displaySemesters);

    if (_hasSchedules()) {
        var addDeleteHTML =
        "<div class='double-option-bar schedule-bar'>" +
            "<div class='option option-left add-schedule'>new schedule</div>" +
            "<div class='option option-left delete-schedule'>delete schedules</div>" +
        "</div>";

    } else {
        var addDeleteHTML =
        "<div class='single-option-bar add-schedule'>new schedule</div>" + _noSchedulesHTML();
    }

    var _deleteScheduleHandler = function() {
        $(".double-option-bar").slideUp(200);
        $(".schedule-icon").hide();
        $(".delete-button").show();

        $(".back-semesters").text("cancel").click(function() {
            _displayScheduleList(semester, year);
        });
        $(".schedule").unbind("click");
        $(".delete-button").click(function() {
            $(".back-semesters").text("done");
        });
    };
    //     $(this).text("cancel").addClass("berkeleytime-red").click(function() {
    //         _displayScheduleList(semester, year);
    //     });
    //     $(".schedule").unbind("click");
    //     $(".remove-schedule").show();
    // };

    $left.append(addDeleteHTML);

    $(".add-schedule").click(function() {
        _displayCreateSchedule(semester, year);
    });
    $(".delete-schedule").click(_deleteScheduleHandler);

    var $resultList = $("<div class='result-list'></div>");

    $left.append($resultList);

    $.each(schedule.schedules, function (index, s) {
        $resultList.append(_createScheduleBlock(s));
    });

    _resizeScheduleList();
    $(".delete-button").hide();
};

/**
* Creates a clickable schedule block for the sidebar.
* @param schedule {dict} schedule instance
* @param callback {function} a function to be called when the box is clicked
* @return {jQuery} the header block element
*/
var _createScheduleBlock = function (s) {
    var $scheduleBlock = $(
        "<div class='schedule' data-schedule_id=" + s.id + ">" +
            "<div class='schedule-inner-container'>" +
                "<div class='schedule-text-container'>" +
                    "<span class='schedule-name'>" + s.name + "</span>" +
                    "<span class='schedule-courses'>" + s.course_string + "</span>" +
                    "<span class='schedule-options'>" +
                        "<span class='main-button'>Set as Main Schedule</span>" +
                    "</span>" +
                "</div>" +
                "<div class='schedule-icon-container'>" +
                    "<i class='icon-chevron-sign-right icon-large schedule-icon'></i>" +
                    "<span class='delete-button bold'>delete</span>" +
                "</div>" +
            "</div>" +
        "</div>"
    );


    $scheduleBlock.find(".main-button").click(function(e) {
        e.stopPropagation();
        _setScheduleAsMain(s.id);
    });

    if (s.main === true) {
        $scheduleBlock.addClass("main");
        $scheduleBlock.find(".main-button")
            .unbind("click")
            .text("Main Schedule")
            .addClass("unselectable")
    }

    $scheduleBlock.find(".delete-button").click(function(e) {
        e.stopPropagation();
        _deleteSchedule(s, $scheduleBlock);
    });



    $scheduleBlock.click(function() {
        _loadSchedule(s.id);
    });

    return $scheduleBlock
};

/**
* Refreshes a list of currently displayed schedules to accurately reflect the schedule
* that is the main schedule
* @param scheduleID {string} representation of the id of the schedule
*/
var _refreshMainSchedules = function(scheduleID) {
    //reset all schedules as not the main schedule and bind click event
    var $allSchedules = $(".schedule");
    $allSchedules.removeClass("main");
    $allSchedules.find(".main-button")
        .text("Set As Main Schedule")
        .removeClass("unselectable")
        .click(function(e) {
            e.stopPropagation();
            _setScheduleAsMain($(this).closest(".schedule").data("schedule-id"));
        });

    //set the schedule with scheduleID to the main schedule
    var $mainSchedule = $(".schedule[data-schedule_id='" + scheduleID + "']");
    $mainSchedule.addClass("main");
    $mainSchedule.find(".main-button")
        .unbind("click")
        .text("Main Schedule")
        .addClass("unselectable");
}

/**
* Permanently deletes a schedule from the database
* @param {dict} s: the schedule to delete
* @param {jQuery}: the schedule block to remove once it's deleted.
*/
var _deleteSchedule = function (s, $removable) {
    $.post("/schedule/delete_schedule/", {"schedule_id": s.id}, function (json) {
        if (json.success) {

            //remove from (prototype-extensions.js), takes in a filter function
            schedule.schedules.remove(function (schedule) {
                return schedule.id === s.id;
            });
            if (!_hasSchedules()) {
                _displayScheduleList(s.semester, s.year);
            }
            $removable.remove();
        }
    }, "json");
}

/**
* Sets schedule with scheduleID as the main schedule in the database
* @param scheduleID {string} representation of the ID of the schedule
*/
var _setScheduleAsMain = function(scheduleID) {
    $.post("/schedule/main_schedule/", {"schedule_id": scheduleID}, function (json) {
        if (json.success) {
            _refreshMainSchedules(scheduleID);
        }
    }, "json");
}

/**
* Displays the dialog in the left column to create a schedule. Attaches relevant click
* events, and submit button to save schedule. On success, redirects user to new schedule
*/
var _displayCreateSchedule = function(semester, year) {
    _clearLeftColumn();
    var $left = $(".left");
    $left.html("<div class='schedule-header'><span class='bold'>" + semester + "</span> " + year + "</div>");

    $left.append("<div class='single-option-bar back-schedule-list'>Cancel</div>");
    $(".single-option-bar.back-schedule-list").click(function() {
        _displayScheduleList(semester, year);
    });

    var html =
    "<div class='schedule-create-container'>" +

        //profile picture
        "<div class='facebook-profile'>" +
            "<div class='facebook-picture'></div>" +
            "<div class='facebook-text'>" +
                "<div class='facebook-name'></div>" +
                "<div class='facebook-info'></div>" +
            "</div>" +
        "</div>" +

        //form
        "<div class='name-schedule-prompt'></div>" +
        "<input class='name-schedule' type='text' placeholder='Name your schedule...'>" +
        "<div class='main-schedule-prompt'>Set this as your main schedule?</div>" +

        //main schedule
        "<div class='wrapper'>" +
            "<div class='main-option active' data-main='true'>Yes</div>" +
            "<div class='main-option' data-main='false'>No</div>" +
        "</div>" +
        "<div class='submit' type='submit'>Create</div>" +
    "</div>";
    $left.append(html);

    $(".facebook-picture").css("background-image", "url(" + schedule.userInfo.profilePicture + ")")
            .css("background-repeat", "no-repeat")
            .css("background-position", "top center")
            .css("background-size", "cover");

    $(".facebook-name").text(schedule.userInfo.name);
    $(".facebook-info").text(semester + " " + year);

    $(".main-option").click(function() {
        $(".main-option").removeClass("active");
        $(this).addClass("active");
    });

    /* Validation for Create Schedule */
    $(".submit").click(function() {
        var error = false;
        var name = $.trim($(".name-schedule").val());
        var mainBoolean = $(".main-option.active").data("main") === "true" ? true : false;
        if (name === "") {
            $(".facebook-info").html("You must give your schedule a name!").addClass("error");
        } else if (name.length > 250) {
            $(".facebook-info").html("That name is wayyy too long. Pick a short one.").addClass("error");
        }
        else {
            _createSchedule(name, mainBoolean, semester, year);
        }
    })
};

/**
* Creates a new schedule with the given name, semester, and year (backend & frontend) then displays it.
* @param {string} name
* @param {string} main: should this be the main schedule, or not
* @param {string} semester
* @param {string} year
*/
var _createSchedule = function (name, main, semester, year) {
    var data = {
        "name": name,
        "main": main,
        "semester": semester,
        "year": year
    };
    $.post("/schedule/new_schedule/", data, function (json) {
        if (json.success) {
            if (schedule.currentState === undefined)
                schedule.currentState = new schedule.State();
            schedule.currentState.store([], json.id, name, semester, year);
            schedule.displayExistingSchedule();
            // _loadSemesterSchedules(semester, year, schedule.displaySchedule);
        } else if (json.error) {
            $(".facebook-info").addClass("error").text(json.error);
        }
    }, "json");
};

/**
* Displays a single schedule in the sidebar and attaches relevant click events
* CURRENTLY BEING REFACTORED BY YUXIN (7/7/13)
*/
schedule.displayExistingSchedule = function () {
    _clearLeftColumn();
    var $left = $(".left");

    var semester = schedule.currentState.getSemester();
    var year = schedule.currentState.getYear();
    var name = schedule.currentState.getName();
    $left.append("<div class='schedule-header'>" + name + "</div>");

    $left.append("<div class='single-option-bar back-schedule-list'>back</div>");
    $(".single-option-bar.back-schedule-list").click(function() {
        schedule.grid.hide();
        _loadSemesterSchedules(semester, year);
    });

    var scheduleCourseIDs = schedule.currentState.getCourseIDs();
    var scheduleCourseJSON = [];
    $.each(scheduleCourseIDs, function (index, courseID) {
        var course = schedule.dataStore.lookupCourse(courseID);
        scheduleCourseJSON.push(course);
    });

    var scheduleControlHTML =
        "<div class='schedule-control'>" +
        "<div class='schedule-info-container'>" +
            "<div class='info-data-container'>" +
                "<div class='info-data footer-left'>" + String(scheduleCourseJSON.length) + "</div>" +
                "<div class='info-data footer-right'>"+ _calculateUnits(scheduleCourseJSON) + "</div>" +
            "</div>" +
            "<div class='info-annotation-container'>" +
                "<div class='info-annotation footer-left'>Courses</div>" +
                "<div class='info-annotation footer-right'>Units</div>" +
            "</div>" +
        "</div>" +
        "<div class='single-option-bar generate'>Generate Schedule</div>" +
        "</div>"

    $left.append(scheduleControlHTML);

    $(".generate").click(function() {
        _loadChoices(semester, year, true, false, false, false, false);
    });

    if (schedule.currentState.hasCourses()) {
        var addDeleteHTML =
        "<div class='double-option-bar course-bar'>" +
            "<div class='option option-left add-course'>add course</div>" +
            "<div class='option option-left delete-course'>delete courses</div>" +
        "</div>";
    } else {
        var addDeleteHTML = "<div class='single-option-bar add-course'>add course</div>";
    }

    //displays search page in the sidebar, and list of courses offered this semester
    var _addCourse = function () {
        _displaySearch(semester, year);
        $(".search-type-selectable[data-type='catalog']").click();
    };

    var _removeCourse = function () {
        var $self = $(this);
        $self.text("cancel")
            .unbind("click")
            .click(schedule.displayExistingSchedule);
        $(".display-constant").hide();
        $(".delete-button").show();

        $(".delete-button").click(function(e) {
            e.stopPropagation();
            $self.text("done");
            var removable = $(this).parent();
            var courseID = removable.attr("data-course_id");
            _deleteCourse(schedule.currentState.getScheduleID(), courseID, removable);
        });
    };

    $left.append(addDeleteHTML);
    $(".add-course").click(_addCourse);
    $(".delete-course").click(_removeCourse);


    $left.append("<div class='result-list'></div>");

    var $resultList = $(".result-list");


    $resultList.append(schedule.courseListToHTML(scheduleCourseJSON, "grade_average"));

    _bindAddedCourseBox();
    schedule.choices.clear();

    if (schedule.currentState.isGenerated()) {
        schedule.grid.renderSchedule(schedule.currentState, "selected");
    }
};

/**
* Permanently deletes a course from the backend
* @param {int} scheduleID: the schedule to remove from
* @param {int} courseID: the course to remove
* @param {jQuery}: the course block to remove once it's deleted.
*/
var _deleteCourse = function (scheduleID, courseID, $removable) {
    var postData = {
        "schedule_id": scheduleID,
        "course_id": courseID
    };
    $.post("/schedule/delete_course/", postData, function (json) {
        if (json.success) {
            schedule.choices.clear();
            schedule.currentState.removeCourse(parseInt(courseID));

            if (!schedule.currentState.hasCourses()) {
                //if no more courses, go back to the list of schedules
                schedule.displayExistingSchedule();
            } else {
                $removable.remove();
            }

            if (schedule.currentState.isGenerated()) {
                schedule.grid.renderSchedule(schedule.currentState, "selected");
            } else {
                schedule.grid.hide();
            }
        }
    }, "json");
};

/**
* Takes a single JSON course object and returns an HTML representation of the course
* @param {Object} an object representing a course
* @param {string} key for which display constant to show
* @return {string} JSON course object as HTML string
*/
var _courseToHTML = function (element, key) {
    var displayConstant = catalog.getCorrectDisplayConstant(element, key);
    return "" +
    "<li class='selectable exclusive searchable course' data-course_id=" + element.id + ">" +
        "<div class='course-text-container'>" +
            "<div class='course-title'>" + element.abbreviation + " " + element.course_number + "</div>" +
            "<div class='course-subtitle'>" + element.title + "</div>" +
        "</div>" +
        "<div class='display-constant " + key + "' style='color:" +
            catalog.getCorrectDisplayColor(displayConstant, key) + ";'>" +
            catalog.getCorrectDisplayText(displayConstant, key) +
        "</div>" +
        "<span class='delete-button bold' style='display: none;'>delete</span>" +
    "</li>"
};

schedule.courseListToHTML = function (data, key) {
    var html = "<ul>";
    $.each(data, function (index, element) {
        html += _courseToHTML(element, key);
    });
    html += "</ul>";
    return html
};

/**
* Displays the search interface, with "catalog" initially selected
* @return undefined
*/
var _displaySearch = function (semester, year) {
    schedule.currentPage = "search";
    _clearLeftColumn();
    var $left = $(".left");

    //BackButton
    // var scheduleName = schedule.currentState.getName();

    //SearchBox
    var $searchBox = $("<input class='search' type='text' name='narrow' placeholder='Search Catalog...'>");
    $left.append($searchBox);

    $left.append("<div class='single-option-bar back-schedule'>Cancel</div>");
    $(".single-option-bar").click(function() {
        schedule.displayExistingSchedule();
    });

    //SearchType
    var searchTypeHTML = "" +
        "<div class='search-type'>" +
            "<div data-type='catalog' class='search-type-selectable catalog'>All Courses</div>" +
            "<div data-type='favorites' class='search-type-selectable favorites'>Favorites</div>" +
        "</div>";

    $left.append(searchTypeHTML);
    $(".search-type-selectable").click(function() {
        _changeSelectedSearchType($(this).data('type'), semester, year);
    });

    //SortBox
    var sortBoxHTML = "" +
        "<select class='sort' id='sort_criteria'>" +
            "<option value='grade_average'>Sort by: Average Grade</option>" +
            "<option value='favorite_count'>Sort by: Most Favorited</option>" +
            "<option value='abbreviation'>Sort by: Department Name</option>" +
            "<option value='open_seats'>Sort by: Open Seats</option>" +
            "<option value='enrolled_percentage'>Sort by: Enrolled Percentage</option>" +
        "</select>"

    $left.append(sortBoxHTML);
    $(".sort").chosen({disable_search_threshold: 100})
        .change(function () {
            var key = $(this).val();
            _sortAndUpdateCourses(key);
        });

    $left.append("<div class='result-list'></div>");
    $left.append("<div class='result-list-bottom-margin'></div>");
    _resizeSearch();

    $(".search").keyup(function (e) {
        e.preventDefault();
        _filterAndUpdateCourses($(this).val(), e);
    });
};

var _changeSelectedSearchType = function(searchType, semester, year) {
    if (_getActiveSearchType() === searchType) {
        return;
    }
    $(".search-type-selectable").removeClass("active");
    // if (searchType)
    _showResults(searchType, semester, year);

        //   $('#animation').animate(
        // {
        //   'background-position': '+=10%'
        // }, 1, 'linear');
    $(".search-type-selectable[data-type=" + searchType + "]").addClass("active");
}
/**
* Shows the relevant courses for the currently selectedSearchType. Either
* makes a request for the courses, or retrieves them from a global variable
* @param {string} semester
* @param {string} year
*/
var _showResults = function (searchType, semester, year) {
    if (searchType === "catalog") {
        if (schedule.catalogCourses === undefined) {
            $(".search-type").hide();
            _getJSONAndUpdateCatalog(semester, year);
        } else {
            _updateCourseResults(schedule.catalogCourses, _getSortKey()); //assumes courses are sorted when saved

        }
    }
    if (searchType === "favorites") {
        _getJSONAndUpdateFavorites(semester, year);
    }
    schedule.allCourses = schedule.catalogCourses;
    schedule.displayedCourses = schedule.catalogCourses;
    $(".search").val("");
};

/**
* Hides the left column, and displays the info for the section given by courseID and sectionID
* @param {int} courseID
* @param {int} sectionID
*/
schedule.displaySectionInfo = function (courseID, sectionID) {
    var $left = $(".left");
    $left.children().hide();
    var $info = $("<div>").addClass("info");
    $left.append($info);

    var courseInfo = schedule.dataStore.lookupCourse(courseID);
    var sectionInfo = schedule.dataStore.lookupSection(courseID, sectionID);

    $info.html(
        "<div class='course-info'>" +
            "<div class='cover-photo'>" +
                "<div class='course-header'>" +
                    "<div class='title-text-box'>" +
                        "<div class='title'>" +
                            courseInfo.abbreviation + " " + courseInfo.course_number +
                        "</div>" +
                        "<div class='subtitle'>" +
                            courseInfo.title +
                        "</div>" +
                    "</div>" +
                "</div>" +
            "</div>" +
        "</div>" +
        "<div class='section-info'>" +
            "<div class='title'>" + sectionInfo.kind + " " + sectionInfo.section_number + "</div>" +
            "<div class='location'>" + sectionInfo.location + "</div>" +
            "<div class='days'>" +
                "<div class='m'>M</div><div class='tu'>Tu</div><div class='w'>W</div><div class='th'>Th</div><div class='f'>F</div>" +
            "</div>" +
            "<div class='times'>" + time.renderTime(sectionInfo.start_time) + " - " + time.renderTime(sectionInfo.end_time) + "</div>" +
            "<div class='enrollment'>" +
                "<div class='enrolled'>Enrolled: <span class='enrolled-text'>" + sectionInfo.enrolled + " / " + sectionInfo.enrolled_max + "</span></div>" +
                "<div class='waitlisted'>Waitlisted: <span class='waitlisted-text'>" + sectionInfo.waitlisted + "</span></div>" +
            "</div>" +
        "</div>"
    );

    // highlight the days that the section occurs on
    var days = ["days", "m", "tu", "w", "th", "f"];
    $.each(sectionInfo.days, function (index, num) {
        $("." + days[num]).addClass("active-day");
    });

    // make the percentage color appropriate
    $(".enrolled-text").css("color", utils.fractionToColor(sectionInfo.enrolled, sectionInfo.enrolled_max));

    // make the percentage color appropriate
    $(".waitlisted-text").css("color", utils.fractionToColor(sectionInfo.waitlisted, sectionInfo.enrolled_max));

    // set background image
    $(".cover-photo").css("background-image", "url(/static_media/css/img/cover_photos/" + courseInfo.cover_photo + ".jpg)");

    $.each(sectionInfo.related, function (index, sectionID) {
        //c(sectionID);
    });
};

/**
* Restores the left column to its previous state.
*/
schedule.hideSectionInfo = function () {
    $(".left .info").remove();
    $(".left").children(":not(.chzn-done)").show();
};

/**
* returns the data-type value of the currently selected search type
* @return {String}
*/
var _getActiveSearchType = function() {
    return $(".search-type-selectable.active").data("type");
}
/*
* @return {String} currently selected sort parameter
*/
var _getSortKey = function() {
    return $(".sort").val();
};

var _getJSONAndUpdateCatalog = function(semester, year) {
    return $.getJSON("/schedule/course_search/", {semester: semester, year: year},  _makeCourseResponseProcessor(_getSortKey(), "catalog"));
}

var _getJSONAndUpdateFavorites = function(semester, year) {
    return $.getJSON("/schedule/favorites_search/", {semester: semester, year: year}, _makeCourseResponseProcessor(_getSortKey(), "favorites"))
}

var _makeCourseResponseProcessor = function (key, searchType) {
    return function(courses) {
        var sortedCourses = catalog.sortCourses(courses, key);
        var html = catalog.courseListToHTML(sortedCourses, key);
        //cannot use getFilterString since filterString may not be initialized in the same order of DOM elements
        if (_getActiveSearchType() === searchType ) {
            if (searchType === "catalog") {
                schedule.catalogCourses = sortedCourses;
            }
            //all courses that should be shown without a search query
            schedule.allCourses = sortedCourses;

            //all courses that are currently displayed
            schedule.displayedCourses = sortedCourses;
            $(".course-loading").hide();
            if (schedule.displayedCourses.length === 0) {
                _noCourseResultsHandler($(".result-list"));
            } else {
                $(".result-list").html(html);
                _bindNewCourseBox();
            }
            $(".search-type").slideDown("fast");
            $(".search").focus();
        }
    };
};

schedule.reloadFavorites = function () {
    var semester = schedule.currentState.getSemester();
    var year = schedule.currentState.getYear();
    _getJSONAndUpdateFavorites(semester, year);
}

var _updateCourseResults = function(data, key) {
    var $resultList = $(".result-list");
    if (data.length === 0) {
        _noCourseResultsHandler($resultList);
    } else {
        var truncatedJSON = data.slice(0, 199);
        var html = catalog.courseListToHTML(truncatedJSON, key);
        $resultList.html(html);
        _bindNewCourseBox();
    }
    $(".search").focus();
};

var _bindAddedCourseBox = function () {
    $(".course").click(function () {
        var courseID = window.parseInt($(this).data("course_id"));
        courseBox.initCourseBox(
            "sections", courseID,
            schedule.currentState.getSemester(),
            schedule.currentState.getYear(),
            true, schedule.currentState.selectedSectionsByCourseID(courseID)
        );
    });
};

var _bindNewCourseBox = function () {
    $(".course").click(function () {
        var courseID = window.parseInt($(this).data("course_id"));
        courseBox.initCourseBox(
            "sections", courseID,
            schedule.currentState.getSemester(),
            schedule.currentState.getYear(),
            true, "all"
        );
    });
};

var _filterAndUpdateCourses = function(query, e) {
    var filteredCourses;
    if (catalog.lastQuery === query) {
        return;
    } else if (e.keyCode === 8 || schedule.lastQuery.length > query.length || catalog.lastQuery !== query.slice(0, -1) ||
        $.inArray(schedule.lastQuery.toUpperCase(), Object.keys(utils.laymanToAbbreviation)) !== -1 ) {
        filteredCourses = catalog.filterCourses(schedule.allCourses, query);
    } else {
        filteredCourses = catalog.filterCourses(schedule.displayedCourses, query);
    }
    schedule.lastQuery = query;
    schedule.displayedCourses = filteredCourses;
    _updateCourseResults(filteredCourses, _getSortKey());
};

var _sortAndUpdateCourses = function(key) {
    var sortedCourses = catalog.sortCourses(schedule.allCourses, key);
    var filteredCourses = catalog.filterCourses(sortedCourses, $(".search").val());
    schedule.allCourses = sortedCourses;
    schedule.displayedCourses = filteredCourses;
    _updateCourseResults(filteredCourses, key);
}

var _resetSearchField = function() {
    schedule.lastQuery = "";
    $(".search").val("");
    schedule.displayedCourses = schedule.allCourses;
    _updateCourseResults(schedule.allCourses, _getSortKey());
}

/**
* Creates a thin bar for the sidebar with two options (typically for Add/Remove).
* @param leftText {string} the text to display in the left option
* @param rightText {string} the text to display in the right option
* @param leftCallback {function} the function to be called when the left option is clicked
* @param rightCallback {function} the function to be called when the right option is clicked
* @return {jQuery} the double thin bar
*/
var _createAddRemove = function (leftText, rightText, leftCallback, rightCallback) {
    var $doubleThinBar = $("<div>").addClass("double-option-bar");
    var $left = $("<div class='option option-left'>" + leftText + "</div>").click(leftCallback);
    var $right = $("<div class='option option-right'>" + rightText + "</div>").click(rightCallback);
    return $doubleThinBar.append($left).append($right);
};

/**
* takes a sem and year, e.g. "spring" and "2013" and converts to "Spring 2013"
* @param semester {string} the semester
* @param year {string} the year
* @return {string} "Semester year"
*/
var _semesterBlockTitle = function (semester, year) {
    return semester.capitalize() + " " + year;
};

/**
* Remove everything from the left column.
*/
var _clearLeftColumn = function () {
    $(".left").empty();
};

/**
* Handles window resize events, resizes relevant containers such
* that they take the entire window
*/
schedule.resizeWindow = function(headerHeight) {
    var appHeight = $(window).height() - headerHeight;
    $(".container, .content, .left").height(appHeight);
    if (schedule.currentPage === "search") {
        _resizeSearch();
    }
    // _resizeSearch();
    // _resizeScheduleList();
};

var _resizeSearch = function() {
    var columnElementHeight = $(".single-option-bar").outerHeight(true) +
        $(".search").outerHeight(true) + $(".search-type").outerHeight(true) +
        $(".chzn-container").outerHeight(true) + $(".result-list-bottom-margin").outerHeight(true);
    var resultListHeight = $(".left").height() - columnElementHeight;
    $(".result-list").height(resultListHeight);
};

var _resizeScheduleList = function() {
    var columnElementHeight = $(".back").outerHeight(true) +
        $(".header").outerHeight(true) + $(".create-schedule").outerHeight(true);
    var resultListHeight = $(".left").height() - columnElementHeight;
    $(".result-list").height(resultListHeight);
};


/**
* takes a list of course JSONs, and returns a string to render of how many units the courses are
* @param courses {Array} of objects which represent courses
* @return {string} number of units of the courses {ie. 1-4, 15}
*/
var _calculateUnits = function(courses) {
    var minUnits = 0;
    var maxUnits = 0;
    $.each(courses, function(index, course) {
        var courseUnits = course.units;
        if (!courseUnits) {
        } else if (courseUnits.indexOf(",") !== -1) {
            var courseUnitsArray = courseUnits.split(",");
            if (courseUnitsArray.length === 1) {
                minUnits += parseFloat(courseUnitsArray[0]);
                maxUnits += parseFloat(courseUnitsArray[0]);
            } else {
                minUnits += parseFloat(courseUnitsArray[0]);
                maxUnits += parseFloat(courseUnitsArray[courseUnitsArray.length - 1])
            }
        } else if (courseUnits.indexOf("-") !== -1) {
            var courseUnitsArray = courseUnits.split("-");
            minUnits += parseFloat(courseUnitsArray[0]);
            maxUnits += parseFloat(courseUnitsArray[courseUnitsArray.length - 1])
        } else if (!isNaN(parseFloat(courseUnits))) {
            minUnits += parseFloat(courseUnits);
            maxUnits += parseFloat(courseUnits);
        }
    });
    minUnits = parseInt(minUnits) == minUnits ? parseInt(minUnits) : minUnits;
    maxUnits = parseInt(maxUnits) == maxUnits ? parseInt(maxUnits) : maxUnits;
    if (minUnits === maxUnits) {
        return String(minUnits);
    }
    return String(minUnits) + " - " + String(maxUnits);
}

/* APPENDIX */

/*
* handles cases where there are no course results to show the user
* @return {jQuery} with relevant event bindings to render as results
*/
var _noCourseResultsHandler = function(container) {
    //the user has no favorites
    if (_getActiveSearchType() == "favorites" && catalog.allCourses.length === 0) {
        var html = $(_noCourseFavorites());

    } else {
        var html = $(_noCourseResults());
    }
    container.html(html);
    $(".blue-link").click( function() { _resetSearchField(); });
}
var _noCourseResults = function() {
    var html = "" +
    "<div class='no-results-container'>" +
        "<div class='no-results-header'>No Courses Found.</div>" +
        "<div class='search-tips'>Search tips:</div>" +
        "<ul>" +
            "<li>The course you searched may not be offered this semester.</li>" +
            "<li>Search a course by its department and course number (ie. CHEM 1A).</li>" +
            "<li>Use different search terms (ie. Shakespeare).</li>" +
            "<li>Click <span class='clear-search blue-link'>here</span> to show all courses offered this semester.</li>" +
        "</ul>" +
    "</div>"
    return html
};

var _noCourseFavorites = function() {
    var html = "" +
    "<div class='no-results-container'>" +
        "<div class='no-results-header'>No Courses Favorited.</div>" +
        "<div class='search-tips'>What are favorites:</div>" +
        "<ul>" +
            "<li>You can favorite a course anywhere by clicking the heart icon.</li>" +
            "<li>Tell Yuxin to fill this shit in before launching.</li>" +
            "<li>Click <span class='clear-search blue-link'>here</span> to show all courses offered this semester.</li>" +
        "</ul>" +
    "</div>"
    return html
};

var _noSchedulesHTML = function() {
    var html = "" +
    "<div class='no-results-container schedule'>" +
        "<div class='no-results-header'>You Don't Have a Schedule Yet!</div>" +
        "<div class='search-tips'>How it works:</div>" +
        "<ul>" +
            "<li>Planning a schedule. Share it with your friends.</li>" +
            "<li>Complain to Yuxin and tell him to put stuff here.</li>" +
        "</ul>" +
    "</div>"
    return html
}

var _scheduleWelcomeHTML = function() {
    var html = "" +
    "<div class='schedule-welcome'>" +
        "<div class='welcome-header'>Welcome to Berkeleytime Scheduler</div>" +
        "<div class='welcome-description'>Click on a schedule on the left to get started</div>" +
    "</div>"
    return html
}

})(window, $, console, bt_utils);
