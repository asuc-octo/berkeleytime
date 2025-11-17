"""
author: Max Wang

compresses enrollment history entries that are equal and within 1 hour of each other
 - only does for 2026 Spring and 2025 Fall terms


port forward local port & hozer-51 mongo port
"""

from datetime import datetime, timedelta, timezone
from math import floor
import pymongo
from pymongo import ReplaceOne
import copy

FROM_COLLECTION = "enrollmenthistories"
TO_COLLECTION = "enrollmenthistories"
QUERY = { "$or": [ { "year": 2026, "semester": "Spring" }, { "year": 2025, "semester": "Fall" } ] }

mongo_db = pymongo.MongoClient("mongodb://localhost:27017/?directConnection=true")["bt"]


def enrollment_singulars_equal(a, b):
    conditions = [
        a.get("status") == b.get("status"),
        a.get("enrolledCount") == b.get("enrolledCount"),
        a.get("reservedCount") == b.get("reservedCount"),
        a.get("waitlistedCount") == b.get("waitlistedCount"),
        a.get("minEnroll") == b.get("minEnroll"),
        a.get("maxEnroll") == b.get("maxEnroll"),
        a.get("maxWaitlist") == b.get("maxWaitlist"),
        a.get("openReserved") == b.get("openReserved"),
        a.get("instructorAddConsentRequired") == b.get("instructorAddConsentRequired"),
        a.get("instructorDropConsentRequired") == b.get("instructorDropConsentRequired"),
    ]
    if not all(conditions):
        return False

    aSeatReservationsEmpty = ("seatReservationCount" not in a) or (a["seatReservationCount"] is None) or (len(a["seatReservationCount"]) == 0)
    bSeatReservationsEmpty = ("seatReservationCount" not in b) or (b["seatReservationCount"] is None) or (len(b["seatReservationCount"]) == 0)
    if aSeatReservationsEmpty != bSeatReservationsEmpty:
        return False

    if (a.get("seatReservationCount") is not None) and (b.get("seatReservationCount") is not None):
        if len(a["seatReservationCount"]) != len(b["seatReservationCount"]):
            return False
        for aRes in a["seatReservationCount"]:
            bRes = None
            found = False
            for bResI in b["seatReservationCount"]:
                if aRes.get("number") == bResI.get("number"):
                    found = True
                    bRes = bResI
                    break
            if not found:
                return False

            if not bRes or aRes.get("maxEnroll") != bRes.get("maxEnroll") or aRes.get("enrolledCount") != bRes.get("enrolledCount"):
                return False


    return True

def within_1_hour(a, b):
    # Check if current entry starts within 1 hour after previous entry ends
    delta = b["startTime"] - a["endTime"]
    return timedelta(0) <= delta <= timedelta(hours=1)


def batch_get_enrollments():
    batch = []
    i = 0
    db_i = 0

    def get_next_enrollment():
        nonlocal batch
        nonlocal i
        nonlocal db_i
        if i >= len(batch):
            batch = list(mongo_db[FROM_COLLECTION].find(QUERY).skip(db_i).limit(5000))
            i = 0
            db_i += len(batch)
            if len(batch) == 0:
                return None
        enrollment = batch[i]
        i += 1
        return enrollment

    return get_next_enrollment


def batch_write(batch_size=5000):
    batch = []

    def write(doc, force=False):
        if doc:
            batch.append(doc)
        if len(batch) == batch_size or (force and len(batch) > 0):
            mongo_db[TO_COLLECTION].bulk_write(batch)
            batch.clear()

    return write

get_next_enrollment = batch_get_enrollments()
write = batch_write()

total = mongo_db[FROM_COLLECTION].count_documents(QUERY)
print_interval = max(1, total // 10)  # Avoid division by zero
processed = 0

while True:
    doc = get_next_enrollment()
    if not doc:
        break

    if processed % print_interval == 0:
        print(f"{floor(processed / total * 100)}%: Processing section {processed}/{total}")
    processed += 1

    new_doc = copy.deepcopy(doc)
    new_doc["history"] = []

    for hidx, entry in enumerate(doc["history"]):
        if hidx > 0 and enrollment_singulars_equal(entry, new_doc["history"][-1]) and within_1_hour(new_doc["history"][-1], entry):
            new_doc["history"][-1]["endTime"] = entry["endTime"]
        else:
            new_doc["history"].append(entry)

    write(ReplaceOne({"_id": new_doc["_id"]}, new_doc))


write(None, force=True)  # Force write the last batch

