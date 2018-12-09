/* Berkeleytime Utils Javascript Library */

var bt_utils = bt_utils || {};

(function(window, $) {
    "use strict";

bt_utils.gradeList = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'P', 'NP'];

bt_utils.gradeToColorTable = {
    "A+": "#A0F06C", "A": "#83F03C", "P": "#83F03C", "A-": "#58E000",
    "B+": "rgb(252, 205, 152)", "B": "rgb(261, 186, 118)", "B-": "#f9aa2d",
    "C+": "#F46E8F", "C": "#F43D6B", "C-": "#E9003A",
    "D": "#AE2C4C", "F": "#970026", "NP": "#970026", "": "#4F4F4F", "N/A": "#4F4F4F"
};

bt_utils.percentToColorList = [
    "#A0F06C",
    "#58E000",
    "#FFB673",
    "#FF9B40",
    "#FF7A00",
    "#F43D6B",
    "#E9003A"
];

bt_utils.laymanToAbbreviation = {
    "ASTRO": "ASTRON",
    "CS": "COMPSCI",
    "MCB": "MCELLBI",
    "NUTRISCI": "NUSCTX",
    "BIOE": "BIO ENG",
    "BIOENG": "BIO ENG",
    "BIO": "BIOLOGY",
    "CIVE": "CIV ENG",
    "CIV E": "CIV ENG",
    "CHEME": "CHM ENG",
    "CIVENG": "CIV ENG",
    "CLASSICS": "CLASSIC",
    "COGSCI": "COG SCI",
    "COLLEGE WRITING": "COLWRIT",
    "COMPLIT": "COM LIT",
    "COMLIT": "COM LIT",
    "CYPLAN": "CY PLAN",
    "CP" : "CY PLAN",
    "DESINV": "DES INV",
    "DESIGN" : "DES INV",
    "DEVENG": "DEV ENG",
    "DEVSTD": "DEV STD",
    "DS" : "DATASCI",
    "EALANG": "EA LANG",
    "ED": "ENV DES",
    "EE": "EL ENG",
    "ERG": "ENE,RES",
    "ER": "ENE,RES",
    "ENERES": "ENE,RES",
    "E": "ENGIN",
    "ENGINEERING": "ENGIN",
    "ENVSCI": "ENV SCI",
    "ETHSTD": "ETH STD",
    "EURAST": "EURA ST",
    "GEOLOGY": "GEOG",
    "HINURD": "HIN-URD",
    "HUMBIO": "HUM BIO",
    "IB": "INTEGBI",
    "IE": "IND ENG",
    "IEOR": "IND ENG",
    "LING": "LINGUIS",
    "L&S": "L & S",
    "LS": "L & S",
    "MALAYI": "MALAY/I",
    "MATSCI": "MAT SCI",
    "MS": "MAT SCI",
    "MSE": "MAT SCI",
    "MECENG": "MEC ENG",
    "MECHE": "MEC ENG",
    "MECH E": "MEC ENG",
    "ME": "MEC ENG",
    "MEDST": "MED ST",
    "MESTU": "M E STU",
    "MIDDLE EASTERN STUDIES": "M E STU",
    "MILAFF": "MIL AFF",
    "MILSCI": "MIL SCI",
    "NEUROSCI": "NEUROSC",
    "NE": "NUC ENG",
    "NESTUD": "NE STUD",
    "MEDIA": "MEDIAST",
    "PE": "PHYS ED",
    "PHYSED": "PHYS ED",
    "PHILO": "PHILOS",
    "PHIL": "PHILOS",
    "POLI ECON" : "POLECON",
    "POLIECON" : "POLECON",
    "PHILOSOPHY": "PHILO",
    "PMB": "PLANTBI",
    "POLSCI": "POL SCI",
    "POLISCI": "POL SCI",
    "PS" : "POL SCI",
    "PUBPOL": "PUB POL",
    "PP": "PUB POL", 
    "PUBLIC POLICY": "PUB POL",
    "PUBAFF": "PUB AFF",
    "PSYCHOLOGY": "PSYCH",
    "SASIAN": "S ASIAN",
    "SSEASN": "S,SEASN",
    "STATS": "STAT",
    "TDPS": "THEATER",
    "HAAS": "UGBA",
    "VIETNAMESE": "VIETNMS",
    "VISSCI": "VIS SCI",
    "VISSTD": "VIS STD",
};

bt_utils.gradeToColor = function(grade) {
    return bt_utils.gradeToColorTable[grade];
};

bt_utils.percentToColor = function(percent) {
    if (window.isNaN(percent)) {
        return bt_utils.percentToColorList[bt_utils.percentToColorList.length-1];
    }
    return bt_utils.percentToColorList[Math.max(0, Math.min(Math.floor(percent/100 * (bt_utils.percentToColorList.length-1)), bt_utils.percentToColorList.length-1))];
};

bt_utils.binaryToColor = function(number) {
    if (number > 0) {
        return "#E9003A"; //red
    } return "#A0F06C"; //green
};

bt_utils.fractionToColor = function (numerator, denominator) {
    if (denominator === 0 || window.isNaN(denominator) || window.isNaN(numerator)) {
        return '#888';
    }
    return this.percentToColor((numerator / denominator) * 100);
};

/*
Arguments: selector, a jquery selector, and html, the updated html
Side effects: Updated the DOM element specified by selector with
html.
*/
bt_utils.updateHTML = function (selector, html) {
    $(selector).html(html);
};

bt_utils.ordinal = function (n) {
    if (10 < n && n < 14) return n + 'th';
    switch (n % 10) {
        case 1: return n + 'st';
        case 2: return n + 'nd';
        case 3: return n + 'rd';
        default: return n + 'th';
    }
};

bt_utils.formatGPA = function (gpa) {
    var stringGPA = "" + gpa;
    if (stringGPA.length === 1) {
        return stringGPA + ".00";
    } else {
        return stringGPA;
    }
};

/*
Exception: an Exception that will me thrown if something goes wrong because of incorrect implementation.
Note: in javascript, Exceptions are functions. Use: throw new ImplementedIncorrectlyException.
*/
bt_utils.ImplementedIncorrectlyException = function (message) {
    this.message = message;
    this.name = "ImplementedIncorrectlyException";
};


bt_utils.DataNotFoundException = function (message) {
    this.message = message;
    this.name = "DataNotFoundException";
};

bt_utils.ImportError = function (message) {
    this.message = message;
    this.name = "ImportError";
};

bt_utils.fixClassPseudonym = function (abbr) {
    if (bt_utils.laymanToAbbreviation.hasOwnProperty(abbr)) {
        return bt_utils.laymanToAbbreviation[abbr];
    }
    return abbr;
};

bt_utils.choice = function (choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
};

// bt_utils.apply_textbooks

})(window, $);
