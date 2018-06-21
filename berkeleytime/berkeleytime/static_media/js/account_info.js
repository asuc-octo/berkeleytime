$(document).ready(function () {
    $major = $("#select_major.chosen");
    $major.chosen({search_contains: true, max_selected_options: 3 }).change(onMajorChange);

    var onMajorChange = function () {
        return 1;
    };
});
