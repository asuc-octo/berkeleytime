## Updating Grades

To update grades, first retrieve the grade data from CalAnswers.

0. Go to CalAnswers dashboard https://caauth.berkeley.edu/dashboard and request "Global Dashboards Access" for "Type of Access"
1. Log into http://calanswers.berkeley.edu and select Course Grade Distribution.
2. To down course grades for a semester (i.e. Fall 2018), filter by the following:
- Semester: Fall 2018
- Course Level: lower, upper
- Everything Else: deselect everything for all
3. Apply, then at the bottom, pick Export -> csv
4. Save as `Fall2018under.csv` in `berkeleytime/berkeleytime/data/service/reader/grades/raw/`
5. Do the same for Course Level: grad and save as `Fall2018grad.csv`
6. In `berkeleytime/berkeleytime/data/service/reader/grades/writer.py`, make sure `'2018'` is in the list `years`.
7. Run `python manage.py translate-grades`.
- If there is an error complaining about a department name, fix it in `berkeleytime/berkeleytime/mondaine/config/abbreviation.yaml`
- Or use the flag `--skip-broken` with `translate-grades`.
8. This generates a new file `fall_2018.csv` in `berkeleytime/berkeleytime/data/service/reader/grades/formatted/`
9. Commit and push these changes to staging.
10. Wait a bit for the staging to deploy (~15-20 min at most)
11. Check out and follow the sets of [Setting Up Kubernetes](https://github.com/asuc-octo/berkeleytime/wiki/Setting-Up-Kubernetes).
12. SSH into the berekelytime-stage pod per the instructions of #11. Then run `python manage.py grade fall 2018` to update the database.

Note that you can do all of this without pushing to production, because production and staging share the same database.