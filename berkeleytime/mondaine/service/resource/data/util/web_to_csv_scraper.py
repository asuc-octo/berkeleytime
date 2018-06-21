from bs4 import BeautifulSoup
import urllib
import csv

#ac_url1 = 'http://academic-senate.berkeley.edu/committees/amcult/approved-ac-courses-berkeley'
#ac_url2 = 'http://guide.berkeley.edu/undergraduate/colleges-schools/chemistry/american-cultures-requirement/'
#foreign_language_url = 'http://guide.berkeley.edu/undergraduate/colleges-schools/chemistry/american-cultures-requirement/'

req_url = "" # Insert link to site with desired requirements
r = urllib.urlopen(req_url).read()
soup = BeautifulSoup(r, "html.parser")
courses = soup.find_all(class_="bubblelink code")

basename = "" # insert description of requirement to be used in file name
output_csv = basename + "-raw.csv" 
with open(output_csv, 'w+') as csvfile:
    for course in courses:
        course_fields = course.get("title").split()
        if len(course_fields) != 2: # If course abbreviation has spaces in it
            temp = course_fields[0]
            for i in range(1, len(course_fields) - 1):
                temp = temp + " " + course_fields[i]

            course_fields = [temp, course_fields[len(course_fields) - 1]]
            
        line = course_fields[0] + "," + course_fields[1] + "\n"
        csvfile.write(line)

# Removes duplicates, comment out if unnecessary
lines_written = set()
output = open(basename + "-noduplicates.csv", 'w+')
for line in open(output_csv, 'r'):
    if line not in lines_written:
        output.write(line)
        lines_written.add(line)
output.close()