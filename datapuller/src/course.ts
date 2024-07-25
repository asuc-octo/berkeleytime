import models from 'berkeleytime-mongo-models';
import setup from './shared';

const SIS_COURSE_URL = 'https://gateway.api.berkeley.edu/sis/v4/courses';

async function main() {
  const { log } = setup();

  // 1. pull from MongoDB for active semesters
  // 2. pull from SIS API for courses for each active semester
  // 3. dump into R2 json file mapping semester to courses

  log.info(SIS_COURSE_URL);
  log.info(models.SemesterModel);
}

main();
