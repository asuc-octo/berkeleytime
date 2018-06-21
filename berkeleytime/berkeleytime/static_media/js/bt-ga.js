/* Berkeleytime Google Analytics Javascript Library */

var bt_ga = bt_ga || {};

(function() {
    "use strict";

/**
 * Adds Google Analytics on the page for a given account.
 * @param {string} accountID: the Google Analytics Account ID
 */
bt_ga.add = function (accountID) {
    bt_ga.setAccount(accountID);
    bt_ga.trackPageview();
    (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
};

/**
 * Returns whether Google Analytics has been added to the page.
 */
var pageHasGA = function () {
    return typeof _gaq !== "undefined";
}

/**
 * Changes the account number to report to Google.
 * @param {string} accountID: the Google Analytics Account ID
 */
bt_ga.setAccount = function (accountID) {
    if (pageHasGA()) {
        _gaq.push(["_setAccount", accountID]);
    }
}

/**
 * Informs Google Analytics that a URL has been accessed.
 * @param {string} url: (optional) the URL to report.
 */
bt_ga.trackPageview = function (url) {
    if (pageHasGA()) {
        if (url) {
            _gaq.push(["_trackPageview", url]);
        } else {
            _gaq.push(["_trackPageview"]);
        }
    }
};

/**
 * Tells Google Analytics that an event has occured
 * @param {string} category: which app you are reporting for (e.g. "Grades", "Enrollment", etc)
 * @param {string} action: what type of data you are reporting about (e.g. "Added Course", "All Courses")
 * @param {string} label: the data itself (e.g. "COMPSCI 61B-all-all, MATH 1B-all-all")
 * @param {int} value: (optional) an integer value associated with the event
 */
bt_ga.trackEvent = function (category, action, label, value) {
    if (pageHasGA()) {
        return _gaq.push(['_trackEvent', category, action, label, value, true]);
    }
};

})();