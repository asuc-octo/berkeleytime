// grades.js
// functionality bindings, etc for berkeleytime grades app
// dependencies: none
/**
 * Note: this is the main entrypoint for the grades javascript. When the document is ready:
 *
 * 1. Select-ify the select boxes
 * 2. Bind events to the add course buttons, etc
 * 3. Look at the URL, and if it indicates that we should display a bar graph of grade data,
 *    then display it.
 */

$(document).ready(function () {

    grades.initCourseSelect();
    grades.initTypeSelect();
    grades.initPrimarySelect();
    grades.initSecondarySelect();

    $("#select_add_button").click(function (e) {
        //these two are important for popover to work correctly
        e.preventDefault();
        e.stopPropagation();
        // callback for checking if its the same section
        grades.getGradesAndAddSection(grades.getSelectedGrades(), grades.getBarText(), grades.checkAlreadyAdded);
    });

    $("#select_add_button").popover({
        content: "Please select a class to view its grade distributions."
    });

    $("#select_question_button").popover({
        trigger: "hover",
        content: "Only four courses can be selected at a time. Please remove one to add another course."
    });

    $("#select_question_button_2").popover({
        trigger: "hover",
        content: "You have already selected this section. Please select another section to add it."
    });

    $("#select_question_button_3").popover({
        trigger: "hover",
        content: "There is no data from past semesters for the selected course. Please select another course."
    });

    // tour
    $(".welcome-highlight").click(function () {
        grades.tour();
    });

    // URLs
    grades.parseURL();
});
