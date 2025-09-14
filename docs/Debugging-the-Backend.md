The Berkeleytime backend can be incredibly hard to debug. This guide acts as an intro to years of learnings of complicated debugging and comes with a walkthrough. 

## Tips
1. Do not try to run Berkeleytime locally. You will need to install a complicated list of requirements and set env variables, and even then some things might not work. Instead boot the docker cluster and ssh into the backend container. See the [Quick Start Guide](https://github.com/asuc-octo/berkeleytime/wiki/Quick-Setup-Guide) to learn how.
2. There is no debugger. Unless you're magic and you come up with a way to run Berkeleytime with a debugger, just still with print statements and the shell. It's a perfectly fine way to debug.
3. If you are investigating a bug that involves the underlying data, you can connect directly to the data source. You can make requests to the [SIS API](https://api-central.berkeley.edu/apis) directly through their interactive docs. This helps you get a look at what data we are working with, and the credentials to do so are checked into git. Look in `build/docker-compose.yaml` and `kubernetes/manifests/configs/sis-secrets.yaml`, which should be the same credential. 
4. You may also want to connect directly to Postgres in order to look through the tables themselves. Install [psql](http://postgresguide.com/utilities/psql.html) to connect from your terminal, then run the command
`psql -h [HOST] -d [DB_NAME] -U [USERNAME]` to connect.  Once you connect you can list all tables with the `\dt` command. 

    _Note: this is a read only credential, so you won't be able to modify any data. If you wish to write, see #5._

5. You may also sometimes want to run a command locally that writes to the database. This is useful if you are updating grades, schedules, etc from your local cluster. The development cluster you boot by default connects to our staging database. 

    _Do not commit this change ever! We do not want people unknowingly using this credential and erasing the prod db._ In general, when using    this credential you should be extremely careful of all DB writes you perform.

6. Try taking advantage of the shell and manage.py commands. The tutorial shows how to debug a data issue with the shell. You can also add print statements to functions you know will be executed, and then run the command. For example if you are debugging updating schedules, you can add a print to the SectionStore and then run `python manage.py schedule [options]`.

## Walkthrough

We got an email from a professor that reads

> A student brought this to my mention, the course description for EDUC C122 (Class # 31769) is not the correct one listed for Fall 2020 on your website.  This course is cross-listed with UGIS C122, the UGIS C122 course description is correct but not the EDUC one.  Can you please correct the course description on your end.  If you have any questions, please feel free to contact me.

We first want to figure out if this is a problem on our end or the SIS API's end. One quick way to check is to look up the course on [classes.berkeley.edu](http://classes.berkeley.edu) which I suspect uses the same API. After investigating we see that EDUC C122 does indeed have a different description than on Berkeleytime. 

Now we want to actually check the API itself. Go to the SIS API page and then the [interactive docs](https://api-central.berkeley.edu/api/46/interactive-docs) for the Course API. Theres two endpoints - one allows you to look up a course by some params and the other lists all courses sequentially. We'll be using the first one. From Tip #3, input the credentials and set EDUC C122 as the params. Now we can see that the response also has a different description.

Lets book the Berkeleytime cluster locally and try running some shell commands. After using `docker exec` to get into the container, I ran `python manage.py shell` to start an interactive session. First I ran some import statements

```
import requests
from catalog.service.mapper.course import course_mapper
from berkeleytime import settings
```

Then I tried to replicate some of the logic of `berkeleytime/catalog/service/resource/sis_course.py`, which is the file that hits the Course endpoints. The only difference is that it hits the second endpoint, so I needed to reuse its logic to hit the first endpoint.

```
headers = {
    'Accept': 'application/json',
    'app_id': settings.SIS_COURSE_APP_ID,
    'app_key': settings.SIS_COURSE_APP_KEY
}
response = requests.get("https://apis.berkeley.edu/uat/sis/v2/courses?subject-area-code=EDUC&catalog-number=C122&sort-by=last-updated&page-number=1&page-size=50", headers=headers).json()
```
I got the URL to hit from the interactive docs. After I tried their API, it shows me what the actual formatted URL was that was executed. I am simply copying that here so that I can hit that same endpoint with the same params again, but from python.
```
sis_courses = response['apiResponse']['response']['any']['courses']
# The mapper takes a JSON response and formats it into a Course object
courses = [x for x in (course_mapper.map(c) for c in sis_courses) if x is not None]
courses
```
This outputs an array showing 2 course objects
```
[<Course: Course object>, <Course: Course object>]
```
But wait! I had thought the API returned a single course: EDUC C122. Why are there 2 here? It turns out because this course is cross listed, it returned both EDUC C122 and UGIS C122. We can inspect each of uses objects closer with the `__dict__` function, which returns the attributes of the object as a dict.
```
print courses[0].__dict__
print courses[1].__dict__
```
Now we can easily see what's going on. The API does not actually return the right description for EDUC C122. In fact, it only returns the right description for UGIS C122, and for EDUC C122 it shows the incorrect description that we show on the site. Previously, I had assumed that it only returned one course because I didn't read through the whole response blob. So our site is not broken, and this is a data problem with the SIS API.
