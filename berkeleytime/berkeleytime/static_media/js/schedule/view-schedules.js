var scheduleIndex = 0;
var colorCount = 0;
// preset colors in RGB
var colorArray = ['#d32f2f', '#F57C00', '#FBC02D', '#388E3C', '#1976D2', '#7B1FA2'];
var colorMap = {};

var dayOfWeekMap = {
  0: 'SU',
  1: 'MO',
  2: 'TU',
  3: 'WE',
  4: 'TH',
  5: 'FR',
  6: 'SA',
  7: 'SU'
}

function buildCCNDict(rawSectionInfo) {
	var cleaned_all_sections = rawSectionInfo.replace(/u'|'/g, '"'); // Remove unicode quotes
	cleaned_all_sections = cleaned_all_sections.replace(/None/g, '"TBA"'); // Add quotes for Python None values
	var CCNtoSecObjMap = JSON.parse(cleaned_all_sections);
	var CCNtoSched = {};
	var CCNtoFinal = {};
	for (var oneCCN in CCNtoSecObjMap) {
		// Check that course obj is valid
		if (CCNtoSecObjMap.hasOwnProperty(oneCCN)) {
        	var currCourseObj = CCNtoSecObjMap[oneCCN];

        	// has some info about sections
        	if (Object.keys(currCourseObj["sections_info"]).length > 0) {
        		// if we have sections, build sections_info Objects
        		var tempDict = buildSectionObject(currCourseObj["sections_info"]);
        		CCNtoSched[oneCCN] = tempDict;
        	}
        	// has some info about finals
        	if (Object.keys(currCourseObj["finals_info"]).length > 0) {
        		var tempDict = buildFinalsObject(currCourseObj["finals_info"]);
        		CCNtoFinal[oneCCN] = tempDict;
        	}
    	}
    }
    // build array of dictionaries to return
    var schedAndFinal = {};
    schedAndFinal["sections_info"] = CCNtoSched;
    schedAndFinal["finals_info"] = CCNtoFinal;
    return schedAndFinal;
}

// Helper function for buildCCNDict.
function buildSectionObject(section) {
	var curr_sec_obj = {};
	// ID, course title prasing
	curr_sec_obj["id"] = (section.abbreviation + section.course_number + "-"
		+ section.type.substring(0, 3)).toLowerCase();

	var split_arr = ((section.instructor).split(","));
	var instructor_str = (split_arr[0] != 'TBA') ? split_arr[0] : '';
	if (split_arr.length > 1) {
		instructor_str += " + " + (split_arr.length - 1) + " others";
	}

	if (section.type === "Break") {
		curr_sec_obj["title"] = section.course_title;
	} else {
		curr_sec_obj["title"] = section.abbreviation + " " + section.course_number
		+ " " + section.type.substring(0, 3).toUpperCase() + " " + section.section_number +
		"\n" + instructor_str;
	}

	// Time parsing
	curr_sec_obj["start"] = section.start_time;
	curr_sec_obj["end"] = section.end_time;

  curr_sec_obj["start_date"] = section.start_date
  curr_sec_obj["end_date"] = section.end_date

  //Location
  curr_sec_obj["location"] = section.location

	// Days of week parsing
	var arrOfStr = section.days.split("");
	var arrOfDays = [];
	for (n of arrOfStr) {
		arrOfDays.push(parseInt(n));
	}
	curr_sec_obj["dow"] = arrOfDays;

	curr_sec_obj["url"] = "#"; // TODO: maybe add to this if necessary

	// Check color mapping
	var curr_name = (section.abbreviation + section.course_number).toLowerCase();
	if (colorMap.hasOwnProperty(curr_name)) { // color already assigned to this class
		curr_sec_obj["color"] = colorMap[curr_name];
	} else {
		if (colorCount < colorArray.length) { // use preset colors
			colorMap[curr_name] = colorArray[colorCount];
			curr_sec_obj["color"] = colorMap[curr_name];
			colorCount += 1;
		} else {
			curr_sec_obj["color"] = "rgb(" + generateRandomRGB().toString() + ")";
		}
	}

	return curr_sec_obj;
}

