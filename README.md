# Berkeleytime

A course discovery and planning tool which combines all of Berkeley's academic information in one place. We intend to make it a more accurate and powerful tool than anything students currently use.

Created by [Yuxin Zhu](http://yuxinzhu.com/) and [Noah Gilmore](https://noahgilmore.com)

Maintained by the ASUC Office of the CTO

Please refer to the [wiki](https://github.com/asuc-octo/berkeleytime/wiki) for all documentation

Getting started (start Docker before running):

```{bash}
docker-compose up   # CTRL+C to stop
docker-compose down # cleaner shutdown, removes containers

# only need to run once to seed the database
curl -O https://storage.googleapis.com/berkeleytime/public/mdb.tgz
docker run --rm --volume ${PWD}/mdb.tgz:/mdb.tgz --network bt mongo:5 mongorestore --drop --host mongodb --gzip --archive=mdb.tgz
```

Local site becomes available at http://localhost:8080
