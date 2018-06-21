/**
* @fileoverview
* popup.js implements a controller object for the campus popup - the popup which shows when
* you click on a room and which contains a schedule grid of all the classes that happen in
* that room over the day.
*/
(function ($, PageFrame, courseBox) {
"use strict";

/**
* Controller for popup grid.
*
* Note that the implementation is such that you must set the internal state of
* this object before showing it - this is so that you can hide, show, and reset
* the state easily without creating other objects, and so that it can act as
* a singleton with campus.schedulePopup (different from campus.SchedulePopop, which
* is a class, not an object).
*
* Also note that this constructor should never be called directly - because it's a singleton,
* you should use .getInstance() instead.
* @constructor
*/
campus.SchedulePopup = function () {
    this.isInitialized = false;
    this.isShowing = false;
};

/**
* Set the element that the arrow on the popup will point to. Note that this assumes
* the popup will be on the LEFT of the element.
* @param {jQuery} elem: element to point to
*/
campus.SchedulePopup.prototype.setElement = function (elem) {
    this.element = elem;
    this.isInitialized = true;
};

campus.SchedulePopup.prototype.setTimes = function (start, end) {
    this.start = time.standardTime(start);
    this.end = time.standardTime(end);
};

campus.SchedulePopup.prototype.setDay = function (day) {
    this.day = day;
};

/**
* Gets the singleton instance of the popup. We create a new instance if there is not one,
* or get the old one if there is.
* @return {campus.SchedulePopup}
*/
campus.SchedulePopup.getInstance = function () {
    if (campus.SchedulePopup.instance) {
        return campus.SchedulePopup.instance;
    } else {
        var instance = new campus.SchedulePopup();
        campus.SchedulePopup.instance = instance;
        return instance;
    }
};

/**
* Show the popup.
*/
campus.SchedulePopup.prototype.show = function () {
    if (this.isShowing) {
        this.hide();
    }
    var elem = $("<div class='campus-popup'>")
        .css("visibility", "hidden")
        .appendTo("body");

    this.grid = new campus.Grid(this.start, this.end, time.numDay(this.day));

    this.grid.appendTo(elem);
    elem.css("right", $("html").outerWidth() - this.element.offset().left + 20);
    this.popup = elem;

    var triangle = $("<div class='triangle'>");
    triangle.css("top", this.calculateTrianglePosition());
    this.popup.append(triangle);
    this.popup.css("visibility", "visible");

    var _this = this;
    this.frame = new PageFrame(1, function () {
        _this.hide();
    });
    this.popup.css("z-index", 2);
    this.frame.addFrame();
    this.isShowing = true;
};

/**
* Return a pixel value of how much the arrow pointer should be offset from the top of the popup.
*/
campus.SchedulePopup.prototype.calculateTrianglePosition = function () {
    return this.element.offset().top - this.popup.offset().top + this.element.outerHeight() / 2 - 10;
};

/**
* Hide the popup.
*/
campus.SchedulePopup.prototype.hide = function () {
    if (this.isShowing) {
        this.popup.remove();
        this.frame.remove();
    }
};

campus.SchedulePopup.prototype.addScheduleBlock = function (options) {
    var block = this.grid.addScheduleBlock(options);
    block.click(function () {
        courseBox.initCourseBox(
            "overview",
            block.data("course-id")
        );
    });
};

/**
* Set the singleton instance.
*/
campus.schedulePopup = campus.SchedulePopup.getInstance();

})(jQuery, common.PageFrame, courseBox);
