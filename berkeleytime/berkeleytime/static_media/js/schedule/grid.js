/************
* Grid
* @dependency schedule-utils.js
************/
var schedule = schedule || {};
(function(
    $,
    utils,
    _,
    time,
    ScheduleBlock,
    colorstore
) {
"use strict";

/********************************************************************************************************************/
/** General/generating the grid *************************************************************************************/
/********************************************************************************************************************/

/**
* Generates an empty grid for rendering the schedules on.
* note that gridlines are defined in schedule.less
* @param start {string} the earliest start of the schedule (HH:MM)
* @param end {string} the latest end of the schedule (HH:MM)
* @constructor
* @tested
*/
schedule.Grid = function (start, end, daysToShow) {
    daysToShow = daysToShow || [1,2,3,4,5];
    this.initTimes(start, end);
    this.days = daysToShow;
    this.grid = this.generateGrid(this.start, this.end, this.halfHours);
    this.enableSectionSwitching = true; // campus subclass will override this.
};

/**
* Initialize the start and end times of the grid. This also sets the number of half hours.
* @param {string} start time
* @param {string} end time
*/
schedule.Grid.prototype.initTimes = function(start, end) {
    this.start = time.standardTime(start);
    this.end = time.standardTime(end);
    this.halfHours = time.calculateHalfHours(start, end);
};

/**
* Generates a jQuery with .hour-labels, the divs we want to render on the left side of
* the schedule.
* @param start {string} the start time in form HH:MM
* @param end {string} the end time in form HH:MM
* @return {jQuery} a jQuery of the appended elements
* @classmethod
*/
schedule.Grid.generateHourLabels = function (start, end) {
    start = time.standardTime(start);
    end = time.standardTime(end);
    var split = time.splitTime(start);
    var startHour = window.parseInt(split.hours);
    var endHour = window.parseInt(time.splitTime(end).hours);

    // we'll append two divs for every hour. if we start with :30, we have to reset to the last hour
    if (split.minutes.indexOf("30") !== -1) start = start.replace("30", "00");

    var append = false;

    var labels = $("<div>").addClass("hour-labels");
    $.each(time.scheduleDisplayHours, function (index, hour) {
        var stdHour = time.standardTime(hour);

        if (stdHour === start) append = true;
        if (time.compareTimes(stdHour, end) >= 0) append = false;

        if (append) {
            var blockWithLabel = $("<div>")
                .addClass("hour-label")
                .text(time.renderTime(stdHour));

            var blockWithoutLabel = $("<div>").addClass("hour-label"); // append a div, give it the right time, then append another empty div

            labels.append(blockWithLabel);
            labels.append(blockWithoutLabel);
        }
    });
    return labels;
};

/**
* Generates elements to put at the top of the grid: "Monday" "Tuesday" etc
* @return {jQuery} the container of the day labels
*/
schedule.Grid.prototype.generateDayLabels = function () {
    var daysContainer = $("<div>").addClass("day-labels");

    $.each(this.days.map(function (day) {return time.days[day];}), function (index, day) {
        daysContainer.append(
            $("<div>").addClass("day-label").text(day)
        );
    });

    return daysContainer;
};

/**
* Generate a jQuery grid. Note that this makes use of the times set in initTimes.
* @return {jQuery} the grid
*/
schedule.Grid.prototype.generateGrid = function () {
    var startIndex = time.standardHours.indexOf(this.start);
    var grid = $("<div>").addClass("grid");

    grid.append(schedule.Grid.generateHourLabels(this.start, this.end));

    var gridContent = $("<div>").addClass("grid-content");
    gridContent.append(this.generateDayLabels());

    var gridBlocks = $("<div>").addClass("grid-blocks");

    // we have to calculate the height of the grid - (n-1), where n is the number of half hour divs we want to input.
    this.halfHours = this.halfHours % 2 === 0 ? this.halfHours : this.halfHours + 1;
    for (var i=0; i < this.halfHours; i++) {
        var line = $("<div>").addClass("half-hour");
        this.days.forEach(function (day, index) {
            var block = $("<div>")
                .addClass("half-hour-block")
                .attr("data-day", time.dayAsString(day).toLowerCase())
                .attr("data-time", time.standardHours[startIndex + i].replace(":", ""));
            line.append(block);
        });

        gridBlocks.append(line);
    }

    gridContent.append(gridBlocks);
    grid.append(gridContent);

    return grid;
};

/**
* Generates a jQuery object for the 'save' button.
*/
schedule.Grid.prototype.bindSaveButton = function () {
    this.saveButton.click(function () {
        if (schedule.choices.hasChoices()) {
            schedule.choices.saveCurrent(schedule.currentState);
        } else {
            schedule.currentState.saveState();
        }
    });
};

/**
* Removes the current grid and appends in the same place another grid with the specified start and end times.
* @param {string} start time
* @param {string} end time
*/
schedule.Grid.prototype.rerender = function (start, end) {
    var parent = this.grid.parent();
    this.getJQuery().remove();

    this.initTimes(start, end);
    this.grid = this.generateGrid(this.start, this.end, this.halfHours);
    this.addControls(undefined, false);
    this.appendTo(parent);
};

/**
* Return the grid, as a jQuery.
* @return {jQuery} the grid
*/
schedule.Grid.prototype.getJQuery = function () {
    return this.grid;
};

/**
* Appends the grid to the specified stage and sets the heights accordingly.
* @param {jQuery} stage
*/
schedule.Grid.prototype.appendTo = function (stage) {
    var _this = this;
    $.when(
        this.grid.appendTo(stage)
    ).done(function () {
        $(".half-hour, .half-hour-block, .hour-label").css("height", _this.calculateCellHeight());
    });
};

/**
* Hides the grid.
*/
schedule.Grid.prototype.hide = function () {
    this.grid.hide();
};

/**
* Shows the grid.
*/
schedule.Grid.prototype.show = function () {
    this.grid.show();
};

/**
* Displays an error when no valid schedules are generated
*/
schedule.Grid.prototype.displayNoSchedulesError = function () {
    var parent = this.grid.parent();
    this.grid.remove();
    this.grid = $("<div class='no-schedules-error'>No valid schedules can be generated from your chosen sections.</div>");
    this.grid.appendTo(parent);
};



/********************************************************************************************************************/
/** Rendering blocks ************************************************************************************************/
/********************************************************************************************************************/

/**
* Calculate the height that a section should be (in pixels).
* @param {int} sectionHalfHours the number of half hours long that the section is (e.g. 4 for two hour lecture)
* @return {int}
*/
schedule.Grid.prototype.calculateSectionHeight = function (sectionHalfHours) {
    return (this.calculateCellHeight() * sectionHalfHours) - 6; // this depends on CSS.
};

/**
* Calculate the height that we should set the cells of the grid to, accounting for borders, number of days, etc.
* @return {int}
*/
schedule.Grid.prototype.calculateCellHeight = function () {
    // the 0.5 and the Math.floor prevent the bottom of the box from looking too close to the gridlines.
    return ((this.grid.height() - (this.halfHours + 1)) / (this.halfHours));
};

/**
* Adds a regular schedule block to the grid.
*
* There is one parameter: a a group of options with the following possible keys.
* Note that if this.enableSectionSwitching is false, the state, sectionID, and CourseID parameters
* can be safely left undefined.
*
* @param {schedule.State} state, the state that the section that corresponds to this block is part of
* @param {string} day: "monday", "tuesday", etc
* @param {string} start start time of the section
* @param {string} end end time of the section
* @param {string} color color to set the section to
* @param {string} borderColor: color hash string to set the border color to
* @param {string} title of the course, e.g. "COMPSCI 61C"
* @param {string} number of the section, e.g. "Lecture 001" or "001 LEC"
* @param {string} location of the section, e.g. "1 PIMENTEL"
* @param {int|string} courseID: id of the course
* @param {int|string} sectionID: id of the section of the block that we're adding (not that we're NOT adding an entire section)
* @param {boolean} isPrimaryKind
* @return {jQuery} the schedule block
*/
schedule.Grid.prototype.addScheduleBlock = function (options) {
    var block = ScheduleBlock.createWithSection(
        options.start,
        options.end,
        options.day,
        options.courseID,
        options.sectionID
    );
    block.setPrimary(options.isPrimaryKind);
    block.setColors(options.color, options.borderColor);
    block.setInfo(options.title, options.number, options.location);
    block.setHeight(this.calculateSectionHeight(block.halfHourLength()));

    var elem = block.generateElement();
    block.getTarget().append(elem);
    if (this.enableSectionSwitching) {
        this.bindSection(options.state, elem);
    }
    return elem;
};

/**
* Add a ghost schedule block to the grid. Clicking on one of these will move the referring section (the one
* that the user clicked on to show this ghost box) to be moved to where this ghost box is.
* @param {schedule.State} state: the schedule that this block belongs to
* @param {string} day: the day, as a string like "monday", that this block is on
* @param {string} start: start time
* @param {string} end: end time
* @param {string|int} ourseID: id of the course that this block is from
* @param {string|int} sectionID: id of the section
* @param {string|int} referringSectionID: id of the section that the user clicked on to show this ghost box
* @return {jQuery} the (ghost) schedule block
*/
schedule.Grid.prototype.addGhostScheduleBlock = function (state, day, start, end, courseID, sectionID, referringSectionID) {
    var block = ScheduleBlock.createWithSection(start, end, day, courseID, sectionID);
    block.setHeight(this.calculateSectionHeight(block.halfHourLength()));
    var elem = block.generateElement();
    var target = block.getTarget();

    elem.attr("data-referring-section-id", referringSectionID);
    var targetOffset = target.offset();

    elem.addClass("ghost");
    elem.css("top", targetOffset.top + 2);
    elem.css("left", targetOffset.left + 2);
    elem.width(target.width() - 6);

    $("body").prepend(elem);
    return elem;
};

/**
* Render a full section on the grid.
* @param {schedule.State} state: the state that the section belongs to
* @param {int} courseID: the id of the cousre
* @param {int} sectionID: the id of the section to render
* @param {string} primary color
* @param {string} highlight color
*/
schedule.Grid.prototype.addSection = function (state, courseID, sectionID, primaryColor, highlightColor) {
    var _this = this;

    var course = schedule.dataStore.lookupCourse(courseID);
    var section = schedule.dataStore.lookupSection(courseID, sectionID);
    var start = time.standardTime(section.start_time),
        end = time.standardTime(section.end_time),
        title = course.abbreviation + " " + course.course_number,
        number = section.kind + " " + section.section_number,
        location = section.location,
        primaryKind = section.primary;

    $.each(section.days, function (index, num) {
        var day = time.dayAsString(num);
        _this.addScheduleBlock({
            state: state,
            day: day,
            start: start,
            end: end,
            color: primaryColor,
            borderColor: highlightColor,
            title: title,
            number: number,
            location: location,
            courseID: courseID,
            sectionID: sectionID,
            isPrimaryKind: primaryKind
        });
    });
};

/**
* Remove a section from the grid.
* @param {int|string} sectionID: the id of the section to remove
*/
schedule.Grid.prototype.removeSection = function (sectionID) {
    $("[data-section-id=" + sectionID + "]").remove();
};

/**
* Add an entire schedule to the grid (overwriting if there is a conflict).
* @param {schedule.State} state, the schedule representation
* @param {Array|undefined} colors, the array of dicts (colors to use)
*/
schedule.Grid.prototype.addSchedule = function (state, colors) {
    colors = colors || colorstore.getStandardColors(state.getLength());
    var _this = this;
    $.each(state.coursesAndScheduledSections(), function (courseIndex, courseAndSections) {
        $.each(courseAndSections.scheduled, function (sectionIndex, sectionID) {
            _this.addSection(
                state,
                courseAndSections.courseID,
                sectionID,
                colors[courseIndex].primary,
                colors[courseIndex].highlight
            );
        });
    });
};



/********************************************************************************************************************/
/** Cycling through schedules ***************************************************************************************/
/********************************************************************************************************************/

/**
* THIS IS A MAIN EXPOSED METHOD
* Replace the grid with a new grid and schedule based on the start and end times of the state.
* @param {schedule.State} the schedule
* @param {string} key "selected" or "scheduled" (which one to iterate use)
* @param {Array|undefined} array of dicts the represent colors
*/
schedule.Grid.prototype.renderSchedule = function (state, key, colors) {
    colors = colors || colorstore.getStandardColors(state.getLength());
    var earliest = state.calculateEarliestStart(key);
    var latest = state.calculateLatestEnd(key);
    this.rerender(earliest, latest);
    this.addSchedule(state, colors);
};

/**
* Replace the schedule currently on the grid with the current one from the choices.
* Also add the navigation buttons (for cycling thorugh schedules).
* @param {Array|undefined} array of dicts the represent colors
*/
schedule.Grid.prototype.renderCurrent = function (colors) {
    colors = colors || this.colors;
    this.renderSchedule(
        schedule.State.createFromChoiceAndState(schedule.choices.current(), schedule.currentState),
        "selected",
        colors
    );
    this.addControls(colors, true, this.grid);
};

/**
* Same as renderCurrent, but render the next choice instead.
*/
schedule.Grid.prototype.renderNext = function (colors) {
    if (schedule.choices.hasNext()) {
        schedule.choices.next();
        this.renderCurrent(colors);
    }
};

/**
* Same as renderCurrent, but render the previous choice instead.
*/
schedule.Grid.prototype.renderPrevious = function (colors) {
    if (schedule.choices.hasPrevious()) {
        schedule.choices.previous();
        this.renderCurrent(colors);
    }
};

/**
* Add the nav buttons to the grid.
* @param {Array|undefined} array of dicts the represent colors
*/
schedule.Grid.prototype.addControls = function (colors, includeNav) {
    this.grid.find(".schedule-controls-container").remove();
    var scheduleControlsHTML = "" +
    "<div class='schedule-controls-container'>";
    if (includeNav) {
        scheduleControlsHTML += "" +
        "<div class='control left-container'>" +
            "<div class='previous'>prev</div>" +
            "<div class='next'>next</div>" +
        "</div>" +
        "<div class='control middle-container'>" +
            "<div class='count'>" +
                (schedule.choices.getPosition() + 1) + " / " + schedule.choices.getLength() +
            "</div>" +
        "</div>";
    }
    scheduleControlsHTML += "" +
        "<div class='control right-container'>" +
            "<div class='save'>save</div>" +
        "</div>" +
    "</div>";

    var $scheduleControls = $(scheduleControlsHTML);
    this.leftButton = $scheduleControls.find(".previous");
    this.rightButton = $scheduleControls.find(".next");
    this.saveButton = $scheduleControls.find(".save");

    if (includeNav) {
        $scheduleControls.addClass("choices-enabled");
    }

    this.grid.find(".grid-blocks").append($scheduleControls);
    this.bindNavControls(colors);
    this.bindSaveButton();
};

/**
* Bind the functionality so that when you click on a nav button it renders the appropriate schedule and text.
* @param {Array|undefined} array of dicts the represent colors
*/
schedule.Grid.prototype.bindNavControls = function (colors) {
    var _this = this;
    this.leftButton.click(function () {
        _this.renderPrevious(colors);
    });
    this.rightButton.click(function () {
        _this.renderNext(colors);
    });
};

/**
* MAIN EXPOSED METHOD.
* Set up a list of choices of schedules and render the first one. This uses the choices from schedule.choices.
*/
schedule.Grid.prototype.renderSchedules = function () {
    this.show();
    var colors = colorstore.getStandardColors(schedule.choices.countCourses());
    this.renderCurrent(colors);
};

/**
* Clear the grid.
*/
schedule.Grid.prototype.clear = function () {
    this.grid.find(".half-hour-block").empty();
};



/********************************************************************************************************************/
/** Switching sections **********************************************************************************************/
/********************************************************************************************************************/

/**
* Determine whether the user can switch sections from one section id to the other.
* Note that a side effect of this will be to associate a berkeleytime box and/or related
* ghost section id (for discussion/lab) with some ghost sections if they need it. See
* comments below for more details.
* @param {int} courseID: the id of the course that both sections belong to
* @param {int} referringSectionID: the id of the section to try to switch FROM
* @param {int} newSectionID: the id of the section to try to switch TO
* @return {boolean}
*/
schedule.Grid.prototype.canSwitchSections = function (courseID, referringSectionID, newSectionID) {
    // you can't switch to the same section
    if (referringSectionID === newSectionID) return {value:false};

    // to check some more, let's get more data about these sections
    var courseData = schedule.dataStore.lookupCourse(courseID);
    var referringSectionData = schedule.dataStore.lookupSection(courseID, referringSectionID);
    var newSectionData = schedule.dataStore.lookupSection(courseID, newSectionID);

    // if the two sections are different kinds, they can't be switched
    if (referringSectionData.kind !== newSectionData.kind) return {value:false};

    var relatedIDs = referringSectionData.related;

    // whether it's a primary section or a secondary one, we can always switch if there are no related ids.
    // for a primary section, this means you can take any lecture with whatever discussion you have now.
    // for a secondary section, this means that you dont have to take any other secondary sections with it.
    if (relatedIDs.length === 0) return {value:true};

    if (schedule.dataStore.isPrimarySection(courseID, newSectionID)) {
        // this is the biggest case: we have a situation where discussion/labs must be take with a specific lecture.
        // TODO (noah)
        // attach a berkeleytime box - when they click on the section, show it up and make them choose sections.
        var _this = this;
        var possibleSectionIDs = schedule.dataStore.relatedSectionsNotPrimary(courseID, newSectionID).filter(function (relatedSectionID) {
            return !_this.willConflict(courseID, relatedSectionID) &&
            !_this.relatedSectionsWillConflict(courseID, relatedSectionID);
        });
        if (possibleSectionIDs.length === 0) {
            return false;
        }
        var box = new ScheduleBerkeleytimeBox({
            message: "Hey!",
            content: "You've selected a lecture that needs to be taken with other sections. " +
            "Here's a list of all the sections that will fit in your schedule right now - pick one to finish switching your lecture.",
            parent: undefined, // attach to body
            type: "info"
        });
        box.extendSections(courseID, possibleSectionIDs, schedule.dataStore);
        return {value:true, box: box};
    } else if (schedule.dataStore.relatedSectionsPrimary(courseID, referringSectionID).length === 0) {
        return {value: true, dependencies: schedule.dataStore.relatedSectionsNotPrimary(courseID, newSectionID)};
    } else {
        var found = false;
        $.each(relatedIDs, function (index, relatedID) {
            if (schedule.dataStore.isPrimarySection(courseID, relatedID)) {
                var primaryRelatedIDs = schedule.dataStore.lookupSection(courseID, relatedID).related;
                // if we're looking at the primary section of the section that we clicked on, then we should show "this"
                // ghost section if the the ghost section is in the primary section's array AND the primary section is in the grid.
                if (
                    $.inArray(newSectionID, primaryRelatedIDs) !== -1 &&
                    $("[data-section-id=" + relatedID + "]").length !== 0
                ) {
                    found = true;
                    return false; // break the .each loop
                }
            }
        });
        var dependencies = schedule.dataStore.relatedSectionsNotPrimary(courseID, newSectionID);
        if (dependencies.length >= 0) {
            return {value:found, dependencies: dependencies};
        }
        return {value:found};
    }
};

/**
* Given a course id and a section id, gray out the screen and prompt the user to choose other sections of the same
* type as the one delimited by section_id (in the same course as course_id).
* @param {schedule.State} state: the schedule that the course is in
* @param {int} courseID
* @param {int} sectionID
*/
schedule.Grid.prototype.showSelectedSections = function (state, courseID, sectionID) {
    this.setUpSectionSelect();
    var block = $("[data-section-id=" + sectionID + "]");
    var color = block.css("background-color");
    var highlight = block.css("border-color");

    var _this = this;
    var sectionKind = schedule.dataStore.lookupSection(courseID, sectionID).kind;
    $.each(state.selectedSectionsByCourseID(courseID), function (index, selectedSectionID) {
        var sectionData = schedule.dataStore.lookupSection(courseID, selectedSectionID);

        // we should only show ghost blocks of the same kind (e.g. DIS) and we shouldn't show one on the section just clicked on
        var canSwitch = _this.canSwitchSections(courseID, sectionID, selectedSectionID);
        if (canSwitch.value) {
            // for each day that the section has a meeting on,
            $.each(sectionData.days, function (index, num) {
                // add a block for that meeting.
                var block = _this.addGhostScheduleBlock(
                    state,
                    time.dayAsString(num),
                    sectionData.start_time,
                    sectionData.end_time,
                    courseID,
                    selectedSectionID,
                    sectionID
                );
                // if this section has dependencies on other sections
                if (canSwitch.dependencies) {
                    // then for each dependency that it has,
                    $.each(canSwitch.dependencies, function(index, dependentSectionID) {
                        var data = $();
                        var dataIDs = [];
                        // get information about the dependent section
                        var dependentSectionData = schedule.dataStore.lookupSection(courseID, dependentSectionID);
                        // and for each day that the dependent section meets on,
                        $.each(dependentSectionData.days, function (index, dependentNum) {
                            // add a dependent ghost block to the schedule, but hide it
                            var dependentBlock = _this.addGhostScheduleBlock(
                                state,
                                time.dayAsString(dependentNum),
                                dependentSectionData.start_time,
                                dependentSectionData.end_time,
                                courseID,
                                dependentSectionID,
                                sectionID
                            ).hide();
                            dependentBlock.css("background-color", color);
                            dependentBlock.css("border-color", highlight);
                            // and add that dependent ghost block to a list to be associated with the original section
                            data = data.add(dependentBlock);
                            dataIDs.push(dependentSectionID); // for easy adding of sections later
                        });
                        // and now associate all the dependent blocks with the meeting of the original section
                        block.data("dependent-section-blocks", data);
                        block.data("dependent-section-IDs", dataIDs);
                    });
                } else if (canSwitch.box) {
                    block.data("box", canSwitch.box);
                }
            });
        }
    });
    _this.bindGhostSection(state, color, highlight);
};

/**
* Do everything that should be done before the user is able to see all the ghost sections and select them.
*/
schedule.Grid.prototype.setUpSectionSelect = function () {
    this.fadeInGrayFrame();
};

/**
* Do everything to get rid of the ghost secitons and return the grid to its original state.
*/
schedule.Grid.prototype.tearDownSectionSelect = function () {
    $(".section.ghost").remove();
    $(".bt-box").remove();
    $(".section.highlighted").removeClass("highlighted");
    this.fadeOutGrayFrame();
};

// speed for the Gray Frame fade
var _fadeSpeed = 200;

/**
* Fade in a semi transparent gray frame over the parent of the grid element, and make sure that you can't select
* sections anymore when it's clicked.
*/
schedule.Grid.prototype.fadeInGrayFrame = function () {
    var _this = this;
    this.frame = this.frame || $("<div>").addClass("gray-frame");
    if ($(".gray-frame").length === 0) {
        this.frame.hide();
        this.grid.parent().append(this.frame);
    }
    this.frame.click(function () {
        _this.tearDownSectionSelect();
    });
    this.frame.fadeIn(_fadeSpeed);
};

/**
* Fade the gray frame out.
*/
schedule.Grid.prototype.fadeOutGrayFrame = function () {
    this.frame.fadeOut(_fadeSpeed);
};

/**
* Given a state and a section block element that is associated with that state, bind all the relevant
* functionality about that section (click events, etc).
* @param {schedule.State} state: the schedule associate with this element
* @param {jQuery} elem: the schedule block element
*/
schedule.Grid.prototype.bindSection = function (state, elem) {
    var _this = this;
    elem.click(function () {
        $("[data-section-id=" + elem.data("section-id") + "]").addClass("highlighted");
        _this.showSelectedSections(state, elem.data("course-id"), elem.data("section-id"));
    });
    elem.hover(function () {
        schedule.displaySectionInfo(elem.data("course-id"), elem.data("section-id"));
    }, schedule.hideSectionInfo);
};

/**
* Given a state, bind all the relevant functionality for all the ghost courses shown.
* @param {schedule.State} state: the schedule that ghost parameters correspond to
*/
schedule.Grid.prototype.bindGhostSection = function (state, color, highlight) {
    // Leavng this commented out because we may want to use it in the future.
    $(".section.ghost").hover(function () {
        var $this = $(this);
        var sectionMeetingBlocks = $("[data-section-id=" + $this.data("section-id") + "]");
        sectionMeetingBlocks.css("background-color", color);
        sectionMeetingBlocks.css("border-color", highlight);
        var dependentBlocks = $this.data("dependent-section-blocks");
        if (dependentBlocks) {
            dependentBlocks.show();
        }
    }, function () {
        var $this = $(this);
        var sectionMeetingBlocks = $("[data-section-id=" + $this.data("section-id") + "]");
        sectionMeetingBlocks.css("background-color", "transparent");
        sectionMeetingBlocks.css("border-color", "white");
        var dependentBlocks = $this.data("dependent-section-blocks");
        if (dependentBlocks) {
            dependentBlocks.hide();
        }
    });

    var _this = this;
    $(".section.ghost").click(function (e) {
        _this.processGhostClick($(this), state);
    });
    $(".section.ghost").hover(function () {
        schedule.displaySectionInfo($(this).data("course-id"), $(this).data("section-id"));
    }, schedule.hideSectionInfo);
};

schedule.Grid.prototype.removeSectionAndRelatedBlocks = function (courseID, sectionID) {
    var _this = this;
    this.removeSection(sectionID);
    var relatedIDs = schedule.dataStore.relatedSectionsNotPrimary(courseID, sectionID);
    $.each(relatedIDs, function (index, relatedID) {
        _this.removeSection(relatedID);
    });
};

schedule.Grid.prototype.addSectionAndDependentBlocks = function (state, courseID, sectionID, dependentIDs, primaryColor, secondaryColor) {
    var _this = this;
    _this.addSection(state, courseID, sectionID, primaryColor, secondaryColor);
    $.each(dependentIDs, function (index, dependentID) {
        _this.addSection(state, courseID, dependentID, primaryColor, secondaryColor);
    });
};

/**
* Preform everything that should happen when a user clicks on a ghost section.
* @param {jQuery} elem: the element that was clicked on
* @param {schedule.State} state: the state that the ghost section is part of
* TODO (noah): i don't think we need to pass in the elem anymore. refactor this.
*/
schedule.Grid.prototype.processGhostClick = function (elem, state) {
    var conflictFound = false;
    var _this = this;
    var elementsToJiggle = $();
    var elementsToCheck = $(".ghost[data-section-id=" + elem.data("section-id") + "]");
    var dependentSectionBlocks = elem.data("dependent-section-blocks");
    if (dependentSectionBlocks) {
        elementsToCheck = elementsToCheck.add(dependentSectionBlocks);
    }
    $.each(elementsToCheck, function (index, sectionBlock) {
        var $sectionBlock = $(sectionBlock);
        if (_this.willConflict(
            $sectionBlock.data("course-id"),
            $sectionBlock.data("section-id")
        )) {
            elementsToJiggle = elementsToJiggle.add($sectionBlock);
            conflictFound = true;
            // return false;
        }
    });
    if (conflictFound) {
        $.each(elementsToJiggle, function (index, element) {
            var $element = $(element);
            var left = $element.offset().left;
            $element.animate({"left": left - 5}, 50)
                .animate({"left": left + 5}, 50)
                .animate({"left": left}, 50);
        });
    } else {
        var referringSectionID = elem.data("referring-section-id");
        var sectionID = elem.data("section-id");
        var courseID = elem.data("course-id");

        var section = $("[data-section-id=" + referringSectionID + "]");
        var primary = section.css("background-color");
        var secondary = section.css("border-color");

        // TODO (noah) calling elem.data("box") twice is unecessary
        if (elem.data("box")) {
            this.processDependentSecondarySwitch(elem.data("box"), state, courseID, referringSectionID, sectionID, primary, secondary);
        } else {
            // TODO (noah) we're calculating referringRelatedIDs and dependentIDs twice - dont do that! we can maybe push to the array BEFORE doing this.
            var referringRelatedIDs = schedule.dataStore.relatedSectionsNotPrimary(courseID, referringSectionID);
            _this.removeSectionAndRelatedBlocks(courseID, referringSectionID);

            var dependentIDs = elem.data("dependent-section-IDs") || [];
            _this.addSectionAndDependentBlocks(state, courseID, sectionID, dependentIDs, primary, secondary);

            // Preparing to replace all of the "referringRelatedIDs" with the "dependentIDs" in either choices or currentState
            dependentIDs.push(sectionID);
            referringRelatedIDs.push(referringSectionID);

            // Perform the replacement in the appropriate place.
            if (schedule.choices.hasChoices()) {
                schedule.choices.replaceSections(courseID, dependentIDs, referringRelatedIDs);
            } else {
                schedule.currentState.replaceScheduledSections(courseID, dependentIDs, referringRelatedIDs);
            }

            this.tearDownSectionSelect();
        }
    }
};

schedule.Grid.prototype.processDependentSecondarySwitch = function (box, state, courseID, referringSectionID, clickedGhostSectionID, primaryColor, secondaryColor) {
    var _this = this;
    var abort = function (box) {
        box.hide();
        _this.tearDownSectionSelect();
    };
    var process = function (box, sectionID) {
        var referringRelatedIDs = schedule.dataStore.relatedSectionsNotPrimary(courseID, referringSectionID);
        var dependentIDs = schedule.dataStore.relatedSectionsNotPrimary(courseID, sectionID);

        // remove the old sections
        _this.removeSectionAndRelatedBlocks(courseID, referringSectionID);

        // add the new lecture section
        _this.addSection(state, courseID, clickedGhostSectionID, primaryColor, secondaryColor);

        // add the new secondary section and its dependencies
        _this.addSectionAndDependentBlocks(state, courseID, sectionID, dependentIDs, primaryColor, secondaryColor);

        // Preparing to replace all of the "referringRelatedIDs" with the "dependentIDs" in either choices or currentState
        dependentIDs.push(sectionID);
        dependentIDs.push(clickedGhostSectionID);
        referringRelatedIDs.push(referringSectionID);

        // Perform the replacement in the appropriate place.
        if (schedule.choices.hasChoices()) {
            schedule.choices.replaceSections(courseID, dependentIDs, referringRelatedIDs);
        } else {
            schedule.currentState.replaceScheduledSections(courseID, dependentIDs, referringRelatedIDs);
        }

        // get ride of the box
        box.hide();
        _this.tearDownSectionSelect();
    };
    var processRandom = function (box, sectionID) {
        sectionID = box.getRandomSectionID();
        process(box, sectionID);
    };

    box.onClickOff(abort);
    box.onCancel(abort);
    box.onSelectSection(process);
    box.onSurpriseMe(processRandom);
    box.show();
};

/**
* Test if inserting a section with the given start and end times will conflict with another schedule block.
* @param {string} day: the string day, like monday
* @param {string} start: the start time
* @param {string} end: the end time
* @return {boolean} true if there will be a conflict, false otherwise
*/
schedule.Grid.prototype.willConflict = function (courseID, sectionID) {
    var _this = this;
    var sectionData = schedule.dataStore.lookupSection(courseID, sectionID);
    // if (typeof(day) === "number" && typeof(start) == "number" && arguments.length === 2) {
    //     var sectionID = start;
    //     var courseID = day;
    //     var rtn = true;
    //     $.each(sectionData.days, function (index, num) {
    //         rtn = rtn && _this.willConflict(time.dayAsString(num), sectionData.start_time, sectionData.end_time);
    //     });
    //     return rtn;
    // }
    var start = time.standardTime(sectionData.start_time);
    var end = time.standardTime(sectionData.end_time);
    var relevantHours = time.standardHours.slice(
        time.standardHours.indexOf(start),
        time.standardHours.indexOf(end)
    );
    var found = false;
    $.each(sectionData.days, function (index, day) {
        $.each(relevantHours, function (index, relevantTime) {
            var target = _this.grid.find("[data-day=" + time.dayAsString(day) + "][data-time=" + time.htmlTime(relevantTime) + "]");
            if (target.html().length > 0) {
                found = true;
                return false; // break from loop
            }
        });

        var previousHours = time.standardHours.slice(
            time.standardHours.indexOf(_this.start),
            time.standardHours.indexOf(start)
        );
        $.each(previousHours, function(index, previousTime) {
            var target = _this.grid.find("[data-day=" + time.dayAsString(day) + "][data-time=" + time.htmlTime(previousTime) + "]");
            if (
                target.children().length > 0 &&
                time.compareTimes(time.standardTime(target.children().first().data("end-key")), start) > 0
            ) {
                found = true;
                return false;
            }
        });
    });
    return found;
};

schedule.Grid.prototype.relatedSectionsWillConflict = function (courseID, sectionID) {
    var _this = this;
    var relatedIDs = schedule.dataStore.relatedSectionsNotPrimary(courseID, sectionID);
    var rtn = false;
    $.each(relatedIDs, function (index, relatedID) {
        rtn = rtn || _this.willConflict(courseID, relatedID);
    });
    return rtn;
};

})(jQuery, bt_utils, _, time, common.ScheduleBlock, colorstore);
