// schedule.js
// functionality bindings, etc for berkeleytime scheduler app
// dependencies: none
/**
 * Note: this is the main entrypoint for the grades javascript. When the document is ready:
 *
 * 1. Select2-ify the select boxes
 * 2. Bind events to the add course buttons, etc
 */



// IMPLEMENT DROPDOWN-TRIGGERED COURSE BOX
$(document).on('change', '#select_course', function() {
    var target = $(this).data('target');
    var thisID = $("option:selected", this).attr("value");
    $(".tbd").attr("id", "btn-more-info-" + thisID);
});

var matcher = function (term, text) {
    if (term.hasOwnProperty("term")) {
        var words = term.term.trim().toUpperCase().split(" ");
        words[0] = bt_utils.fixClassPseudonym(words[0]);
        return text.text.indexOf(words.join(" ")) > -1;
    }
    return false;
};

$(document).ready(function () {
    schedule.createAndInitializeNewCourseDropdown();

    $('.div-toggle').trigger('change');

    $("#select_add_button").click(function (e) {
        //these two are important for popover to work correctly
        e.preventDefault();
        e.stopPropagation();

        schedule.setNewCourseRow();
    });

    $("#select_add_button").popover({
        trigger: "hover",
        content: "Add a new row"
    });

    $("#select_question_button").popover({
        trigger: "hover",
        content: "Select a class from the dropdown"
    });

    $("a[id^='btn-more-info-']").click(function () {
        courseBox.initCourseBox("overview", $(this).data("id"));
    });

    $('#btn-select-sec-form').on('submit', function () {
        //swal('Form submitted!');
        var checkedClasses = [];
        $(".css-checkbox:checkbox").each(function(){
            if($(this).is(":checked")){
                checkedClasses.push($(this).attr("id"));
            }
        });

        var numClasses = checkedClasses.length;
        if (numClasses <= 0) { // No classes selected
            swal({
                title: "No Classes Selected",
                text: "Please select at least one class",
                icon: "error",
            });
            return false;
        }

        // CLASSES -> SECTIONS SET COURSE_ID
        else {
            var courseIDs = [];
            for(i = 0; i < numClasses; i++) {
                var currID = checkedClasses[i].replace("checkbox-", "")
                courseIDs.push(currID);
            }

            document.getElementById("sel-sec-form-course_ids").value = JSON.stringify(courseIDs);
            return true;
        }
    });
});
