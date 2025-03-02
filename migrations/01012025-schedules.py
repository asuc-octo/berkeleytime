"""
author: Hwanhee Kim

migrates schedules from PostgreSQL (pre-2025 python backend) to MongoDB (post-2025 typescript backend)
"""

import psycopg2
import pymongo
from bson.objectid import ObjectId

# PostgreSQL connection
# pg_conn = psycopg2.connect(
#     dbname="bt",
#     user="bt",
#     password="yuxinsucks",
#     host="bt-psql-staging",
#     port="5432"
# )
pg_conn = psycopg2.connect(
    dbname="bt-transfer-db",
    user="postgres",
    password="postgres101",
    host="localhost",
    port="5432"
)
pg_cursor = pg_conn.cursor()

# MongoDB connection
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client["bt-transfer-db-local"]
mongo_collection = mongo_db["schedule3"]

# Check MongoDB connection
# try:
#     print(mongo_collection.find_one({"created_by": 'matthewrowland@berkeley.edu'}))
#     print("MongoDB connection successful!")
# except Exception as e:
#     print("MongoDB connection failed:", e)

# Fetch schedules from scheduler_schedule table
pg_cursor.execute("SELECT id, name, year, semester, date_created, date_modified, total_units, public, user_id FROM scheduler_schedule ")
schedules = pg_cursor.fetchall()

for schedule in schedules:
    id, name, year, semester, date_created, date_modified, total_units, public, user_id = schedule

    # get user email from user_id
    pg_cursor.execute("SELECT user_id FROM user_berkeleytimeuser WHERE id = '%s'" % user_id)
    btuser_id = pg_cursor.fetchall()[0][0]
    pg_cursor.execute("SELECT email FROM auth_user WHERE id = '%s'" % btuser_id)
    user_email = pg_cursor.fetchall()[0][0]

    # Initialize the schedule document
    schedule_doc = {
        "_id": ObjectId(), # mongodb identifier
        "name": name or "Untitled schedule",
        "created_by": user_email, # change to email
        "is_public": public == 't',
        "classes": [],
        "year": int(year),
        "semester": semester,
        # "total_units": total_units,
        "events": [],  #TODO: complete custom events
        # "createdAt": date_created,
        # "updatedAt": date_modified,
        # "__v": 0
    }

    # pg_cursor.execute("SELECT user_id FROM user_berkeleytimeuser WHERE id = %s" % user_id)
    # user_id = pg_cursor.fetchall()[0]
    # pg_cursor.execute("SELECT email FROM auth_user WHERE id = %s" % user_id)
    # user_email = pg_cursor.fetchall()[0][0]
    # schedule_doc["created_by"] = user_email

    # Fetch section selections related to the schedule
    pg_cursor.execute("SELECT id, course_id, primary_id, schedule_id FROM scheduler_sectionselection WHERE schedule_id = '%s'" % id)
    section_selections = pg_cursor.fetchall()

    for section_selection in section_selections:
        section_selection_id, section_selection_course_id, primary_id, schedule_id = section_selection

        # Check on the selected course id
        pg_cursor.execute("SELECT abbreviation, course_number FROM course WHERE id = '%s'" % section_selection_course_id)
        course_sch = pg_cursor.fetchall()
        subject, courseNumber = course_sch[0]

        # Check on selected primary_id
        pg_cursor.execute("SELECT section_number, ccn FROM section WHERE id='%s'" % primary_id)
        section_sch = pg_cursor.fetchall()

        section_number, ccn = section_sch[0]
        selected_class_doc = {
            "_id": ObjectId(),
            "subject": subject,
            "courseNumber": courseNumber,
            "number": section_number,
            "sections": []
        }
        # sections ex. discussion, lab, Independent Study



        # Fetch secondary section selections related to the section selection
        pg_cursor.execute("SELECT id, sectionselection_id,section_id FROM scheduler_sectionselection_secondary WHERE sectionselection_id = %s" % section_selection_id)
        secondary_selections = pg_cursor.fetchall()

        for secondary_selection in secondary_selections:
            secondary_selection_id, sectionselection_id, section_id = secondary_selection

            # Check on selected secondary sections in section
            pg_cursor.execute("SELECT ccn FROM section WHERE id='%s'" % section_id)
            ccn = pg_cursor.fetchall()
            # Add secondary section data to the section document
            selected_class_doc["sections"].append({
                "_id": ObjectId(),
                "ccn": int(ccn[0][0]),
            })

            # Add the section document to the schedule's sections
            schedule_doc["classes"].append(selected_class_doc)

    # Insert the transformed document into MongoDB
    print(schedule_doc)
    mongo_collection.insert_one(schedule_doc)

pg_cursor.close()
pg_conn.close()

print("Data migration completed successfully.")
