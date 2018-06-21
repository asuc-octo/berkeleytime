/**
 * Catalog.js is the main javascript for the catalog. When the page loads:
 *
 * 1. Chosen-ify all the select boxes
 * 2. Bind events to the filter buttons and the search bar and the tour button
 * 3. Show the linked course if it was a hard like to a page like /catalog/COMPSCI/161/
 */
$(document).ready(function () {
    $('.sort').select2({
        minimumResultsForSearch: -1,
        containerCssClass: "select_wrapper",
        width: "100%"
    });

    $('.sort').on("select2:select", function () {
        var key = $(this).val();
        catalog.sortAndUpdateCourses(key);
    });

    $('.filter').click(function (e) {
        e.preventDefault();
        window.history.replaceState(null, null, '/catalog/');
        $('.narrow-course').val("");
        $(this).changeState();
        catalog.getJSONAndUpdateCourses();
        catalog.updateBreadcrumbs($(".breadcrumbs")); //container for all breadcrumbs
    });

    $('.narrow-course').keyup(function (e) {
        e.preventDefault();
        var query = $(this).val();
        catalog.filterAndUpdateCourses(query, e);
    });

    $('.narrow').keyup(function (e) {
        e.preventDefault();
        catalog.filterFilters($(this).siblings().find(".searchable"), $(this).val());
    });

    /* Handles links to pages */
    if (!courseID) {
        catalog.getDefaultCourses();
    } else if (courseID) {
        catalog.getCourseWithLink(courseID);
    }

    // tour
    $(".welcome-highlight").click(function () {
        catalog.tour();
    });
});
