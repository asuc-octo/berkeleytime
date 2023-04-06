# Berkeleytime

## Background

A course discovery and planning tool which combines all of UC Berkeley's academic information in one place. We intend to make it a more accurate and powerful tool than anything students currently use.

Berkeleytime was created by [Yuxin Zhu](http://yuxinzhu.com/) and [Noah Gilmore](https://noahgilmore.com) and is maintained by [the ASUC Office of the CTO](https://octo.asuc.org/).
# Getting started

Create an `.env` file with the keys in `.env.template` populated accordingly.

Start Docker before running these in repo root

```{bash}
docker-compose up   # CTRL+C to stop
docker-compose down # cleaner shutdown, removes containers
```

To seed the database, run these following commands while the containers are up. You will only need to do this once.
```{bash}
curl -O https://storage.googleapis.com/berkeleytime/public/mdb.archive
docker run --rm --volume "${PWD}/mdb.archive":/mdb.archive --network bt mongo:5 mongorestore --drop --host mongodb --gzip --archive=mdb.archive
```

Local site becomes available at http://localhost:8080
