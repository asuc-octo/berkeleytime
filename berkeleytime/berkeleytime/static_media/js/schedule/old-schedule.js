/** DEPRECATED. PLEASE SEE SCHEDULE.JS FOR CURRENT CODE. */

$(document).ready(function() {
    schedule.initializeLeftColumn();
    schedule.resizeWindow(25);

    $(window).resize(function() {
        schedule.resizeWindow(25);
    });

    schedule.grid = new schedule.Grid("9:00 AM", "6:00 PM");
    schedule.grid.hide();
    schedule.grid.appendTo($(".right"));
});
