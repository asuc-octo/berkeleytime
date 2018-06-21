import berkeleytime.config.finals.finals_general

dict = berkeleytime.config.finals.finals_general.FOREIGN_LANGUAGES

abbreviations = dict.keys()

lines_written = set()
# Directories wrong! Make sure appropriate files are in directory.
output = open("foreign_language_complete.csv", 'w+')
for line in open("foreign_language_complete.csv", 'r'):
    if line not in lines_written:
        output.write(line)
        lines_written.add(line)

for abbreviation in abbreviations:
    course_nums = dict[abbreviation]
    for course_num in course_nums:
        line = abbreviation + "," + course_num + "\n"
        if line not in lines_written:
            output.write(line)
            lines_written.add(line)

output.close()