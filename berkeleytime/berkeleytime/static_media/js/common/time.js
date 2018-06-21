var time = {};

(function () {

time.days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
* Given a day as either a string or a number, return a standard string, or null if it cannot be standardized.
* @param {int|string} dayInput: the day to standardize
* @return {string|null}
*/
time.standardDay = function (dayInput) {
    if (typeof(dayInput) === "string" ){
        if (!window.isNaN(dayInput) && dayInput.length === 1) {
            var num = window.parseInt(dayInput, 10);
            if (num >= 0 && num <= 6) {
                return time.days[num].toLowerCase();
            } else {
                return null;
            }
        } else if (time.days.contains(dayInput.capitalize())) {
            return dayInput.toLowerCase();
        } else {
            return null;
        }
    } else if (typeof(day) === "number" && day >= 0 && day <= time.days.length) {
        return time.days[day].toLowerCase();
    } else {
        return null;
    }
};

/**
* Returns the name to display (e.g. Wednesday) of a day given an unstandardized input,
* or null if the input is not valid.
* @param {int|string} dayInput: the day to standardize
*/
time.numDay = function (dayInput) {
    var stdDay = time.standardDay(dayInput);
    return stdDay ? time.days.indexOf(stdDay.capitalize()) : null;
};

/**
* Given a number, return the corresponding day as a string.
* @param {string} num: the number, indexed from 0 at monday
*/
time.dayAsString = function (num) {
    // time.days starts with sunday, so there's no need to -1 from the given num to get the correct array index.
    return time.days[window.parseInt(num)].toLowerCase();
};

time.months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

time.standardHours = [
    "6:00",
    "6:30",
    "7:00",
    "7:30",
    "8:00",
    "8:30",
    "9:00",
    "9:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
    "23:00",
    "23:30"
];

/**
* Standard hours, but only whole hours (not 1:30, 2:30, etc)
*/
time.scheduleDisplayHours = time.standardHours.filter(function (item, index) {
    return index % 2 === 0;
});


/**
* Given an input time in the form "HH:MM*.", trims and returns the split value between
* the colon.
* @param inputTime {string}
* @return {object}, with "hours": hours, "minutes": minutes
*/
time.splitTime = function (inputTime) {
    var trimmed = inputTime.trim();
    trimmed = trimmed.replace(/^00/, "0");
    if (trimmed.indexOf(":") === -1) {
        if (trimmed.length > 4 || trimmed.length < 3) {
            throw new TypeError("Could not sanitize string: " + inputTime + ".");
        } else if (trimmed.length === 4) {
            trimmed = trimmed.slice(0, 2) + ":" + trimmed.slice(2, trimmed.length);
        } else {
            trimmed = trimmed.slice(0, 1) + ":" + trimmed.slice(1, trimmed.length);
        }
    }
    var split = trimmed.split(":");
    var hours = split[0];
    var minutes = split[1];
    return {hours: hours, minutes: minutes};
};

/**
* Normalizes any time to 24 hour time for processing.
* @param {string} (inputTime) the time to convert (e.g. "1:30 PM")
* @return {string} the converted time
*/
time.standardTime = function (inputTime) {
    var split = time.splitTime(inputTime);
    var hours = window.parseInt(split.hours);
    if (hours === 0) hours = 24;

    if (hours === 12 && inputTime.indexOf("AM") !== -1) {
        hours = 0;
    }
    if (inputTime.indexOf("PM") !== -1 && hours !== 12) {
        hours = hours + 12;
    }
    return "" + hours + ":" + split.minutes.replace("AM", "").replace("PM", "").trim();
};

/**
* Normalizes any time to 24 hour time for storing as a data attribute of an html element.
* @param {string} (inputTime) the time to convert (e.g. "1:30 PM")
* @return {string} the converted time
*/
time.htmlTime = function (inputTime) {
    return time.standardTime(inputTime).replace(":", "");
};

/**
* Given a standard time, outputs what we want to display on the left side of the time.
* @param {string} inputTime the standardized (via time.standardTime) time to render
* @return {string} the rendered time
* @param {boolean=} shouldUsePostFix: whether or not to append the "AM" and "PM"
*/
time.renderTime = function (inputTime, shouldUsePostfix) {
    if (shouldUsePostfix === undefined) {
        shouldUsePostfix = true;
    }
    var split = time.splitTime(inputTime);
    var hours = window.parseInt(split.hours);


    var postfix = "AM";
    if (hours >= 12) {
        hours = hours - 12;
        postfix = "PM";
    }
    if (hours === 0) hours = 12;

    var minutes = split.minutes;
    if (minutes.length !== 2) {
        minutes = "0" + minutes;
    }
    var result = hours + ":" + minutes;
    if (shouldUsePostfix) {
        return result + " " + postfix;
    } else {
        return result;
    }
};

/**
* Given two standardized times, compares them for equality.
* @param {string} t1
* @param (string) t2
* @return {int} 0 if t1 == t2, 1 if t1 > t2, -1 if t1 < t2
*/
time.compareTimes = function (t1, t2) {
    t1 = time.standardTime(t1);
    t2 = time.standardTime(t2);
    var parts1 = t1.split(":");
    var parts2 = t2.split(":");
    if (parts1[0] === parts2[0]) {
        return parts1[1].localeCompare(parts2[1]);
    }

    var t1int = window.parseInt(parts1[0]);
    var t2int = window.parseInt(parts2[0]);
    if (t1int === t2int) return 0;
    if (t1int >= t2int) return 1;
    if (t1int <= t2int) return -1;
};

time.minTime = function (t1, t2) {
    if (time.compareTimes(t1, t2) > 0) {
        return t2;
    } else {
        return t1;
    }
};

time.maxTime = function (t1, t2) {
    if (time.compareTimes(t1, t2) < 0) {
        return t2;
    } else {
        return t1;
    }
};

/**
* Given a list of times, find the earliest one.
* @param {Array} times
* @tested
*/
time.findEarliest = function (times) {
    var reducer = function (current, next) {
        if (time.compareTimes(current, next) > 0) { // if current is after next
            return next;
        }
        return current;
    };
    return times.reduce(reducer, time.standardHours[time.standardHours.length - 1]);
};

/**
* Given a list of times, find the latest one.
* @param {Array} times
* @tested
*/
time.findLatest = function (times) {
    var reducer = function (current, next) {
        if (time.compareTimes(current, next) < 0) { // if current is before next
            return next;
        }
        return current;
    };
    return times.reduce(reducer, time.standardHours[0]);
};

/*
* Calculate the number of half hours between the given times.
* @param {string} start HH:MM (AM|PM)
* @param {string} end HH:MM (AM|PM)
* @return {int} the number of calculated half hours
*/
time.calculateHalfHours = function (start, end) {
    start = time.standardTime(start);
    end = time.standardTime(end);
    var parts1 = time.splitTime(start);
    var parts2 = time.splitTime(end);
    parts1.hours = window.parseInt(parts1.hours);
    parts2.hours = window.parseInt(parts2.hours);

    if (parts2.hours < parts1.hours) {
        return -1;
    }
    var diff = parts2.hours - parts1.hours;
    if (parts1.minutes === parts2.minutes) {
        return diff * 2;
    }

    switch (parts1.minutes + parts2.minutes) {
        case "3030":
        case "0000": return diff * 2;
        case "0030": return diff * 2 + 1;
        case "3000": return diff * 2 - 1;
        default: return -1;
    }
};

/**
* Given a standard time string, return another time string offset by a given number of minutes.
* @param {int} minutes: the number of minutes to add/subtract from the time. Can be negative/positive.
* @param {string} currentTime: the time to offset from
*/
time.offsetByMinutes = function (minutes, currentTime) {
    currentTime = time.standardTime(currentTime);
    var currentDate = new Date();
    var split = time.splitTime(currentTime);
    currentDate.setHours(split.hours);
    currentDate.setMinutes(split.minutes);
    var resultDate = new Date(currentDate.getTime() + 1000 * 60 * minutes);
    return time.standardTime(resultDate.getHours() + ":" + resultDate.getMinutes());
};

/**
* Return true if the given time is a valid string that can be converted to a standard time, and
* false otherwise. Note that 24 hour time is still valid.
*/
time.isValidCampusTime = function (inputTime) {
    if (inputTime.length > 5 || inputTime.length < 4) return false;
    if (inputTime.indexOf(":") === -1) return false;
    var lastChar = inputTime.charAt(inputTime.length - 1);
    if (lastChar !== "5" && lastChar !== "0") return false;
    return !window.isNaN(inputTime.replace(":", ""));
};

/**
* Return true if the given date is today. False otherwise.
* @param {Date} date: date to check (if it's today)
* @return {boolean}
*/
time.isToday = function (date) {
    return time.isNDaysFromNow(0, date);
};

/**
* Return true if the given date is tomorrow. False otherwise.
* @param {Date} date: date to check (if it's tomorrow)
* @return {boolean}
*/
time.isTomorrow = function (date) {
    return time.isNDaysFromNow(1, date);
};

/**
* Given some number n, return true if the given date is n days from the current date. False otherwise.
* @param {int} n: the number of days from now to check (can be negative or 0)
* @param {Date} date: date to check against
* @return {boolean}
*/
time.isNDaysFromNow = function (n, date) {
    var nDaysFromNow;
    if (n === 0) {
        nDaysFromNow = new Date();
    } else {
        nDaysFromNow = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * n);
    }
    return (
        date.getMonth() === nDaysFromNow.getMonth() &&
        date.getDate() === nDaysFromNow.getDate() &&
        date.getYear() === nDaysFromNow.getYear()
    );
};

})();