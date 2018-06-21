// shorten the console.log to c
window.c = function (s) {console.log.call(console, s);};

// on result of an ajax error, throw the error
$(document).ajaxError(function (e,j,a,t) {
    console.log("OH NOES THERE WAS AN ERROR!!");
    throw t;
});

window.debugUndefined = function (name) {
    if (name === undefined) {
        debugger;
    }
};
