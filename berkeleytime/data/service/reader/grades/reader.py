import csv
from courses import Course

def row_to_Course(row):
    c = Course(row)
    c.add_grade(row["Grade Nm"], int(row["Enrollment Cnt"]))
    return c


def read(file_name):
    courses = {}

    with open(file_name) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            c = row_to_Course(row)
            if c in courses:
                courses[c].merge(c)
            else:
                courses[c] = c

    for c in courses.values():
        c.aggregate()

    return courses.values()


def clean(dirty, grad):
    if grad:
        limit = 5
    else:
        limit = 10

    cleaned = []
    for c in dirty:
        if c.enrollment() < limit:
            continue

        ok = True
        for g in c.Grades.keys():
            if c.enrollment() == c.Grades[g]:
                ok = False
                break

        if not ok:
            continue

        cleaned.append(c)

    return cleaned

if __name__ == "__main__":
    courses = read("input.csv")
    for c in clean(courses, False):
        print(c.Subject, c.CourseNum, c.enrollment(), c.GradeMap)