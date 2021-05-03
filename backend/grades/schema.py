import django_filters
import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from grades.models import Grade
from grades.utils import add_up_grades, gpa_to_letter_grade, add_up_distributions

STANDARD_GRADES = [('a1', 'A+'), ('a2', 'A'), ('a3', 'A-'),
                   ('b1', 'B+'), ('b2', 'B'), ('b3', 'B-'),
                   ('c1', 'C+'), ('c2', 'C'), ('c3', 'C-'),
                   ('d', 'D'), ('f', 'F'), ('p', 'P'), ('np', 'NP')]

ALL_GRADES = (
    'a1', 'a2', 'a3',
    'b1', 'b2', 'b3',
    'c1', 'c2', 'c3',
    'd1', 'd2', 'd3',
    'f', 'p', 'np'
)

class LetterGradeType(graphene.ObjectType):
    letter = graphene.String()
    numerator = graphene.Int()
    percent = graphene.Float()
    percentile_high = graphene.Float()
    percentile_low = graphene.Float()

class GradeConnection(graphene.Connection):
    class Meta:
        abstract = True

    distribution = graphene.List(LetterGradeType)
    section_gpa = graphene.Float()
    section_letter = graphene.String()
    denominator = graphene.Int()

    def resolve_distribution(self, info):
        return [LetterGradeType(**dist) for dist in add_up_distributions([section.node for section in self.edges])]

    def resolve_section_gpa(self, info):
        counter, total = add_up_grades([section.node for section in self.edges])
        if total == 0:
            return -1
        else:
            return round(float(sum(counter.values())) / total, 3)

    def resolve_section_letter(self, info):
        counter, total = add_up_grades([section.node for section in self.edges])
        if total == 0:
            return 'N/A'
        else:
            return gpa_to_letter_grade(round(float(sum(counter.values())) / total, 3))
    
    def resolve_denominator(self, info):
        return sum([sum(getattr(section.node, grade, 0.0) for grade in ALL_GRADES) for section in self.edges])

class GradeFilter(django_filters.FilterSet):
    class Meta:
        model = Grade
        exclude = ('instructors',) + ALL_GRADES


class GradeType(DjangoObjectType):
    class Meta:
        model = Grade
        filterset_class = GradeFilter
        interfaces = (graphene.Node, )
        exclude = ALL_GRADES
        connection_class = GradeConnection

    distribution = graphene.List(LetterGradeType)
    section_gpa = graphene.Float()
    section_letter = graphene.String()
    denominator = graphene.Int()

    def resolve_distribution(self, info):
        return [LetterGradeType(**dist) for dist in add_up_distributions([self])]

    def resolve_section_gpa(self, info):
        counter, total = add_up_grades([self])
        if total == 0:
            return -1
        else:
            return round(float(sum(counter.values())) / total, 3)

    def resolve_section_letter(self, info):
        counter, total = add_up_grades([self])
        if total == 0:
            return 'N/A'
        else:
            return gpa_to_letter_grade(round(float(sum(counter.values())) / total, 3))

    def resolve_denominator(self, info):
        return sum(getattr(self, grade, 0.0) for grade in ALL_GRADES)



class Query(graphene.ObjectType):
    all_grades = DjangoFilterConnectionField(GradeType)
    grade = graphene.Node.Field(GradeType)
