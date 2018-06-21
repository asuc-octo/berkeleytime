var common = common || {};

(function ($, time, _) {
"use strict";

/**
* Object encapsulation of a meeting block on the schedule grid.
*
* @constructor
* @param {string} start: start time of the section
* @param {string} end: end time of the section
* @param {string|int} day: day that the section is on
*/
common.ScheduleBlock = function (start, end, day) {
    this.start = time.standardTime(start);
    this.end = time.standardTime(end);
    this.day = time.standardDay(day);
    this.hasSectionSynched = false;
};

/**
* Set whether this is a primary section meeting or not.
* @param {boolean} isPrimary
* @return {common.ScheduleBlock}
*/
common.ScheduleBlock.prototype.setPrimary = function (isPrimary) {
    this.isPrimaryKind = isPrimary;
    return this;
};

/**
* Set the height of the section element. Note that this should be called
* before generateElement is called, or else the generated element with have
* 0 height.
* @param {int} height: height to set
* @return {common.ScheduleBlock}
*/
common.ScheduleBlock.prototype.setHeight = function (height) {
    this.height = height;
    return this;
};

/**
* Set the colors of the block.
* @param {string} background: bg color
* @param {string} border: border color
* @return {common.ScheduleBlock}
*/
common.ScheduleBlock.prototype.setColors = function (background, border) {
    this.bgColor = background;
    this.borderColor = border;
    this.hasColorsSet = true;
    return this;
};

/**
* Set the info to display in the section block.
* @param {string} title: title of the course e.g. COMPSCI 61A
* @param {string} number: description of the meeting e.g. Lecture 001
* @param {string} location: location of the course e.g. 1 PIMENTEL
* @return {common.ScheduleBlock}
*/
common.ScheduleBlock.prototype.setInfo = function (title, number, location) {
    this.title = title;
    this.number = number;
    this.location = location;
    this.hasInfoSet = true;
    return this;
};

/**
* Return a string to pass to a jquery object to get the grid half hour block element that
* this meeting block should be insterted into.
* @return {string}
*/
common.ScheduleBlock.prototype.targetQuery = function () {
    return "[data-day=" + this.day + "][data-time=" + time.htmlTime(this.start) + "]";
};

/**
* Get the correct jquery to instert this block into.
* @return {jQuery}
*/
common.ScheduleBlock.prototype.getTarget = function () {
    return $(this.targetQuery());
};

/**
* Return how long this meeting block is, in half hours.
* @return {int}
*/
common.ScheduleBlock.prototype.halfHourLength = function () {
    return time.calculateHalfHours(this.start, this.end);
};

/**
* Associate a section ID (and a course ID) with this object. This should be done before
* calling generateElement if you wish to have id data attrs present on the jQuery block.
* @param {int} courseID: course id
* @param {int} sectionID: section id
* @return {common.ScheduleBlock}
*/
common.ScheduleBlock.prototype.syncSection = function (courseID, sectionID) {
    this.courseID = courseID;
    this.sectionID = sectionID;
    this.hasSectionSynched = true;
    return this;
};

/**
* Generates a jQuery which can be appended to the appropriate part of the schedule grid.
* @return {jQuery}
*/
common.ScheduleBlock.prototype.generateElement = function () {
    var elem = $("<div>").addClass("section");
    if (this.height) {
        elem.height(this.height);
    }
    if (this.hasInfoSet) {
        elem = this._setElementInfo(elem);
    }
    if (this.hasSectionSynched) {
        elem.attr({
            "data-course-id": this.courseID,
            "data-section-id": this.sectionID
        });
    }
    if (this.isPrimaryKind) {
        elem.addClass("primary");
    }
    if (this.hasColorsSet) {
        elem.css("background-color", this.bgColor);
        elem.css("border", "1px solid " + this.borderColor);
    }
    elem.data("day", this.day);
    elem.data("start-key", time.htmlTime(this.start));
    elem.data("end-key", time.htmlTime(time.standardHours[time.standardHours.indexOf(this.start) + this.halfHourLength()]));

    elem.data("controller", this);
    return elem;
};

/**
* Factory method to create a ScheduleBlock and associate a section in one fell swoop.
* @return {common.ScheduleBlock}
*/
common.ScheduleBlock.createWithSection = function (start, end, day, courseID, sectionID) {
    var block = new common.ScheduleBlock(start, end, day);
    block.syncSection(courseID, sectionID);
    return block;
};

/********************************************************************************************************************/
/** Private methods *************************************************************************************************/
/********************************************************************************************************************/

/**
* @propertyOf {jQuery}
* Creates a section info element (title, section number, or location) and appends it
* to the jQuery that this was called on (e.g. $(".section").createSectionInfo(...))
* @param {string} class to give the section info element
* @param {string} content of the new element
* @param {object} heights of the new object:
* -- {int} height of the element
* -- {int} padding (top) of the element
* -- {int} fontSize of the element
*/
$.fn.createSectionInfo = function (klass, content, heights) {
    var element = $("<div>")
                    .addClass("section-info")
                    .addClass(klass)
                    .text(content);
    element.height(heights.height);

    element.css("line-height", heights.height + "px");
    element.css("font-size", heights.fontSize + "px");
    element.css("padding-top", heights.padding + "px");
    this.append(element);
};

/**
* Given a jQuery, add relevent info about the meeting block (title, number, etc) to the element.
* @param {jQuery} elem: element to add to
* @return {jQuery} the updated element
*/
common.ScheduleBlock.prototype._setElementInfo = function (elem) {
    var componentHeights = this._calculateComponentHeights(this.height);
    if (componentHeights.number) {
        elem.createSectionInfo("section-title", this.title, componentHeights.title);
        elem.createSectionInfo("section-number", this.number, componentHeights.number);
    } else {
        elem.createSectionInfo("section-title",
            // TODO (noah): use the actual abbreviation instead of this hack
            this.title + " (" + this.number.split(" ")[0].slice(0,3).toUpperCase() + " " + this.number.split(" ")[1] + ")",
            componentHeights.title
        );
    }
    elem.createSectionInfo("section-location", this.location, componentHeights.location);
    return elem;
};

/**
* If the difference between the combined font sizes (which are constants) of the schedule
* blocks are within this much of the actual height of the section block, we make it look
* pretty by taking out the "Lecture 001".
* @const
*/
common.ScheduleBlock.prototype.INFO_PADDING_TOLERANCE = 5;

/**
* Calculate all the heights of everything that is needed about the schedule block.
* @param {int} sectionHeight: the height of the section block
* @return {object} an object with values of the same schema as the return value of _normalizeHeights.
*/
common.ScheduleBlock.prototype._calculateComponentHeights = function (sectionHeight) {
    // title is 40%, section number is 25%, location is 35%
    var titleHeight = sectionHeight * 0.30;
    var titlePadding = sectionHeight * 0.10;
    var titleFontSize = 12;

    var numberHeight = sectionHeight * 0.20;
    var numberPadding = sectionHeight * 0.05;
    var numberFontSize = 10;

    var locationHeight = sectionHeight * 0.25;
    var locationPadding = sectionHeight * 0.10;
    var locationFontSize = 10;

    // if we're not going to be using the section number, we can make everything neater
    var result;
    if (!this._shouldUseSectionNumber(result, this.INFO_PADDING_TOLERANCE)) {
        titleHeight = sectionHeight * 0.40;
        titlePadding = sectionHeight * 0.10;
        locationHeight = sectionHeight * 0.40;
        locationPadding = sectionHeight * 0.10;

        result = {
            title: this._normalizeHeights(titleHeight, titlePadding, titleFontSize),
            location: this._normalizeHeights(locationHeight, locationPadding, locationFontSize)
        };
    } else {
        result = {
            title: this._normalizeHeights(titleHeight, titlePadding, titleFontSize),
            number: this._normalizeHeights(numberHeight, numberPadding, numberFontSize),
            location: this._normalizeHeights(locationHeight, locationPadding, locationFontSize)
        };
    }
    return result;
};

/**
* Return an object with keys mapped to heights (for height, padding, fontSize).
* We could also use this here to do more processing on the heigts (e.g. take out padding, etd) if we needed to.
* @param {int} height
* @param {int} padding
* @param {int} fontSize
*/
common.ScheduleBlock.prototype._normalizeHeights = function (height, padding, fontSize) {
    return {
        height: height,
        padding: padding,
        fontSize: fontSize
    };
};

/**
* Return true if, depending on the tolerance, we should use the section number ("Lecture 001") on its own line, false otherwise.
* @param {object} componentHeights as calculated by calculateComponentHeights
* @param {int} tolerance, the maximum difference that we should be okay with.
* @return {boolean}
*/
common.ScheduleBlock.prototype._shouldUseSectionNumber = function (componentHeights, tolerance) {
    var fontSizeSum = _.values(componentHeights).reduce(function (total, next) {return total + next.fontSize;}, 0);
    var heightSum = _.values(componentHeights).reduce(function (total, next) {return total + next.height + next.padding;}, 0);
    if (fontSizeSum > heightSum - tolerance) {
        return false;
    }
    return true;
};

})(jQuery, time, _);