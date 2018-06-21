
var catalog = (function (w, $, console, _, utils, c) {
    // calscope-util.js
    // Contains utility functions for the Berkeleytime (formerly Calscope) project.
    // Dependencies: calscope-constants.js, seemore.js, jquery-colorbox.js, jquery-ui-slider.min.js
    // Notes: though this file is not directly dependent on crsf-ajax.js, the ajax requests will not work unless it is included.

    "use strict"; //get rid of questionalble code as per JSLint

    /////////////////////////////////////////////////////////////////
    // Selectability functions
    /////////////////////////////////////////////////////////////////

    // Arguments: jQuery selectableElement
    // Return: true if the element has class "active" and "selectable", false otherwise
    // Note: Assumes selectableElement is a length one query. If larger, will return true if the first element is active.
    // If length zero, will return undefined.
    // Note: If the element is not selectable, returns false.
    function isActive(selectableElement) {
        var res;
        if (selectableElement.prop('class') === undefined) {
            // do nothing, res is already undefined
        } else {
            res = selectableElement.hasClass('active') && selectableElement.hasClass('selectable');
        }
        return res;
    }

    // Arguments: jQuery selectableElement
    // Return: true if the element has class "exclusive" and "selectable", false otherwise
    // Note: Assumes selectableElement is a length one query. If larger, will return true if the first element is active.
    // If length zero, will return undefined.
    // Note: If the element is not selectable, returns false.
    function isExclusive(selectableElement) {
        if (selectableElement.prop('class') === undefined) {
            return;
        } else {
            return selectableElement.hasClass('exclusive') && selectableElement.hasClass('selectable');
        }
    }

    // Arguments: jQuery selectable Element
    // Side Effect: removes the 'active' class if the element is active, adds it if it is inactive
    // Note: affects the first in a query for query larger than one, does nothing if selectableElement is a zero length query
    function changeState($elem) {
        var classString = $elem.prop('class');
        if (isActive($elem) && !isExclusive($elem)) {
            //if active and non-exclusive, only make non-active
            $elem.removeClass(c.ACTIVE_CLASS);
        } else if (!isActive($elem) && !isExclusive($elem)) {
            //if non-active and non-exclusive, only make active
            $elem.addClass(c.ACTIVE_CLASS);
        } else if (isActive($elem) && isExclusive($elem)) {
            //if active and exclusive, only make non-active
            $elem.removeClass(c.ACTIVE_CLASS);
        } else if (!isActive($elem) && isExclusive($elem)) {
            //if non-active but exclusive, only make active, but make all other items non-active, and exclusive
            $elem.addClass(c.ACTIVE_CLASS);
            $elem.siblings('li').removeClass(c.ACTIVE_CLASS);
        }
    }

    /////////////////////////////////////////////////////////////////
    // Implementation functions
    /////////////////////////////////////////////////////////////////

    // filter the things based on what is typed in the narrow box
    // note that $list must be the input type=text element of the search bar
    var filterResults = function ($bar, needle) {
        //get the string from the filter bar
        var filterVal = needle.toUpperCase(); //e.g. "Molecul"
        //get the query of elements to check against
        var $searchableSibling = $bar.parent().prop('tagName') === "FORM" ? $bar.parent() : $bar;
        var filterQuery = $searchableSibling.siblings('.searchable').children('ul').children('li:not(.header)'); //everything in the list,
        //eg. "Molecular and Cell Biology 32", "Arabic 1B", ...
        if (filterVal === '') {
            filterQuery.show(); //show all the elements and stop
            return;
        }

        filterQuery.hide(); //hide all

        var f = function (item) {
            return utils.fixClassPseudonym(item);
        };

        filterVal = filterVal.split(" ").map(f).join(" ");

        //.filter takes a function that returns true or false, just like python filter
        filterQuery.filter(function() { //not sure if "index" parameter is needed
            return utils.stringContains($(this).html().toUpperCase(), filterVal); //"this" is the current element in filterquery
        }).show(); //show all relevant

    };

    // Define the actions to take when the breadcrumbs should be update
    // Side Effects: Only breadcrumbs for active filters are shown.
    //TODO
    function updateBreadcrumbs() {
        var closingHTML = '<div class="breadcrumb and"></div>'; //html to be appended to the end of the breadcrumb html
        var html = '';
        // this closing html closes the final breadcrumb group span and creates an "and" button in preparation for the next gorup
        var i;

        for (i=0; i<c.FILTER_TYPES.length; i++) { // go through the list and make a new breadcrumb for each group
            var query = $('.active.selectable.filter[data-category=' + c.FILTER_TYPES[i] + ']');
            if (query.length === 0) {
                // if there are no active filters for this filter type, do nothing
                continue;
            }

            // add a breadcrumb button to the html
            html += '<div class="breadcrumb">';
            //populate the breadcrumb code
            query.each(function() {
                //"this" is a selectable filter of the current filter group (the li, NOT the a)
                html += "<span class='breadcrumb-text' data-filter='" + $(this).prop('id') + "'>" +
                        $(this).html() + "<div class='remove'><i class='icon-remove-sign'></i></div></span>";
            });
            html += '</div>';
            html += closingHTML; //add the "and" button
        }

        if (html) {
            // we have to slice off the html that creates an "and" button after every breadcrumb group
            html = utils.sliceFromRight(html, closingHTML);
        }
        html = '<div class="breadcrumb info"><span class="breadcrumb-text">' +
                'Showing classes in categories:</span></div>' + html; // the html we will eventually put in the breadcrubs area

        $('.breadcrumbs').html(html);

        // bind functionality for removing filters by clicking on their breadcrumbs
        $('.breadcrumb .remove').click(function () {
            //get the filter and simulate a click to take it off
            $('.active.selectable.filter#' + $(this).parent().attr('data-filter')).click();
        });
    }

    var getCorrectKey = function (s) {
        switch (s) {
            case c.GRADE_SORT_CRITERIA:
                return "gpa";
            case c.RATING_SORT_CRITERIA:
                return "rating_average";
            case c.WORKLOAD_SORT_CRITERIA:
                return "workload_average";
            case c.ENROLLED_PERCENTAGE_SORT_CRITERIA:
                return "enrolled_percentage";
            case c.OPEN_SEATS_SORT_CRITERIA:
                return "open_seats";
        }
    };

    // var sortByOpenSeats = function(courses) {
 //        return groupAndSort(courses, 'open_seats', true);
 //    };
 
 //    var sortByPercentEnrolled = function(courses) {
 //        return groupAndSort(courses, 'percent_enrolled', true);
 //    };
 
 //    var sortByAverageGrade = function(courses) {
 //        return groupAndSort(courses, 'gpa', false);
 //    };
 
 //    var sortByWorkload = function(courses) {
 //        return groupAndSort(courses, 'workload_average', true);
 //    };
 
 //    var sortByRating = function(courses) {
 //        return groupAndSort(courses, 'rating_average', false);
 //    };

    var sortCourses = function (sort_criteria) {
        var newCourses = sortOnCriteria($('.course'), sort_criteria, true);
        $('.course-list').html(newCourses);
        updateDisplayConstants(sort_criteria);
    };

    var sortOnCriteria = function (courses, sort_criteria, html) {
        var lower_first;
        if (utils.arrayContains([c.GRADE_SORT_CRITERIA, c.WORKLOAD_SORT_CRITERIA, c.OPEN_SEATS_SORT_CRITERIA], sort_criteria)) {
            lower_first = false;
        } else {
            lower_first = true;
        }

        return groupAndSort(courses, getCorrectKey(sort_criteria), lower_first, html);
    };
 
    var groupAndSort = function(courses, field, lower_first, html) {
        // if we want to pass in a different accessor for sorting html, we pass a check function
        var iterator = html ? function(c) { return $(c).data(field) === -1; } : function(c) { return c[field] === -1; };

        var grouped = _.groupBy(courses, iterator);
        var validCourses = grouped[false] ? sortByCustom(grouped[false], field, lower_first, html) : [];
        return grouped[true] && grouped[true].length > 0 ? validCourses.concat(grouped[true]): validCourses;
    };
 
    var sortByCustom = function(items, field, lower_first, html) {
        var accessor = html ? function (item) {return $(item).data(field);} : function (s) {return s[field];};
        var rst = _.sortBy(items, accessor);
        // if (html) {
        //     rst = rst.map(function (item) {return $(item);});
        // }
        if (lower_first === true) {
            return rst;
        }
        else {
            return rst.reverse();
        }
    };

    // update the display constants of all the courses with a given sort criteria.
    var updateDisplayConstants = function (sort_criteria) {
        $.each($('.course'), function () {
            var constant = getCorrectHTMLDisplayConstant($(this), sort_criteria);
            $(this).children('.display-constant').html(constant)
                                                .css('color', getCorrectDisplayColor(constant, sort_criteria))
                                                .prop('class', 'display-constant ' + sort_criteria);
        });
    };

    var getCorrectDisplayConstant = function (o, s) {
        var rtn;
        if (s == c.GRADE_SORT_CRITERIA) {
            rtn =  o.letter;
        } else {
            rtn = o[getCorrectKey(s)];
        }

        if (rtn == -1) {
            return '';
        } else {
            if (s === c.ENROLLED_PERCENTAGE_SORT_CRITERIA) {
                rtn = '' + Math.floor(rtn*100, 100) + "%";
            }
            return rtn;
        }
    };

    var getCorrectHTMLDisplayConstant = function ($elem, sort_criteria) {
        var rtn;
        if (sort_criteria == c.GRADE_SORT_CRITERIA) {
            rtn =  $elem.data('letter');
        } else {
            rtn = $elem.data(getCorrectKey(sort_criteria));
        }

        if (rtn == -1) {
            return '';
        } else {
            if (sort_criteria === c.ENROLLED_PERCENTAGE_SORT_CRITERIA) {
                rtn = '' + Math.floor(rtn*100, 100) + "%";
            }
            return rtn;
        }
    };

    var getCorrectDisplayColor = function (constant, sort_criteria) {
        if (sort_criteria === c.GRADE_SORT_CRITERIA) {
            return utils.gradeToColor(constant);
        } else {
            return '#4d4d4d';
        }
    };

    // Functions related to the dynamic loading of filter queries and html

    // Define the actions for populating course lists based on JSON
    // Arguments: string filter_string of & separated filter IDs, string sort_criteria, function callback
    // Side Effects: the ul with ID COURSE_LIST_ID as definied in calscope-constants.js is changed to reflect the filters
    // and the sort criteria. Callback is called.
    // Note: This function assumes that the JSON is formatted in compliance with JSON-example.txt. If given improperly
    // formatted JSON, the function will error (or produce unexpected results) and probably nothing will be displayed.
    // Note: if te sort criteria is not found in SORT_CRITERIA, it will default to DEFAULT_SORT_CRITERIA.
    // Note: argument callback need not be specified.
    // Note: if the filter_string or the sort_criteris or both are empty strings, this function will return the course list
    // to the "pick a course" message.
    // Note: this function takes into account that a user may click on one filter that takes 8 seconds to send, recieve, and
    // display, and then another filter which takes 2 second to do the same. Without allowing for this, a user would see the
    // course list mysteriously change if the second request was called within 4 seconds of the first request. Instead, this
    // function sets a global variable at its start, then checks it at its end to make sure it's the same. This means that a
    // malformed request, even one sent after an okay one, will result in an error or unexpected results, but the user will
    // only see this mysterious error if a filter is clicked after this function begins to load the compiled html but before
    // the html is fully loaded.
    var getJSONAndUpdateCourses = function (filter_string, sort, callback) {
        console.log('getJSONAndUpdateCourses called with filter string: ' + filter_string + ' and sort criteria: ' + sort);
        //before we do anything else, set the global to tell everyone that there has been another request.
        //even if this request fails, we don't want undefined functionality for when two requests don't work out asynchronously.
        w._most_recent_requested_query = filter_string;
        // the only way asynchronicity will cause problems now is if two threads try to change this global variable at excatly the same time.

        var sort_criteria = sort; //sort will be used to check recency of request at the end, thus we can't change it.
        if (filter_string === '') {
            callback();
            clearCourseList(true);
            return;
        }

        if (!utils.arrayContains(c.SORT_CRITERIA, sort_criteria) || sort_criteria === undefined) { // if the sort criteria is not recognized
            sort_criteria = c.DEFAULT_SORT_CRITERIA; // reset it to the default sort criteria
            //if this block is executed, there is almost definitely just a typo somewhere.
        }
        clearCourseList(false);
        $('.course-loading').show();

        var html; //html to eventually be added

        $.getJSON('/catalog/filter/' + filter_string + '/', function(data) {
            var course;
            data = sortOnCriteria(data, sort_criteria);
            // Data could tecnically be an array, object, or value, though if properly formatted, it should be an object.
            html = $('<ul></ul>');
            // on the backend can be synced up. This is basically DUMMY COURSES
            $.each(data, function(index, object) { //parse through each class dict and buffer the list items in html
                // at any time, if we know we are not going to add these because another request has superseded us, just stop.
                if (w._most_recent_requested_query !== filter_string) {
                    return false; //will break the "each" loop...isn't jquery great?
                }

                var enrolled_or_regular;
                if (sort_criteria == c.OPEN_SEATS_SORT_CRITERIA) {
                    enrolled_or_regular = " enrolled"; //this will be added as a class to the display constant
                    // we want to display the constant differently if it takes up more space (e.g., with a large number of people)
                } else {
                    enrolled_or_regular = '';
                }

                var constant = getCorrectDisplayConstant(object, sort_criteria);

                course = $("<li class='selectable exclusive course' id='" + object.id + "'></li>");
                course.append("<div class='display-constant " + getSortCriteriaString() + "' style='color: " +
                                getCorrectDisplayColor(constant, sort_criteria) + "'>" + constant + "</div>");
                course.append("<div class='course-listing-content'>" + object.abbreviation +
                                " " + object.course_number + "</div>");

                var newTitle = object.subtitle;
                if (object.subtitle.length > c.COURSE_TITLE_LENGTH) {
                    newTitle = object.subtitle.slice(0, c.COURSE_TITLE_LENGTH - c.COURSE_TITLE_POSTFIX.length);
                    newTitle = newTitle + c.COURSE_TITLE_POSTFIX;
                }

                course.append("<div class='course-listing-info'>" + newTitle + "</div>");
                for (var key in object) {
                    course.attr("data-" + key, object[key]);
                }

                html.append(course);
            });

            html = html || c.NONE_FILTER_LIST_ELEMENT;
            if (w._most_recent_requested_query === filter_string) { // you want to check for this as late as possible to prevent errors.
                $('.course-loading').hide();
                $.when($('.course-list').html(html)).done(function() { // when teh html has been loaded, call the callback
                    callback();
                    bindCourseClick();
                });
            }
        });
    };

    // Return: the currently selected sort criteria, as a string.
    // Note: if there is a disconnect between the value of the sort_criteria select control and the CRITERIA_MAP that
    // maps those values to values accepted by the filters view (i.e., a KeyError in CRITERIA_MAP), this function will
    // throw an IncorrectlyImplementedExcption, because it was an error on our (the developers') part.
    //TODO
    function getSortCriteriaString() {
        var selectVal = $('.sort').val();
        if (!utils.arrayContains(c.SORT_CRITERIA, selectVal)) {
            // if the key is not found, return teh default value
            console.log("Selected value " + selectVal + " could not be mapped to a sort criteria key.");
            throw new utils.ImplementedIncorrectlyException("Selected value " + selectVal + " could not be mapped to a sort criteria key.");
        } else {
            return selectVal;
        }
    }

    // Return: a FILER_STRING_DELIMITER separated string of the IDs of the filters currently selected.
    //TODO
    function getSelectedFilterIDString() {
        var result = [];
        $('.active.selectable.filter').each(function() {
            result.push($(this).prop('id')); //slice off 'filter_', etc
        });
        return result.join(c.FILTER_STRING_DELIMITER);
    }

    // Arguments: string course_id_string, function callback
    // Side Effects: html data determined by the course_id_string is loaded the COURSE_COLLAPSED div,
    // seemore.js functionality is rebound so that it will work with the course description, and callback is called.
    // Note: argument callback need not be specified.
    //TODO
    var getHTMLAndUpdateCourseView = function (course_id_string, callback) {
        var finishUp = function() {
            var grade = $('.avg-grade').html();
            var num = window.parseInt($('.enrolled .numerator').html());
            var den = window.parseInt($('.enrolled .denominator').html());
            $('.grade-info').css('background-color', utils.gradeToColor(grade));
            $('.enrolled').css('background-color', utils.fractionToColor(num, den));
            // $.smrebind(); //remind seemore.js
            // //call callback, if specified
            // $('[rel="tooltip"]').tooltip({placement:'left'});
            // $('[rel="popover"]').popover({placement:'left'});
            // if (callback) {
            //     callback();
            // }
        };
        $('.column.right').load('/catalog/course/'+course_id_string+'/', finishUp); //load HTML straight into the div, call finishUp() when done
        // $(COURSE_EXPANDED_ID_SELECTOR).load('/courses/course_expanded/'+course_id_string+'/', finishUp); //load HTML straight into the div, call finishUp() when done
    };


    // Functions related to populating the fourth column (course collapsed) with dynamic html

    // Side Effect: sets the HTML of the COURSE_COLLAPSED area to default.
    //TODO
    var clearCourseDescription = function () {
        $('.column.right').html(c.NONE_COURSE_LIST_ELEMENT);
    };

    // Side effect: sets the HTML of the course list to the loading default.
    //TODO
    var clearCourseList = function (show_message) {
        $('.course-list').empty(); //empty the current course list
        if (show_message === true) {
            $('.course-list').html(c.NONE_FILTER_LIST_ELEMENT); // display loading sign
        }
    };

    // Side effects: binds the correct functionality to clicks on course listings. (We have to do this when we load
    // new lists of courses, because they weren't there to get the click functionality the first time).
    var bindCourseClick = function () {
        var makeFinalChanges = function() {
            // bindFavoriteFunctionality();
            // bindRateFunctionality();
            // $('.colorbox').colorbox({inline:true, width: "60%", height: "80%"}); //bind colorbox functionality
            // bindSliders();

            // $( "#amount" ).val( "$" + $( "#slider" ).slider( "value" ) );
        };

        $('.course').click(function () {
            if (isActive($(this))) {
                clearCourseDescription();
            } else {
                $('.column.right').html(c.COURSE_LOADING_LIST_ELEMENT);
                getHTMLAndUpdateCourseView($(this).prop('id'), makeFinalChanges); //slice off 'course_' etc
            }
            changeState($(this)); //update the state
        });

    };

    // Return: the ID of the currently selected course as a string, or an empty string if no course is selected.
    var getActiveCourseIDString = function () {
        if ($(c.ACTIVE_COURSE_SELECTOR).length === 0) {
            return '';
        } else {
            return $('.active.course').prop('id');
        }
    };

    // Arguments: string toCut, string fullString, a FILTER_STRING_DELIMITER (&) delimited list of filters with a
    // FILTER_SORT_DELIMITER delimited sort criteria.
    // Return: a copy of fullString with instances of toCut removes and delimiters formatted accordingly, e.g.
    // 1&2&275&14%blah -> 1&275&14%blah
    var cutFromIDString = function (fullString, toCut) {
        var result = fullString.replace(new RegExp(c.FILTER_STRING_DELIMITER + toCut + c.FILTER_STRING_DELIMITER), c.FILTER_STRING_DELIMITER);
        result = result.replace(new RegExp(c.FILTER_STRING_DELIMITER + toCut + c.FILTER_SORT_DELIMITER), c.FILTER_SORT_DELIMITER);
        result = result.replace(new RegExp(toCut + c.FILTER_SORT_DELIMITER), '');
        result = result.replace(new RegExp('^' + toCut + c.FILTER_STRING_DELIMITER), '');
        result = result.replace(new RegExp(toCut), '');
        return result;
    };

    // Side effects: binds the click effects to the add and remove favorites buttons.
    // Note: This needs to be done because since the course collapsed view is loaded dynamically, it may not have been
    // loaded when a .click() function was specified on $(document).ready(). Thus any time we load in HTML, we should call
    // this function. Similarly, anytime we change a Favorited button, we need to call this function.
    // Note: if getActiveCourseIDString() is an empty string, this favorite buttons will be rendered useless. This case should never
    // happen, however, because in order for the user to have clicked a button, there must have been a course loaded in the
    // collapsed view and thus a course active.
    //TODO
    function bindFavoriteFunctionality() {
        $(ADD_FAVORITE_BUTTON_ID_SELECTOR).click(function() {
            if (getActiveCourseIDString() == '') return;
            //send post request
            $.post('/courses/star/' + getActiveCourseIDString() + '/', function(data) {

                getHTMLAndUpdateCourseView(getActiveCourseIDString(), bindFavoriteFunctionality); // this will reload the favorites button as well
                //delayed recursion
            }); //this should always work because getActiveCourseIDString will only be '' when no course is selected and thus no button will ever be clicked

        });
        $(REMOVE_FAVORITE_BUTTON_ID_SELECTOR).click(function() {
            if (getActiveCourseIDString() == '') return;
            //send post request
            $.post('/courses/unstar/' + getActiveCourseIDString() + '/', function(data){
                // changeFavoritedButton($(this));
                getHTMLAndUpdateCourseView(getActiveCourseIDString(), bindFavoriteFunctionality);
            }); //this should always work because getActiveCourseIDString will only be '' when no course is selected and thus no button will ever be clicked
        });
    };

    // Side effects: binds the click effects (on the submit button (the POST_RATING_BUTTON) on the ratings colorbox) to submit a POST ajax request to rate
    // the classes. Likewise with the bindFavoriteFunctionality function, we have to call this every time we load in a new course.
    //TODO
    var bindRateFunctionality = function () {
        $(POST_RATING_ID_SELECTOR).click(function(event) {
            event.preventDefault();

            var course_id = getActiveCourseIDString();
            if (course_id == '') return;

            var practicality, workload, reading, memorization;
            practicality = $(PRACTICALITY).val();
            memorization = $(MEMORIZATION).val();
            workload = $(WORKLOAD).val();
            reading = $(READING).val();

            $.post('/rate/' + course_id + '/', $('#rate_form').serialize(),
            function(data) {
                if (data == AJAX_SUCCESS_STRING) {
                    $.colorbox.close();
                    $('#first_level_container').prepend('<div class="row"><div class="alert alert-success span12"><button class="close" data-dismiss="alert">&times;</button>Thank you! Your course has been rated successfully.</div></div>');
                    getHTMLAndUpdateCourseView(getActiveCourseIDString(), bindFavoriteFunctionality);
                } else {
                    $(RATE_COLORBOX_ID_SELECTOR).prepend('<div class="row-fluid"><div class="alert alert-error span12"><button class="close" data-dismiss="alert">&times;</button>Please make sure all ratings are filled in correctly.</div></div>');
                }
            });
        });
    };

    // Arguments: _this, the jquery this operator OR null, the current filter id string, e.g. 1&234&23 and the current sort criteria string, e.g. "average_grade"
    // Side effects: repopulates the course listing based on the filters and sort critera. If this is null, update courses will
    // proceed as planned. If not null, it will interpret this as a filter and account for it being clicked on.
    // Note: this does NOT set the global _most_recent_requested_query until getJSONAndUpdateCourses is called.
    var updateCourses = function (_this, filter_id_string, sort_criteria_string) {

        var makeFinalChanges = function () { //this stuff will update after the list of courses populates
            // updateBreadcrumbs();
            // bindCourseClick();
            // $('[rel="tooltip"]').tooltip({html: false, placement: 'right'}); //bind tooltip functionality
            if ($('.filter.active').length === 0) {
                clearCourseDescription();
            }
        };

        $(c.COURSE_LIST_ID_SELECTOR).html(c.COURSE_LOADING); //replace whatever the course list has with just "loading" (or a similar message)

        if (_this) {
            var thisID = _this.prop('id');
            if (isActive(_this)) {
                // take out the id and update
                var result = cutFromIDString(filter_id_string, thisID);
                changeState(_this); //update the state after calculating the string to get JSON with
                getJSONAndUpdateCourses(result, sort_criteria_string, makeFinalChanges); //get the json and update!
            } else {
                //put in the id and update
                changeState(_this); //update the state
                // if it is not active, we change the state before getting the JSON, so getSelectedFilterIDStirng will return teh right thing
                // if (_this === null) {
                //     getJSONAndUpdateCourses(filter_id_string, sort_criteria_string, makeFinalChanges);
                // } else {
                getJSONAndUpdateCourses(getSelectedFilterIDString(), getSortCriteriaString(), makeFinalChanges);
                // }
            }
        } else {
            getJSONAndUpdateCourses(filter_id_string, sort_criteria_string, makeFinalChanges);
        }
    };

    return {
        updateCourses: updateCourses,
        selectedFilter: getSelectedFilterIDString,
        selectedSort: getSortCriteriaString,
        changeState: changeState,
        filterResults: filterResults,
        updateBreadcrumbs: updateBreadcrumbs,
        sortCourses: sortCourses,
        loadCourse: getHTMLAndUpdateCourseView,
        selectedCourseID: getActiveCourseIDString
        // testing

    };
})(window, window.jQuery, console, _, bt_utils, constants);