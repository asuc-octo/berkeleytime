In order to be organized, be productive, and not have shitty code, we're operating by a specific plan for developing features, refactoring code, etc.

## Branches
There are two main git branches in the project: _master_ and _site-redesign_. Master should always be ready to push to the live version on heroku, so right now it contains code very similar to what's on the live site.

Site-redesign is the branch for working code of the redesign of the site (i.e., catalog/data/schedule/plan). This means it should always contain working code with no errors. Merging these branches should always happen after approval from the CEO (LOL).

More info on branching [here](http://git-scm.com/book/en/Git-Branching-Basic-Branching-and-Merging).

## Doing work with git
When you work on code, you should always work on a branch dedicated to what you're working on. These branches should be branched from site-redesign. Eventually, when you're done, you can merge your branch back into site-redesign. This formula is so we can reduce merge errors to a minimum and keep a well encapsulated design style. For example: here's how the branches worked when developing the new login page:

1. Switch to site-redesign: `git checkout site-redesign`
2. Make a new branch for the new homepage and switch to it: `git checkout -b new-homepage`
3. Do work on the new homepage, make everything work, add all the files you need, change everything you need, etc.
4. Make sure your new code works
5. Run `git status` to make sure you're on the right branch, and to make sure you don't have useless files (.pyc, et) staged for commit.
6. `git add -A` to add the files. Or just add them all individually.
7. Commit the changes you made with an informative message: `git commit -m "add login.less, homepage is done, django_facebook functionality implemented"`
8. Push your changes to the new branch you created so people can see: `git push origin new-homepage`. NOTE: YOU SHOULD NEVER JUST DO `git push` OR `git pull`, because that tends to create a bunch of branching and dependency issues.
9. Let people see your code, post screenshots in the facebook group, post an unlisted video on youtube, or whatever. Eventually when everyone is okay with it, switch to site-redesign: `git checkout site-redesign`
10. Merge site redesign with your branch: `git merge new-homepage`. Hopefully there won't be any merge errors, but if there are, fix them and commit the result.
11. Push to site-redesign: `git push origin site-redesign` and done.

Note: You should commit as many times as you need to during this process, but only think about merging when something is done.

## Development timeline
First and foremost, we should have a specification for each app posted on this wiki, so everyone is on the same page in terms of what the functionality for an app should be. This should include both what it should do at a high level and how the frontend and backend will interface (JSON formatting, what work is done where, etc).

Each app of the main site (Login, About, Home, Catalog, Courses/Data, Schedule, Plan) should start with a preliminary design in photoshop. We can then code up the frontend: HTML, LESS/CSS, etc. At this point it looks nice but has no functionality at all. At the same time we can start working on the backend with respect to the specification. After some of this is done, we can work on the javascript/jQuery frontend and interfacing with the backend. Eventually, we should set aside a LITTLE bit of time for testing. _All bugs should be reported with github issues_.

## Code documentation
Every time you make a commit, you should update relevant documentation pages on the wiki. For python and javascript, this included descriptions of functions and notes about how they work (this does not have to be in great detail). For apps, template inheritance, and other things, it should at the least be a broad overview of what things do. Basically, there should never have to be questions on what a function does because there should be documentation available.

## Javascript design patterns
Every javascript file should be modular so that we can keep our heads around it. Each should include dependencies in a comments section at the top. Basically, we should be able to include a file at the top of an HTML page and then be able to access that files functions from an object. Example: say we have a file of functions for updating and working the the D3 section on the data app. That file should define the functions and map a global object to the `window`, so that in subsequent javascript files we can say something like `btD3.addCourseData({'A-': 102, 'A': 75, ...});`, etc. Every function should have accessible documentation in the file, on the wiki, or, in the best case, on both.

## Python design patterns
In every python/django app, we should try to be modular by keeping only model objects in `models.py` and only functions that operate on HTTP requests in `views.py`. If we have a lot of other functions, like, for example, all the functionality in `haste` for parsing and grabbing data from schedule.berkeley.edu, it should be in `haste.py`. If we have a lot of utility functions that relate to models or helper functions for views, those should reside in a file called `utils.py` or similar, and be imported when they need to be.

## Code linting
Everyone should install [sublime linter](https://github.com/SublimeLinter/SublimeLinter) and fix any errors it finds with your code. This is for consistency, mostly.