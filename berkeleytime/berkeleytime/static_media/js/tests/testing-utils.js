var T = {};

(function () {
    "use strict";

/**
* Returns a function that takes a list of arguments where the last argument is
* the epected value of the output of func based on the rest of the arguments (in order).
* Note that even though the returned function looks like it doesn't take arguments, it
* can take a variable number using the arguments variable.
* Example:
* var add = function(a, b) {return a+b;};
* var assert_added = make_input_output_asserter(add);
* assert_added(2, 3, 5);
*
* @param func the function whose output we should test
* @para _this optional "this" parameter to pass to func.apply
*/
T.make_input_output_asserter = function (func, _this) {
    _this = _this || {};
    return function () {
        var argsList = Array.prototype.slice.call(arguments);
        var expected = argsList.pop();
        var output = func.apply(_this, argsList);
        if (argsList.length === 1) {
            strictEqual(expected, output, "Input " + argsList[0] + " yielded " + output + "; expected " + expected + ".");
        } else {
            strictEqual(expected, output, "Inputs [" + argsList + "] yielded " + output + "; expected " + expected + ".");
        }
    };
};

/**
* Returns a jQuery of a div encompassing all the elements contained in stage.
* This is necessary because occasionally we want to find out whether a query
* matching the top level element of another query is present, and we can't use
* .find() to do this.
* @param {jQuery} stage
* @return {jQuery} the normalized stage
*/
var _normalize_stage = function (stage) {
    return $("<div>").append(stage);
};

/**
* QUnit check of whether there are a specific number of instances of one query
* contained within another.
* @param {jQuery} stage the haystack container
* @param {string} query the needle, like ".half-hours"
* @param {int} num the expected number of occurances
*/
T.assert_number_in_dom = function (stage, query, num) {
    var results = stage.find(query);
    ok(results.length === num, "Found " + results.length + " of `" + query + "` in the fixture; expected " + num + ".");
};
T.assert_number_in_fixture = function (query, num) {
    T.assert_number_in_dom(T.getFixture(), query, num);
};

/**
* QUnit check - same as assert_number_in_dom, except it does not match elements
* with no content.
* @param {jQuery} stage the haystack container
* @param {string} query the needle, like ".half-hours"
* @param {int} num the expected number of occurances
*/
T.assert_number_with_content_in_dom = function (stage, query, num) {
    var results = stage.find(query);
    var num_with_content = 0;
    $.each(results, function(index, element) {
        if ($(element).html().length > 0) {
            num_with_content++;
        }
    });
    strictEqual(num, num_with_content, "Found " + num_with_content + " elements with content; expected " + num + ".");
};
T.assert_number_with_content_in_fixture = function (query, num) {
    T.assert_number_with_content_in_dom(T.getFixture(), query, num);
};

/**
* QUnit check if a query is in the dom, similar to assert_number_in_dom
* @param {jQuery} stage the haystack container
* @param {string} query the needle, like ".half-hours"
*/
T.assert_in_dom = function (stage, query) {
    stage = _normalize_stage(stage);
    var results = stage.find(query);
    ok(results.length >= 1, "Found " + results.length + " of `" + query + "` in the fixture; expected at least one.");
};

T.assert_in_fixture = function (query) {
    T.assert_in_dom(T.getFixture(), query);
}

/**
* Same as assert_in_dom, but checks for strings instead of elements.
* @param {jQuery} stage the haystack container
* @param {string} text the needle text
*/
T.assert_in_html = function (stage, text) {
    ok(stage.html().indexOf(text) !== -1, text + " should be in the given html.");
};

/**
* Same as assert_in_html, but the opposite.
* @param {jQuery} stage the haystack container
* @param {string} text the needle text
*/
T.assert_not_in_html = function (stage, text) {
    ok(stage.html().indexOf(text) === -1, text + " should not be in the given html.");
};

/**
* Convenience function to return the QUnit fixture element.
* @return {jQuery} the fixture
*/
T.getFixture = function () {
    return $("#qunit-fixture");
};

T.assert_css = function (elem, property, expected) {
    var actual = elem.css(property);
    strictEqual(actual, expected, "Found " + actual + " as css for " + property + "; expected " + expected + ".");
};

})();