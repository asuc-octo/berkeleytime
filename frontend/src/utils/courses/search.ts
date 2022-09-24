import { CourseOverviewFragment } from '../../graphql/graphql';
import { combineQueries, normalizeSearchTerm, search } from 'utils/search-utils';

export type SearchableCourse = CourseOverviewFragment;

/**
 * Applies search query over list of courses
 */
export function searchCourses(
  courses: SearchableCourse[],
  rawQuery: string
): SearchableCourse[] {
  const query = normalizeSearchTerm(rawQuery);
  const results = courses
    .map<[SearchableCourse, number | null]>((course) => {
      return [
        course,
        combineQueries([
          searchCourse(query, getFullCourseCode(course), 1),
          search(query, `${course.title}`.toLowerCase(), 0.3, 0.05),
        ]),
      ];
    })
    .filter(
      (result): result is [SearchableCourse, number] => result[1] !== null
    )
    .sort((a, b) => a[1] - b[1])
    .map(([course]) => course);

  return results;
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
  const searches = laymanToAbbreviation
    .filter(([source]) => courseCode.indexOf(source) > -1)
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
  return searchComponents.join(' ').toLowerCase();
}

export const laymanToAbbreviation: [string, string][] = [
  ['astron', 'astro'],
  ['compsci', 'cs'],
  ['compsci', 'comp sci'],
  ['compsci', 'computer science'],
  ['mcellbi', 'mcb'],
  ['nusctx', 'nutrisci'],
  ['bio eng', 'bioe'],
  ['bio eng', 'bio e'],
  ['bio phy', 'bio p'],
  ['bio eng', 'bioeng'],
  ['biology', 'bio'],
  ['civ eng', 'cive'],
  ['civ eng', 'civ e'],
  ['chm eng', 'cheme'],
  ['civ eng', 'civeng'],
  ['classic', 'classics'],
  ['cog sci', 'cogsci'],
  ['colwrit', 'college writing'],
  ['com lit', 'complit'],
  ['com lit', 'comlit'],
  ['cy plan', 'cyplan'],
  ['cy plan', 'cp'],
  ['des inv', 'desinv'],
  ['des inv', 'design'],
  ['dev eng', 'deveng'],
  ['dev std', 'devstd'],
  ['datasci', 'ds'],
  ['datasci', 'data'],
  ['ea lang', 'ealang'],
  ['env des', 'ed'],
  ['el eng', 'ee'],
  ['el eng', 'electrical engineering'],
  ['ene,res', 'erg'],
  ['ene,res', 'er'],
  ['ene,res', 'eneres'],
  ['engin', 'e'],
  ['engin', 'engineering'],
  ['env sci', 'envsci'],
  ['eth std', 'ethstd'],
  ['eura st', 'eurast'],
  ['geog', 'geology'],
  ['geog', 'geo'],
  ['hin-urd', 'hinurd'],
  ['hum bio', 'humbio'],
  ['integbi', 'ib'],
  ['ind eng', 'ie'],
  ['ind eng', 'ieor'],
  ['linguis', 'ling'],
  ['l & s', 'l&s'],
  ['l & s', 'ls'],
  ['l & s', 'lns'],
  ['malay/i', 'malayi'],
  ['mat sci', 'matsci'],
  ['mat sci', 'ms'],
  ['mat sci', 'mse'],
  ['mec eng', 'meceng'],
  ['mec eng', 'meche'],
  ['mec eng', 'mech e'],
  ['mec eng', 'me'],
  ['med st', 'medst'],
  ['m e stu', 'mestu'],
  ['m e stu', 'middle eastern studies'],
  ['mil aff', 'milaff'],
  ['mil sci', 'milsci'],
  ['natamst', 'native american studies'],
  ['natamst', 'nat am st'],
  ['neurosc', 'neurosci'],
  ['nuc eng', 'ne'],
  ['ne stud', 'nestud'],
  ['mediast', 'media'],
  ['music', 'mus'],
  ['pb hlth', 'pbhlth'],
  ['pb hlth', 'ph'],
  ['pb hlth', 'pub hlth'],
  ['pb hlth', 'public health'],
  ['phys ed', 'pe'],
  ['phys ed', 'physed'],
  ['philos', 'philo'],
  ['philos', 'phil'],
  ['polecon', 'poli econ'],
  ['polecon', 'poliecon'],
  ['philo', 'philosophy'],
  ['plantbi', 'pmb'],
  ['pol sci', 'poli'],
  ['pol sci', 'polsci'],
  ['pol sci', 'polisci'],
  ['pol sci', 'poli sci'],
  ['pol sci', 'ps'],
  ['pub pol', 'pubpol'],
  ['pub pol', 'pp'],
  ['pub pol', 'public policy'],
  ['pub aff', 'pubaff'],
  ['pub aff', 'public affairs'],
  ['psych', 'psychology'],
  ['rhetor', 'rhetoric'],
  ['s asian', 'sasian'],
  ['s,seasn', 'sseasn'],
  ['stat', 'stats'],
  ['theater', 'tdps'],
  ['ugba', 'haas'],
  ['vietnms', 'vietnamese'],
  ['vis sci', 'vissci'],
  ['vis std', 'visstd'],
];
