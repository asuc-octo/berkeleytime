// bt-enroll.js
// functionality bindings, etc for berkeleytime enrollment part of the data app
// dependencies: none

$(document).ready(function () {

    enrollment.initCourseSelect();
    enrollment.initSemesterSelect();
    enrollment.initSectionSelect();

    $("#select_add_button").click(function (e) {
        //these two are important for popover to work correctly
        e.preventDefault();
        e.stopPropagation();
        if ($("#select_course").children(":selected").val() === "" || $("#select_section").val() === "") {
            $("#select_add_button").popover("show");
        } else {
            enrollment.getEnrollmentDataAndAddSection(enrollment.getCurrentCourseInfo(), enrollment.checkAlreadyAdded);
        }
    });

    // TODO: the content of these should really be a data attribute on the element,
    // this may require hacking popover.js though
    $("#select_add_button").popover({
        content: "Please select a section to view its enrollment history."
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
        content: "Sorry, but we don't have any data on this section yet."
    });

    // tour hook
    $(".welcome-highlight").click(function () {
        enrollment.tour();
    });

    // URLs
    enrollment.parseURL();
});
