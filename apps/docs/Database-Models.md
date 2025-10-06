![NoSleep](https://33.media.tumblr.com/c9a22d03a9982a451858033fbda59c57/tumblr_nbqqrv7Fml1ryzyomo1_500.gif)

### Course

A course represents a single class at Berkeley, independent of the semester or year it is offered. The table contains information about the title, description, units, etc about the course. It is uniquely identified by the `abbreviation` and `course_number`.

Course data can be updated every once in a while to match information in SIS. To understand how to do this, please refer to: 


### Section

A section represents a particular section for a semester and year. For instance, `COMPSCI 61A LEC 1 @ Fall 2013` and `COMPSCI 61A LAB 003 @ Spring 2015` are both Sections. The Berkeleytime DB currently stores about ~53,000 sections from the last 3-4 years. A section contains information about its location, start time, end time, etc. A Course can have many Sections. A Section is also tied to a campus.Room. 


### Enrollment

An enrollment represents a single data-point about class-size for a single section. Information about how many people were on October 1st for `COMPSCI 61A LEC 1 @ Fall 2012` would represent a single row in the Enrollment table. There are currently ~6,000,000 Enrollment entries in our database.


### Grade

A grade represents a histogram of grade distribution tied to a implicitly tied to a single section (but technically ForeignKey'ed with Course). The grade distribution for John Denero's `COMPSCI 61A LEC 1 @ Fall 2012` is represented in a single grade entry. To update grades see [New Grades](https://github.com/asuc-octo/berkeleytime/wiki/Grade-Distribution).


### Playlist

Berkeleytime's best feature is the ability to filter through courses by requirement, time-of-day, units, department, etc. This is internally called Playlist. A playlist has a Many-to-Many relation with courses. It is simply a collection of courses, which is calculated every night during our update.

