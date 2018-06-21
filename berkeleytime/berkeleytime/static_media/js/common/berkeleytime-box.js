var BerkeleytimeBox, OKBerkeleytimeBox, YesNoBerkeleytimeBox, ScheduleBerkeleytimeBox;

(function ($, time, utils) {
"use strict";

var _addToScheduleGreen = "#72C55B";
var _selectAllRed = "#D73A40";
var _berkeleytimeBlue = "#5AB2DE";


BerkeleytimeBox = function (options) {};

BerkeleytimeBox.prototype.init = function (options) {
    var message = options.message || "";
    var content = options.content || "";
    var parent = options.parent || $("html");
    var type = options.type || "info";
    this.parent = parent;
    this.slideTime = 400;

    this.frame = $("<div>").addClass("bt-frame");

    this.box = this.drawBox(message, content);
    this.message = this.box.find(".message");
    this.autoResize();
    this.box.hide();
    this.box.css("visibility", "visible");

    switch (type) {
        case "info":
            this.message.css("background-color", _addToScheduleGreen);
            break;
        case "error":
            this.message.css("background-color", _selectAllRed);
            break;
        default:
    }

    this.initHook();
};

BerkeleytimeBox.prototype.autoResize = function () {
    this.parent.append(this.frame);
    this.parent.append(this.box);
    this.box.css("top", (this.parent.outerHeight() - this.box.outerHeight()) / 2);
    this.box.css("left", (this.parent.outerWidth() - this.box.outerWidth()) / 2);
};

BerkeleytimeBox.prototype.drawBox = function (message, content) {
    var html = [
        "<div class='bt-box'>",
            "<div class='message'>",
                message,
            "</div>",
            "<div class='content'>",
                "<p>",
                    content,
                "</p>",
            "</div>",
            this.drawControls(), // will be specified by subclasses
        "</div>"
    ].join("");

    return $(html);
};

BerkeleytimeBox.prototype.onClickOff = function (func) {
    var _this = this;
    this.frame.click(function () {
        func(_this, $(this));
    });
};

BerkeleytimeBox.prototype.show = function () {
    this.frame.fadeIn(this.slideTime);
    this.box.fadeIn(this.slideTime);
};

BerkeleytimeBox.prototype.hide = function () {
    this.frame.fadeOut(this.slideTime);
    this.box.fadeOut(this.slideTime);
};

BerkeleytimeBox.prototype.initHook = function () {};

BerkeleytimeBox.hideBox = function (box) {
    box.hide();
};


/********************************************************************************************************************/
/** BerkeleytimeBox with only "okay" option *************************************************************************/
/********************************************************************************************************************/

OKBerkeleytimeBox = function (options) {
    this.init(options);
};
OKBerkeleytimeBox.extends(BerkeleytimeBox);

OKBerkeleytimeBox.prototype.drawControls = function () {
    return [
        "<div class='controls one-button'>",
            "<button>Okay</button>",
        "</div>"
    ].join("");
};

OKBerkeleytimeBox.prototype.onOkay = function (func) {
    var _this = this;
    this.box.find("button").click(function () {
        func(_this, $(this));
    });
};

OKBerkeleytimeBox.create = function (options) {
    var box = new OKBerkeleytimeBox(options);
    box.onClickOff(options.onClickOff);
    box.onOkay(options.onOkay);
    return box;
};

/********************************************************************************************************************/
/** BerkeleytimeBox with "yes/no" options ***************************************************************************/
/********************************************************************************************************************/

YesNoBerkeleytimeBox = function (options) {
    this.init(options);
};
YesNoBerkeleytimeBox.extends(BerkeleytimeBox);

YesNoBerkeleytimeBox.prototype.drawControls = function () {
    return [
        "<div class='controls two-buttons'>",
            "<button class='no'>No</button>",
            "<button class='yes'>Yes</button>",
        "</div>"
    ].join("");
};

YesNoBerkeleytimeBox.prototype.initHook = function () {
    this.box.find("button.no").css("background-color", _selectAllRed);
    this.box.find("button.yes").css("background-color", _addToScheduleGreen);
};

YesNoBerkeleytimeBox.prototype.onNo = function (func) {
    var _this = this;
    this.box.find("button.no").click(function () {
        func(_this, $(this));
    });
};

YesNoBerkeleytimeBox.prototype.onYes = function (func) {
    var _this = this;
    this.box.find("button.yes").click(function () {
        func(_this, $(this));
    });
};

YesNoBerkeleytimeBox.create = function (options) {
    var box = new YesNoBerkeleytimeBox(options);
    box.onClickOff(options.onClickOff);
    box.onNo(options.onNo);
    box.onYes(options.onYes);
    return box;
};


/********************************************************************************************************************/
/** BerkeleytimeBox with schedule options ***************************************************************************/
/********************************************************************************************************************/

ScheduleBerkeleytimeBox = function (options) {
    this.init(options);
    this.sectionIDs = [];
    this.cancelButton = this.box.find("button.cancel");
    this.surpriseMeButton = this.box.find("button.surprise-me");
    this.content = this.box.find(".content");
};
ScheduleBerkeleytimeBox.extends(BerkeleytimeBox);

ScheduleBerkeleytimeBox.prototype.drawControls = function () {
    return [
        "<div class='box-sections'>",
        "</div>",
        "<div class='controls two-buttons'>",
            "<button class='cancel'>Cancel</button>",
            "<button class='surprise-me'>Pick one for me!</button>",
        "</div>"
    ].join("");
};

ScheduleBerkeleytimeBox.prototype.generateSectionBlock = function (courseID, sectionID, datastore) {
    var sectionData = datastore.lookupSection(courseID, sectionID);
    var days = [];
    $.each(sectionData.days, function (index, num) {
        days.push(time.dayAsString(num).slice(0, 1).toUpperCase());
    });
    days = days.join("/");
    var html = [
        "<div class='box-section'>",
            "<span class='section-detail'>",
                // TODO (noah): use the actual kind abbreviation instead of slicing
                sectionData.kind.slice(0,3).toUpperCase() + " " + sectionData.section_number + ": " + days + " " +
                time.renderTime(sectionData.start_time) + " - " + time.renderTime(sectionData.end_time),
            "</span>",
        "</div>"
    ].join("");
    var block = $(html);
    block.attr("data-section-id", sectionID);
    block.hover(function () {
        $.each(sectionData.related, function (index, relatedID) {
            $(".box-section[data-section-id=" + relatedID + "]").addClass("active");
        });
    }, function () {
        $.each(sectionData.related, function (index, relatedID) {
            $(".box-section[data-section-id=" + relatedID + "]").removeClass("active");
        });
    });
    return block;
};

ScheduleBerkeleytimeBox.prototype.addSection = function (courseID, sectionID, datastore) {
    this.box.find(".box-sections").append(this.generateSectionBlock(courseID, sectionID, datastore));
    this.sectionIDs.push(sectionID);
    this.autoResize();
};

ScheduleBerkeleytimeBox.prototype.extendSections = function (courseID, sectionIDs, datastore) {
    var _this = this;
    $.each(sectionIDs, function (index, sectionID) {
        _this.addSection(courseID, sectionID, datastore);
    });
    this.sectionIDs = this.sectionIDs.concat(sectionIDs);
    this.autoResize();
};

ScheduleBerkeleytimeBox.prototype.getActiveSectionIDs = function () {
    return this.box.find(".box-section.active").map(function () {
        return $(this).data("section-id");
    });
};

ScheduleBerkeleytimeBox.prototype.getRandomSectionID = function () {
    return utils.choice(this.sectionIDs);
};

ScheduleBerkeleytimeBox.prototype.initHook = function () {
    this.box.find("button.cancel").css("background-color", _selectAllRed);
    this.box.find("button.surprise-me").css("background-color", _berkeleytimeBlue);
    this.box.find(".content").css("padding-bottom", "20px");
};

ScheduleBerkeleytimeBox.prototype.onCancel = function (func) {
    var _this = this;
    this.cancelButton.click(function () {
        func(_this, $(this));
    });
};

ScheduleBerkeleytimeBox.prototype.onSurpriseMe = function (func) {
    var _this = this;
    this.surpriseMeButton.click(function () {
        func(_this, $(this));
    });
};

ScheduleBerkeleytimeBox.prototype.onSelectSection = function (func) {
    var _this = this;
    this.box.find(".box-section").click(function () {
        var $this = $(this);
        func(_this, $this.data("section-id"), $this);
    });
};

})(jQuery, time, bt_utils);