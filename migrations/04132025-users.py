"""
author: Max Wang

migrates users from PostgreSQL (pre-2025 python backend) to MongoDB (post-2025 typescript backend)

dependencies:
- running local PostgreSQL server with auth_user, user_berkeleytimeuser, user_berkeleytimeuser_saved_classes, and course tables
- running local MongoDB server
"""
import datetime

import psycopg2
import pymongo

COLLECTION = "users_new"

pg_conn = psycopg2.connect(
    dbname="bt",
    user="postgres",
    host="localhost",
    port="5432"
)
pg_cursor = pg_conn.cursor()

mongo_db = pymongo.MongoClient("mongodb://localhost:27017/?directConnection=true")["bt"]
mongo_db[COLLECTION].drop()
mongo_db[COLLECTION].create_index([
    ("email", pymongo.ASCENDING),
], unique=True)


"""
auth_user table:
id | password | last_login | is_superuser | username | first_name | last_name | email | is_staff | is_active | date_joined

user_berkeleytimeuser table:
id  | major | email_class_update | email_grade_update | email_enrollment_opening | email_berkeleytime_update | user_id

user_berkeleytimeuser_saved_classes table:
id | berkeleytimeuser_id | course_id

course table:
id | title | department | abbreviation | course_number | description | units | prerequisites  | grade_average | letter_average | has_enrollment | enrolled | enrolled_max | enrolled_percentage | waitlisted | open_seats | last_updated 
"""

def batch_write(collection, batch_size=5000):
    batch = []

    def write(doc, force=False):
        if doc:
            batch.append(doc)
        if len(batch) == batch_size or force:
            mongo_db[collection].insert_many(batch)
            batch.clear()

    return write


write = batch_write(COLLECTION)

pg_cursor.execute("SELECT auth_user.id, user_berkeleytimeuser.id, email, first_name, last_name, date_joined, major "
                  "FROM auth_user "
                  "JOIN user_berkeleytimeuser ON auth_user.id = user_berkeleytimeuser.user_id")
auth_users = pg_cursor.fetchall()
for auth_user in auth_users:
    auth_user_id, user_berkeleytimeuser_id, email, first_name, last_name, date_joined, major = auth_user

    pg_cursor.execute("SELECT abbreviation, course_number "
                      "FROM user_berkeleytimeuser_saved_classes "
                      "JOIN course ON user_berkeleytimeuser_saved_classes.course_id = course.id "
                      "WHERE berkeleytimeuser_id = %s", (user_berkeleytimeuser_id,))
    saved_courses = pg_cursor.fetchall()

    user_doc = {
        "email": email,
        "name": f"{first_name} {last_name}",
        "majors": [major] if major else [],
        "bookmarkedCourses": [
            {
                "subject": abbreviation.replace(" ", ""),
                "number": course_number
            }
            for abbreviation, course_number in saved_courses
        ],
        "createdAt": datetime.datetime.fromisoformat(date_joined.isoformat()),
    }

    write(user_doc)

write(None, force=True)  # Force write the last batch
