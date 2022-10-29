import { CourseOverviewFragment } from '../../graphql/graphql';
import { combineQueries, normalizeSearchTerm, search } from 'utils/search-utils';
import Fuse from 'fuse.js';
import CourseSelector from 'components/Scheduler/CourseSelector';

export type SearchableCourse = CourseOverviewFragment;

/**
 * Applies search query over list of courses
 */
export function searchCourses(
  courses: SearchableCourse[],
  rawQuery: string
): SearchableCourse[] {

  const options = {
    includeScore: true,
    shouldSort: true,
    threshold: 0.3,
    keys: [
      "title",
      "abbreviation",
      "abbreviations",
      "courseNumber",
      "fullCourseCode"
    ]
  };
  const courseInfo = courses.map(course => {
    let abbreviations: string[]
    if (laymanMap[course.abbreviation.toLowerCase()]) {
      abbreviations = laymanMap[course.abbreviation.toLowerCase()].map<string>(abbreviation => {
        return abbreviation + "" + course.courseNumber;
      })
    } else {
      abbreviations = []
    }
    return {
      title: course.title,
      abbreviation: course.abbreviation,
      courseNumber: course.courseNumber,
      fullCourseCode: getFullCourseCode(course),
      abbreviations: abbreviations
    }
  })
  const fuse = new Fuse(courseInfo, options);
  const query = normalizeSearchTerm(rawQuery);
  const fuseResults = fuse.search(query);
  const newResults = fuseResults.map<SearchableCourse>((result) => {
    return courses[result.refIndex];
  })
  return newResults;
}

/**
 * Searches for a single course
 * @return a number (lower is better) representing the quality of the match
 */
export function searchCourse(
  query: string,
  courseCode: string,
  maxPenalty?: number
): number | null {
  let laymanArray: string[][] = [];
  Object.keys(laymanMap).forEach(key => {
    laymanMap[key].forEach(replacement => [
      laymanArray.push([key, replacement])
    ])
  })
  const searches = laymanArray.filter(([source]) => courseCode.indexOf(source) > -1)
    .map(([source, replacement]) =>
      search(query, courseCode.replace(source, replacement), maxPenalty)
    );

  searches.push(search(query, courseCode, maxPenalty));

  return combineQueries(searches);
}

/**
 * Runs {@link searchCourse} but for react-select
 */
export function reactSelectCourseSearch(option: any, query: string): boolean {
  return searchCourse(query, option.label.toLowerCase(), 0.2) !== null;
}

/**
 * Course object to a fully-descriptive course search string.
 */
export function getFullCourseCode(course: SearchableCourse): string {
  const searchComponents = [course.abbreviation, course.courseNumber];
  return searchComponents.join('').toLowerCase();
}

type abbreviationMap = {
  [key: string]: string[];
}
export const laymanMap: abbreviationMap = {
  'astron': ['astro'],
  'compsci': ['cs', 'comp sci', 'computer science'],
  'mcellbi': ['mcb'],
  'nusctx': ['nutrisci'],
  'bio eng': ['bioe', 'bio e', 'bio p', 'bioeng'],
  'biology': ['bio'],
  'civ eng': ['cive', 'civ e', 'civeng'],
  'chm eng': ['cheme'],
  'classic': ['classics'],
  'cog sci': ['cogsci'],
  'colwrit': ['college writing'],
  'com lit': ['complit', 'comlit'],
  'cy plan': ['cyplan', 'cp'],
  'des inv': ['desinv', 'design'],
  'dev eng': ['eveng'],
  'dev std': ['devstd'],
  'datasci': ['ds', 'data'],
  'ea lang': ['ealang'],
  'env des': ['ed'],
  'el eng': ['ee', 'electrical engineering'],
  'ene,res': ['erg', 'er', 'eneres'],
  'engin': ['e', 'engineering'],
  'env sci': ['envsci'],
  'eth std': ['ethstd'],
  'eura st': ['eurast'],
  'geog': ['geology', 'geo'],
  'hin-urd': ['hinurd'],
  'hum bio': ['humbio'],
  'integbi': ['ib'],
  'ind eng': ['ie', 'ieor'],
  'linguis': ['ling'],
  'l & s': ['l&s', 'ls', 'lns'],
  'malay/i': ['malayi'],
  'mat sci': ['matsci', 'ms', 'mse'],
  'mec eng': ['meceng', 'meche', 'mech e', 'me'],
  'med st': ['medst'],
  'me stu': ['mestu', 'middle eastern studies'],
  'mil aff': ['milaff'],
  'mil sci': ['milsci'],
  'natamst': ['native american studies', 'nat am st'],
  'neurosc': ['neurosci'],
  'nuc en': ['ne'],
  'ne stud': ['nestud'],
  'mediast': ['media'],
  'music': ['mus'],
  'pb hlth': ['pbhlth', 'ph', 'pub hlth', 'public health'],
  'phys end': ['pe', 'physed'],
  'philos': ['philo', 'phil'],
  'polecon': ['poliecon'],
  'philo': ['philosophy'],
  'plantbi': ['pmb'],
  'pol sci': ['poli', 'polsci', 'polisci', 'poli sci', 'ps'],
  'pub pol': ['pubpol', 'pp', 'public policy'],
  'pub aff': ['pubaff', 'public affaris'],
  'psych': ['psychology'],
  'rhetor': ['rhetoric'],
  's asian': ['sasian'],
  's,seasn': ['sseasn'],
  'stat': ['stats'],
  'theater': ['tdps'],
  'ugba': ['haas'],
  'vietnms': ['vietnamese'],
  'vis sci': ['vissci'],
  'vis std': ['visstd']
}
