var common = common || {};

(function ($){

/**
* Object to encapsulate an invisible (or visible) frame/pane over the entire page.
*
* Instantiate a PageFrame then call .addFrame to put a frame over the whole page.
* When the frame is clicked, a callback will be called and the frame element will be removed.
*
* @constructor
* @param {int} zindex: the z-index to set on the frame - if you want something to be above the frame,
* simply set the z-index here to be lower than the z-index of the element you want above the frame.
* @param {function} fn: the callback to call when the frame is clicked. Accepts no arguments.
* @param {string=} color: optional color to set on the frame (defaults to entirely transparent)
*/
common.PageFrame = function (zindex, fn, color) {
    color = color || "rgba(0,0,0,0)";
    this.color = color;
    this.fn = fn;
    this.zindex = zindex;
    this.setActive(false);
};

/**
* Remove the frame.
* @return {jQuery} this for chaining commands
*/
common.PageFrame.prototype.remove = function () {
    this.frame.remove();
    this.setActive(false);
    return this;
};

/**
* Adds a loading message in the middle of the frame.
* @param {string} message: a message to display while loading
* @return {jQuery} this for chaining commands
*/
common.PageFrame.prototype.addLoader = function (message) {
    if (this.isActive()) {
        this.loader = $(
            "<div class='frame-buffer'></div>"
            + "<div class='frame-loader'>"
                + message
            + "</div>"
        );
        this.frame.append(this.loader);
        this.setLoading(true);
    }
    return this;
};

/**
* Removes the loading message from the middle of the frame.
* @return {jQuery} this for chaining commands
*/
common.PageFrame.prototype.removeLoader = function () {
    if (this.isActive()) {
        this.loader.remove();
        this.setLoading(false);
    }
    return this;
};

/**
* Returns whether we haven't removed the loading message yet.
* @return {boolean} the result
*/
common.PageFrame.prototype.isLoading = function () {
    return this.loading;
};

/**
* Sets whether the page is currently in a loading state.
* @param {boolean} loading: the new loading state
*/
common.PageFrame.prototype.setLoading = function (loading) {
    this.loading = loading;
};

/**
* Returns whether the frame is currently active.
* @return {boolean} whether the frame is currently active.
*/
common.PageFrame.prototype.isActive = function () {
    return this.active;
};

/**
* Sets the frame's current state.
* @param {boolean} active whether the frame is currently active.
*/
common.PageFrame.prototype.setActive = function (active) {
    this.active = active;
    if (!active) {
        this.setLoading(false);
    }
};

/**
* Add the frame. We append it to the body and automatically make it cover the whole page.
* @param {int} fadeTime: the time to fade in
* @return {jQuery} this for chaining commands
*/
common.PageFrame.prototype.addFrame = function (fadeTime) {
    fadeTime = fadeTime || 0;
    if (this.isActive()) {
        this.remove();
    }
    this.frame = $("<div class='frame'></div>");
    this.frame.css("z-index", this.zindex);
    this.frame.css("background-color", this.color);
    $("body").append(this.frame);
    this.setActive(true);
    this.frame.fadeIn(fadeTime);
    var _this = this;
    this.frame.click(function () {
        if (!_this.isLoading()) {
            _this.fn();
            _this.remove();
        }
    });
    return this;
};

})(jQuery);