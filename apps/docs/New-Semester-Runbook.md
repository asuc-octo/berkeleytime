![Excited](https://31.media.tumblr.com/d0247afa8f704322343d71fd4803c330/tumblr_n1iq6aheIk1sx03a7o1_400.gif)

Whenever enrollment starts, Berkeleytime magically switches from one semester to the next. How does this happen?

## SIS API Scraper

This only needs to be done once per semester, and it can be done as soon as Berkeley starts enrollment for the next semester. After this change, our nightly SIS scraper job will know to query the new semester's data.

Check out [this example](https://github.com/asuc-octo/berkeleytime/commit/ea72eefdba7b60f2f6d87253eeb80e9e08c874d2) of switching from Fall 2020 to Spring 2021.

`CURRENT_SEMESTER`: This is the semester for which enrollment is active (not the current semester of the school year). If it is currently October 20th, and students are signing up for SPRING semester classes, the CURRENT_SEMESTER global variable is "spring", not "fall". 

Here are the Term ID that will be needed for the SIS API (pattern should be pretty obvious, just drop the century digit and tack the term code (2=Spring, 5=Summer, 8=Fall) on the end).:
```
2208    2020 Fall      2020 Fall
2205    2020 Summer    2020 Sum
2202    2020 Spring    2020 Spr
2198    2019 Fall      2019 Fall
2195    2019 Summer    2019 Sum
2192    2019 Spring    2019 Spr
2188    2018 Fall      2018 Fall
2185    2018 Summer    2018 Sum
2182    2018 Spring    2018 Spr
2178    2017 Fall      2017 Fall
2175    2017 Summer    2017 Sum
2172    2017 Spring    2017 Spr
2168    2016 Fall      2016 Fall
```
Please do this on a new branch off of MASTER!

1. In `berkeleytime/config/finals/semesters` make a copy of `[spring OR fall][20xx].py` (name it appropriately) and modify it to match the information for the finals schedule for the new semester (you will need to modify both dictionaries and the function mapper). Final schedules can be found [here](http://registrar.berkeley.edu/sis-SC-message).

2. Within `berkeleytime/config/semesters` make a copy of `[spring OR fall][20xx].py` (name it appropriately) and modify it to match the information (semester ID for the API) for the new `CURRENT_SEMESTER` semester you are upgrading to. Be sure to change the `berkeleytime.config.finals.semester.*` import to the file created above.

3. In `berkeleytime/settings.py` update the import so that you are importing the correct global variables from `config.semesters`.

4. Update `berkeleytime/config/general.py`. Make sure you update everything in this file!!!

5. Run make up, and ssh into the backend docker container. Run the update job (update-data.sh) and make sure everything works. Then deploy to staging.

6. Open a pull request for the branch and get it approved/merged to master.

7. Nervously wait and see if things break in production. Alternatively, run it on prod yourself. If nothing breaks, 🍾🥂!

### Troubleshooting
1. API keys: Make sure the environment variables for SIS_COURSE_APP_ID and SIS_CLASS_APP_ID are set. 

2. Remember that you can enter the container shell with `kubectl exec -it <pod_id> bash` to debug on prod.