// Helper function for buildCCNDict.
function buildFinalsObject(fin) {
	var curr_fin_obj = {};

	// ID, course title prasing
	curr_fin_obj["id"] = (fin.abbreviation + fin.course_number).toLowerCase() + "-fin";
	curr_fin_obj["title"] = fin.abbreviation + " " + fin.course_number + " FINAL";

	// TODO: temp time parsing
	curr_fin_obj["start"] = fin.final_start;
	curr_fin_obj["end"] = fin.final_end;

	// Day of final
	curr_fin_obj["dow"] = fin.final_day;

	curr_fin_obj["url"] = "#"; // TODO: maybe add to this if necessary


  var curr_name = (fin.abbreviation + fin.course_number).toLowerCase();
	if (colorMap.hasOwnProperty(curr_name)) { // color already assigned to this class
		curr_fin_obj["color"] = colorMap[curr_name];
	} else {
		if (colorCount < colorArray.length) { // use preset colors
			colorMap[curr_name] = colorArray[colorCount];
			curr_fin_obj["color"] = colorMap[curr_name];
			colorCount += 1;
		} else {
			curr_fin_obj["color"] = "rgb(" + generateRandomRGB().toString() + ")";
		}
	}

	return curr_fin_obj;
}

function buildSectionList(rawSchedule) {
	var cleaned_all_scheds = rawSchedule.replace(/u&#39;|&#39;/g, ''); // Remove unicode quotes, parse to ints
	var parsedSchedList = JSON.parse(cleaned_all_scheds);

	return parsedSchedList;
}

function buildScheduleList(mapCCN, listSection) {
    var toReturn = [];
    for (singleSchedule of listSection) {
        var sections = []
        var oneSchedule = {"schedules": [], "uid": Math.floor(Math.random() * 2147483647)};
        for (oneCCN of singleSchedule) {
			sections.push(mapCCN[oneCCN]);
		}
        oneSchedule["schedules"] = sections;
        toReturn.push(oneSchedule);
    }
    return toReturn;
}

function buildFinalsList(finCCN, listSection) {
	var toReturn = [];
	for (singleSchedule of listSection) {
		var oneFinalSchedule = [];
		for (oneCCN of singleSchedule) {
			if (oneCCN in finCCN) {
				oneFinalSchedule.push(finCCN[oneCCN]);
			}
		}
		toReturn.push(oneFinalSchedule);
	}
	return toReturn;
}

function buildEventObject(section) {
  let startTime = section.startdate.slice(0, 11) + section.start + section.startdate.slice(16);
  let endTime = section.startdate.slice(0, 11) + section.end + section.startdate.slice(16);
  let daysOfWeek = section.map((dow) => daysOfWeek[dow]).join(",");

  var event = {
    'location': section.location,
    'originalStartTime': {
      "date" : section.startdate
    },
    'start': {
      'dateTime': startTime,
      'timeZone': 'America/Los_Angeles'
    },
    'end': {
      'dateTime': endTime,
      'timeZone': 'America/Los_Angeles'
    },
    'recurrence': [
      'RRULE:FREQ=WEEKLY;UNTIL=`${section.endWeek}`;BYDAY=`${daysOfWeek}`'
    ]
  }


}


function generateRandomRGB() {
	return [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)];
}

var calVar;
// Whether or not calendar is currently displaying classes. If false, that means it is displaying finals.
var buttonText = 'Finals Schedule';


// List containing each schedule view. Each element in scheduleList is one schedule view.
// Users click the left/right button to increment scheduleIndex, which changes the schedule shown on the calendar.

var scheduleList = [];

// List containing finals for each class. All finals must have a specific day slot assigned, as
// indicated by the special date format. Example: 2010-01-01T14:30:00
var scheduleListFinals = [];

// Sets default "view" to schedule list.
var currList = scheduleList;
var currSchedule;
var events = [];

function updateScheduleCount(currSchedNum, totalSched) {
    $(calendarCountText).text(`${currSchedNum+1} / ${totalSched}`);
}

