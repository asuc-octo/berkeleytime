<img src="https://s-media-cache-ak0.pinimg.com/736x/05/b7/b0/05b7b05c6f3e930e1c9f02b91dec426d.jpg" height="250">

# Berkeleytime

__[Yuxin Zhu](http://yuxinzhu.com/) and Noah Gilmore__

A course discovery and planning tool which combines all of Berkeley's academic information in one place. We intend to make it a more accurate and powerful tool than anything students currently use.

*Yuxin*


## Quick Start

This codebase is __not__ open source. Please do not distribute.

Please refer to the [wiki](https://github.com/yuxinzhu/campanile/wiki) for all documentation and getting started.

## First Time Developers

__This may be outdated, please see above__

##### Dependencies (Mac and Linux)

We want to get you up and running as soon as possible!

Due to the nature of this project, there are a number of packages you will need which are not pre-installed with Python 2.7. In order to run the Berkeleytime files correctly, please install the following packages using pip. If you do not currently have pip installed, first run:
`sudo easy_install pip` in the command line.
Navigate to the top level directory (you should see `requirements.txt` from the `ls` command) and run:

`virtualenv venv`
`source venv/bin/activate`
`pip install -r requirements.txt`

If you want to be cool and run the app inside a virtual machine, you can simply make sure Virtualbox and Vagrant are installed, then run `vagrant up --provision` and the virtual machine will set everything up for you. Then, in order to run the server, you can do `python vmanage.py runserver`: the `vmanage.py` script will translate that into the appropriate command to pass to vagrant via `ssh`.

To run the server, you will also need to run memcached (after installing it). Please run:

```
/usr/bin/memcached -m 64 -p 11211 -u nobody -l 127.0.0.1 -vv
```

### Troubleshooting

##### If lxml installation fails:

For Apple Users, in order to install lxml, first download XCode Developer Tools from the App Store, navigate to Preferences, Downloads, and download the "Command Line Tools" package.
Then run:
`easy_install lxml`.

For Linux Users try going on terminal and running:
`easy_install lxml`

##### If libmemcached/pylibmc fails to install:

`brew install libmemcached`

##### If PIL fails to install:

PIL is used for ImageField: pip install PIL --allow-external PIL --allow-unverified PIL
http://stackoverflow.com/questions/21242107/pip-install-pil-dont-install-into-virtualenv

##### "I installed psycopg2, but Postgres doesn't seem to work":

Berkeleytime uses Postgres locally and on the live site. You must download Postgres from (http://www.postgresql.org/) first. Once you have installed postgres, you must update Django with the relevant username and password in `berkeleytime/settings.py`

Check [Setting Up Postgres](https://github.com/yuxinzhu/campanile/wiki/Setting-up-Postgres) for more information on how to do this.


Database Migration using South and Heroku
---

1. Add a field to an app's ("catalog", "campus", etc are apps) models.py, or change it in some way.
2. Migrate the schema of the _local_ database (tell south that the attributes of the models have changed). Use `python manage.py schemamigration [app_name] --auto` for this.
3. Migrate the _local_ database. `python manage.py migrate [app_name]`. This will create new things in the `migrations` folder - these will be pushed to heroku and to github so everyone knows what the database schema should be.
4. Push the migration changes you just made to heroku. `git push heroku master`. If you want to push it to the staging site, do `git push <remote> master`, where `<remote>` is your heroku remote, aka `heroku2` or `staging`. If you are working locally on a branch other than master, it will be `git push <remote> <yourbranch>:master`. Also, go ahead and push the changes to github for consistency.
5. Migrate the databse on heroku. `heroku run --app <appname> 'bash'`, `cd calscope`, `python manage.py migrate courses`. You should _not_ have to do a schemamigration here because you pushed the migrations folder to heroku in step 4.
