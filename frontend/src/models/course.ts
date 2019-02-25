export class Course {
    public title: string = "";
    public department: string = "";
    public abbreviation: string = "";
    public course_number: string = "";
    public units: string = "";
    public hours: string = "";
    public cs_course_id: string = "";

    public grading: string = "";
    public description: string = "";
    public previously: string = "";
    public final_exam_status: string = "";
    public credit_restrictions: string = "";

    public primary_kind: string = "";
    public favorite_count: number = 0;

    # Do not override this field!
    # https://github.com/yuxinzhu/campanile/issues/195
    public prerequisites: string = "";

    # Do not ever change manually set these fields!
    # They are duplicated here by grade_store to optimize queries
    public grade_average: number = -1;
    public letter_average: string = "";

    # Do not ever change manually set these fields!
    # They are duplicated here by enrollment_store to optimize queries
    public enrolled_percentage: number = -1;
    public open_seats: number = -1;
    public enrolled: number = -1;
    public enrolled_max: number = -1;
    public waitlisted: number = -1;

    public has_enrollment: bool=False

    public last_updated: Date;
}





# class Course(models.Model):
#     """A single course (e.g. COMP SCI 61A)."""

#     _derived_grade_fields = (
#         'grade_average', 'letter_average',
#     )

#     _derived_enrollment_fields = (
#         'enrolled', 'enrolled_max', 'waitlisted', 'enrolled_percentage',
#         'open_seats',
#     )

#     _derived_playlist_fields = ('favorite_count',)

    

#     class Meta:
#         """Metaclass for Course model."""

#         unique_together = ('abbreviation', 'course_number')

#     def __unicode__(self):
#         """Return unicode representation of models.Course."""
#         return self.abbreviation + ' ' + self.course_number

#     @property
#     def display_units(self):
#         """Unit string for display in the third column."""
#         separator = None
#         if '-' in self.units:
#             separator = '-'
#         if 'or' in self.units:
#             separator = 'or'
#         if separator:
#             try:
#                 first, second = map(
#                     lambda u: int(float(u.strip())),
#                     self.units.split(separator)
#                 )
#                 return '{}-{}'.format(first, second)
#             except ValueError:
#                 return self.units
#         return self.units