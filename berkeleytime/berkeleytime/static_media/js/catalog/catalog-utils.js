var catalog = {};

(function (window, $, _, utils, ga, tour) {
    "use strict";

/**
 * The string currently typed in the text box in the middle column.
 * @type {String}
 */
catalog.lastQuery = "";

/**
* Allows jQueries to be checked for activeness. Note that the $.fn. syntax makes it
* applicable to every jQuery object, but since these are defined within the scope of
* this module they can only be used here. Example: $(".filter[data-id=4]").isActive();
* @return {boolean} whether the object is active or not
*/
$.fn.isActive = function () {
    return this.hasClass("active") && this.hasClass("selectable");
};

/**
* Same thing as isActive, but for exclusiveness.
* @return {boolean}
*/
$.fn.isExclusive = function () {
    return this.hasClass("exclusive") && this.hasClass("selectable");
};

/**
* Change the state of the calling jQuery. Example: $(".filter#465").changeState()
*/
$.fn.changeState = function () {
    if (this.isActive()) {
        this.removeClass("active");
    } else {
        this.addClass("active");
        if (this.isExclusive()) {
            this.siblings("li").removeClass("active");
        }
    }
};

var _filterTypes = ['department', 'ls', 'engineering', 'haas', 'chemistry', 'university',
                    'custom', 'level', 'units', 'semester', 'days', 'time_of_day', 'time', 'length', 'enrollment'];
/**
* Update the breadcrumbs. Note that this will automatically look at the selected
* filters and populate the given container with the correct breadcrumbs, including
* generating the (and) for filters which are in the same section.
*
* @param {jQuery} breadcrumbContainer the container to update
*/
catalog.updateBreadcrumbs = function (breadcrumbContainer) {
    breadcrumbContainer.children(".breadcrumb").remove();
    var remove = $("<div class='remove'><i class='icon-remove-sign'></i></div>");
    var and = $("<div class='breadcrumb and'></div>");

    var relevantTypes = _filterTypes.filter(function (filter) {
        return $(".active[data-category=" + filter + "]").length !== 0;
    });


    $.each(relevantTypes, function (index, filterType) {
        var filters = $(".active.selectable.filter[data-category=" + filterType + "]");
        var breadcrumb = $("<div class='breadcrumb'>");
        filters.each(function () {
            var $this = $(this);
            var htmlContent = $("<span class='breadcrumb-text' data-filter='" + $this.prop('id') + "'>");
            htmlContent.text($this.text()); // set text of breadcrumb to corresponding filter text
            htmlContent.append(remove.clone());
            breadcrumb.append(htmlContent); // "/" will also be appended in the CSS
        });
        breadcrumbContainer.append(breadcrumb);
        // append an "and" if it's not the last one in the list
        if (index !== relevantTypes.length - 1) {
            breadcrumbContainer.append(and.clone());
        }
    });

    // make sure a breadcrumb removes itself when the x is clicked
    $(".remove").click(function () {
        $(".active.selectable.filter#" + $(this).parent().attr('data-filter')).click();
    });
};

/**
* Filter filters by name. Removes header (siblings of .searchable) if the number of
* searchables between itself and the next header is 0. This way, there won't be a
* header like "University Requirements" if there are no actual university requirements
* shown because the user typed in "L&S", or something like that.
*
* @param {string} target to be found in searchables
*/
catalog.filterFilters = function (searchables, target) {
    searchables.hide();
    searchables.removeClass("first-filter");

    // var showCount = 0;
    searchables.each(function (index, searchable) {
        var $this = $(this);
        if ($this.html().toLowerCase().indexOf(target.toLowerCase()) !== -1) {
            $this.show();
        }
    });

    var ulElement = $(searchables[0]).parent();
    ulElement.find('li.header').each(function () {
        var $this = $(this);
        if ($this.nextUntil(".header").not(":hidden").length === 0) {
            $this.hide();
        } else {
            $this.show();
        }
        //if this header is currently displayed, select the first filter
        if ($this.css("display") !== "none") {
            $this.nextUntil('.header').filter(':visible:first.filter').addClass("first-filter");
        }
    });
};

/**
 * Filter all the courses in the middle column of the page by whether or not they
 * match the given query that the user typed into the search bar. Note that this
 * function will ACTUALLY update the html, unlike filterCourses, which is a utility
 * function.
 *
 * @param  {string} query the string that is in the text box
 * @param  {Event}  e     the keypress event that triggered the filter. Used to check
 *     which key was pressed, since we want to do special things for backspace.
 */
catalog.filterAndUpdateCourses = function (query, e) {
    var filteredCourses;
    if (catalog.lastQuery === query) {
        return;
    } else if (
        // if they did anything else other than type another letter on the end of their query,
        // we filter down from *all* the courses
        e.keyCode === 8 || // backspace
        catalog.lastQuery.length > query.length || // if they cut some of the text off from the end
        catalog.lastQuery !== query.slice(0, -1) ||// if they went back and changed some random part of the word that was not the last letter
        utils.laymanToAbbreviation.hasOwnProperty(query.toUpperCase()) // discrepancy between E and EE, IE and IEOR
    ) {
        filteredCourses = catalog.filterCourses(catalog.allCourses, query);
    } else {
        // if they just typed another letter, we filter from the currently displayed courses instead of all
        // of them, for speed purposes.
        filteredCourses = catalog.filterCourses(catalog.displayedCourses, query);
    }
    catalog.lastQuery = query;
    catalog.displayedCourses = filteredCourses;
    catalog.updateCatalog(filteredCourses, catalog.getSortKey());
};

/**
 * Filter and return a list of courses by a given search string. Note that this function
 * also performs some special magic on the query (for example, mapping CS -> COMPSCI),
 * so it's not just regular string matching.
 *
 * @param  {Array<Object>} courses The courses to search through
 * @param  {String} query The string to match against
 * @return {Array<Object>} The filtered list of courses.
 */
catalog.filterCourses = function (courses, query) {
    if ($.trim(query) === "") { return courses; }
    var querySplit = query.toUpperCase().split(" ");
    // to protect against things like "civ e" mapping to "civ engin", we only apply the fixClassPseudonym function to the first word.
    querySplit[0] = utils.fixClassPseudonym(querySplit[0]);
    query = query.toLowerCase();
    var pseudoQuery = querySplit.join(" ").toLowerCase();
    // if query has multiple words, only use pseud version.
    // so things like 'e 120' don't go to 'chinese 120'
    var useOriginalQuery = (querySplit.length === 1 && query !== pseudoQuery);
    var data = [];
    for(var i = 0; i < courses.length; i++) {
        var course = courses[i];
        if((useOriginalQuery && catalog.courseMatches(course, query)) ||
            catalog.courseMatches(course, pseudoQuery)) {

            data.push(course);
        }
    }
    return data;
};

/**
 * Tests whether the provided course contains the query string
 * in its abbreviation and course number, its description, or its department.
 *
 * Also takes into account that some course numbers have 'C' and some do not,
 * and compares the query to both versions of each course number.
 *
 * @param  {Object} course The course object we are testing
 * @param  {string} query The query string to match against
 */
catalog.courseMatches = function (course, query) {
        var courseMatches = (course.abbreviation + " " + course.course_number + " " + course.title + " " + course.department).toLowerCase().indexOf(query) !== -1;
        var otherNumber;
        if (course.course_number.indexOf("C") !== -1) { // if there is a c in the course number
            otherNumber = course.course_number.substring(1);
        } else { // if there is not a c in the course number
            otherNumber = "C" + course.course_number;
        }
        var courseFixedForCMatches = (course.abbreviation + " " + otherNumber + " " + course.title + " " + course.department).toLowerCase().indexOf(query) !== -1;
        return courseMatches || courseFixedForCMatches;
};


/**
 * Sorts the list of all courses on the page by the given key (from the "sort courses"
 * dropdown) and displays the new courses in sourted, filtered order.
 *
 * @param  {string} key the key to sort on, e.g. grade_average, favotite_count, etc.
 *     for all possible keys, see the sort_criteria element in the catalog.html
 */
catalog.sortAndUpdateCourses = function (key) {
    var sortedCourses = catalog.sortCourses(catalog.allCourses, key);
    var filteredCourses = catalog.filterCourses(sortedCourses, $('.narrow-course').val());

    catalog.allCourses = sortedCourses;
    catalog.displayedCourses = filteredCourses;
    catalog.updateCatalog(filteredCourses, key);
};

/**
 * Sort keys for which a higher value is a better value.
 * @type {Array}
 */
var _higherBetter = ["grade_average", "open_seats", "favorite_count"];

/**
* Sorts the given courses on the given key. if isHTML, displays the correct display contants.
* @param {Array} courses
* @param {string} key to sort on
*/
catalog.sortCourses = function (courses, key) {
    var sortedCourses = catalog.groupAndSortOnKey(courses, key);
    catalog.allCourses = sortedCourses;
    return sortedCourses;
};

/**
* Groups together the given objects by whether or not they
* have an attribute key, and sorts the ones that do on the given key.
* @param {Array} courses to sort
* @param {string} key to sort on
* @return {Array} the sorted courses
*/
catalog.groupAndSortOnKey = function (courses, key) {
    var higherFirst = _higherBetter.indexOf(key) !== -1;
    var grouped = _.groupBy(courses, function (element) { return element[key] === -1; });
    var validCourses;
    if (grouped[false]) {
        validCourses = _sortByCustom(grouped[false], key, higherFirst);
    } else {
        validCourses = [];
    }

    return grouped[true] ? validCourses.concat(grouped[true]) : validCourses;
};

/**
 * Return a function which, given an object, will retrive the {key} property of that object.
 * @param  {string} key
 * @return {function(Object)}
 */
var _get = function (key) {
    return function (element) {
        return element[key];
    }
};

/**
 * Sort the given items (array of objects) by the given key (string) based on whether
 * a higher value is a better value and return the sorted list.
 */
var _sortByCustom = function (items, key, higherIsBetter) {
    var getKey = _get(key);
    if (higherIsBetter) {
        return _.sortBy(items, getKey).reverse();
    }
    return _.sortBy(items, getKey);
};

/**
 * Return a display constant to show for the given course in a list that is sorted by
 * the given sort key (from the sorting dropdown).
 *
 * What is a display constant, you ask? In the center column of the catalog page, we
 * have cells that represent classes. At the right side of the cells, we'll display
 * something like "A+" if the list is sortd by grade, or "100" if the list is sorted
 * by number of people enrolled. This thing that we display is called the display
 * constant.
 *
 * We need to have this function because we need to be able to update the display constants
 * when the method of sorting (e.g. by grade or by seats) changes.
 */
catalog.getCorrectDisplayConstant = function (course, key) {
    // handles special case
    if (key === "grade_average" || key === "abbreviation") {
        key = "letter_average";
    }
    var getKey = _get(key);
    var constant = getKey(course);

    if (constant === -1 || constant === null || constant === undefined) {
        return "";
    }
    if (key === "enrolled_percentage") {
        return Math.floor(constant*100, 100);
    }
    return constant;
};

/**
 * Given a display constant (see above) and a sort key from the dropdown, return a hex
 * string representing the color to show. E.g., we return a gree color if the display
 * constant is an A+ and the list is sorted by average grade, though we may return a red
 * color if constant is a C-.
 */
catalog.getCorrectDisplayColor = function (constant, key) {
    if (key === "grade_average" || key === "abbreviation") {
        return utils.gradeToColor(constant);
    } else if (key === 'enrolled_percentage') {
        return utils.percentToColor(constant);
    } else if (key === 'favorite_count') {
        return "#da3b42";
    } else {
        return "#4d4d4d";
    }
};

/**
 * Return the value of the "sort courses" dropdown. This is the string that is used in
 * the above functions as the sort key.
 */
catalog.getSortKey = function () {
    return $(".sort").val();
};

/**
 * Return string which represents the database ids of the selected filters, comma separated.
 * E.g. "5,2,4,7,12"
 */
catalog.getFilterString = function () {
    return $(".active.filter").map(function () {
        return this.id;
    }).get().join(",");
};

/**
 * Empty the right column of the screen (e.g. if someone clicked on a selected course).
 */
var _clearRightColumn = function () {
    $(".column.right").html("");
};

/**
 * Emtpy out the center column of all html. Useful for when we get new data via AJAX.
 */
var _clearCenterColumn = function () {
    $(".course-list").html("");
};

/**
* Binds click events behavior to all course elements.
*/
var _bindCourseClick = function () {
    $(".course").click(function () {
        var $this = $(this);
        if ($this.isActive()) {
            _clearRightColumn();
        } else {
            catalog.getHTMLAndUpdateCourse($this.attr("data-course_id"), _bindRightColumnEvents);
        }
        $this.changeState();
    });
};

/**
* Bind events to elements in the right (course description) column. This is useful because we
* have to re-bind events to elements when we get new data, because the elements will be newly
* created.
*/
var _bindRightColumnEvents = function () {
    $(".section-info-button").click(function () {
        courseBox.initCourseBox("current", catalog.getActiveCourse());
    });
    $(".description-info-button").click(function () {
        courseBox.initCourseBox("overview", catalog.getActiveCourse());
    });
    $(".favorite-icon").click({id: catalog.getActiveCourse()}, courseBox.toggleFavorite);

    /* TODO (*) This is kind of inefficient */
    var $recommendedTextbookActionArea = $(".recommended-textbook-action-area");

    $recommendedTextbookActionArea.click(function(event) {
        if ($(this).data("amazon-affiliate-url")) {
            window.open($(this).data("amazon-affiliate-url"),'_blank');
        }

        var isbn = $(this).data("isbn") || null;
        var ctaType = $(this).data("cta-type") || "";
        ga.trackEvent("Recommended Textbook", "Click: " + ctaType, isbn);
    });

    $recommendedTextbookActionArea.mouseover(function(event) {
        var isbn = $(this).data("isbn") || null;
        var ctaType = $(this).data("cta-type") || "";
        ga.trackEvent("Recommended Textbook", "Hover: " + ctaType, isbn);
    });

    if ($recommendedTextbookActionArea.length) {
        var isbn = $recommendedTextbookActionArea.data("isbn") || null;
        var ctaType = $recommendedTextbookActionArea.data("cta-type") || "";
        ga.trackEvent("Recommended Textbook", "Impression: " + ctaType, isbn);
    } else {
        ga.trackEvent("Recommended Textbook", "No Impression: " + ctaType, null);
    }
    /******************/

    /* Textbook Table */
    var $textbookActionArea = $(".course-textbook-container .textbook-action-area");

    $($textbookActionArea).click(function(event) {
        if ($(this).data("amazon-affiliate-url")) {
            window.open($(this).data("amazon-affiliate-url"),'_blank');
        }

        var isbn = $(this).data("isbn") || null;
        ga.trackEvent("Textbook", "Click", isbn);
    });

    $($textbookActionArea).mouseover(function(event) {
        var isbn = $(this).data("isbn") || null;
        ga.trackEvent("Textbook", "Hover", isbn);
    });

    // $(".course-info").scroll(function(event) {
    //     TODO (*) Implement this
    // })
};

/**
 * Return formatted text to display in the right side of the center column boxes.
 * Note that this may just be the display constant, or it may be the display constant,
 * formatted in some way (e.g. we add a percent sign for enrolled_percentage).
 * @param  {String} displayConstant the display constant
 * @param  {String} key             the sort key currently activated
 * @return {String}
 */
catalog.getCorrectDisplayText = function (displayConstant, key) {
    if (displayConstant !== "" && key === "enrolled_percentage") {
        return displayConstant + "%";
    } else if (key === "grade_average") {
        return displayConstant.replace("-", "&ndash;");
    } return displayConstant;
};

/**
* Takes a single JSON course object and returns an HTML representation of the course
* @param {Object} element an object representing a course
* @param {string} key for which display constant to show
* @return {string} JSON course object as HTML string
*/
var _courseToHTML = function (element, key) {
    var displayConstant = catalog.getCorrectDisplayConstant(element, key);
    return "" +
    "<li class='selectable exclusive searchable course' data-course-name='" + element.abbreviation + " " + element.course_number +
    "' data-course_id=" + element.id + ">" +
        "<div class='course-text-container'>" +
            "<div class='course-title'>" + element.abbreviation + " " + element.course_number + "</div>" +
            "<div class='course-subtitle'>" + element.title + "</div>" +
        "</div>" +
        "<div class='display-constant " + key + "' style='color:" + catalog.getCorrectDisplayColor(displayConstant, key) + ";'>" +
            catalog.getCorrectDisplayText(displayConstant, key) +
        "</div>" +
    "</li>";
};

/**
 * Return a string representing amazon promotional HTML for displaying at the top of the course list.
 */
var _amazonPromotionHTML = function(data) {
    // TODO(noah): this shit templating is old school, we need a better way
    return "<div class='amazon-promotion'>" +
        '<a class="amazon-promotion-cta-link" target="_blank" href="' + data.url + '">' +
            "<div class='promo-image-container amazon-promotion-component'>" +
                "<img class='promo-image' src='" + data.image_url + "' />" +
            "</div>" +
            "<div class='amazon-promotion-info amazon-promotion-component'>" +
                "<div class='amazon-promotion-title'>" + data.title + "</div>" +
                "<div class='amazon-promotion-description'>" + data.description + "</div>" +
            "</div>" +
        '</a>' +
        '<img src="' + data.tracking_pixel_url + '" width="1" height="1" border="0" alt="" style="position: absolute; top: 0; left: 0; border:none !important; margin:0px !important;" />' +
    "</div>"
};

/**
 * Return an HTML string representing the list of given courses, sorted with the given sort key.
 */
catalog.courseListToHTML = function (data, key, promotions) {
    var html = "<ul>";
    var batchSize = 15;
    $.each(data, function (index, element) {
        if (index % batchSize == 0 && promotions[Math.floor(index / batchSize)]) {
            var promotionHTML = _amazonPromotionHTML(promotions[Math.floor(index / batchSize)]);
            html += promotionHTML;
        }
        html += _courseToHTML(element, key);
    });
    html += "</ul>";
    var query = $(html);
    query.find(".amazon-promotion").prev(".course").addClass("bottom-border");
    return query.html();
};

/**
 * Return a function which process the AJAX response which contains the courses information.
 * In particular, the response processor will take the courses as a list of json objects, sort
 * them, filter them, bind events to them, hide the loading spinner, then display the courses.
 *
 * Also, will call the callback when finished, if one is provided.
 * @param  {String}   key          the sort key to sort the retrived data on
 * @param  {String}   filterString the string to filter the displayed courses on
 *    Note that whatever the filter string, ALL the courses will still be kept in catalog.allCourses.
 * @param  {Function|undefined} callback     callback to call when finished
 * @return {function(courses)} the response processor function
 */
var _makeResponseProcessor = function (key, filterString, callback) {
    return function (courses) {
        var promotions = window.promotions;
        var sortedCourses = catalog.sortCourses(courses, key);
        var html = catalog.courseListToHTML(sortedCourses, key, promotions);
        //cannot use getFilterString since filterString may not be initialized in the same order of DOM elements
        if (catalog.latestRequest === filterString ) {
            catalog.allCourses = sortedCourses;
            catalog.displayedCourses = sortedCourses;
            $(".course-loading").hide();
            if (catalog.displayedCourses.length === 0) {
                $(".course-list").html(catalog.noResults());
                $(".default-filter-link").click(catalog.getDefaultCourses);
            } else {
                $(".course-list").html(html);
                _bindCourseClick();
            }
        }
        if (callback) {
            callback();
        }
    };
};

/**
 * Update the catalog page with the given courses and sort key. This will show
 * the "no results" html if there are no results, and is useful for when we update
 * the page after the user types in the search bar.
 *
 * @param  {Array<Object>} data courses (from json)
 * @param  {String} key the sort key
 */
catalog.updateCatalog = function (data, key) {
    $(".course-loading").hide();
    var $courseList = $(".course-list");
    if (data.length === 0) {
        $courseList.html(catalog.noResults());
        $(".default-filter-link").click(catalog.getDefaultCourses);
    } else {
        var html = catalog.courseListToHTML(data, key, window.promotions);
        $courseList.html(html);
        _bindCourseClick();
    }
};

/**
 * Main entrypoint for getting data for the catalog page. Will make an AJAX request and
 * use the data in the response (from the backend) to update the page's HTML.
 * @param  {String}   filterString           String to filter the courses on
 * @param  {Boolean}   shouldClearRightColumn Whether or not to clear the right column of the page
 *     (usually, you will want to do this).
 * @param  {Function} callback               Callback to call when all has been said and done and updated.
 */
catalog.getJSONAndUpdateCourses = function (filterString, shouldClearRightColumn, callback) {
    shouldClearRightColumn = shouldClearRightColumn === undefined ? true : shouldClearRightColumn;
    if (shouldClearRightColumn) {
        _clearRightColumn();
    }

    filterString = filterString || catalog.getFilterString();
    catalog.latestRequest = filterString;
    $(".course-loading").show();
    _clearCenterColumn();
    $.getJSON("/catalog/filter/", {filters: filterString}, _makeResponseProcessor(catalog.getSortKey(), filterString, callback));
};

/**
 * Given a course's database id, make a request which will return HTML for the right column
 * of the page with that course's information. Note that the /catalog/course/<id>/ endpoint
 * does *not* return JSON like the others - instead, we render a template and jquery.load it.
 * @param  {int|String}   courseID the course id to query
 * @param  {Function} callback a callback to call when everything has been updated.
 */
catalog.getHTMLAndUpdateCourse = function (courseID, callback) {
    var url = "/catalog/course/" + courseID + "/";
    $(".column.right").load(url, function () {
        ga.trackEvent("Third Column", "View Course", $(".column.right .title").html());
        callback();
    });
};

/**
 * The other main entrypoint for the catalog page. This is used when the user enters the page
 * from a direct link e.g. /catalog/COMPSCI/161/. The returned data, in this case, will only
 * have the one class included, so it will be as if the user had typed in the class name
 * and clicked on the class box in the center column.
 * @param  {int|String} courseID the database id of the course to get
 */
catalog.getCourseWithLink = function (courseID) {
    $.getJSON("/catalog/filter/", {course_id: courseID}, function (data) {
        catalog.allCourses = data;
        catalog.displayedCourses = data;

        catalog.updateCatalog(data, catalog.getSortKey());

        var $courseSelectable = $("[data-course_id=" + courseID + "]");
        $courseSelectable.changeState();
        $courseSelectable.parent().append(_courseLink());
        $(".default-filter-link").click(catalog.getDefaultCourses);
    });

    catalog.getHTMLAndUpdateCourse(courseID, _bindRightColumnEvents);
};

/**
 * Populate the page with the default filters. Useful for when there are no more courses
 * and the user clicks "restore defaults", etc.
 */
catalog.getDefaultCourses = function () {
    var filterIDs = defaultFilterString.split(",");
    $('.filter').removeClass("active");
    $('#' + filterIDs.join(',#')).addClass("active");
    catalog.updateBreadcrumbs($(".breadcrumbs"));

    window.history.replaceState(null, null, '/catalog/');
    catalog.getJSONAndUpdateCourses(defaultFilterString, false);
};

/**
* Starts the catalog tour.
*/
catalog.tour = function () {
    var firstFilter = ".tab-pane.active .filter:first";
    var firstFilterWasSelected = !$(firstFilter).isActive();
    var highlights = {
        "#section_select": {
            text: "Select a course, semester, section (or all sections) and add it here."
        },
        ".course-list": {
            text: "Courses corresponding to the selected filters",
            angle: 180,
            distance: -250
        },
        ".tab-pane.active .filter:first": {
            text: "Filter classes using these tabs",
            angle: 0,
            distance: 25
        },
        ".tab3": {
            text: "Select the type of filter",
            angle: 90,
            distance: 20
        },
        ".breadcrumb:last": {
            text: "Currently selected filters",
            angle: 90,
            distance: 50
        },
        ".enrolled-text-box": {
            text: "Grade Distributions and Enrollment Timeline",
            angle: 65,
            distance: 65
        },
        ".section-info-button": {
            text: "All sections for this course",
            angle: 85,
            distance: 80
        }
    };
    var preTour = function (displayTour) {
        window.history.replaceState(null, null, '/catalog/');
        $('.narrow-course').val("");
        var firstFilterWasSelected = !$(firstFilter).isActive();
        if (firstFilterWasSelected) {
            $(firstFilter).changeState();
        }
        catalog.getJSONAndUpdateCourses(catalog.getFilterString(), true, function () {
            var $course = $(".course:nth-child(3)");
            $course.changeState();
            catalog.getHTMLAndUpdateCourse($course.attr("data-course_id"), function () {
                _bindRightColumnEvents();
                displayTour();
            });

        });
        catalog.updateBreadcrumbs($(".breadcrumbs")); //container for all breadcrumbs
    };
    var postTour = function () {
        if (firstFilterWasSelected) {
            $(firstFilter).click();
        }
    };
    tour.startTour(highlights, preTour, postTour);
};

/**
* Gets the currently active course's courseID.
*/
catalog.getActiveCourse = function () {
    var query = $(".active.course");
    if (query.length === 0) {
        return "";
    }
    return query.attr("data-course_id");
};

/**
 * Gets an initial help text link as an html string. Used when the user enters the page
 * via the /COMPSCI/161/ style entrypoint.
 */
var _courseLink = function () {
    return "<div class='help-text'>Click on a filter on the right, or <span class='default-filter-link blue-link'>here</span> to show all courses this semester.</div>";
};

/**
 * Return html to show when there are no filtered course results.
 */
catalog.noResults = function () {
    var html = "" +
    "<div class='no-results-container'>" +
        "<div class='no-results-header'>No Courses Found.</div>" +
        "<div class='search-tips'>Search tips:</div>" +
        "<ul>" +
            "<li>Try selecting less filters to widen your search.</li>" +
            "<li>Browse through different tabs and filters on the left.</li>" +
            "<li>Use different search terms (ie. Shakespeare).</li>" +
            "<li>Click <span class='default-filter-link blue-link'>here</span> to show all courses offered this semester.</li>" +
        "</ul>" +
    "</div>"
    return html;
};

})(window, $, _, bt_utils, bt_ga, tour);
