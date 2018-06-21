// bt-enrollment-utils.js
// functions for enrollment funtionality of berkeleytime

var enrollment = {};

(function (window, $, console, _, d3, utils, ga, tour) {
"use strict";

var onCourseChange = function () {
    $("#select_semester").prop("disabled", false);
    $("#select_section").prop("disabled", false);
    enrollment.updateSemesters(enrollment.checkAlreadyAdded);
};

var onSemesterChange = function () {
    enrollment.updateSections();
    enrollment.checkAlreadyAdded();
};

/**
 * Matcher function to allow layman abbreviation matches, e.g. "cs" -> "COMPSCI"
 * @param  {string} term The search term entered by the user
 * @param  {string} text The text in a dropdown item to match
 * @return {boolean}      True if the term matches the text according to our layman
 *                             abbreviations
 */
var matcher = function (term, text) {
    var words = term.trim().toUpperCase().split(" ");
    words[0] = bt_utils.fixClassPseudonym(words[0]);
    return text.indexOf(words.join(" ")) > -1;
};

function asdf() {
    console.log("yesyesyes");
}

enrollment.initCourseSelect = function () {
    var $courses = $("#select_course");
    $.fn.select2.amd.require(['select2/compat/matcher'], function (oldMatcher) {
      $courses.select2({
        width: "100%",
        placeholder: "Search for a class...",
        matcher: oldMatcher(matcher),
        containerCssClass: "select_wrapper"
      })
    });
    $courses.on("select2:select", onCourseChange);
};

enrollment.initSemesterSelect = function (destroyPrevious) {
    var $semester = $("#select_semester");
    if (destroyPrevious) {
        $semester.select2("destroy");
    }
    $semester.select2({
        width: "100%",
        placeholder: "Select a semester...",
        containerCssClass: "select_wrapper"
    });
    $semester.on("select2:select", onSemesterChange);
};

enrollment.initSectionSelect = function (destroyPrevious) {
    var $section = $("#select_section");
    if (destroyPrevious) {
        $section.select2("destroy");
    }
    $section.select2({
        width: "100%",
        placeholder: "Select a section...'",
        containerCssClass: "select_wrapper"
    });
    $section.on("select2:select", enrollment.checkAlreadyAdded);
};

/**
* Given an enrollment datapoint, return true if we should display it
* or false if not. This is applied to the data before rendering it so
* as not to show all 365 days of telebears (we cap it at 250).
* @param {object} point: the data point (has a day attr which is an int)
*/
var _filterDataPoints = function (point) {
    return point.day < 250;
};

var _nonCurrentSectionIsSelected = function () {
    var found = false;
    $(".section-container").each(function (index, item) {
        var $item = $(item);
        if ($item.data("semester") !== window.CURRENT_SEMESTER ||
            // have to implicitly convert to string here - will break if one of them is a number:
            "" + $item.data("year") !==  "" + window.CURRENT_YEAR) {
            found = true;
            return false;
        }
    });
    return found;
};

// Arguments: key, either "enrolled" or "waitlisted", depending on which graph we want to see
//            transform, a transformation function, if we want to manipulate the enrollment data before displaying it
// SideEffects: updates the graph with data from all added sections/aggregates
var updateGraph = function (key, transform) {
    key = key || "enrolled";

    var sectionDatas = getAllEnrollmentData();

    if (sectionDatas.length > 1)
        key += "_percent";

    sectionDatas = sectionDatas || sectionDatas.map(transform);

    var getCorrectMax = function (data) {
        if (key === "enrolled")
            return data.enrolled_max;
        else
            return 100;
    };

    var getCorrectRangeMax = function (data) {
        switch(key) {
            case "enrolled":
                return data.enrolled_scale_max;
            case "waitlisted":
                return data.waitlisted_scale_max;
            case "enrolled_percent":
                return data.enrolled_percent_max;
            default:
                return data.waitlisted_percent_max;
        }
    };

    var getCorrectYText = function () {
        switch (key) {
            case "enrolled":
                return "Students Enrolled";
            case "waitlisted":
                return "Students Waitlisted";
            case "enrolled_percent":
                return "Percentage Enrolled";
            default:
                return "Percentage Waitlisted";
        }
    };

    var domainMax = d3.max(sectionDatas, function (e) {return d3.max(e.data, function (d) {return d.day;}); }) > 85 ?
                    d3.max(sectionDatas, function (e) {return d3.max(e.data, function (d) {return d.day;}); }) + 5:
                    90;
    domainMax = d3.min([domainMax, 250]);

    var getCorrectButtons = function () {
        var enrolled = key.indexOf("waitlisted") === -1;
        return [{text: "Enrolled", classname: enrolled ? "selected" : "unselected", position: 0, data: "enrolled"},
                {text: "Waitlisted", classname: !enrolled ? "selected" : "unselected", position: 65, data: "waitlisted"}];
    };

    // Return an object of the form {day: 14, enrolled: 164, waitlisted: 3, percent: 46.6} that
    // represents what should be treated as the current information for this sectionData.
    // If the sectionData passed is an old aggregation, it will return the maximum of the days
    // and the final enrollment
    var getCorrectNowFromData = function (sectionData, accessor) {
        // this function will change with different ui decisions for how the "now" functionality works
        // return {day: 14, enrolled: 164, waitlisted: 3, percent: 46.6};
        var dayDiff = moment().diff(sectionData.telebears.phase1_start_date, "days");
        var newData = accessor(sectionData.data);
        var day = dayDiff + 1;

        var lastDay = newData[newData.length - 1];

        return {day: day,
                enrolled: lastDay.enrolled,
                waitlisted: lastDay.waitlisted,
                enrolled_percent: lastDay.enrolled_percent,
                waitlisted_percent: lastDay.waitlisted_percent};
    };

    // Given a polygon/polyline, create intermediary points along the
    // "straightaways" spaced no closer than `spacing` distance apart.
    // Intermediary points along each section are always evenly spaced.
    // Modifies the polygon/polyline in place.
    var midMarkers = function (poly,spacing) {
        var svg = poly.ownerSVGElement;
        for (var pts=poly.points,i=1;i<pts.numberOfItems;++i){
            var p0=pts.getItem(i-1), p1=pts.getItem(i);
            var dx=p1.x-p0.x, dy=p1.y-p0.y;
            var d = Math.sqrt(dx*dx+dy*dy);
            var numPoints = Math.floor( d/spacing );
            dx /= numPoints;
            dy /= numPoints;
            for (var j=numPoints-1;j>0;--j){
                var pt = svg.createSVGPoint();
                pt.x = p0.x+dx*j;
                pt.y = p0.y+dy*j;
                pts.insertItemBefore(pt,i);
            }
            if (numPoints>0) i += numPoints-1;
        }
    };

    // here's where the SHIT GOES DOWN
    // okay so if there is already a graph, remove it
    $("svg").remove();
    $(".welcome").hide();

    if (sectionDatas.length === 0) {
        return;
    }

    //margins
    var w = $("#graph").width(),
        h = $("#graph").height(),
        margin = {top: h/13, right: w/46, bottom: h/20, left: w/23},
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;

    // scales
    // x maps the min to the max of days sine telebears to a pixel position
    // y maps 0 to the max percent enrolled to a pixel position
    var rangeMax = function (sectionDatas) {
        // return d3.max(sectionDatas, function (e) {return d3.max(e.data, function (d) {return d[key];}); }) + 10;
        return d3.max(sectionDatas, function (d) {return getCorrectRangeMax(d);});
    };

    var x = d3.scale.linear()
        .domain(
            [d3.min(sectionDatas, function (e) {return d3.min(e.data, function (d) {return d.day;}); }),
             domainMax]
            )
        .range([0, width]);

    var y = d3.scale.linear()
        .domain(
            [0,
             rangeMax(sectionDatas)]
            )
        .range([height, 0]);

    // set up the color
    var color = d3.scale.ordinal()
        .domain(sectionDatas.map(function (item) {return item.id;}))
        .range(getSelectedColors());

    // now the axes
    var generateTickValues = function (axis, num) {
        var rtn = [];
        var max = d3.max(axis.scale().domain());
        for (var i=num; i<=max; i++) {
            if (i % num === 0) {
                rtn.push(i);
            }
        }
        return rtn;
    };

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(d3.format("d"))
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    if (sectionDatas.length > 1)
        yAxis.tickFormat(function (d) { return d + "%"; });
    else
        yAxis.tickFormat(d3.format("d"));

    // create the actual svg element and apply a top level grouping
    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        // for animations, add additional attributes
        // .attr("xmlns", "http://www.w3.org/2000/svg")
        // .attr("version", "1.1")
        // .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var telebears = sectionDatas.map(function (d) {
        return d.telebears;
    });

    var getUsedTelebearsPhases = function () {
        var sectionData = sectionDatas[0];
        var telebears = sectionData.telebears;
        var dateFormatter = d3.time.format("%m/%d/%Y-%H:%M:%S");
        var now = new Date();
        var labelSuffix = "(" + sectionData.semester.capitalize() + " " + sectionData.year + ")";
        var rtn = [
            {
                start: telebears.phase1_start_day,
                start_date: telebears.phase1_start_date,
                end: telebears.phase1_end_date,
                label: "Phase I " + labelSuffix,
                classname: "phase1"
            },
            {
                start: telebears.phase2_start_day,
                start_date: telebears.phase2_start_date,
                end: telebears.phase2_end_date,
                label: "Phase II " + labelSuffix,
                classname: "phase2"
            },
            {
                start: telebears.adj_start_day,
                start_date: telebears.adj_start_date,
                end: d3.max(xAxis.scale().domain()), // don't let the graph go more than 300 days
                label: "Adjustment Period " + labelSuffix,
                classname: "adjustment"
            }
        ].filter(function (telebearsData) {
            return _nonCurrentSectionIsSelected() || dateFormatter.parse(telebearsData.start_date).getTime() < now.getTime();
        });
        return rtn;
    };

    //append the indicating rects
    var phases = getUsedTelebearsPhases();
    var indicators = svg.selectAll(".indicator")
        .data(phases)
    .enter().append("g")
        .attr("class", function (d) {return "indicator " + d.classname;});

    // fill for phase 1, phase 2, etc
    indicators.append("rect")
        .attr("x", function (d) {return x(d.start);})
        .attr("y", "0")
        .attr("width", function (d) {return x(d.end) - x(d.start);})
        .attr("height", y(0));

    // append the barlines
    svg.selectAll(".barline.x")
        .data(generateTickValues(xAxis, 10))
    .enter().append("g")
        .attr("class", "barline x")
    .append("line")
        .attr("x1", function (d) {return x(d);})
        .attr("x2", function (d) {return x(d);})
        .attr("y1", function (d) {return y(0);})
        .attr("y2", "0");

    svg.selectAll(".barline.y")
        .data(generateTickValues(yAxis, 50))
    .enter().append("g")
        .attr("class", "barline y")
    .append("line")
        .attr("y1", function (d) {return y(d);})
        .attr("y2", function (d) {return y(d);})
        .attr("x1", x(0))
        .attr("x2", width);

    // now the indicating text

    svg.selectAll(".indicator-text")
        .data(phases)
    .enter().append("g")
        .attr("class", "indicator-text")
    .append("text")
        .text(function (d) {return d.label;})
        .attr("transform", "rotate(-90)")
        .attr("y", function (d) {return x(d.end);})
        .attr("x", function (d) {return y(d3.max(yAxis.scale().domain()) / 1.5) * -1;})
        .attr("dy", "-.7em")
        .style("text-anchor", "end");

    // now the indicators for class capacity
    if (key === "enrolled" || key === "enrolled_percent") {
        svg.selectAll(".capacity")
            .data(sectionDatas.map(function (data) {
                return {"capacity": getCorrectMax(data), "color": data.color};
            }))
        .enter().append("g")
            .attr("class", "capacity")
        .append("line")
            .attr("x1", x(0))
            .attr("x2", width)
            .attr("y1", function (d) {return y(d.capacity);})
            .attr("y2", function (d) {return y(d.capacity);});
    }

    // append the axes
    svg.append("g")
        .attr("class", "axis x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
    .append("text")
        .attr("transform", "translate(" + (width) +",0)")
        .attr("dy", "-.71em")
        .attr("dx", "-1em")
        .style("text-anchor", "end")
        .text("Days since telebears");

    svg.append("g")
        .attr("class", "axis y")
        .call(yAxis)
    .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("dy", ".71em")
        .attr("dx", "-1em")
        .style("text-anchor", "end")
        .text(getCorrectYText());

    // put the actual data in
    var section = svg.selectAll(".section")
        .data(sectionDatas.slice(0, domainMax))
    .enter()
    .append("g")
        .attr("class", "section");

    // the line is the function we will use to map section data with out specified scales to an actual svg path
    var line = d3.svg.line()
        .interpolate("linear")
        .x(function (d) {return x(d.day);})
        .y(function (d) {return y(d[key]);});

    section.append("path")
        .attr("class", function (d) {return "line" + d.course_id;})
        .attr("d", function (d) {return line(d.data.filter(_filterDataPoints));})
        .style("stroke-width", 3)
        .style("stroke", function (d) {return color(d.id);});

    // add the hoverovers
    // the hoverovers are big rectangles, so that they are difficult to miss
    svg.selectAll(".day-hovers")
        .data(sectionDatas).enter()
        .append("g")
        .attr("class", "day-hovers")
        .selectAll(".day-hover")
        .data(function (d) {return d.data;}).enter()
        .append("rect")
        .attr("class", "day-hover")
        .attr("x", function (d) {return x(d.day);})
        .attr("y", function (d) {return y(d.next[key]) - h/20;})
        .attr("width", function (d) {
            var diff = x(d.next.day) - x(d.day);
            return diff === 0 ? 4 : diff;
        })
        .attr("height", function (d) {return Math.abs(y(d.next[key]) - y(d[key])) + h/10;})
        .style("fill", "rgba(0,0,0,0)")
        .on("mouseover", function (d) {
            svg.select(".current-day")
                .attr("cx", x(d.day))
                .attr("cy", y(d[key]))
                .attr("r", 5)
                .style("fill", color(d.id));
            updateInfo(d.id, d.day);
        });

    // the line corresponding to the current day (initially uninitialized)
    svg.append("circle")
        .attr("class", "current-day");

    // add the "now" indicators
    var innerRadius = 3; //pixels
    var outerRadius = 5;

    var dot = section.append("g")
        .attr("class", "now")
        .datum(function (d) {
            return getCorrectNowFromData(d, function (dataPoints) {
                return dataPoints.filter(_filterDataPoints);
            });
        });

    var defs = svg.append("defs");

    defs.append("marker")
        .attr("id", "t")
        .attr("markerWidth", 40)
        .attr("markerHeight", 20)
        .attr("orient", "auto")
        .attr("refY", 10)
        .append("path")
        .attr("d", "M0,0 L10,10 0,20");

    // var anim = dot.append("g")
    //     .attr("class", "anim-line");

    // anim.append("polyline")
    //     .attr("points", function (d) {return x(d.day) + ", " + 0 + " " + x(d.day) + ", " + (y(d[key]) - 10);});

    // anim.append("animateTransform")
    //     .attr("attributeName", "transform")
    //     .attr("type", "translate")
    //     .attr("from", "0 0")
    //     .attr("to", "0 5")
    //     .attr("dur", "0.4s")
    //     .attr("repeatCount", "indefinite");

    // midMarkers(document.querySelector("polyline"),5);

    dot.append("circle")
        .attr("class", "outer")
        .attr("cx", function (d) {return x(d.day);})
        .attr("cy", function (d) {return y(d[key]);})
        .attr("r", outerRadius);

    dot.append("circle")
        .attr("class", "inner")
        .attr("cx", function (d) {return x(d.day);})
        .attr("cy", function (d) {return y(d[key]);})
        .attr("r", innerRadius);

    var dashLength = outerRadius;
    var spaceLength = 5;

    // add the radio buttons
    var radios = svg.selectAll(".radio")
        .data(getCorrectButtons())
    .enter().append("g")
        .attr("class", function (d) {return "radio " + d.classname;})
        .attr("transform", "translate(0, -20)");

    radios.append("circle")
        .attr("class", "outer")
        .attr("cx", function (d) {return d.position;})
        .attr("cy", 0)
        .attr("r", outerRadius);

    radios.append("circle")
        .attr("class", "inner")
        .attr("cx", function (d) {return d.position;})
        .attr("cy", 0)
        .attr("r", innerRadius);

    radios.append("text")
        .attr("x", function (d) {return d.position + outerRadius + 3;})
        .attr("y", outerRadius - 2)
        .attr("text-anchor", "start")
        .text(function (d) {return d.text;});

    radios.on("click", function (d) {
        if ($(this).attr("class").indexOf("unselected") !== -1) {
            updateGraph(d.data);
        }
    });
};

// Return: a list of colors of all of the added sections
var getSelectedColors = function () {
    var rtn = [];
    for (var i = 1; i <= 4; i++) {
        if (getEnrollmentData(i)) {
            rtn.push(sectionNumToColor(i));
        }
    }
    return rtn;
};

// Arguments: callback, a callback function
// SideEffects: updates the list of semesters based on the course selected
enrollment.updateSemesters = function (callback) {
    var courseID = getSelectedCourse();
    if (courseID === "")
        return;

    $.when($.getJSON("/enrollment/sections/" + courseID + "/", function (data) {
        processSemesters(data);
        enrollment.updateSections();
    })).done(function () {
        if (callback)
            callback();
    });
};

// Arguments: json, the json containing details about the semesters
// SideEffects: directly updates the dropdown with the semester data
var processSemesters = function (json) {
    var html = "";
    $.each(json, function (index, val) {
        html += "<option value='" + val.semester + "-" + val.year + "'";
        // TODO (noah) make encoding of semesters standard.
        enrollment.sections = enrollment.sections || {};
        enrollment.sections[val.semester + "-" + val.year] = val.sections;
        html += ">" + val.semester.capitalize() + " " + val.year + "</option>";
    });
    $("#select_semester").html(html);
    enrollment.initSemesterSelect(true);
};

// SideEffects: updates the list of sections based on the selected semester/year
enrollment.updateSections = function () {
    var html = "<option value='all'>All Sections</option>";
    $.each(enrollment.sections[getSelectedSemesterYear()], function (index, val) {
        var instructor = val.instructor || "No Instructor Assigned";
        html += "<option value='" + val.section_id + "'>";
        html += instructor + " - " + val.section_number;
        html += "</option>";
    });
    $("#select_section").html(html);
    enrollment.initSectionSelect(true);
};

// Return: the jQuery DOM object of the currently selected <option> for course
var getSelectedCourse = function () {
    return $("#select_course option:selected").val();
};

// Return: the jQuery DOM object of the currently selected <option> for semesterYear
var getSelectedSemesterYear = function () {
    return $("#select_semester option:selected").val();
};

// Return: the jQuery DOM object of the currently selected <option> for semester
var getSelectedSemester = function () {
    return getSelectedSemesterYear().split("-")[0];
};

// Return: the jQuery DOM object of the currently selected <option> for year
var getSelectedYear = function () {
    return getSelectedSemesterYear().split("-")[1];
};

// Return: the jQuery DOM object of the currently selected <option> for section
var getSelectedSection = function () {
    return $("#select_section option:selected").val();
};

// Return: the course, semester, year, and section chosen
enrollment.getCurrentCourseInfo = function () {
    return [getSelectedCourse(), getSelectedSemester(), getSelectedYear(), getSelectedSection()];
};

// Return: whether the current semester is selected
var currentSemesterIsSelected = function () {
    return $("#select_semester option:selected").attr("current") === "true";
};

// SideEffects: checks whether the selected section has already been added,
//              and enables/disables the "add" button accordingly.
enrollment.checkAlreadyAdded = function () {
    if (enrollment.section_data === undefined)
        return;

    var already = false;
    $.each(enrollment.section_data, function (index, val) {
        if (val === null)
            return true;
        already = (val.course_id === getSelectedCourse() &&
                  val.semester === getSelectedSemester() &&
                  val.year === getSelectedYear() &&
                  (val.section_id === getSelectedSection() || ($("#select_section option").length === 2)));
        if (already)
            return false;
    });
    if (already) {
        $(".select-button").hide();
        $("#select_question_button_2").show();
    } else {
        $(".select-button").hide();
        $("#select_add_button").show();
    }
};

    // Arguments: num, the sectionData ID
    // Return: true if the section number is valid (1-4), false if not
    var isValidEnrollmentNum = function (num) {
        return (typeof num === "number" && num < 5 && num > 0);
    };

    // Arguments: num, the sectionData ID
    // Return: num's text representation
    var numToWindowKey = function (num) {
        var keys = ["one", "two", "three", "four"];
        return keys[num - 1];
    };

// Arguments: callback, a callback function
//            item, the text representation of a section to add (optional)
// SideEffects: queries for the section data and add the section.
enrollment.getEnrollmentDataAndAddSection = function (courseInfo, callback) {
    var courseID = courseInfo[0];
    var semester = courseInfo[1];
    var year = courseInfo[2];
    var section = courseInfo[3];

    var url = section !== "all" ? "data/" + section + "/" : "aggregate/" + courseID + "/" + semester + "/" + year + "/";

    $.getJSON("/enrollment/" + url, function (data) {
        var sectionData = processEnrollmentData(data, semester, year);

        if (sectionData.data && sectionData.data.length) {
            addSection(sectionData);
            updateGraph();
        } else {
            $(".select-button").hide();
            $("#select_question_button_3").show(); // "we don't have data for this section"
        }

        if (callback) {
            callback();
        }
        if (getNextEnrollmentDataPosition() === false) {
            $(".select-button").hide();
            $("#select_question_button").show();
        }

        var getSectionEventText = function (section) {
            return [section.title,
                    section.semester.capitalize() + " " + section.year,
                    section.section_name].join(" - ");
        };

        // event tracking by GA
        ga.trackEvent("Enrollment", "Add Course", getSectionEventText(sectionData));

        var sectionInfo = [];
        for (var index in enrollment.section_data) {
            if (enrollment.section_data[index] !== null) {
                sectionInfo.push(getSectionEventText(enrollment.section_data[index]));
            }
        }
        ga.trackEvent("Enrollment", "Added Courses", sectionInfo.sort().join(", "));
    });
};

// Arguments: d, the section data received from the server
//            semesterYear, a string containing the semester and year
// Return: processed section data (all necessary info added)
var processEnrollmentData = function (d, semester, year) {
    d.course_id = d.course_id.toString();
    d.section_id = d.section_id.toString();
    d.semester = semester;
    d.year = year;
    d.enrolled_percent_max *= 100;
    d.waitlisted_percent_max *= 100;
    d.data = d.data.filter(function (i) {return i.day >= 0;});
    d.id = getNextEnrollmentDataPosition();
    for (var i = 0; i < d.data.length; i++) {
        d.data[i].enrolled_percent *= 100;
        d.data[i].waitlisted_percent *= 100;
        d.data[i].id = d.id;
        if (i !== d.data.length - 1)
            d.data[i].next = d.data[i+1];
        else
            d.data[i].next = d.data[i];
    }
    if (d.subtitle.length >= 40)
        d.shortSubtitle = d.subtitle.slice(0, 37) + "...";
    else
        d.shortSubtitle = d.subtitle;

    return d;
};

// Return: the next empty data position in the section_data array (1,2,3,4)
var getNextEnrollmentDataPosition = function () {
    if (enrollment.section_data === undefined) {
        return 1;
    } else {
        var list = ["one", "two", "three", "four"];
        for (var i=0; i<list.length; i++) {
            if (enrollment.section_data[list[i]] === null) {
                return list.indexOf(list[i]) + 1;
            }
        }
        return false;
    }
};

// SideEffects: binds the clicks for the remove buttons,
//              and the hovers for the section-containers
var bind = function () {
    $(".section-remove-button").unbind("click").click(function () {
        removeSection($(this).parent().parent());
        if ($(".section-container").length === 0) {
            // hide the ad if no classes are selected
            $(".enrollment-secret-container").css("display", "none");
        }
    });
    $(".section-container").unbind("hover").hover(function () {
        var num = parseInt($(this).attr("data-section-id"), 10);
        updateInfo(num);
    });
};

// SideEffects: Displays an error message if there is more than one kind of semester displayed.
var checkTelebearsWarning = function () {
    var semesters = getAllEnrollmentData().map(function (item) {
        return item.semester;
    });
    var differentSemesters = false;
    for (var i = 0; i < semesters.length - 1; i++) {
        if (semesters[i] !== semesters[i+1]) {
            differentSemesters = true;
            break;
        }
    }
    if (differentSemesters) {
        $(".telebears-warning").show();
    } else {
        $(".telebears-warning").hide();
    }
};

// Arguments: sectionData, the section data to be added
// SideEffects: adds the section, or prints an error if 4 are already added
var addSection = function (sectionData) {
    var next = getNextEnrollmentDataPosition();
    if (next) {
        var title = sectionData.title;
        var semester = sectionData.semester;
        var year = sectionData.year;
        var section = sectionData.section_name;
        var bgcolor = sectionNumToColor(next);
        sectionData.color = bgcolor;
        storeEnrollmentData(sectionData, next);
        updateInfo(next);
        var $added = addSectionHTML(title, semester, year, section, bgcolor, next);
        bind();
        updateURL();
        checkTelebearsWarning();
        return $added;
    } else {
        console.log("Error: No more sections can be added.");
    }
};

// Arguments: title, the title of the section
//            semester, the semester of the section
//            section, the name of the section
//            bgcolor, the background color of the section
//            id, the section's id
// Return: a jQuery DOM element containing the new (added) section-container
var addSectionHTML = function (title, semester, year, section, bgcolor, id) {
    var $elem = newSectionHTML(title, semester, year, section, bgcolor);
    $elem.attr("data-section-id", id);
    if (noSectionsSelected()) {
        $("#container").prepend($elem);
    } else {
        $("#container").children(".section-container").last().after($elem);
    }
    return $elem;
};

// Arguments: title, the title of the section
//            semester, the semester of the section
//            section, the name of the section
//            bgcolor, the background color of the section
// Return: a jQuery DOM element containing the new section-container
var newSectionHTML = function (title, semester, year, section, bgcolor) {
    var html = "";
    html += "<div class='section-container' data-semester='" + semester + "' data-year='" + year + "'>";
    html += "<span class='section-info'>";
    html += "<span class='title'>" + title + "</span>";
    html += "<span class='semester'>" + semester.capitalize() + " " + year + "</span>";
    html += "<span class='section'>" + section + "</span>";
    html += "</span>";
    html += "<div class='section-controls'>";
    html += "<div class='section-remove-button'><i class='icon-remove-sign'></i></div>";
    html += "</div>";

    var $elem = $(html);
    $elem.css("border-color", bgcolor);

    return $elem;
};

// Arguments: the section-container to be removed
// SideEffects: removes the section, erasing the data and HTML, and updating the graph
var removeSection = function ($section) {
    var id = $section.attr("data-section-id");
    var num = parseInt(id, 10);
    $section.remove();
    removeEnrollmentData(num);
    updateGraph();
    enrollment.smartRemoveEnrollmentInfo(id);
    $(".select-button").hide();
    $("#select_add_button").show();
    updateURL();
    enrollment.checkAlreadyAdded();
    checkTelebearsWarning();
};

// Arguments: num, the section data ID
// Return: the associated color
var sectionNumToColor = function (num) {
    var colors = ["#5fc0ce", "#ffb673", "#f4638f", "#83f03c"];
    if (!isValidEnrollmentNum(num)) {
        return "#999999";
    } else {
        return colors[num - 1];
    }
};

// Return: true if no sections are selected, false otherwise
var noSectionsSelected = function () {
    return $(".section-container").length === 0;
};

// Arguments: sectionData, the section data
//            day, the day relative to telebears start
// Return: the metadata for the day
var getDayInfo = function (sectionData, day) {
    var rtn = false;
    $.each(sectionData.data, function (index, val) {
        if (val.day === day) {
            rtn = val;
            return false;
        }
    });
    return rtn;
};

// Arguments: num, the section data ID
//            day, the day relative to telebears start
// SideEffects: updates the info at the top of the graph with the info from the specified day
var updateInfo = function (num, day) {
    enrollment.info_num = num;
    var d = getEnrollmentData(num);
    if (day === undefined)
        day = _.last(getEnrollmentData(num).data).day;
    var dayInfo = getDayInfo(d, day);
    if (d && dayInfo) {
        updateSectionInfo(d);
        updateDayInfo(d, dayInfo);
    } else {
        console.log("Error: could not find stored section data for Section #" + num + " on day: " + day);
    }
};

// Arguments: num, the section Data ID
//            sectionData, the section data
// SideEffects: updates the info at the top of the graph with the info for the section
var updateSectionInfo = function (sectionData) {
    if (noSectionsSelected()) {
        var html = "";
        html += "<div class='title'></div>";
        html += "<div class='subtitle'></div>";
        $('#title_container').html(html);

        html = "";
        html += "<div class='date'>";
            html += "<span class='date-value'></span>:";
        html += "</div>";
        html += "<div class='enrolled'>Latest Enrolled: ";
            html += "<span class='enrolled-amount'></span>&nbsp;&nbsp;/&nbsp;&nbsp;";
            html += "<span class='enrolled-max'></span>";
        html += "</div>";
        html += "<div class='waitlisted'>Latest Waitlisted: ";
            html += "<span class='waitlisted-amount'></span>";
        html += "</div>";
        $("#section_info_container").html(html);

        html = "";
        html += "<p style='font-family: Ubuntu, Helvetica Neue, Helvetica, sans-serif;" +
        "text-align: center; padding-top: 26px; width: 100%; font-size: 15px;'><i class='icon-arrow-down'></i> Mouse over the graph " +
        "to see enrollment information.</p>";
        $("#day_info_container").html(html);
    }

    var latest = _.last(sectionData.data);

    // update title_container
    utils.updateHTML("#title_container .title", sectionData.title + "<div class='card-link' data-id='" + sectionData.course_id + "'>(info)</div>");
    $("#title_container").css("background-color", sectionData.color);
    $(".card-link").click(function () {
        courseBox.initCourseBox("overview", $(this).data("id"));
    });

    utils.updateHTML("#title_container .subtitle", sectionData.shortSubtitle);

    // update section_info_container
    utils.updateHTML("#section_info_container .date-value", moment(latest.date.split("-")[0]).format("MMMM Do, YYYY"));
    utils.updateHTML("#section_info_container .enrolled-amount", latest.enrolled);
    utils.updateHTML("#section_info_container .enrolled-max", sectionData.enrolled_max);
    $("#section_info_container .enrolled").css("background-color", utils.percentToColor(latest.enrolled_percent));

    utils.updateHTML("#section_info_container .waitlisted-amount", latest.waitlisted);
    $("#section_info_container .waitlisted").css("background-color", utils.percentToColor(latest.waitlisted_percent));
};

// Arguments: data, the enrollment data
//            dayInfo, metadata for the selected day
// SideEffects: updates the info at the top of the graph with the info for the day
var updateDayInfo = function(data, dayInfo) {
    if (noSectionsSelected()) {
        // show the secret
        $(".enrollment-secret-container").css("display", "inline-block");
        var html = "";
        if (!window.SECRET) {
            html += "<div class='phase-day'>";
                html += "<span class='phase'></span>: ";
                html += "Day <span class='day'></span>";
            html += "</div>";
        }
        html += "<div class='percentage'>";
            html += "<span class='number'></span>%";
        html += "</div>";
        html += "<div class='day-info'>";
            html += "<div class='date'>";
                html += "<span class='date-value'></span>:";
            html += "</div>";
            html += "<div class='enrolled'>Enrolled: ";
                html += "<span class='enrolled-amount'></span>&nbsp;&nbsp;/&nbsp;&nbsp;";
                html += "<span class='enrolled-max'></span>";
            html += "</div>";
            html += "<div class='waitlisted'>Waitlisted: ";
                html += "<span class='waitlisted-amount'></span>";
            html += "</div>";
        html += "</div>";
        $("#day_info_container").html(html);
        $("#day_info_container").css("background-color", "#eee");
    }

    if (!window.SECRET) {
        // update day_info_container
        var phase;
        if (dayInfo.day < data.telebears.phase2_start_day)
            phase = "Phase I";
        else if (dayInfo.day < data.telebears.adj_start_day)
            phase = "Phase II";
        else
            phase = "Adj. Period";

        utils.updateHTML("#day_info_container .phase", phase);
        utils.updateHTML("#day_info_container .day", dayInfo.day);
    } else {

    }

    utils.updateHTML("#day_info_container .number", Math.floor(dayInfo.enrolled_percent));

    // format date properly
    var date = moment(dayInfo.date.split("-")[0]);
    var dateString = date.format("MMMM Do, YYYY");

    utils.updateHTML("#day_info_container .date-value", dateString);
    utils.updateHTML("#day_info_container .enrolled-amount", dayInfo.enrolled);
    utils.updateHTML("#day_info_container .enrolled-max", data.enrolled_max);
    $("#day_info_container .enrolled").css("background-color", utils.percentToColor(dayInfo.enrolled_percent));

    utils.updateHTML("#day_info_container .waitlisted-amount", dayInfo.waitlisted);
    $("#day_info_container .waitlisted").css("background-color", utils.percentToColor(dayInfo.waitlisted_percent));
};

// Arguments: id, the id of the removed section
// SideEffects: clears the info bar if no sections are selected,
//              updates it with the first one if the current section has been removed
enrollment.smartRemoveEnrollmentInfo = function (id) {
    if (noSectionsSelected()) {
        $("#title_container").empty();
        $("#section_info_container").empty();
        $("#day_info_container").html("");

        $("#day_info_container").css("background-color", "#fff");
        $("#title_container").css("background-color", "#fff");
        $(".welcome").show();
    } else if (enrollment.info_num === parseInt(id)) {
        updateInfo(parseInt($(".section-container").first().attr("data-section-id"), 10));
    }
};

// Arguments: ajaxData, the section data to store
//            num, the section data ID
// SideEffects: stores the data in enrollment.section_data
// Return: true if stored, false on failure
var storeEnrollmentData = function (ajaxData, num) {
    if (!isValidEnrollmentNum(num) || typeof ajaxData !== "object") {
        return false;
    }
    if (enrollment.section_data === undefined) {
        enrollment.section_data = {"one": null, "two": null, "three": null, "four": null};
    }
    var key = numToWindowKey(num);
    enrollment.section_data[key] = ajaxData;
    return true;
};

// Arguments: num, the section data ID
// SideEffects: gets the data at index "num" from enrollment.section_data
// Return: the requested data on success, false on failure
var getEnrollmentData = function (num) {
    if (!isValidEnrollmentNum(num)) {
        return false;
    }

    var key = numToWindowKey(num);
    // 1 is now mapped to one, etc.
    if (enrollment.section_data === undefined) {
        return false;
    } else {
        return enrollment.section_data[key];
    }
};

// Return: all of the section data
var getAllEnrollmentData = function () {
    var rtn = [];
    _.each([1,2,3,4], function (item, index) {
        var d = getEnrollmentData(item);
        if (d) {
            rtn.push(d);
        }
    });
    return rtn;
};

// Arguments: num, the section data index
// SideEffects: removes the section data at num
var removeEnrollmentData = function (num) {
    if (!isValidEnrollmentNum(num) || enrollment.section_data === undefined) {
        return false;
    } else {
        var key = numToWindowKey(num);
        if (enrollment.section_data[key] === null || enrollment.section_data[key] === undefined) {
            return false;
        }

        enrollment.section_data[key] = null;
    }
};

// SideEffects: Puts on a tour of the enrollment app.
enrollment.tour = function () {
    var highlights = {
        ".section-container:nth-child(2)": {
            text: "Selected courses are here. Hover over one to see its info. Choose up to 4 using the dropdowns.",
            angle: 85,
            distance: 170
        },
        "#enrollment_info": {
            text: "This bar tells you current enrollment info, and if you hover over a line in the graph, you can see info about a particular day.",
            angle: 180,
            distance: 15
        },
        ".radio.unselected": {
            text: "You can look at enrollment or waitlist data.",
            angle: 160,
            distance: 15
        },
        ".day-hover:last": {
            text: "This red circle reflects the current enrollment today.",
            angle: 190,
            distance: 30
        }
    };
    var preTour = function (displayTour) {
        var enableDropdowns = function () {
            $("#select_semester").prop("disabled", false);
            $("#select_section").prop("disabled", false);
        };
        var selectCourse = function (courseTitle) {
            $("#select_course").prop("selectedIndex", $("#select_course option[data-title='" + courseTitle + "']").index());
            $("#select_course").trigger("select2:select");
        };

        selectCourse("COMPSCI 61A");
        enrollment.updateSemesters(function () {
            enrollment.getEnrollmentDataAndAddSection(enrollment.getCurrentCourseInfo(), function () {
                selectCourse("ENGLISH R1A");
                enrollment.updateSemesters(function () {
                    enrollment.getEnrollmentDataAndAddSection(enrollment.getCurrentCourseInfo(), function () {
                        displayTour();
                    });
                });
            });
        });
    };
    var postTour = function () {
        $(".section-container").each(function () {
            removeSection($(this));
        });
    };
    tour.startTour(highlights, preTour, postTour);
};

// SideEffects: updates the URL to reflect the sections currently chosen
// Note: The format of each option should be:
//       <course_id>-<semester>-<section>
//       - course_id is just the number corresponding to the course
//       - semester can either be set to "all" or "<semester>_<year>" (e.g. "spring_2012")
//       - section can be "all" or a number
var updateURL = function () {
    var constructURLFromSections = function () {
        var count = 0;
        return "/enrollment/?" + $.map(enrollment.section_data, function (section, index) {
            if (section === null)
                return null;
            count += 1;
            return "course" + count.toString() + "=" + section.course_id + "-" + section.semester
                    + "-" + section.year + "-" + section.section_id;
        }).join("&");
    };

    if (window.history.replaceState) {
        if (getAllEnrollmentData().length === 0) {
            window.history.replaceState(null, null, "/enrollment/");
            return;
        }
        var pageURL = constructURLFromSections();
        window.history.replaceState(null, null, pageURL);
    }
};

/**
* Given the portion of the URL after the ?, makes sure that it is a valid enrollment query.
* The keys of the params should be course(1|2|3|4) and the values should be of the form:
* <course_id>-<semester>-<section>
* @param {string} getParams the GET parameters passed to the URL, as a string (no "?")
* @return {boolean} whether the params are valid or not
*/
enrollment.validateURL = function (getParams) {
    var params = getParams.split("&");
    var errorFound = false;
    $.each(params, function (index, param) {
        var keyValue = param.split("=");
        if (keyValue.length !== 2 ||
            !keyValue[0].match(/course[1|2|3|4]/) ||
            !keyValue[1].match(/(\d+)-(fall|spring)-(\d+)-(.+)/)) {
            errorFound = true;
            return false; // break the each loop
        }
    });
    return !errorFound;
};

// SideEffects: reads the current URL, and adds the appropriate sections.
// Note: The format of each option should be:
//       <course_id>-<semester>-<section>
//       - course_id is just the number corresponding to the course
//       - semester can either be set to "all" or "<semester>_<year>" (e.g. "spring_2012")
//       - section can be "all" or a number
enrollment.parseURL = function () {
    var sections = window.location.search.replace("?", "");
    if (!enrollment.validateURL(sections)) {
        $(".welcome").show();
        return;
    }
    sections = sections.split("&");
    $(".loading").show();
    sections = $.map(sections, function (val) {
        return val.split("=")[1];
    });
    var lastID;
    $.each(sections.slice(0,4), function (index, val){
        var courseInfo = val.split("-");
        if (courseInfo.length === 4) {
            enrollment.getEnrollmentDataAndAddSection(courseInfo);
            $(".loading").hide();
            lastID = courseInfo[0];
        }
    });
    if (lastID !== undefined) {
        $("#select_course").prop("selectedIndex", $("#select_course option[value=" + lastID + "]").index());
        enrollment.initCourseSelect();
        $("#select_course").trigger("select2:select");
    }
};

})(window, $, console, _, d3, bt_utils, bt_ga, tour);
