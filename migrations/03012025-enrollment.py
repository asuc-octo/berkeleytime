"""
author: Max Wang

migrates enrollment from PostgreSQL (pre-2025 python backend) to MongoDB (post-2025 typescript backend)

dependencies:
- running local PostgreSQL server with enrollment & section tables
- running local MongoDB server with term collection
"""

import psycopg2
import pymongo

pg_conn = psycopg2.connect(
    dbname="bt",
    user="postgres",
    host="localhost",
    port="5432"
)
pg_cursor = pg_conn.cursor()

mongo_db = pymongo.MongoClient("mongodb://localhost:27017/?directConnection=true")["bt"]
mongo_db["enrollmenthistories_new"].drop()
mongo_db["enrollmenthistories_new"].create_index([("termId", pymongo.ASCENDING), ("sessionId", pymongo.ASCENDING), ("sectionId", pymongo.ASCENDING)])
mongo_db["enrollmenthistories_new"].create_index([
    ("year", pymongo.ASCENDING),
    ("semester", pymongo.ASCENDING),
    ("sessionId", pymongo.ASCENDING),
    ("subject", pymongo.ASCENDING),
    ("courseNumber", pymongo.ASCENDING),
    ("sectionNumber", pymongo.ASCENDING),
])


"""
enrollment table:
id | date_created | enrolled | enrolled_max | waitlisted | waitlisted_max | section_id

section table:
id | abbreviation | course_number | year | semester | course_title | section_number | ccn | kind | is_primary | days | start_time | end_time | final_day | final_end | final_start | instructor | disabled | location_name | instruction_mode | last_updated | enrolled | enrolled_max | waitlisted | waitlisted_max | course_id
"""


def get_term_id(year: int, semester: str) -> str:
    semester = semester[0].upper() + semester[1:]
    term_id = mongo_db["terms"].find_one({"name": f"{year} {semester}"})["id"]
    return term_id


def get_session_id(year: int, semester: str) -> str:
    if semester in ["spring", "fall"]:
        return '1'
    pass


def has_changes(old: dict, new: dict) -> bool:
    return old["enrolledCount"] != new["enrolledCount"] or old["maxEnroll"] != new["maxEnroll"] or old[
        "waitlistedCount"] != new["waitlistedCount"] or old["maxWaitlist"] != new["maxWaitlist"]


def batch_write(batch_size=5000):
    batch = []

    def write(doc):
        batch.append(doc)
        if len(batch) == batch_size:
            mongo_db["enrollmenthistories_new"].insert_many(batch)
            batch.clear()

    return write


write = batch_write()

pg_cursor.execute("SELECT DISTINCT section_id FROM enrollment")
section_ids = pg_cursor.fetchall()
for section_id in section_ids:
    pg_cursor.execute("SELECT year, semester, ccn, abbreviation, course_number, section_number "
                      "FROM section WHERE id = %s", (section_id,))
    sections = pg_cursor.fetchall()
    if len(sections) != 1:
        print(f"Found {len(sections)} sections with section_id {section_id}")
        continue

    year, semester, ccn, abbreviation, course_number, section_number = sections[0]

    pg_cursor.execute("SELECT date_created, enrolled, enrolled_max, waitlisted, waitlisted_max, section_id "
                      "FROM enrollment WHERE section_id = %s", (section_id,))
    enrollments = pg_cursor.fetchall()
    enrollments.sort(key=lambda x: x[0])

    if semester not in ["spring", "fall"]:
        continue
    if not ccn or ccn == "See Department":
        continue

    enrollment_doc = {
        "termId": get_term_id(year, semester),
        "year": int(year),
        "semester": semester[0].upper() + semester[1:],
        "sessionId": get_session_id(year, semester),
        "sectionId": ccn,
        "subject": abbreviation.replace(" ", ""),
        "courseNumber": course_number,
        "sectionNumber": section_number,
        "history": []
    }

    for enrollment in enrollments:
        date_created, enrolled, enrolled_max, waitlisted, waitlisted_max, section_id = enrollment

        last = enrollment_doc["history"][-1] if enrollment_doc["history"] else None
        next = {
            "time": date_created.isoformat(),
            "enrolledCount": enrolled if enrolled is not None else 0,
            "maxEnroll": enrolled_max if enrolled_max is not None else 0,
            "waitlistedCount": waitlisted if waitlisted is not None else 0,
            "maxWaitlist": waitlisted_max if waitlisted_max is not None else 0
        }

        if not last or has_changes(last, next):
            enrollment_doc["history"].append(next)

    write(enrollment_doc)
