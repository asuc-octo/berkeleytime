from reader import read, clean
import csv, json
from mondaine.lib import utils

headers = ["Subject", "ClassNum", "CourseID", "Section", "ClassDesc", "Instructor", "Level"]
grades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "P", "NP"]

all_semesters = ["Fall", "Spring", "Summer"]
all_years = ["2018", "2017", "2016", "2015", "2014", "2013"]

path = "data/service/reader/grades/"

unknown = []

def abbreviate_subject(subject):
    if utils.is_department(subject):
        return utils.department_to_abbreviation(subject)
    else:
        if subject not in unknown:
            unknown.append(subject)
        return "UNKNOWN"

def translate(skip, semester=None, year=None):
    semester_todo = [semester] if semester else all_semesters
    years_todo = [year] if year else all_years

    for s in semester_todo:
        for y in years_todo:
            couseids = []

            try:
                with open(path + "formatted/" + s.lower() + "_" + y + ".csv", "w") as csvfile:
                    w = csv.writer(csvfile)
                    w.writerow(headers + grades)
                    for standing in ["under", "grad"]:

                        courses = clean(read("{}raw/{}{}{}.csv".format(path, s, y, standing)), standing == "grad")
                        for c in courses:
                            couseids.append(c.CourseID)
                            course_grades = []
                            for g in grades:
                                if g in c.Grades:
                                    course_grades.append(c.Grades[g])
                                else:
                                    course_grades.append(0)
                            subject = abbreviate_subject(c.Subject)
                            if skip and subject == "UNKNOWN":
                                continue
                            w.writerow([subject, c.CourseNum, c.CourseID,
                                        c.SectionNum, c.CourseDesc, c.Instructor, standing] + course_grades)
            except IOError:
                pass


    if len(unknown) > 0 and not skip:
        print "----------------------- WARNING -----------------------"
        print "There are {} Subjects that could not be translated into".format(len(unknown))
        print "departments abbreviations: "
        for counter, value in enumerate(unknown):
            print "{}) {}".format(counter + 1, value)
        print "Please fix them in mondaine/config/abbreviation.yaml   "
        print "before continuing, or turn on --skip-broken to skip    "
        print "adding those classes to the formatted csv."
        print "-------------------------------------------------------"
