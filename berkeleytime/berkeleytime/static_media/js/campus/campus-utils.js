var campus = campus || {};
// Note here that we either set campus to the existing campus module object
// OR a new object. This enables us to include the dependencies of this module
// (time.js, frame.js, popup.js, etc) in any order, and before this file if we
// want to. This creates both a more semantic order of including javascript files
// and keeps us from worrying about whether campus is going to be replaced by an
// empty object in javascript file inclued later.
//
// If we did campus = {}; instead, campus might be overwritten if we had to include
// another file that uses the campus object before this one in the html head.

(function ($, time, utils, schedule, PageFrame, colors, tour) {

campus.xhr = null;
campus.allBuildings = [];
campus.defaultLat = 37.87239868103175;
campus.defaultLong = -122.25758135318755;

//map of buildingID to their respective markers on the map
campus.markerMap = {};

//map marker
campus.buildingIcon = L.icon({
  iconUrl: "http://api.tiles.mapbox.com/v3/marker/pin-m+5ab2de.png",
  iconSize: [30, 70],
  popupAnchor: [0, -40]
});

campus.getRoomDataAndShowPopup = function (clickedElement, roomID, day, callback) {
    $.getJSON(
        '/campus/rooms/sections',
        {'room_id': roomID, 'day': day},
        _makeRoomDataResponseHandler(clickedElement, day, callback)
    );
};


_displayOngoingRooms = function() {
    _clearResults();
    $.getJSON("/campus/ongoing/",
        {
            datetime: campus.getSelectedTime()
        },
        function (json) {
            _ongoingResponseHandler(json);
        }
    );
}

//NO DOCUMENTATION...WHY???
var _makeRoomDataResponseHandler = function(clickedElement, day, callback) {
    return function (json) {
        var earliest = time.minTime(time.findEarliest(json.map(function (obj) {
            return obj.start_time;
        })), "8:00");
        var latest = time.maxTime(time.findLatest(json.map(function (obj) {
            return obj.end_time;
        })), "22:00");
        campus.schedulePopup.setElement(clickedElement);
        campus.schedulePopup.setTimes(earliest, latest);
        campus.schedulePopup.setDay(day);
        campus.schedulePopup.show();
        $.each(json, function (index, sectionData) {
            campus.schedulePopup.addScheduleBlock({
                start: sectionData.start_time,
                end: sectionData.end_time,
                color: colors.blue.primary,
                day: day,
                borderColor: colors.blue.highlight,
                title: sectionData.abbreviation + " " + sectionData.course_number,
                number: sectionData.kind + " " + sectionData.section_number,
                location: sectionData.location,
                courseID: sectionData.course_id,
                sectionID: sectionData.section_id
            });
        });
        if (callback)
            callback();
    };
};

/**
* Initializes the campus application, more specifically, creates a
* mapBox map, and retrieves all buildings on campus, calling the
* initResponseHandler on completion (AJAX)
*/
campus.initCampus = function() {
    campus.map = L.mapbox.map('map', 'yuxinzhu.map-e17jxa5n', {"minZoom": 16});
    campus.markerLayer = L.mapbox.markerLayer().addTo(campus.map);
    campus.setDefaultMap(true);
    $(".result-list").bind("mousewheel", function() {
        if (campus.schedulePopup.isShowing) {
            campus.schedulePopup.hide();
        }
    });
    $.getJSON("/campus/buildings/",
        function(json) {
            _initResponseHandler(json);
            $(".campus-info-container").append(
                '<div class="welcome">' +
                    '<div class="greeting"><i class="icon-time"></i></div>' +
                    '<div class="welcome-subheading">Stop looking - see all the classes going on right now. <a class="welcome-highlight">Take a tour</a>.</div>' +
                    '<div class="welcome-paragraph">' +
                        'Search for a building or course. See what\'s going on campus. Click on a room to explore its classes.' +
                    '</div>' +
                '</div>'
            );
            $(".welcome-highlight").click(function () {
                campus.tour();
            });
        }
    );
};

/**
* Handles the initCampus response JSON, and initializes a global arr
* of all buildings on campus and their active states, and displays them
* on the map. Initializes the current state by calling getAndUpdateCampusState
* @param {Object} json response containing building objects
*/
var _initResponseHandler = function(json) {
    campus.allBuildings = []; // make sure that allBuildings is cleared
    $.each(json.buildings, function(index, building) {
        campus.allBuildings.push({
            "id": building.id,
            "lat": building.latitude,
            "long": building.longitude,
            "active": building.active,
            "name": building.name
        });
    });
    _displayBuildingMarkers(campus.allBuildings);
    campus.getAndUpdateCampusState();
};

/**
* Sets the map to the default position and zoom level, if defaultPosition
* is false, sets map to default zoom level
* @param {boolean} defaultPosition whether or not to default coordinates
*/
campus.setDefaultMap = function(defaultPosition) {
    if (defaultPosition) {
        campus.map.setView([campus.defaultLat, campus.defaultLong], 16);
    } else {
        campus.map.setZoom(16);
    }
};

/**
* Binds the Ongoing Sections button in the given popup
*/
campus.bindPopupButtonOnce = function() {
    var $button = $(".building-button");
    $button.one("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        _displayBuildingState($button.parent().data("building-id"), true);
    });
};

/**
* Retrieves the current campus state based on the selected datetime
* and calls the stateResponseHandler (AJAX)
*/
campus.getAndUpdateCampusState = function(searchQuery) {
    $(".welcome").remove();
    campus.unhighlightSubmit();
    if (campus.xhr && 0 < campus.xhr.readyState && campus.xhr.readyState < 4) {
        campus.xhr.abort();
    }
    if (!searchQuery) {
        campus.resetSearch();
        campus.xhr = $.getJSON("/campus/state/", {datetime: campus.getSelectedTime()},
            function(json) {
                _stateResponseHandler(json);
            }
        );
    } else {
        _searchAndUpdate(searchQuery);
    }
};

/**
* Handles the getAndUpdateCampusState response JSON, and sets the
* results to show an overview of the current campus state
* @param {Object} json response containing the state overview
*/
var _stateResponseHandler = function(json) {
    _setMessage(_initMessage());
    var $stateOverview = _campusStateOverviewContent(json);
    _setResult($stateOverview);
};

/**
* Given a JSON response, returns content representing a campus state overview
* @param {Object} json response containing the state overview
* @return {jQuery} content representing a campus state overview
*/
var _campusStateOverviewContent = function(json) {
    var $content = $("" +
        "<div class='state-info-container'>" +
            "<div class='data-container'>" +
                "<div class='state-data'>" + json.active_ids.length + "</div>" +
                "<div class='state-data'>"+ json.section_count + "</div>" +
            "</div>" +
            "<div class='annotation-container'>" +
                "<div class='state-annotation'>Active Buildings</div>" +
                "<div class='state-annotation ongoing-classes'></div>" +
            "</div>" +
        "</div>");

    if (json.section_count != 0) {
        $content.find(".ongoing-classes").click(function() {_displayOngoingRooms()}).addClass("hover-blue").text("View Ongoing Classes");
    }
    else {
        $content.find(".ongoing-classes").text("No Ongoing Classes")
    }

    return $content;
};

/**
* Shows the clear search icon in the search bar
*/
campus.showClearSearchIcon = function() {
    $(".clear-search").show();
};

/**
* Hides the clear search icon in the search bar
*/
campus.hideClearSearchIcon = function() {
    $(".clear-search").hide();
};

/**
* Resets campus to default and clear any user defined search queries,
* namely, empties the search bar, displays a list of all buildings, and
* sets the map to its default zoom level
*/
campus.resetSearch = function() {
    _clearSearch();
    campus.setDefaultMap();
    campus.bindPopupButtonOnce(); //reactivate popup button
    campus.schedulePopup.hide();
};

/**
* Clears the search bar
*/
var _clearSearch = function() {
    $(".search-bar").val("");
};

/**
* Zooms the campus map to a building, and triggers the popup
* @param {String} buildingID
*/
var _zoomToBuilding = function(buildingID) {
    $(".welcome").empty();
    var buildingMarker = campus.markerMap[buildingID];
    var location = buildingMarker.getLatLng();
    buildingMarker.openPopup();
    campus.map.setView([location.lat, location.lng], 19);

};

/**
* Given a building object, returns a jQuery element with relevant events
* @param {Object} building
* @return {jQuery} content representing a building element
*/
var _buildingElement = function(building) {
    var $buildingElement = $("" +
     "<li class='selectable building' data-building-name='" + building.name + "' data-building-id=" + building.id +
        " data-lat=" + building.lat + " data-long=" + building.long + ">" +
        "<div class='block building-more-info'></div>" +
        "<div class='block building-text-container'>" +
            "<div class='building-name'>" + building.name + "</div>" +
        "</div>" +
    "</li>");

    $buildingElement.mouseenter(function() {
        $(this).find(".building-more-info").stop().animate({
            "width": "10px"
        }, 100);
    });

    $buildingElement.mouseleave(function() {
        $(this).find(".building-more-info").stop().animate({
            "width": "3px"
        }, 100);
    });

    $buildingElement.click(function() {
        _displayBuildingState(building.id);
    });
    return $buildingElement;
};

/**
* Given an array of building objects, returns a jQuery representation
* of a list of buildings
* @param {Array} a list of building objects
* @return {jQuery} content representing list of building objects
*/
var _buildingListToContent = function (buildings) {
    var result = $("<ul>");
    $.each(buildings, function (index, building) {
        result.append(_buildingElement(building));
    });
    return result;
};

/**
* Shows all buildings in the results and updates relevant content
*/
campus.displayAllBuildings = function() {
    _clearResults();
    _setResult(_buildingListToContent(campus.allBuildings));
    _setMessage(_allBuildingsMessage());
};

/**
* Plots markers representing building locations on the map, and attaches
* relevant popup events
* @param {Array} a list of building objects
*/
var _displayBuildingMarkers = function(buildings) {
    $.each(buildings, function(index, b) {
        var marker = L.marker([b.lat, b.long], {
        icon: campus.buildingIcon,
        }).addTo(campus.markerLayer);
        campus.markerMap[b.id] = marker;
        var popup = L.popup({
            closeButton: false,
            minWidth: 150
        }).setContent(_buildingPopupHTML(b));
        marker.bindPopup(popup);

        popup.on("open", function() {
            campus.bindPopupButtonOnce();
        });
    });
};

/**
* Sets the result message content
* @param {String | jQuery} message to display
*/
var _setMessage = function(message) {
    _stopLoadingAnimation();
    $(".result-message").html(message);
};

/**
* Sets the result list
* @param {String | jQuery} content to display
*/
var _setResult = function(result) {
    $(".result-list").html(result).slideDown("100");
};

/**
* Given a room object, returns a jQuery element with relevant events
* @param {Object} room
* @return {jQuery} content representing a room element
*/
var _roomElement = function(room) {
    var roomObj = room.info;
    var section = room.section;
    var $roomElement = $("" +
    "<li class='room' data-room-name='" + roomObj.short_name + "' data-room-id=" + roomObj.id + ">" +
        "<div class='block room-status'>" +
            "<i class='status icon-ellipsis-vertical'></i>" +
        "</div>" +
        "<div class='block room-text-container'>" +
            "<div class='room-title'>" + roomObj.short_name + "</div>" +
            "<div class='room-subtitle'></div>" +
        "</div>" +
    "</li>");
    $roomElement.click(function() {
        var $this = $(this);
        $(".room.active").removeClass("active");
        $this.addClass("active");
        campus.getRoomDataAndShowPopup($this, $this.data("room-id"), campus.dayController.getStringDay());
    });

    var $subtitleElement = $roomElement.find(".room-subtitle");
    var roomSubtitle;
    if (section) {
        roomSubtitle = section.info;
        $roomElement.find(".status").addClass("active");
        $subtitleElement.addClass("section")
            .data("course-id", section.id);
        $roomElement.find(".room-title");
    } else {
        roomSubtitle = "Room is currently available";
        $roomElement.find(".status").addClass("available");
    }
    $subtitleElement.text(roomSubtitle);
    return $roomElement;
};

/**
* Given an array of room objects, returns a jQuery representation
* of a list of rooms
* @param {Array} a list of room objects
* @return {jQuery} content representing list of room objects
*/
var _roomListToContent = function(rooms) {
    var result = $("<ul>");
    $.each(rooms, function (index, room) {
        result.append(_roomElement(room));
    });
    return result;
};

/**
* Sets a loading animation and clear the results list
*/
var _clearResults = function() {
    $(".welcome").remove();
    _setLoadingAnimation();
    $(".result-list").empty();
};

/**
* Retrieves the state of a building and calls the buildingResponseHandler
* (AJAX)
* @param {String} buildingID
* @param {boolean} removes any zoom animation on the building upon completion
* @param {callback} a callback function
*/
var _displayBuildingState = function(buildingID, preventZoom, callback) {
    _clearResults();
    _zoomToBuilding(buildingID);
    $.getJSON("/campus/building/",
        {
            building_id: buildingID,
            datetime: campus.getSelectedTime()
        },
        function (json) {
            _buildingResponseHandler(json, preventZoom);
            if (callback)
                callback();
        }
    );
};

/**
* Handles the buildingState response JSON, and sets relevant information
* in the results
* @param {Object} json response containing room objects and building data
*/
var _buildingResponseHandler = function(json, preventZoom) {
    if (!preventZoom) {
        _zoomToBuilding(json.building_id);
    }
    var adjustedQuery = json.name;
    _setSearchInput(adjustedQuery);
    _setMessage(_searchResponseMessage(adjustedQuery));
    _setResult(_roomListToContent(json.rooms));
};

/**
* Handles the roomState response JSON, and sets relevant information
* in the resuls
* @param {Object} json response containing a room object
*/
var _roomResponseHandler = function(json) {
    _zoomToBuilding(json.building_id);
    var adjustedQuery = json.name;
    _setSearchInput(adjustedQuery);
    _setMessage(_searchResponseMessage(adjustedQuery));
    _setResult(_roomListToContent([json.room]));
};


/**
* Handles the sectionState response JSON, and sets relevant information
* in the resuls
* @param {Object} json response containing room objects and course/department/section data
*/
var _courseResponseHandler = function(json) {
    if ((json.rooms.length) === 1) {
        _zoomToBuilding(json.rooms[0].info.building_id);
    }
    var adjustedQuery = json.name;
    _setSearchInput(adjustedQuery);
    _setMessage(_searchResponseMessage(adjustedQuery));
    _setResult(_roomListToContent(json.rooms));
};

/**
* Handles the sectionState response JSON, and sets relevant information
* in the resuls
* @param {Object} json response containing room objects and course/department/section data
*/
var _ongoingResponseHandler = function(json) {
    _setMessage(_ongoingResponseMessage());
    _setResult(_roomListToContent(json.rooms));
};

/**
* Search and retrieves the correct response for a user defined query
* and calls the searchResponseHandler
* @param {String} query a user defined search query
*/
var _searchAndUpdate = function(query) {
    _clearResults();
    campus.xhr = $.getJSON("/campus/search/",
        {
            query: $.trim(query.toUpperCase().split(" ").map(utils.fixClassPseudonym).join(" ").toLowerCase()),
            datetime: campus.getSelectedTime()
        },
        function(json) {
            _searchResponseHandler(json);
        }
    );
};

/**
* Handles the searchAndUpdate response JSON, and calls the correct
* response handler given the structure of the response
* @param {Object} json response containing a search response
*/
var _searchResponseHandler = function(json) {
    if (json.hasOwnProperty("error")) {
        _noResultsResponseHandler(json);
    } else {
        //rooms of a specific buildings
        if (json.hasOwnProperty("rooms") && json.hasOwnProperty("building_id")) {
            _buildingResponseHandler(json);
        //random rooms
        } else if (json.hasOwnProperty("rooms")) {
            _courseResponseHandler(json);
        //a single room
        } else if (json.hasOwnProperty("room")) {
            _roomResponseHandler(json);
        }
    }
};

/**
* Handles a searchResponse response JSON with no results
* @param {Object} json response containing a search response with no results
*/
var _noResultsResponseHandler = function(json) {
    if (json.query) {
        _setMessage(_noResultsMessage(json.query));
    } else {
        _setMessage(_serverErrorMessage());
    }
};

/**
* Sets the content of the search bar to the specified string
* @param {String} adjustedQuery
*/
var _setSearchInput = function(adjustedQuery) {
    adjustedQuery = $.trim(adjustedQuery);
    $(".search-bar").val(adjustedQuery);
    campus.showClearSearchIcon();
};

/* Misc HTML Appendix */

/**
* Returns HTML content for the popup given a building object
* @param {Object} building
* @return {String} HTML content for the popup
*/
var _buildingPopupHTML = function(building) {
    var html = "" +
    "<div class='popup' data-building-id='" + building.id + "'>" +
        "<div class='building-name'>" + building.name + "</div>" +
        "<button type='button' class='building-button'" +
        "'>View Ongoing Classes</button>" +
    "</div>";
    return html;
};

/**
* Returns jQuery content for the result message following a search query
* @param {String} the corrected search query returned in the search response
* @return {jQuery} content with relevant attached events
*/
var _searchResponseMessage = function(adjustedQuery) {
    var message = "Results for <span class='bold'>" + adjustedQuery + "</span>"
    var $content = $("<div>" +
        "<div class='block result-message-text'>" +
            message +
        "</div>" +
        "<div class='block message-clear-search hover-blue'>Clear</div></div>");

    $content.find(".message-clear-search").click(function() {
        campus.getAndUpdateCampusState();
    });
    return $content;
};

var _ongoingResponseMessage = function() {
    var $content = $("<div>" +
        "<div class='block result-message-text'>" +
            "Showing ongoing classes right now"  +
        "</div>" +
        "<div class='block message-clear-search hover-blue'>Clear</div></div>");

    $content.find(".message-clear-search").click(function() {
        campus.getAndUpdateCampusState();
    });
    return $content;
};

/**
* Returns jQuery content for the no result message following a search query
* @param {String} is the search query with no results
* @return {jQuery} content with relevant attached events
*/
var _noResultsMessage = function(query) {
    var $content = $("<div>" +
        "<div class='block result-message-text'>" +
            "<span class='bold'>No Results for:</span> " + query +
        "</div>" +
        "<div class='block message-clear-search hover-blue'>Clear</div></div>");

    $content.find(".message-clear-search").click(function() {
        campus.getAndUpdateCampusState();
    });
    return $content;
};

/**
* Returns jQuery content for the server error message following a search query
* @return {jQuery} content with relevant attached events
*/
var _serverErrorMessage = function() {
    var $content = $("<div>" +
        "<div class='block result-message-text'>" +
            "<span class='bold'>Sorry, We Couldn't Process Your Search</span>" +
        "</div>" +
        "<div class='block message-clear-search hover-blue'>Clear</div></div>");

    $content.find(".message-clear-search").click(function() {
        campus.getAndUpdateCampusState();
    });
    return $content;
};

/**
* Returns jQuery content for the result message when displaying all buildings
* @return {jQuery} message content
*/
var _allBuildingsMessage = function() {
    var $content = $("<div>" +
        "<div class='block result-message-text'>" +
            "Click on one of the <span class='bold'>" + campus.allBuildings.length + "</span> buildings below" +
        "</div>" +
        "<div class='block message-clear-search hover-blue'>Clear</div></div>"
    );
    $content.find(".message-clear-search").click(function() {
        campus.getAndUpdateCampusState();
    });
    return $content;
};

/**
* Returns jQuery content for the result message when the campus application
* is first initialized
* @return {jQuery} message content
*/
var _initMessage = function(buildings) {
    var activeBuildings = _.filter(buildings, function(building) {
        return building.active;
    });
    var $content = $("" +
        "<div class='block default-message-text'>" +
            "Search a <span class='bold'>building</span> or " +
            "<span class='bold'>room, </span> or " +
            "<span class='display-all-buildings'>See All Buildings</span>" +
        "</div>");
    $content.children(".display-all-buildings").click(function() {
        campus.displayAllBuildings();
    });
    return $content;
};

/**
* Clears result messages and sets the loading content
*/
var _setLoadingAnimation = function() {
    var $loading = $(".result-message").empty().html("<div class='loading'></div>").children();
    campus.loadingInterval = setInterval(function() {
        if ( $loading.text().length === 3 ) {
            $loading.text("");
        } else {
            var currentState = $loading.text();
            $loading.text(currentState + ".");
        }
    }, 250);
};

/**
* Stops the loading animation
*/
var _stopLoadingAnimation = function() {
    clearInterval(campus.loadingInterval);
    $("result-message").empty();
};

campus.Grid = function (start, end, day) {
    this.days = [day];
    this.initTimes(start, end);
    this.grid = this.generateGrid(this.start, this.end, this.halfHours);
    this.enableSectionSwitching = false; // we don't care
};
campus.Grid.extends(schedule.Grid);

/**
* Starts the campus tour
*/
campus.tour = function () {
    var highlights = {
        ".datetime-controls": {
            text: "Click/scroll to pick a time, and click to see what's going at Berkeley.",
            angle: 180
        },
        ".hour-label:nth-child(11)": {
            text: "Here's everything going on in this room today. Click on a course to learn more.",
            angle: 270,
            distance: 40
        },
        ".campus-info-container": {
            text: "Find out what's happening in any room, or click on it for more information.",
            angle: 283,
            distance: 130
        },
        ".search-bar": {
            text: "Search for any building, room, course, or subject.",
            angle: 180
        }
    };
    var preTour = function (displayTour) {
        $(".display-all-buildings").click();
        var $wheeler = $(".building[data-building-name='Wheeler Hall']");
        _displayBuildingState($wheeler.data("building-id"), false, function () {
            var $room = $(".room[data-room-name='Wheeler Auditorium']");
            $room.addClass("active");
            $(".result-list").scrollTop($(".result-list")[0].scrollHeight);
            campus.getRoomDataAndShowPopup($room, $room.data("room-id"), campus.dayController.getStringDay(), function () {
                campus.map.setView([$wheeler.data("lat") + 0.0005, $wheeler.data("long") + 0.0005], 19);
                displayTour();
            });
        });
    };
    var postTour = function () {
        campus.schedulePopup.hide();
    };
    tour.startTour(highlights, preTour, postTour);
};

/**
* Attach controller wrappers to the correct elements. This must be called before getSelectedTime but after the DOM
* has been loaded.
*/
campus.registerTimeControllers = function () {
    campus.timeController = new campus.TimeSelect($(".control-field.time"));
    campus.ampmController = new campus.AmPmSelect($(".control-field.ampm"));
    campus.dayController = new campus.DaySelect($(".control-field.day"));
};

/**
* Return the currently selected time (from the time controls) in dd/mm/yyy-hh:mm format. Note that dd may be d and hh may be h.
* @return {string}
*/
campus.getSelectedTime = function () {
    if (!campus.timeController || !campus.ampmController || !campus.dayController) {
        return null;
    }
    return campus.dayController.format() + "-" + campus.timeController.format(campus.ampmController.value());
};

/**
* Give the submit button a blue background to highlight that users should click on it.
*/
campus.highlightSubmit = function () {
    $(".datetime-controls-submit").css("background-color", "rgba(90, 178, 222, 0.5)");
};

/**
* He that giveth, he that taketh away the blue highlight of the submit button.
*/
campus.unhighlightSubmit = function () {
    $(".datetime-controls-submit").css("background-color", "rgba(255, 255, 255, 0.7)");
};

})(jQuery, time, bt_utils, schedule, common.PageFrame, colorstore.berkeleytime, tour);
