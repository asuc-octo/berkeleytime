$(document).ready(function () {

    $(".tab-class").first().css("background-color", "#1694D2");

    // IMPLEMENT SWAP TABS

    $(".tab-class").click(function(){
        $(".sections:visible").hide();
        var toShow = "." + $(this).attr("data-showdiv");
        $(toShow).show();
        scrollableTables(toShow);
        $(".tab-class").css("background-color", "#46aee2");
        $(this).css("background-color", "#1694D2");
    });

    //IMPLEMENT SCROLLABLE TABLES: THEAD COLUMNS ADJUSTMENT

    function scrollableTables(divToShow) {
        var $table = $(divToShow),
        $bodyCells = $table.find('tbody tr:first').children(),colWidth;

        // Adjust the width of thead cells when window resizes
        $(window).resize(function() {
                // Get the tbody columns width array
                colWidth = $bodyCells.map(function() {
                    return $(this).width();
                }).get();

                // Set the width of thead columns
                $table.find('thead tr').children().each(function(i, v) {
                    $(v).width(colWidth[i] - 5);
                });
            }).resize();
    }

    // First table column adjustment
    scrollableTables('.scroll')

    // IMPLEMENT "SELECT ALL" CHECKBOXES

    $(':checkbox').click(function(event) {
        // select all checkboxes functionality
        if ($(this).attr("class") == "css-checkbox checkbox-all") {
            var courseID = parseInt(this.id.substring(this.id.length - 1)) + 1;
            var checkboxID = "checkbox-" + courseID;

            if(this.checked) {
                $("input[class~='" + checkboxID + "']").each(function() {
                    this.checked = true;
                });
            }

            // Uncheck all checkboxes in category
            else {
                $("input[class~='" + checkboxID + "']").each(function() {
                    this.checked = false;
                });
            }
        }
        // mark the "all" checkbox as checked or unchecked depending on children boxes
        else if ($(this).attr("class").endsWith("checkbox-sec")) {
            var getNum = parseInt($(this).attr("class").replace( /(^.+\D)(\d+)(\D.+$)/i,'$2'));
            var cleanedClass = "checkbox-" + (getNum);
            var allChecked = true;
            $("input[class~='" + cleanedClass + "']").each(function() {
                if (this.checked == false) {
                    allChecked = false;
                }
            });
            if (allChecked) {
                $("#checkbox-all-" + (getNum - 1))[0].checked = true;
            } else {
                $("#checkbox-all-" + (getNum - 1))[0].checked = false;
            }
        }
    });

    // IMPLEMENT RADIOBUTTON-LIKE CHECKBOXES IN PREFERENCES

    $("input[class^='css-checkbox checkbox-rb-']").change(function() {
        var checked = $(this).is(':checked');
        $("input[class='" + $(this).attr("class") + "']").prop('checked',false);
        if(checked) {
            $(this).prop('checked',true);
        }
    });

    // IMPLEMENT ADDING CUSTOM BREAKS
    var allCustomBreaks = {}; // dictionary with key=break name, value=array of break info
    $("#btn-add-break").click(function() {
        var newBreakName = addNewBreak(); // add new break
        if (newBreakName !== "") {
            createBreakElem(newBreakName); // add new html element
            clearBreakInputs(); // clear break inputs
        }

    });

    // Adds new break into allCustomBreaks dictionary. If successfully added,
    // returns name of new break; otherwise returns empty string.
    function addNewBreak() {
        // grab input info
        var breakName = $("#breakName").val();
        if (breakName === "") {
            swal({
                title: "Invalid Break Name",
                text: "Please enter a valid break name",
                icon: "error",
                className: "main-font",
            });
        }
        else {
            var startTime = $("select[name='breakStart']").val();
            var endTime = $("select[name='breakEnd']").val();
            if (parseFloat(endTime) === -1 || parseFloat(startTime) === -1 ||
            parseFloat(endTime) <= parseFloat(startTime)) { // not selected start/end time OR end time is before start time
            swal({
                title: "Invalid Break Time",
                text: "Please select valid break times",
                icon: "error",
                className: "main-font",
            });
        }
        else {
            var breakDays = [];
                $("input[name='breakDays']").each(function() { // grab checked break days
                    if($(this).is(":checked")){
                        breakDays.push(parseFloat($(this).attr("id").slice(-1)));
                    }
                });
                if (breakDays.length <= 0) {
                    swal({
                        title: "No Breaks Selected",
                        text:  "Please select at least one break day",
                        icon: "error",
                        className: "main-font",
                    });
                }
                else {
                    allCustomBreaks[breakName] = {"start": startTime, "end": endTime, "breakDays": breakDays};
                    return breakName;
                }
            }
        }
        return "";
    }

    // Creates and adds new row of custom break.

    function createBreakElem(breakName) {
        var currBreak = allCustomBreaks[breakName];
        var startTime = numToTime(parseFloat(currBreak["start"]));
        var endTime = numToTime(parseFloat(currBreak["end"]));
        var breakDays = currBreak["breakDays"];
        var breakString = "";
        for (x of breakDays) {
            switch (x) {
                case 1:
                breakString += "M "; break;
                case 2:
                breakString += "T "; break;
                case 3:
                breakString += "W "; break;
                case 4:
                breakString += "Th "; break;
                case 5:
                breakString += "F "; break;
                default: break;
            }
        }
        newElem = "<div class='optRow r4'>" +
        "<div class='cell'>" + breakName + "</div>" +
        "<div class='cell'>" + startTime + " - " + endTime + "</div>" +
        "<div class='cell'>" + breakString + "</div>" +
        "<div class='cell rmv'><a href='#' id='btn-rmvbrk-" +
        Object.keys(allCustomBreaks).length + "' class='button button-thin'>Remove Break</a>" +
        "</div></div>";
        $(".prefTable").append(newElem);
    }

    // Helper function for createBreakElem. Takes float
    // time representation and returns string representation.
    // e.g. 13.5 -> "1:30 PM"

    function numToTime(timeNum) {
        var front = Math.floor(timeNum);
        var back = timeNum % 1 === 0 ? ":00" : ":30";
        var ampm = " AM";

        if (front >= 12) {
            ampm = " PM";
        }
        front = front % 12;
        return front + back + ampm;
    }

    // Clears custom break inputs after a new break is created.
    function clearBreakInputs() {
        $(".view-options").find(":checkbox").each(function() {
            if ($(this).attr("name") === "breakDays") { // select all checkboxes in custom breaks

                $(this).prop('checked', false); // clears break day checkboxes
            }
        });
        $("input:text[name='breakName']").val(""); // clear custom break name input
        $("select[name='breakStart']").val(-1); // reset break time dropdowns
        $("select[name='breakEnd']").val(-1);
    }

    // IMPLEMENT REMOVING CUSTOM BREAKS
    $(".prefTable").on('click', "a[id^='btn-rmvbrk-']", function () {
        var thisBreakName = $(this).parent().parent().children(":first").text();
        $(this).parent().parent().remove(); // removes HTML element
        delete allCustomBreaks[thisBreakName];
    });

    // IMPLEMENT SECTIONS <-> OPTIONS SWAP BUTTONS
    $("#btn-select-opts").click(function() {
        if (this.text === "Options") {
            $('.view-sections').hide();
            $('.view-options').show();
            this.text = "Sections";
        }
        else {
            $('.view-options').hide();
            $('.view-sections').show();
            this.text = "Options";
        }
    });

    // SECTIONS -> VIEW SCHEDULE
    var maxSections = 150;
    $('#btn-view-scheds-form').on('submit', function () {
        var checkedSections = [];

        $(".checkbox-sec:checkbox").each(function(){
            if($(this).is(":checked")){
                var thisID = $(this).attr("id");
                var thisCCN = thisID.split("-")[3];
                checkedSections.push(thisCCN);
            }
        });

        var numSections = checkedSections.length;
        if (numSections <= 0) { // No sections selected
            swal({
                title: "No Classes Selected",
                text: "Please select at least one class",
                icon: "error",
                className: "main-font",
            });
            return false;
        }
        else if (numSections > maxSections) {
            swal({
                title: "You've selected too many sections",
                text:  `Please limit your section count to at most ${maxSections} options`,
                icon: "error",
                className: "main-font",
            });
            return false;
        }
        else {
            var ccns = [];
            // Append CCN's
            for (i = 0; i < numSections; i++) {
                var currCCN = checkedSections[i];

                ccns.push(currCCN);
            }

            var constraintBits = [];

            // Append preferences, 13 bits with 0 = not checked, 1 = checked

            $(".view-options").find(":checkbox").each(function() {
                if ($(this).attr("name") !== "breakDays") { // select all checkboxes except custom breaks
                    var bit = $(this).is(":checked") ? "1" : "0";
                    constraintBits.push(bit);
                }
            });

            var sendDictionary = {};
            sendDictionary["ccns"] = ccns;
            sendDictionary["constraintBits"] = constraintBits;
            sendDictionary["breaks"] = allCustomBreaks;

            document.getElementById("view-scheds-form-sections_data").value = JSON.stringify(sendDictionary);
            return true;
        }
    });
});

