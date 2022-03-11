# Berkeleytime

A course discovery and planning tool which combines all of Berkeley's academic information in one place

The intent is to make it the most powerful academic planning tool than anything students currently use

Berkeleytime is a publicly collaborative open-source project that follows [MIT](https://en.wikipedia.org/wiki/MIT_License), with more guided maintenance by the ASUC Office of the CTO

Full local development is possible, except direct API usage of [Student Information Systems](https://api-central.berkeley.edu/). Per our agreement with SIS, we keep our API keys for [Class API](https://api-central.berkeley.edu/api/45) and [Course API](https://api-central.berkeley.edu/api/72) private

However, our development database with its full data set is available in all its glory [here](https://storage.googleapis.com/berkeleytime/public/mdb.tar.gz), so _anyone_ can help improve Berkeleytime

Getting started (start Docker before running these in repo root):

```{bash}
docker-compose up   # CTRL+C to stop
docker-compose down # cleaner shutdown, removes containers

# only need to run once to seed the database
curl -O https://storage.googleapis.com/berkeleytime/public/mdb.archive
docker run --rm --volume ${PWD}/mdb.archive:/mdb.archive --network bt mongo:5 mongorestore --drop --host mongodb --gzip --archive=mdb.archive
```

Local site becomes available at http://localhost:8080

[Discord](https://discord.gg/DeCEPNdPjc)