$(document).ready(function() {
    CCNtoSectionMap = buildCCNDict(all_sections);
	listOfSections = buildSectionList(schedule_str_list);
	scheduleList = buildScheduleList(CCNtoSectionMap["sections_info"], listOfSections);
	scheduleListFinals = buildFinalsList(CCNtoSectionMap["finals_info"], listOfSections);

	if (scheduleList.length == 0) {
		// no schedules were returned
		$('#calendar').html('<div style=\"text-align:center; margin:20px;\">No schedules could be generated due to unavoidable class conflict. Try removing a class or adding more options.</div>');
		return;
	}

	currList = scheduleList;
    currSchedule = currList[scheduleIndex];
    events = currSchedule["schedules"];
	minimumTime = bufferedMinTime(events, 1);
	maximumTime = bufferedMaxTime(events, 1);

	// put first render in schedule-utils.js
	calVar = $('#calendar').fullCalendar({
		customButtons: {
	        toggleFinals: {
	        	text: buttonText,
	        	click: function() {
	        		var thisButton = $(".fc-toggleFinals-button");
	        		if (thisButton.text().charAt(0) === "F") {
	        			// Currently on schedule, switch to finals schedule
	        			currList = scheduleListFinals;
                		scheduleIndex = 0;
             			events = currList[scheduleIndex];
             			buttonText = "Schedule";
	        		} else {
	        			// Currently on finals schedule, switch to regular schedule
	        			currList = scheduleList;
	        			events = currList[scheduleIndex];
             			buttonText = "Finals Schedule";
	        		}
              updateScheduleCount(scheduleIndex, currList.length);
	        		rerender();
	            }
	        },
	        prevSched: {
	        	text: '<',
	        	click: function() {
	        		scheduleIndex = previousSchedIndex(scheduleIndex);
                    currSchedule = currList[scheduleIndex];
                	events = currSchedule["schedules"];
                    updateScheduleCount(scheduleIndex, currList.length);
                    $("#saveButton").show();
                    $("#unsaveButton").hide();
                    $("#exportButton").show();
	            	rerender();
	            }
	        },
	        nextSched: {
	        	text: '>',
	        	click: function() {
	        		scheduleIndex = nextSchedIndex(scheduleIndex);
                    currSchedule = currList[scheduleIndex];
                	events = currSchedule["schedules"];
                    updateScheduleCount(scheduleIndex, currList.length);
                    $("#saveButton").show();
                    $("#unsaveButton").hide();
                    $("#exportButton").show();
	            	rerender();
	            }
	        },
          randomSched: {
            text: 'Random',
            click: function() {
              scheduleIndex = Math.floor(Math.random() * (currList.length - 1));
              currSchedule = currList[scheduleIndex];
          	  events = currSchedule["schedules"];
              updateScheduleCount(scheduleIndex, currList.length);
              rerender();
            }
          }
	    },
		header: {
			left: 'prevSched, randomSched, nextSched',
			center: 'title',
			right: 'toggleFinals',
		},
		height: "auto",
        weekends: false, // Hide Sunday and Saturday
        columnFormat: 'dddd', // Format the day to only show like 'Monday'
		defaultDate: '2017-01-16', // show monday of first week of class
		navLinks: true, // can click day/week names to navigate views
		defaultView: 'agendaWeek', // sets default view to week-like schedule
		allDaySlot: false, // hides all day view
		minTime: "08:00:00", // earliest time
		maxTime: "22:00:00", // latest time
		eventOverlap: false,
		slotEventOverlap: false,
		eventLimit: true, // allow "more" link when too many events
		events: events, // gets current schedule from scheduleList
    theme: true,
    themeSystem: 'jquery-ui',
    eventRender: function(event, element) {
        $(element).hover(function() {
          topAttr = $(this).css('top');
          topValue = parseFloat(topAttr.slice(0, -2))
          newTop = (topValue - 1) + 'px'

          bottomAttr = $(this).css('bottom');
          bottomValue = parseFloat(bottomAttr.slice(0, -2))
          newBottom = (bottomValue + 1) + 'px'


          $(this).css('top', newTop);
          $(this).css('bottom', newBottom);
        }, function() {
          topAttr = $(this).css('top');
          topValue = parseFloat(topAttr.slice(0, -2))
          newTop = (topValue + 1) + 'px'

          bottomAttr = $(this).css('bottom');
          bottomValue = parseFloat(bottomAttr.slice(0, -2))
          newBottom = (bottomValue - 1) + 'px'

          $(this).css('top', newTop);
          $(this).css('bottom', newBottom);
        })
    }
		//timeFormat: ' ', // if you want no time header
	});

	// Change initial title to "Schedule"
	$('#calendar > div.fc-toolbar.fc-header-toolbar > div.fc-center > h2').html('Schedule');

  // Shifting Around FullCalendar Elements
  buttonsDiv = document.createElement('div');
  $(buttonsDiv).addClass('fc-buttons');
  $('#calendar > div.fc-toolbar.fc-header-toolbar > div.fc-left').appendTo(buttonsDiv);
  $('#calendar > div.fc-toolbar.fc-header-toolbar > div.fc-right').appendTo(buttonsDiv);
  $(buttonsDiv).appendTo('#calendar > div.fc-toolbar.fc-header-toolbar');

  calendarCountDiv = document.createElement('div');
  $(calendarCountDiv).addClass('fc-count');
  $(calendarCountDiv).css('margin-left', '0px');
  calendarCountText = document.createElement('h3');
  updateScheduleCount(scheduleIndex, currList.length);
  $(calendarCountText).appendTo(calendarCountDiv);
  $(calendarCountDiv).appendTo('#calendar > div.fc-toolbar.fc-header-toolbar > div.fc-center');


  //Handle Form Submit Popups

  $("#saveButton").ajaxForm({
      success: saveSuccess,
      error: saveFail,
  });

  $("#exportButton").ajaxForm({
      success: exportSuccess,
      error: exportFail,
  });

  $("#unsaveButton").ajaxForm({
      success: unsaveSuccess,
      error: unsaveFail,
  });

  function saveSuccess(responseText, statusText, xhr, $form)  {
    swal({
      title: "Schedule Saved!",
      text: "Your schedule has been successfully saved",
      icon: "success",
      className: "main-font",
    });
    $("#saveButton").hide();
    $("#unsaveButton").show();
  }

  function saveFail(responseText, statusText, xhr, $form)  {
    swal({
    title: "Schedule Save Error",
    text:  "There has been an error saving the schedule. Please refresh and try again",
    icon: "error",
    className: "main-font",
    });
  }

  function unsaveSuccess(responseText, statusText, xhr, $form)  {
    swal({
      title: "Schedule Unsaved!",
      text: "Your schedule has been successfully unsaved",
      icon: "success",
      className: "main-font",
    });
    $("#unsaveButton").hide();
    $("#saveButton").show();
  }

  function unsaveFail(responseText, statusText, xhr, $form)  {
    swal({
    title: "Schedule Unsave Error",
    text:  "There has been an error unsaving the schedule. Please refresh and try again",
    icon: "error",
    className: "main-font",
    });
  }

  function exportSuccess(responseText, statusText, xhr, $form)  {
    swal({
      title: "Schedule Exported!",
      text: "Your schedule has been successfully exported",
      icon: "success",
      className: "main-font",
      buttons: {
        newWindow: "Go to Google Calender",
        exit: true,
      }
    })
    .then((value) => {
      switch(value) {
        case 'newWindow':
          window.open("https://calendar.google.com/calendar/");;
          break;
        default:
          break;
      }
    });
    $("#exportButton").hide();
  }

  function exportFail(responseText, statusText, xhr, $form)  {
    swal({
      title: "Schedule Export Error!",
      text: "There has been an error exporting the schedule. Please refresh and try again",
      icon: "error",
      className: "main-font",
    });
  }

	// Detect arrow press
	document.onkeydown = checkKey;

  	// $("#backButton").on("click", function() {
  	// 	window.history.back();
	// })

	function checkKey(e) {
		e = e || window.event;

		 if (e.keyCode === 37 || e.keyCode === 65) {
			$(".fc-prevSched-button").trigger('click');
		}
		else if (e.keyCode === 39 || e.keyCode === 68) {
			$(".fc-nextSched-button").trigger('click');
		}
	}

	// Final rerender to get everything in order
	rerender();

});

