var scheduleIndex = 0;
var events = {};
var colorCount = 0;
// preset colors in RGB
var colorArray = ['#d32f2f', '#F57C00', '#FBC02D', '#388E3C', '#1976D2', '#7B1FA2'];
var colorMap = {};

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
    curr_sec_obj["title"] = section.abbreviation + " " + section.course_number
    + " " + section.type.substring(0, 3).toUpperCase() + " " + section.section_number +
    "\n" + instructor_str;

    // Time parsing
    curr_sec_obj["start"] = section.start_time;
    curr_sec_obj["end"] = section.end_time;

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
    var cleaned_all_scheds = rawSchedule.replace(/u'|'/g, '"'); // Remove unicode quotes, parse to ints
    var parsedSchedList = JSON.parse(cleaned_all_scheds);
    parsedSchedList.forEach((item) => {
        sectionNumArray = item["sections"].map(Number);
        item["sections"] = sectionNumArray
    })
    return parsedSchedList;
}

function buildScheduleList(mapCCN, listSection) {
    var toReturn = [];
    for (singleSchedule of listSection) {
        var oneSchedule = {"schedules": [], "uid": singleSchedule["uid"]};
		for (oneCCN of singleSchedule["sections"]) {
			oneSchedule["schedules"].push(mapCCN[parseInt(oneCCN)]);
        }
        toReturn.push(oneSchedule);
    }
    return toReturn;
}

function buildFinalsList(finCCN) {
    var toReturn = [];
    for (var fin in finCCN) {
        var oneFinal = []
        oneFinal.push(finCCN[fin]);
        toReturn.push(oneFinal);
    }
    return toReturn;
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

function updateScheduleCount(currSchedNum, totalSched) {
    $(calendarCountText).text(`${currSchedNum+1} / ${totalSched}`);
}

$(document).ready(function() {
    currList = [];
    CCNtoSectionMap = buildCCNDict(all_sections);
    listOfSections = buildSectionList(sched);
    scheduleList = buildScheduleList(CCNtoSectionMap["sections_info"], listOfSections);
    scheduleListFinals = buildFinalsList(CCNtoSectionMap["finals_info"]);
    currList = scheduleList;

    currSchedule = currList[scheduleIndex];
	events = currSchedule["schedules"];
    rerender();

    // put first render in schedule-utils.js
    var calVar = $('#calendar').fullCalendar({
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
                        currSchedule = currList[scheduleIndex];
                    	events = currSchedule["schedules"];
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
                    $("#exportButton").show();
                    $("#deleteButton").show();
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
                    $("#exportButton").show();
                    $("#deleteButton").show();
                    rerender();
                }
            },
          randomSched: {
            text: 'Random',
            click: function() {
              scheduleIndex = Math.floor(Math.random() * (currList.length + 1));
              currSchedule = currList[scheduleIndex];
          	  events = currSchedule["schedules"];
              updateScheduleCount(scheduleIndex, currList.length);
              $("#exportButton").show();
              $("#deleteButton").show();
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
        minTime: "08:00:00", // bufferedMinTime(events, 1), earliest time
        maxTime: "22:00:00", // bufferedMaxTime(events, 1), latest time
        eventOverlap: false,
        slotEventOverlap: false,
        eventLimit: true, // allow "more" link when too many events
        events: events, // gets current schedule from scheduleList
    theme: true,
    themeSystem: 'jquery-ui',
        //timeFormat: ' ', // if you want no time header
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
    });

    // Change initial title to "Schedule"
    $('#calendar > div.fc-toolbar.fc-header-toolbar > div.fc-center > h2').html('Saved Schedules');

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

  $("#exportButton").ajaxForm({
      success: exportSuccess,
      error: exportFail,
  });
  $("#deleteButton").ajaxForm({
      success: deleteSuccess,
      error: deleteFail,
  });

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

  function deleteSuccess(responseText, statusText, xhr, $form)  {
    swal({
      title: "Schedule Deleted!",
      text: "Your schedule has been successfully deleted",
      icon: "success",
      className: "main-font",
    });
    currList.splice(scheduleIndex, 1);
    if (currList.length == 0) {
        location.reload();
    }
    scheduleIndex = previousSchedIndex(scheduleIndex);
    currSchedule = currList[scheduleIndex];
    events = currSchedule["schedules"];
    updateScheduleCount(scheduleIndex, currList.length);
    $("#exportButton").show();
    $("#deleteButton").show();
    rerender();
  }

  function deleteFail(responseText, statusText, xhr, $form)  {
    swal({
    title: "Schedule Delete Error",
    text:  "There has been an error deleting the schedule. Please refresh and try again",
    icon: "error",
    className: "main-font",
    });
  }

  	// Detect arrow press
	document.onkeydown = checkKey;

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
    document.getElementById('delete_sched_form_data').value = data;
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
