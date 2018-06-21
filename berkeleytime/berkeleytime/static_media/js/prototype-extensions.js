/********************************************************************************************************************/
/** Native Prototype Extensions *************************************************************************************/
/********************************************************************************************************************/

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.forEach = function (f, scope) {
    if (typeof(f) !== "function") {
        throw new TypeError("String.prototype.forEach: " + f + " is not a function");
    }

    for (var i = 0, len = this.length; i < len; ++i) {
        if (i in this) {
            f.call(scope, this.charAt(i), i, this);
        }
    }
};

Array.prototype.remove = function (matcher) {
    // Matching function
    var match = null;

    // Type of "element"
    var type = Object.prototype.toString.call(matcher);

    // Determine the correct match function to use
    if (type === "[object String]" || type === "[object Number]") {
        match = function (element) {
            return element === matcher;
        };
    } else if (type === "[object Function]") {
        match = matcher;
    } else {
        throw new TypeError("Array.prototype.remove: " + matcher + " is not a String, Number, or function");
    }

    for (var i = 0, len = this.length; i < len; ++i) {
        if (i in this) {
            if (match(this[i])) {
                this.splice(i,1);
            }
        }
    }
}

if (!Array.prototype.forEach) {

    Array.prototype.forEach = function (f, scope) {
        if (typeof(f) !== "function") {
            throw new TypeError("Array.prototype.forEach: " + f + " is not a function");
        }

        for (var i = 0, len = this.length; i < len; ++i) {
            if (i in this) {
                f.call(scope, this[i], i, this);
            }
        }
    };

}

if (!Array.prototype.contains) {
    Array.prototype.contains = function (item) {
        return this.indexOf(item) !== -1;
    };
}

if (!Function.prototype.extends) {
    Function.prototype.extends = function (ParentClass) {
        var Inheritor = function () {}; // dummy constructor
        Inheritor.prototype = ParentClass.prototype;
        this.prototype = new Inheritor();
    };
}