// Caesar shift of amount. Ex: shift of 3 makes "cat" -> "fcv".
// Used to "encrypt" custom break names.
var caesarShift = function(str, amount) {
    // Wrap the amount
    if (amount < 0)
        return caesarShift(str, amount + 26);
    var output = '';
    for (var i = 0; i < str.length; i ++) {
        var c = str[i];
        if (c.match(/[a-z]/i)) {
            var code = str.charCodeAt(i);
            if ((code >= 65) && (code <= 90))
                c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
            else if ((code >= 97) && (code <= 122))
                c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
        }
        output += c;
    }
    return output;
};

// Converts unicode characters in a String to readable text. Also replaces "&amp;" with "&".
function unicodeToChar(text) {
   return text.replace(/\\u[\dA-F]{4}/gi,
    function (match) {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16)).replace("&amp;", "&");
    });
}

function parseCourseName(courseName) {
    var name = {}
    name.dept = "";
    name.number = "";
    for (var i = 0; i < courseName.length - 1; i++) {
        var c = courseName.charAt(i + 1);
        if (c >= '0' && c <= '9') {
            if (courseName.charAt(i).toUpperCase() == 'C'
                || courseName.charAt(i).toUpperCase() == 'W') {
                name.dept = courseName.substring(0, i).trim();
                name.number = courseName.substring(i).trim();
            } else {
                name.dept = courseName.substring(0, i + 1).trim();
                name.number = courseName.substring(i + 1).trim();
            } break;
        }
    }
    return name;
}

// Returns random lowercase or uppercase letter from a-z, except t and f.
function generateRandomDelimiter() {
    var c = 't';
    while (['t', 'T', 'f', 'F'].indexOf(c) != -1) {
        c = String.fromCharCode(Math.round(Math.random() * 26)
        + 65 + 32 * Math.floor(Math.random() * 2)); // a - z, A - Z
    }
    return c;
}