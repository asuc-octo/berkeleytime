"""Grade Reader."""
import csv
import os

from data.service.mapper.grade import grade_mapper


class GradeReader(object):
    """Grade interface with CSV files."""

    file_path = os.path.join(os.path.dirname(__file__), 'grades/formatted')  # noqa

    def read(self, semester, year):
        """Read CSV file and return a generator of entity.Grade."""
        extras = {
            'semester': semester,
            'year': year,
        }

        filename = '%s/%s_%s.csv' % (self.file_path, semester, year)
        print("Parsing %s" % filename)
        with open(filename, 'rb') as f:
            reader = csv.reader(f)
            next(reader, None)  # skip the header k thx
            for row in reader:
                grade = grade_mapper.map(data=row, extras=extras)
                if grade:
                    yield grade

    def get_available_semesters(self):
        """Read available CSV files and return an iterable of semesters."""
        available_semesters = []
        for f in os.listdir(self.file_path):
            if f.endswith('.csv'):
                semester, year = f[:-4].split('_')  # splice off .csv
                available_semesters.append((semester, year,))
        return available_semesters

grade_reader = GradeReader()
