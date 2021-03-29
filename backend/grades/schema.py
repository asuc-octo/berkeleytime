import django_filters
import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from grades.models import Grade
from grades.utils import add_up_grades, gpa_to_letter_grade

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

    distribution = graphene.List(LetterGradeType)
    section_gpa = graphene.Float()
    section_letter = graphene.String()
    denominator = graphene.Int()

    def resolve_distribution(self, info):
        dist = []
        percentile_ceiling = 0
        for grade, display in STANDARD_GRADES:
            if grade == 'd':
                numerator = sum([getattr(self, d, 0.0) for d in ('d1', 'd2', 'd3')])
            else:
                numerator = getattr(self, grade, 0.0)
            percent = round(numerator / self.graded_total if self.graded_total else 0.0, 2)
            if grade == 'p' or grade == 'np':
                percentile_high = 0
                percentile_low = 0
            else:
                percentile_high = abs(round(1.0 - percentile_ceiling, 2))
                percentile_low = abs(round(1.0 - percentile_ceiling - percent, 2))
            percentile_ceiling += percent
            dist.append(LetterGradeType(
                letter=display,
                numerator=numerator,
                percent=percent,
                percentile_high=percentile_high,
                percentile_low=percentile_low
            ))
        return dist

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