// Removes all events and renders the updated calendar view (whether it's a new schedule
// or switching between regular and final schedules).
function rerender() {
	$('.fc-toggleFinals-button').text(buttonText);

	$('#calendar').fullCalendar('removeEvents');
	$('#calendar').fullCalendar('renderEvents', events);

	var titleText = '';
	if (buttonText === "Schedule") {
		titleText = 'Finals Schedule ' + (scheduleIndex + 1);
	} else {
		titleText = 'Schedule ' + (scheduleIndex + 1);
	}
	$('#calendar > div.fc-toolbar.fc-header-toolbar > div.fc-center > h2').text(titleText);
    var sectionInfo = [listOfSections[scheduleIndex]];
    var data = JSON.stringify({"uid": currSchedule["uid"], sectionInfo});
    document.getElementById('export_sched_form_data').value = data;
    document.getElementById('save_sched_form_data').value = data;
    document.getElementById('unsave_sched_form_data').value = data;
}

// Gets the earliest time that a given schedule starts at buffered by buffer amount before
function bufferedMinTime(events, bufferHours) {
	var earliest = events[0].start;
	events.forEach(function(event) {
		if(event.start.localeCompare(earliest) < 0) {
			earliest = event.start;
		}
	});
	return shiftTime(earliest, bufferHours * -1)
}

// Gets the latest time that a given schedule ends at buffered by buffer amount after
function bufferedMaxTime(events, bufferHours) {
	var latest = events[0].end;
	events.forEach(function(event) {
		if(event.end.localeCompare(latest) > 0) {
			latest = event.end;
		}
	});
	return shiftTime(latest, bufferHours)
}

// Takes in a String time in the form of HH:mm:ss and returns a String time shifted by shiftInHours
function shiftTime(time, shiftInHours) {
	var timeMoment = moment(time, "HH:mm:ss")
	timeMoment.add(shiftInHours, 'hour');
	var hour = timeMoment.hour().toString();
	var minute = timeMoment.minute().toString();
	var second = timeMoment.second().toString();
	return hour+":"+minute+":"+second;
}

function nextSchedIndex(index) {
    if (scheduleIndex < currList.length - 1){
        return scheduleIndex + 1;
    } else {
        return 0;
    }
}

function previousSchedIndex(index) {
    if (scheduleIndex > 0 ){
        return scheduleIndex - 1;
    } else {
        return currList.length - 1;
    }
}
