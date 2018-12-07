from mondaine.lib import utils

grades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "P", "NP"]

class Course:

    def __init__(self, data):

        self.Subject = data["Course Subject Short Nm"]
        self.CourseID = data["Course Control Nbr"]
        self.CourseNum = data["Course Number"]
        self.Instructor = data["Instructor Name"]
        self.CourseDesc = data["Course Title Nm"]
        self.SectionNum = data["Section Nbr"]

        self.GradeMap = {}
        self.Grades = {}

    def add_grade(self, grade, num):
        assert grade not in self.GradeMap
        self.GradeMap[grade] = num

    def merge(self, other):
        assert isinstance(other, self.__class__)
        self.GradeMap.update(other.GradeMap)

    def enrollment(self):
        return sum(self.Grades.values())

    def aggregate(self):
        self.Grades["P"] = 0
        self.Grades["NP"] = 0

        for grade in self.GradeMap.keys():
            if grade in grades:
                self.Grades[grade] = self.GradeMap[grade]
            elif grade == "Pass" or grade == "Satisfactory":
                self.Grades["P"] += self.GradeMap[grade]
            elif grade == "Not Pass" or grade == "Not Satisfactory":
                self.Grades["NP"] += self.GradeMap[grade]


    def __eq__(self, other):
        if isinstance(other, self.__class__):
            if self.CourseID == other.CourseID and self.SectionNum == other.SectionNum:
                assert self.Instructor == other.Instructor
                assert self.CourseID == other.CourseID
                assert self.CourseDesc == other.CourseDesc
                assert self.Subject == other.Subject
                return True
        return False

    def __hash__(self):
        return hash((self.CourseID, self.SectionNum))
