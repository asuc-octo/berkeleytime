/************
* DataStore, a wrapper around storing key-valued course and section data for schedul
* @dependency schedule-utils.js
************/
(function() {
"use strict";
if (typeof schedule === "undefined") {
    throw new Error("DEPENDENCY: data-store.js depends on schedule-utils.js");
}

/** @private */
var _instance; // singleton enforcement - there can ONLY be one instance of choices at a time

schedule.DataStore = function () {
    if (_instance)
        return _instance;
    _instance = this;
    return _instance;
};

/**
* Error to throw if we can't find data in the datastore.
* @extends Error
*/
schedule.DataStore.DataStoreNotFoundException = function (msg) {
    this.message = msg || "";
    this.name = "DatastoreNotFoundException";
};
schedule.DataStore.DataStoreNotFoundException.toString = function () {return this.name + ": " + this.msg;};
schedule.DataStore.DataStoreNotFoundException.prototype = new Error();

/**
* Loads dummy data in the DataStore
*/
schedule.DataStore.prototype.storeDummyData = function () {
    this.store(dummy.DummyDataStore.DUMMY_DATASTORE, "spring", "2013");
};

/**
* Given a data store in the format described on the wiki, store it as a DataStore, overwriting previous data.
* @param {dict} newDataStore
*/
schedule.DataStore.prototype.store = function (dataStore, semester, year) {
    this._dataStore = dataStore;
    this._semester = semester;
    this._year = year;
};

/**
* Given a list of courses, ensures that all of the courses are stored in the DataStore
* @param {Array} courseIDs: a list of course IDs
* @param {function} callback
*/
schedule.DataStore.prototype.ensure = function (courseIDs, callback) {
    var _this = this;

    var courseIDString = courseIDs.filter(function (courseID) {
        try {
            _this.lookupCourse(courseID);
            return false;
        } catch(e) {
            return true;
        }
    }).join(",");

    if (courseIDString === "") {
        if (callback)
            callback();
        return;
    }

    var url = "/schedule/course_data?course_ids=" + courseIDString + "&semester=" + this._semester + "&year=" + this._year;

    $.getJSON(url, function (courses) {
        $.each(courses, function (courseID, courseInfo) {
            _this._dataStore[courseID] = courseInfo;
        });
        if (callback)
            callback();
    });
};

/**
* Resets the DataStore to an empty dict.
*/
schedule.DataStore.prototype.clearOrCreate = function (semester, year) {
    this.store({}, semester, year);
};

/**
* Returns the course information for a given ID.
* @param {int} courseID: the course ID
* @throws {schedule.DataStore.DataStoreNotFoundException}
*/
schedule.DataStore.prototype.lookupCourse = function (courseID) {
    if (!this._dataStore[courseID]) {
        throw new schedule.DataStore.DataStoreNotFoundException("Could not find course " + courseID + " in the datastore.");
    }
    return this._dataStore[courseID].course;
};

/**
* Returns the section information for a given course & section ID.
* @param {int} courseID: the course ID
* @param {int} sectionID: the section ID
* @throws {schedule.DataStore.DataStoreNotFoundException}
*/
schedule.DataStore.prototype.lookupSection = function (courseID, sectionID) {
    if (courseID === undefined || sectionID === undefined) {
        throw new schedule.DataStore.DataStoreNotFoundException("Datastore: lookupSction called with invalid IDs: " + courseID + " and " + sectionID + ".");
    }
    var course = this._dataStore[courseID];
    if (course) {
        var section = course.sections[sectionID];
        if (!section) {
            throw new schedule.DataStore.DataStoreNotFoundException("Could not find section " + sectionID + " from course " + courseID + " in the datastore.");
        }
        return section ? section : null;
    } else {
        throw new schedule.DataStore.DataStoreNotFoundException("Could not find course " + courseID + " in the datastore.");
    }
};


/**
* Determine if a section is a primary section.
* @param {int} courseID: the id of the course that the section is in
* @param {int} sectionID: the id of the section
* @return {boolean}
*/
schedule.DataStore.prototype.isPrimarySection = function (courseID, sectionID) {
    return this.lookupSection(courseID, sectionID).kind === this.lookupCourse(courseID).primary_kind;
};

schedule.DataStore.prototype.relatedSectionsNotPrimary = function (courseID, sectionID) {
    var _this = this;
    return _this.lookupSection(courseID, sectionID).related.filter(function (relatedSectionID) {
        return !_this.isPrimarySection(courseID, relatedSectionID);
    });
};

schedule.DataStore.prototype.relatedSectionsPrimary = function (courseID, sectionID) {
    var _this = this;
    return _this.lookupSection(courseID, sectionID).related.filter(function (relatedSectionID) {
        return _this.isPrimarySection(courseID, relatedSectionID);
    });
};

schedule.dataStore = new schedule.DataStore();

})();
