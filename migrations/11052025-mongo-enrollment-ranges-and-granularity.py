"""
author: Max Wang

migrates enrollment from MongoDB (pre-enrollment ranges & granularity) to MongoDB (post-enrollment ranges & granularity)
 - only does for 2026 Spring term

dependencies:
1. running local MongoDB server with (old) enrollmenthistories collection

after:
db.enrollmenthistories.renameCollection("enrollmenthistories_old")
db.enrollmenthistories_new.renameCollection("enrollmenthistories")
"""

from datetime import datetime, timedelta
from math import floor
import pymongo

FROM_COLLECTION = "enrollmenthistories"
TO_COLLECTION = "enrollmenthistories_new"

mongo_db = pymongo.MongoClient("mongodb://localhost:27017/?directConnection=true")["bt"]
# mongo_db[TO_COLLECTION].drop()
mongo_db[TO_COLLECTION].create_index([("termId", pymongo.ASCENDING), ("sessionId", pymongo.ASCENDING), ("sectionId", pymongo.ASCENDING)])
mongo_db[TO_COLLECTION].create_index([
    ("year", pymongo.ASCENDING),
    ("semester", pymongo.ASCENDING),
    ("sessionId", pymongo.ASCENDING),
    ("subject", pymongo.ASCENDING),
    ("courseNumber", pymongo.ASCENDING),
    ("sectionNumber", pymongo.ASCENDING),
])


def batch_write(batch_size=5000):
    batch = []

    def write(doc, force=False):
        if doc:
            batch.append(doc)
        if len(batch) == batch_size or (force and len(batch) > 0):
            mongo_db[TO_COLLECTION].insert_many(batch)
            batch.clear()

    return write


write = batch_write()

enrollments = list(mongo_db[FROM_COLLECTION].find({ "year": 2026, "semester": "Spring" }))
for i, doc in enumerate(enrollments):
    if i % (len(enrollments) // 10) == 0:
        print(f"{floor(i / len(enrollments) * 100)}%: Processing section {i}/{len(enrollments)}")

    new_doc = {
        "termId": doc["termId"],
        "year": doc["year"],
        "semester": doc["semester"],
        "sessionId": doc["sessionId"],
        "sectionId": doc["sectionId"],
        "subject": doc["subject"],
        "courseNumber": doc["courseNumber"],
        "sectionNumber": doc["sectionNumber"],
        "history": [],
    }
    for i in range(len(doc["history"])):
        entry = doc["history"][i]
        if i + 1 < len(doc["history"]):
            # round and format to js-style Date object iso string
            end_time = (datetime.fromisoformat(doc["history"][i + 1]["time"]) - timedelta(seconds=900))
            end_time =end_time.replace(microsecond=round(end_time.microsecond / 1000) * 1000)
            end_time = end_time.isoformat(timespec='milliseconds').replace('+00:00', 'Z')
        else:
            end_time = entry["time"]
        new_entry = {
            "startTime": datetime.fromisoformat(entry["time"]),
            "endTime": datetime.fromisoformat(end_time),
            "granularitySeconds": 15 * 60,
            "status": entry.get("status", None),
            "enrolledCount": entry.get("enrolledCount", None),
            "reservedCount": entry.get("reservedCount", None),
            "waitlistedCount": entry.get("waitlistedCount", None),
            "minEnroll": entry.get("minEnroll", None),
            "maxEnroll": entry.get("maxEnroll", None),
            "maxWaitlist": entry.get("maxWaitlist", None),
            "openReserved": entry.get("openReserved", None),
            "instructorAddConsentRequired": entry.get("instructorAddConsentRequired", None),
            "instructorDropConsentRequired": entry.get("instructorDropConsentRequired", None),
            "seastReservationCount": entry.get("seastReservationCount", None),
        }
        new_doc["history"].append(new_entry)

    write(new_doc)


write(None, force=True)  # Force write the last batch

