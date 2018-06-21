/**
* @fileoverview
* controls.js contains the controller wrappers for changing date, time and am/pm for campus.
*/
var campus = campus || {};

(function ($, time, utils, OKBerkeleytimeBox, BerkeleytimeBox) {
"use strict";


/********************************************************************************************************************/
/** Time (e.g. 7:35) select control *********************************************************************************/
/********************************************************************************************************************/

/**
* Wrapper for the time selection controll for campus. Encapsulates all the needed functionality
* and automatically binds buttons, so all you need to do for it to work is instantiate it once
* with the correct element.
* @param {type} element: any ancestor element of both the time input field and the top/bottom buttons
*/
campus.TimeSelect = function (element) {
    this.element = element;
    this.input = this.element.find("input");
    var now = new Date();
    this.input.val(time.renderTime((now.getHours()) + ":" + (now.getMinutes()), false));
    this.value = this.input.val();
    this.initHooks();
};

/**
* Bind the next/prev functionality.
*/
campus.TimeSelect.prototype.initHooks = function () {
    this.element.find(".prev").click(this.processPrevious());
    this.element.find(".next").click(this.processNext());
    this.input.keyup(this.processKeyup());
    this.input.blur(this.processBlur());
    this.input.bind('mousewheel', this.processMousewheel());
};

/**
* Return a function to be executed on click of the previous control. (this can be passed)
* very easily to jQuery's click event, but we have to be careful about "this" because in
* the handler function for .click in jQuery, "this" is bound to the element that was clicked
* on. To work with the TimeSelect instead, we employ js closures.
*/
campus.TimeSelect.prototype.processPrevious = function () {
    var _this = this;
    return function () {
        campus.highlightSubmit();
        _this.updateTimeByOffset(5);
    };
};

/**
* Return a function to be executed on click of the next control.
*/
campus.TimeSelect.prototype.processNext = function () {
    var _this = this;
    return function () {
        campus.highlightSubmit();
        _this.updateTimeByOffset(-5);
    };
};

/**
* Update the time display by the specified offset in minutes (which may be negative or)
* positive.
* @param {int} offset: amount of minutes to offset by
*/
campus.TimeSelect.prototype.updateTimeByOffset = function (offset) {
    this.value = time.renderTime(time.offsetByMinutes(offset, this.value), false);
    this.input.val(this.value);
};

/**
* Return a function to be executed when the user clicks off of the input control.
*/
campus.TimeSelect.prototype.processBlur = function () {
    var _this = this;
    return function () {
        if (time.isValidCampusTime(_this.input.val())) {
            _this.value = _this.input.val();
        } else {
            _this.input.val(_this.value);
        }
    };
};

/**
* Return true if the sanitized value has the first two characters that could
* represent a two digit hour, like 12 or 10.
* @param {string} val: sanitized time value (no colons)
*/
var _hasTwoDigitHour = function (val) {
    return val.charAt(0) === "1" &&
    ["0", "1", "2"].contains(val.charAt(1));
};

campus.TimeSelect.prototype.processKeyup = function () {
    var _this = this;
    return function (e) {
        campus.highlightSubmit();
        var val = _this.input.val();
        var sanitizedVal = val.replace(":", "");

        var reset = function () {
            _this.input.val(val.slice(0, val.length - 1));
        };

        // if there is only one : and all the characters other than : are numbers, we proceed.
        // otherwise, we reset the value.
        if (val.indexOf(":") === val.lastIndexOf(":") && !window.isNaN(val.replace(":", ""))) {
            if (sanitizedVal.length === 1 && sanitizedVal === "0") {
                reset();
            }
            // if there are two numbers and we know they're not typeing "12:xx", "10:xx" etc,
            // then we can automatically insert a colon.
            else if (sanitizedVal.length === 2) { // "12" -> "1:2"
                if (_hasTwoDigitHour(sanitizedVal)) {
                    return;
                } else if (!["0", "1", "2", "3", "4", "5"].contains(sanitizedVal.charAt(1))) {
                    reset();
                } else {
                    _this.input.val(sanitizedVal.slice(0,1) + ":" + sanitizedVal.slice(1,2));
                }
            }

            // same thing - we can insert a colon if we know what they're typing
            else if (sanitizedVal.length === 3) {
                // "135" -> "1:35"
                // "123" -> "12:3"
                // "524" -> "52"
                // "101" -> "1:01"
                if (!["0", "1", "2", "3", "4", "5"].contains(sanitizedVal.charAt(1))) {
                    reset();
                } else {
                    // they can't select times other than in five minutes intervals from the hour
                    _this.input.val(sanitizedVal.slice(0,1) + ":" + sanitizedVal.slice(1,3));
                    _this.value = _this.input.val();
                }

            }

            else if (sanitizedVal.length === 4) {// "1:235" -> "12:35", "1235" -> "12:35"
                if (!_hasTwoDigitHour(sanitizedVal) || !["0", "1", "2", "3", "4", "5"].contains(sanitizedVal.charAt(2))) {
                    reset();
                } else {
                    _this.input.val(sanitizedVal.slice(0,2) + ":" + sanitizedVal.slice(2,4));
                    _this.value = _this.input.val();
                }
            }

            // can't type more than 5 numbers including :, 4 numbers excluding
            else if (sanitizedVal.length > 4 || val.length > 5) {
                reset();
            }

        } else {
            reset();
        }
    };
};

/**
* Return a function to be executed on mousewheel. This function updates the time display
* in the same way as clicking the next/prev buttons a bunch of times would.
*/
campus.TimeSelect.prototype.processMousewheel = function () {
    var _this = this;
    return function (event, delta, deltaX, deltaY) {
        event.preventDefault();
        campus.highlightSubmit();
        var minutesToOffsetBy = (deltaY - (deltaY % 5) + 5); // we only want increments of 5
        if (deltaY < 0) {
            minutesToOffsetBy = -minutesToOffsetBy;
        }
        _this.updateTimeByOffset(minutesToOffsetBy);
    };
};

/**
* Return a standard, formatted string representing the current time value of the select control.
* @param {string} ampm: "(A|P)M"
* @return {string}
*/
campus.TimeSelect.prototype.format = function (ampm) {
    return time.standardTime(this.value + " " + ampm.toUpperCase());
};

/********************************************************************************************************************/
/** AM/PM select control ********************************************************************************************/
/********************************************************************************************************************/

campus.AmPmSelect = function (element) {
    this.element = element;
    this.display = this.element.find(".field-content");
    this.initDisplay();
    this.initHooks();
};

campus.AmPmSelect.prototype.initDisplay = function () {
    var now = new Date();
    var todayAtNoon = new Date();
    todayAtNoon.setHours(12);
    todayAtNoon.setMinutes(0);
    todayAtNoon.setSeconds(0);

    if (now.getTime() > todayAtNoon.getTime()) {
        this.display.text("PM");
    } else {
        this.display.text("AM");
    }
};

campus.AmPmSelect.prototype.initHooks = function () {
    this.element.find(".prev").click(this.processChange());
    this.element.find(".next").click(this.processChange());
};

campus.AmPmSelect.prototype.processChange = function () {
    var _this = this;
    return function () {
        campus.highlightSubmit();
        if (_this.display.text() === "PM") {
            _this.display.text("AM");
        } else {
            _this.display.text("PM");
        }
    };
};

campus.AmPmSelect.prototype.value = function () {
    return this.display.text();
};

/********************************************************************************************************************/
/** Day select control **********************************************************************************************/
/********************************************************************************************************************/

/**
* Instantiate a wrapper for cycling through days.
* @param {jQuery} element: element containing day and date fields and next/prev controls (can be any ancestor of those)
* @constructor
*/
campus.DaySelect = function (element) {
    this.element = element;
    this.dayDisplay = this.element.find(".day");
    this.dateDisplay = this.element.find(".date");
    this.date = new Date();
    this.initHooks();
    this.dayDisplay.text(this._processDateForDay());
    this.dateDisplay.text(this._ongoingSemesterDisplay());
};

/**
* Bind the proper events to the next and prev buttons.
*/
campus.DaySelect.prototype.initHooks = function () {
    this.element.find(".prev").click(this.makeDayIncrementer(false));
    this.element.find(".next").click(this.makeDayIncrementer(true));
};

/**
* Return a function to call when either the next or previous button is clicked. The returned
* function increments (or decrements) the shown day/date and then updates their displays - we
* will pass this returned function to the .click() events for the next and prev buttons as such:
* $(".next").click(this.makeDayIncrementer(false)).
*
* Show a berkeleytime box if the date is too far in the future.
*
* @param {boolean} shouldMoveForward: whether to increment (if true) or decrement (if false)
* the day.
* @return {function}
*/
campus.DaySelect.prototype.makeDayIncrementer = function (shouldMoveForward) {
    var coefficient = shouldMoveForward ? 1 : -1;
    var _this = this;
    return function () {
        campus.highlightSubmit();
        var nextDate = new Date(_this.date.getTime() + 1000 * 60 * 60 * 24 * coefficient);
        if (!(time.isNDaysFromNow(7, nextDate) || time.isNDaysFromNow(-7, nextDate))) {
            _this.date = nextDate;
        } else {
            _this.date = new Date();
        }
        _this.dayDisplay.text(_this._processDateForDay());
        _this.dateDisplay.text(_this._ongoingSemesterDisplay());
    };
};

/**
* Return a string with the day of the week, accounting for today and tomorrow, based on this.date.
* @return {string}
*/
campus.DaySelect.prototype._processDateForDay = function () {
    return time.days[this.date.getDay()];
};

/**
* Return a string with the date of this.date, formated Month + day + ordinal
* @return {string}
*/
campus.DaySelect.prototype._ongoingSemesterDisplay = function () {
    var semesterString = window.ONGOING_SEMESTER.capitalize() + " " + window.ONGOING_YEAR;
    if (time.isToday(this.date)) {
        return "Today (" + semesterString + ")";
    }
    return semesterString;
};

campus.DaySelect.prototype.getStringDay = function () {
    return "" + this.date.getDay();
};

/**
* Return the currently selected date in dd/mm/yyy format.
* @return {string}
*/
campus.DaySelect.prototype.format = function () {
    var month = (this.date.getMonth() + 1).toString();
    return month + "/" + this.date.getDate() + "/" + this.date.getFullYear();
};

})(jQuery, time, bt_utils, OKBerkeleytimeBox, BerkeleytimeBox);
