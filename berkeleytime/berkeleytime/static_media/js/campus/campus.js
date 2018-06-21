$(document).ready(function() {
    campus.initCampus();

    $(".clear-search").click(function() {
        campus.getAndUpdateCampusState();
    });

    // attach handlers for time controls
    campus.registerTimeControllers();

    $(".control-field.submit").click(function () {
        campus.getAndUpdateCampusState();
    });

    // automatically focus the time selection input field
    $(".control-field.time input").focus().val($(".control-field.time input").val());

    $(".search-bar").keyup(function(e) {
        var searchQuery = $.trim($(this).val());
        searchQuery ? campus.showClearSearchIcon() : campus.hideClearSearchIcon();

        /* Sanitize the input to prevent XSS attacks */
        searchQuery = escape(searchQuery);

        if (e.keyCode === 13) {
            campus.getAndUpdateCampusState(searchQuery);
        }
    });
});
