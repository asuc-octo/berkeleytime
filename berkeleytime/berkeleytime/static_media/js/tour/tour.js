var tour = tour || {};

(function($) {
"use strict";

/**
* Initializes the grumble tour. Grumble gumble gumple gumbo gump.
* @param {dict} highlights the keys are selectors or jQuery elements, and the values are the options
*               to be passed to grumble
* @param {function} preTour the function to call before the tour.
*                   should take 1 argument, the startTour function.
* @param {function} postTour the function to call when the tour is ended.
*/
tour.startTour = function (highlights, preTour, postTour) {
    var frame = (new common.PageFrame(99999, function () {
        for (var selector in highlights) {
            $(selector).grumble("delete");
        }
        postTour();
    }, "rgba(0, 0, 0, 0.1)")).addFrame(300).addLoader("Loading Tour...");
    var displayTour = function () {
        frame.removeLoader();
        for (var selector in highlights) {
            $(selector).grumble(highlights[selector]);
        }
    }
    preTour(displayTour);
};

})($);
