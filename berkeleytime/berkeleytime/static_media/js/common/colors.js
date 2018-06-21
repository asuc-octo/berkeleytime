/********************************************************************************************************************/
/** Colors **********************************************************************************************************/
/********************************************************************************************************************/

var colorstore = colorstore || {};

(function () {
"use strict";

/**
* Schedule section colors.
*/
colorstore.berkeleytime = {
    pink: {primary: "#f18875", highlight: "#ea4c4c"},
    orange: {primary: "rgb(252, 205, 152)", highlight: "#f9aa2d"},
    blue: {primary: "#a4d9f3", highlight: "#3fa9de"},
    green: {primary: "rgb(176, 231, 143)", highlight: "#3fa639"},
    gray: {primary: "#C7C7C7", highlight: "#7a7a7a"},
    purple: {primary: "rgb(219, 182, 243)", highlight: "rgb(158, 95, 153)"}
};

//fad22b
// schedule.colors = {};
// schedule.colors.berkeleytime = {
//     pink: {primary: "#f46e8f", highlight: "#F43D6B"},
//     orange: {primary: "#FFB673", highlight: "#FF9C40"},
//     blue: {primary: "#5FC0CE", highlight: "#36BBCE"},
//     green: {primary: "#A0F06C", highlight: "#83F03C"},
//     gray: {primary: "#C7C7C7", highlight: "#7a7a7a"},
//     purple: {primary: "#e3bce6", highlight: "#b960c3"},
// };

// not used
// schedule.colors.ninjacourses = {
//     blue: {primary: "#C7E9FE", highlight: "#4ab8fc"},
//     purple: {primary: "#e3bce6", highlight: "#b960c3"},
//     green: {primary: "#c8ffb8", highlight: "#67ff38"},
//     orange: {primary: "#ffe999", highlight: "#ffc800"},
//     pink: {primary: "#fde8e8", highlight: "#ffb8b8"},
//     gray: {primary: "#C7C7C7", highlight: "#7a7a7a"}
// };

/**
* Get random color combinations from schedule.colors.
* @param {int} num the number of color combinations to get.
* @return {Array} the combinations.
*/
// schedule.colors.getRandomColors = function (num) {
//     var rtn = [],
//         colors = ["pink", "orange", "blue", "green", "purple"], // dont add gray until we have to
//         color;

//     if (num > 5) {
//         colors.push("gray");
//     }
//     for (var i=0; i<num; i++) {
//         if (colors.length === 0) {
//             colors = ["pink", "orange", "blue", "green", "purple", "gray"];
//         }
//         color = utils.choice(colors);

//         var primary = schedule.colors.ninjacourses[color].primary;
//         var highlight = (schedule.colors.berkeleytime[color] && schedule.colors.berkeleytime[color].highlight) ||
//             schedule.colors.ninjacourses[color].highlight;
//         rtn.push({primary: primary, highlight: highlight});
//         colors.remove(color); //remove the color from the array so we dont use it twice
//     }
//     return rtn;
// };

/**
* Get a determenistic (the same every time) set of color combinations from schedule.colors. Note that
* if we try to get more colors than there are, colors will be repeated.
* @param {int} num: the number of colors to get
*/
colorstore.getStandardColors = function (num) {
    var rtn = [],
    colors = ["orange", "green", "blue", "purple", "pink"], // dont add gray until we have to.
    color;

    if (num > 5) {
        colors.push("gray");
    }
    for (var i=0; i<num; i++) {
        color = colors[i % colors.length];

        var primary = colorstore.berkeleytime[color].primary;
        var highlight = (colorstore.berkeleytime[color].highlight);
        rtn.push({primary: primary, highlight: highlight});
        colors.remove(color); //remove the color from the array so we dont use it twice
    }
    return rtn;
};

})();
