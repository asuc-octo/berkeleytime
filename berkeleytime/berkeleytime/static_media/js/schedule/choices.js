/************
* Choices, a wrapper around storing scheduled and selected section data in the window.
* This singleton object stores an ordered list of schedules in format 2 and defines methods
* for iterating and operating on them.
* @dependency schedule-utils.js
************/
(function () {
"use strict";
if (typeof schedule === "undefined") {
    throw new Error("DEPENDENCY: choices.js depends on schedule-utils.js");
}

/** @private */
var _instance; // singleton enforcement - there can ONLY be one instance of choices at a time

/**
* Instantiate a new set of choices. Note that Choices is a singleton object, which means that
* there can only be ONE instance of it at a time. Because we store the actual array of choices
* in the _choices variable rather than in the Choice itself, Choices objects are very easy to
* pass around.
* @constructor
*/
schedule.Choices = function () {
    // singleton block. if the object's ever been created, it's this.
    if (_instance)
        return _instance;
    _instance = this;
    return _instance;
};

/**
* Error to throw if someone tries to access a choice that doesn't exist.
* @extends Error
*/
schedule.Choices.ChoicesOutOfBoundsException = function (msg) {
    this.message = msg || "";
    this.name = "ChoicesOutOfBoundsException";
};
schedule.Choices.ChoicesOutOfBoundsException.prototype = Error.prototype;

/**
* Error to throw if someone tries to access a choice and the choices haven't been stored yet.
* @extends Error
*/
schedule.Choices.ChoicesNotStoredException = function (msg) {
    this.message = msg || "";
    this.name = "ChoicesNotStoredException";
};
schedule.Choices.ChoicesNotStoredException.prototype = Error.prototype;

/**
* Store dummy data in the choices.
*/
schedule.Choices.prototype.storeDummyData = function () {
    var dummy_data = [[{"course_id": 2416, "section_ids": [2330, 2343, 2333]}, {"course_id": 4473, "section_ids": [7723, 7730]}, {"course_id": 2339, "section_ids": [2184, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2333]}, {"course_id": 4473, "section_ids": [7723, 7730]}, {"course_id": 2339, "section_ids": [2179, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2333]}, {"course_id": 4473, "section_ids": [7723, 7731]}, {"course_id": 2339, "section_ids": [2184, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2333]}, {"course_id": 4473, "section_ids": [7723, 7730]}, {"course_id": 2339, "section_ids": [2178, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2333]}, {"course_id": 4473, "section_ids": [7723, 7730]}, {"course_id": 2339, "section_ids": [2177, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2331]}, {"course_id": 4473, "section_ids": [7723, 7730]}, {"course_id": 2339, "section_ids": [2185, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2331]}, {"course_id": 4473, "section_ids": [7723, 7730]}, {"course_id": 2339, "section_ids": [2180, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2331]}, {"course_id": 4473, "section_ids": [7723, 7731]}, {"course_id": 2339, "section_ids": [2185, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2331]}, {"course_id": 4473, "section_ids": [7723, 7731]}, {"course_id": 2339, "section_ids": [2180, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2333]}, {"course_id": 4473, "section_ids": [7723, 7730]}, {"course_id": 2339, "section_ids": [2176, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2331]}, {"course_id": 4473, "section_ids": [7723, 7730]}, {"course_id": 2339, "section_ids": [2184, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2331]}, {"course_id": 4473, "section_ids": [7723, 7730]}, {"course_id": 2339, "section_ids": [2179, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2331]}, {"course_id": 4473, "section_ids": [7723, 7731]}, {"course_id": 2339, "section_ids": [2184, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2331]}, {"course_id": 4473, "section_ids": [7723, 7731]}, {"course_id": 2339, "section_ids": [2179, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2331]}, {"course_id": 4473, "section_ids": [7723, 7730]}, {"course_id": 2339, "section_ids": [2178, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2331]}, {"course_id": 4473, "section_ids": [7723, 7731]}, {"course_id": 2339, "section_ids": [2178, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2331]}, {"course_id": 4473, "section_ids": [7723, 7730]}, {"course_id": 2339, "section_ids": [2177, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2331]}, {"course_id": 4473, "section_ids": [7723, 7731]}, {"course_id": 2339, "section_ids": [2177, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2331]}, {"course_id": 4473, "section_ids": [7723, 7730]}, {"course_id": 2339, "section_ids": [2176, 2174]}, {"course_id": 5089, "section_ids": [4675]}], [{"course_id": 2416, "section_ids": [2330, 2343, 2331]}, {"course_id": 4473, "section_ids": [7723, 7731]}, {"course_id": 2339, "section_ids": [2176, 2174]}, {"course_id": 5089, "section_ids": [4675]}]];
    this.store(dummy_data);
};

/**
* Given an array of schedules in format 2, store them as the Choices, overwriting any previous data.
* @param {Array} newChoices
*/
schedule.Choices.prototype.store = function (newChoices) {
    this.choices = newChoices;
    this.counter = 0;
};

/**
* Clears all the data.
*/
schedule.Choices.prototype.clear = function () {
    delete this.choices;
    delete this.counter;
};

/**
* Error if nothing is stored.
* @throws {schedule.Choices.ChoicesNotStoredException}
*/
schedule.Choices.prototype.errorIfNothingStored = function () {
    if (!this.hasChoices()) {
        throw new schedule.Choices.ChoicesNotStoredException("Attempt to access choices before storing.");
    }
};

/**
* Whether there are any choices stored.
* @return {boolean}
*/
schedule.Choices.prototype.hasChoices = function () {
    return this.counter !== undefined && this.choices;
};

/**
* Check to see if there are any more choices after the current one. Ie, if we instantiate Choices with
* 20 choices Choices.getInstance().counter = 20, then this will return false.
* @return {bool}
*/
schedule.Choices.prototype.hasNext = function () {
    this.errorIfNothingStored();
    return this.counter + 1 < this.choices.length;
};

/**
* Move the current choice counter along to the next choice.
*/
schedule.Choices.prototype.next = function () {
    this.seekTo(this.counter + 1);
};

/**
* Check to see if there are any more choices before the current one. Ie, if we instantiate Choices with
* 20 choices Choices.getInstance().counter = 0, then this will return false.
* @return {bool}
*/
schedule.Choices.prototype.hasPrevious = function () {
    this.errorIfNothingStored();
    return this.counter - 1 >= 0;
};

/**
* Move the current choice counter back to the previous choice.
*/
schedule.Choices.prototype.previous = function () {
    this.seekTo(this.counter - 1);
};

schedule.Choices.prototype.getPosition = function () {
    this.errorIfNothingStored();
    return this.counter;
};

/**
* Get the current choice as defined by the counter.
* @return {Array} the schedule choice currently being pointed to.
*/
schedule.Choices.prototype.current = function () {
    this.errorIfNothingStored();
    return this.choices[this.counter];
};

/**
* Get the IDs of all the courses in the current choice.
* @return {Array}
*/
schedule.Choices.prototype.getCurrentCourseIDs = function () {
    return this.current().map(function (obj) {
        return obj.course_id;
    });
};

/**
* Saves the current choice to the backend.
* @param {State} the state to save the result in
*/
schedule.Choices.prototype.saveCurrent = function (state) {
    var _this = this;
    var choiceCourses = this.getCurrentCourseIDs();
    var addedCourses = state.getCourseIDs().filter(function (courseID) {
        return $.inArray(courseID, choiceCourses) === -1;
    });
    var postData = {
        "schedule_id": state.getScheduleID(),
        "choice": JSON.stringify(this.current()),
        "added_courses": addedCourses.join(",")
    };
    $.post("/schedule/save/", postData, function (json) {
        if (json.success) {
            state.updateScheduledFromChoice(_this.current(), addedCourses);
            state.setGenerated(true);
            schedule.grid.renderSchedule(state, "selected");
            _this.clear();
            // TODO (ashwin) more save success stuff
        }
    }, "json");
};

/**
* For the course designated by "courseID":
*     1. Deletes all the sections with IDs in "referringSectionIDs"
*     2. Adds all the sections with IDs in "newSectionIDs"
* note: we can't use this.current() here, because we're updating the state.
* @param {int} courseID: courseID of the course to replace the section in
* @param {int} sectionID: the section id to add
* @param {int} referringSectionID: the section id to replace
*/
schedule.Choices.prototype.replaceSections = function (courseID, newSectionIDs, referringSectionIDs) {
    var _this = this;
    for (var i = 0; i < _this.choices[this.counter].length; i++) {
        if (_this.choices[_this.counter][i].course_id === courseID) {
            $.each(referringSectionIDs, function (index, referringSectionID) {
                _this.choices[_this.counter][i].section_ids.remove(referringSectionID);
            });
            $.each(newSectionIDs, function (index, newSectionID) {
                _this.choices[_this.counter][i].section_ids.push(newSectionID);
            });
            break;
        }
    }
};

/**
* Move the counter to a specified index in the choices array. Throw and exception if the index is outside
* the bounds of the array.
* @param {int} index to try ot move to
* @throws {schedule.Choices.ChoicesOutOfBoundsException}
*/
schedule.Choices.prototype.seekTo = function (index) {
    this.errorIfNothingStored();
    if (typeof(index) !== "number" || index < 0 || index >= this.choices.length) {
        throw new schedule.Choices.ChoicesOutOfBoundsException("Cannot find choice with index " + index);
    } else {
        this.counter = index;
    }
};

/**
* Return the number of courses in the schedule choices. This should be the same for every choice.
* @return {int} the number of courses
*/
schedule.Choices.prototype.countCourses = function () {
    this.errorIfNothingStored();
    if (this.choices.length === 0) {
        return 0;
    }
    return this.choices[0].length;
};

/**
* Return how many choices we have right now.
* @return {int}
*/
schedule.Choices.prototype.getLength = function () {
    return this.choices.length;
};

schedule.choices = new schedule.Choices();

})();
