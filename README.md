# Berkeleytime

[Discord](https://discord.gg/uP2bTPh99U)

A course discovery and planning tool which combines all of Berkeley's academic information in one place

The intent is to make it the most powerful academic planning tool than anything students currently use

Berkeleytime is a publicly collaborative [MIT](https://en.wikipedia.org/wiki/MIT_License) open-source project, with more guided maintenance by ASUC Office of the CTO

Full local development is possible, except direct API usage of [Student Information Systems](https://api-central.berkeley.edu/). Per our agreement with SIS, we keep our API keys for [Class API](https://api-central.berkeley.edu/api/45) and [Course API](https://api-central.berkeley.edu/api/72) private

However, our development database with its full data set is available [here](https://storage.googleapis.com/berkeleytime/public/mdb.archive), so _anyone_ can help improve Berkeleytime

# Getting started

Start Docker before running these in repo root

```{bash}
docker-compose up   # CTRL+C to stop
docker-compose down # cleaner shutdown, removes containers

# only need to run once to seed the database
curl -O https://storage.googleapis.com/berkeleytime/public/mdb.archive
docker run --rm --volume "${PWD}/mdb.archive":/mdb.archive --network bt mongo:5 mongorestore --drop --host mongodb --gzip --archive=mdb.archive
```

Local site becomes available at http://localhost:8080

If you have Postman, you can play and test API routes after importing **postman_environment.json** and **postman_routes.json**

![Screen Shot 2022-03-12 at 10 23 13](https://user-images.githubusercontent.com/22272118/158030106-7d88366c-3c62-4832-96af-fdb9ec43d2d4.png)

# Debugging

From host machine

```{bash}
# Enter mongo shell
docker run -it --rm --network bt mongo:5 bash -c 'mongosh mongodb/bt'
# or directly from host machine
mongosh localhost/bt

# some example mongo shell commands
show dbs
show collections
db.calanswers_grade.find().limit(1)
db.sis_course.find().limit(1)
db.sis_course_history.find().limit(1)
db.sis_class.find().limit(1)
db.sis_class_history.find().limit(1)
db.sis_class_section.find().limit(1)
db.sis_class_section_history.find().limit(1)

# Enter redis shell
docker run -it --rm --network bt redis:6 redis-cli -h redis
# or directly from host machine
redis-cli

# some example redis-cli commands
FLUSHALL
KEYS *
GET a97c026ceac066bba7c96cb7fd125958
DEL 9cb4f765240d81cb227a9fdbff74f0c0
```
