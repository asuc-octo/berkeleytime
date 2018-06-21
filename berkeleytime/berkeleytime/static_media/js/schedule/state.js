/************
* State, a wrapper around storing scheduled and selected section data.
* @dependency schedule-utils.js
************/

(function ($, time) {
"use strict";
if (typeof schedule === "undefined") {
    throw new Error("DEPENDENCY: state.js depends on schedule-utils.js");
}

/**
* Create a new state with the given format.
* @param {Array} newStateFormat (format 1)
*/
schedule.State = function (newStateFormat) {
    this.store(newStateFormat);
};

/**
* Exception to throw when we try to get the internal representation of the state (in format 1)
* but it's undefined.
* @param {string|undefined} msg the message to display with the error
* @constuctor
* @extends Error
*/
schedule.State.StateUndefinedException = function (msg) {
    this.message = msg || "";
    this.name = "StateUndefinedException";
};
schedule.State.StateUndefinedException.prototype = Error.prototype;

/**
* Factory method to create a new State from dummy data.
* Includes a dependency on schedule.dummy.
* @return {schedule.State}
*/
schedule.State.createFromDummy = function () {
    return new schedule.State(dummy.DummyState.DUMMY_STATE);
};

/**
* Factory method to create a State from a choice format, using the selected sections from stateForSelected.
* @param {Array} choice, one of a list of schedules as determined by format 2
* @param {State} stateForSelected, the state used to load in the selected sections.
* @return {schedule.State}
*/
schedule.State.createFromChoiceAndState = function (choice, stateForSelected) {
var choiceWithSelected = choice.map(function (courseIDAndSectionIDs) {
        return {
            course_id: courseIDAndSectionIDs.course_id,
            selected: stateForSelected.selectedSectionsByCourseID(courseIDAndSectionIDs.course_id),
            scheduled: courseIDAndSectionIDs.section_ids
        };
    });
    return new schedule.State(choiceWithSelected);
};

/**
* Store a new format in the internal representation.
* @param {Array} state (format 1)
* @param {int} scheduleID
* @param {string} name
* @param {string} semester
* @param {string} year
*/
schedule.State.prototype.store = function (state, scheduleID, name, semester, year, generated) {
    this._state = state;
    this._scheduleID = scheduleID;
    this._name = name;
    this._semester = semester;
    this._year = year;
    this._generated = generated;
};

/**
* Create an empty state.
*/
schedule.State.prototype.create = function (newSemester, newYear) {
    this._state = [];
    delete this._scheduleID;
    delete this._name;
    this._semester = newSemester;
    this._year = newYear;
    this._generated = false;
};

/**
* Return true if the state has not had anything stored yet.
* @return {boolean}
*/
schedule.State.prototype.isNewSchedule = function () {
    return this._scheduleID === undefined;
};

/**
* Given a course id and list of section ids, update either the
* @param {string} key: either 'scheduled' or 'selected'
* @param {int} courseID: id of the course to update
* @param {Array} sectionIDs: list of ints (the seciton ids that you want to replace the old ones)
*/
schedule.State.prototype.update = function (key, courseID, sectionIDs) {
    for (var i = 0; i < this._state.length; i++) {
        if (this._state[i].course_id === courseID) {
            this._state[i][key] = sectionIDs;
        }
    }
};

/**
* Removes the course with the given ID from the schedule. If there are no more courses, sets sets generated to false;
* @param {int} course_id
*/
schedule.State.prototype.removeCourse = function (courseID) {
    this._state.remove(function (obj) {
        return obj.course_id === courseID;
    });

    if (this._state.length === 0) {
        this.setGenerated(false);
    }
};

/**
* For the course designated by "courseID":
*     1. Deletes all the sections with IDs in "referringSectionIDs"
*     2. Adds all the sections with IDs in "newSectionIDs"
* @param {int} courseID: courseID of the course to replace the section in
* @param {int} sectionID: the section ids to add
* @param {int} referringSectionID: the section ids to replace
*/
schedule.State.prototype.replaceScheduledSections = function (courseID, newSectionIDs, referringSectionIDs) {
    var _this = this;
    for (var i = 0; i < this._state.length; i++) {
        if (this._state[i].course_id === courseID) {
            $.each(referringSectionIDs, function (index, referringSectionID) {
                _this._state[i].scheduled.remove(referringSectionID);
            });
            $.each(newSectionIDs, function (index, newSectionID) {
                _this._state[i].scheduled.push(newSectionID);
            });
            break;
        }
    }
};

/**
* Updates the schedule sections from the choice given. Resets the schedule sections for the other courses (addedCourses)
* @param {dict} choice: the choice to read from.
* @param {Array} addedCourses: a list of courses for which there are no sections scheduled.
*/
schedule.State.prototype.updateScheduledFromChoice = function (choice, addedCourses) {
    var _this = this;
    var allCourses = this.getCourseIDs();
    $.each(choice, function (index, courseIDAndSectionIDs) {
        _this.update("scheduled", courseIDAndSectionIDs.course_id, courseIDAndSectionIDs.section_ids);
    });
    $.each(addedCourses, function (index, courseID) {
        _this.update("scheduled", courseID, []);
    });
};

/**
* Applies the specified applicator function to all the selected sections (in the dataStore)
*     given by the section ids in the state.
* @param {string} key, either "selected" or "secheduled"
* @param {function} accessor, a function to apply to each section data object from the
*     dataStore before adding it to the result list. This function can take up to three arguments:
*     the section object, its section id, and its course id.
* @param {function} applicator function to apply to the result list and return
* @return {any} the return value of the applicator when applied to the result list
*/
schedule.State.prototype.applyOverSections = function (key, accessor, applicator) {
    var sections = [];
    var coursesAndSections = key === "selected" ? this.coursesAndSelectedSections(): this.coursesAndScheduledSections();
    $.each(coursesAndSections, function (index, data) {
        sections = sections.concat(
            data[key].map(function (sectionID) {
                return accessor(schedule.dataStore.lookupSection(data.courseID, sectionID), sectionID, data.courseID);
            })
        );
    });
    return applicator(sections);
};

/**
* Return a list of objects from this state with keys:
*   courseID -- course id
*   selected -- section ids that the user has selected from this course
* @return {Array} the list of objects
*/
schedule.State.prototype.coursesAndSelectedSections = function () {
    return this.getState().map(function (obj) {
        return {selected: obj.selected, courseID: obj.course_id};
    });
};

/**
* Return a list of objects with keys:
*   courseID -- course id
*   scheduled -- section ids that the user has in their generated schedule from this course
* @return {Array} the list of objects
*/
schedule.State.prototype.coursesAndScheduledSections = function () {
    return this.getState().map(function (obj) {
        return {scheduled: obj.scheduled, courseID: obj.course_id};
    });
};

/**
* Converts the state to a choice in format 2
* @return {Array} the choice
*/
schedule.State.prototype.toChoice = function () {
    var choice = [];
    $.each(this.getState(), function (index, obj) {
        if (obj.scheduled.length > 0)
            choice.push({section_ids: obj.scheduled, course_id: obj.course_id});
    });
    return choice;
};

/**
* Returns the IDs of all courses in the state that have no scheduled sections.
* @return {Array}
*/
schedule.State.prototype.getUnscheduledCourseIDs = function () {
    var unscheduled = [];
    $.each(this.getState(), function (index, obj) {
        if (obj.scheduled.length === 0)
            unscheduled.push(obj.course_id);
    });
    return unscheduled;
};

/**
* Find the earliest start time of any section in a given state (schedule).
* Note that if the dataStore can't find a section via sectionLookup, this will fail.
* This should probably be moved to the State object eventually.
* @param {string} key "selected" or "scheduled" (which one to iterate over)
* @return {string} the earliest start
*/
schedule.State.prototype.calculateEarliestStart = function (key) {
    return this.applyOverSections(key, function (section) {
        return section.start_time;
    }, time.findEarliest);
};

/**
* Find the latest time of any section in a given state (schedule).
* Note that if the dataStore can't find a section via sectionLookup, this will fail.
* This should probably be moved to the State object eventually.
* @param {string} key "selected" or "scheduled" (which one to iterate over)
* @return {string} the earliest start
*/
schedule.State.prototype.calculateLatestEnd = function (key) {
    return this.applyOverSections(key, function (section) {
        return section.end_time;
    }, time.findLatest);
};

/**
* Get all the selected sections in the state for a given course id.
* @param {string|int} targetCourseID: the course id for which to get the selected sections
* @return {Array} of ints
*/
schedule.State.prototype.selectedSectionsByCourseID = function (targetCourseID) {
    if (typeof targetCourseID !== "number") {
        // have to convert to a string in all cases - we'll be comparing with === later.
        targetCourseID = window.parseInt(targetCourseID);
    }
    return this.applyOverSections("selected", function (data, sectionID, courseID) {
        return courseID === targetCourseID ? sectionID : null;
    }, function (data) {
        return data.filter(function (data) {
            return data !== null;
        });
    });
};

/**
* Throw an error if the internal representation is not defined in the window.
* @throws {schedule.State.StateUndefinedException}
*/
schedule.State.prototype.ensureOrError = function () {
    if (this._state === undefined) {
        throw new schedule.State.StateUndefinedException();
    }
};

/**
* Determines whether the state contains a given course.
* @return {boolean}
*/
schedule.State.prototype.hasCourse = function (courseID) {
    for (var i = 0; i < this._state.length; i++) {
        if (this._state[i].course_id === courseID)
            return true;
    }
    return false;
};

/**
* Determines whether the state contains any courses.
* @return {boolean}
*/
schedule.State.prototype.hasCourses = function (courseID) {
    return this._state.length > 0;
};

/**
* Get the internal representation of the state.
* @return {Array} the internal representation
*/
schedule.State.prototype.getState = function () {
    this.ensureOrError();
    return this._state;
};

/**
* Get the internal schedule id.
* @return {int} the internal representation
*/
schedule.State.prototype.getScheduleID = function () {
    this.ensureOrError();
    return this._scheduleID;
};

/**
* Get the internal name.
* @return {string} the internal representation
*/
schedule.State.prototype.getName = function () {
    this.ensureOrError();
    return this._name;
};

/**
* Get the internal semester.
* @return {string} the internal representation
*/
schedule.State.prototype.getSemester = function () {
    this.ensureOrError();
    return this._semester;
};

/**
* Get the internal year.
* @return {string} the internal representation
*/
schedule.State.prototype.getYear = function () {
    this.ensureOrError();
    return this._year;
};

/**
* Returns whether the schedule has been generated yet, or not.
* @return {boolean}
*/
schedule.State.prototype.isGenerated = function () {
    this.ensureOrError();
    return this._generated;
};

/**
* Sets whether the state is generated or not.
*/
schedule.State.prototype.setGenerated = function (generated) {
    this.ensureOrError();
    this._generated = generated;
};

/**
* Return a list of the course ids in the state.
* @return {Array} of ints
*/
schedule.State.prototype.getCourseIDs = function () {
    this.ensureOrError();
    return this._state.map(function (course) {
        return course.course_id;
    });
};

/**
* Get the number of courses in the state.
* @return {int}
*/
schedule.State.prototype.getLength = function () {
    this.ensureOrError();
    return this.getState().length;
};

/**
* Adds a course to the state, given a course ID and section IDs.
* The section IDs become the 'selected' sections, and the 'scheduled' sections are empty.
* @param {int} courseID
* @param {Array} sectionIDs
*/
schedule.State.prototype.addCourse = function (courseID, sectionIDs) {
    this.ensureOrError();
    this._state.push({
        "course_id": courseID,
        "scheduled": [],
        "selected": sectionIDs
    });
};

/**
* Deletes a course from the backend, and on success, deletes it from the front-end
* @param {int} courseID: the course to delete
* @param {function} callback
*/
schedule.State.prototype.deleteCourse = function (courseID, callback) {
    if ($.inArray(courseID, this.getCourseIDs()) !== -1) {
        var postData = {
            "schedule_id": this.getScheduleID(), "course_id": courseID
        };
        $.post("/schedule/delete_course", postData, function (json) {
            for (var i = 0; i < this._state.length; i++) {
                if (this._state[i].course_id === courseID) {
                    delete this._state[i];
                    break;
                }
            }
            if (callback)
                callback();
        }, "json");
    }
};

/**
* Tries to change the selected sections for a given course in the backend. If the request fails, doesn't do anything.
* @param {int} courseID: the course to modify
* @param {Array} sectionIDs: the IDs for the new selected sections
* @param {function} callback: a callback for after the course is completely added
*/
schedule.State.prototype.captureSelected = function (courseID, sectionIDs, callback) {
    var data = {
        "schedule_id": this._scheduleID,
        "course_id": courseID,
        "section_ids": sectionIDs.join(",")
    };
    var _this = this;
    $.post("/schedule/save_course/", data, function (json) {
        if (json.success) {
            if (_this.hasCourse(courseID)) {
                // update the sections if the course is already there
                _this.update("selected", courseID, sectionIDs);
            } else {
                // otherwise, adds the course
                _this.addCourse(courseID, sectionIDs);
            }
            schedule.dataStore.ensure([courseID], callback);
        } else {
            // BERKELEYTIME BOX HERE
            c(json.error);
        }
    }, "json");
};

/**
* Saves the current State to the backend.
*/
schedule.State.prototype.saveState = function () {
    var _this = this;
    var postData = {
        "schedule_id": this.getScheduleID(),
        "choice": JSON.stringify(this.toChoice()),
        "added_courses": this.getUnscheduledCourseIDs().join(",")
    };
    $.post("/schedule/save/", postData, function (json) {
        if (json.success) {
            _this.setGenerated(true);
            // TODO (ashwin) more save success stuff
        }
    }, "json");
};

/**
* String representation of State. For now, just the name of the Class.
*/
schedule.State.prototype.toString = function () {
    return "schedule.State";
};

})(jQuery, time);
