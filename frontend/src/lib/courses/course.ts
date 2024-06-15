import { CourseFragment } from '../../graphql';
import { hash } from '../../utils/string';

type CourseReference = {
	abbreviation: string;
	courseNumber: string;
};

/**
 * Course to a course name
 * @example
 * courseToName(course) == "COMPSCI 61B"
 */
export function courseToName(
	course: Pick<CourseFragment, 'abbreviation' | 'courseNumber'> | CourseReference | null | undefined
): string {
	return course ? `${course.abbreviation} ${course.courseNumber}` : '';
}

/**
 * Color palette for courses
 */
export const COURSE_PALETTE = ['#1AA8E5', '#18DE83', '#FCD571', '#ED5186', '#FFA414'];

/**
 * Gets a color for a course
 * @param course Either a course object or the courseId.
 * @returns a CSS color code.
 */
export function courseToColor(course: Pick<CourseFragment, 'id'> | string | null): string {
	return COURSE_PALETTE[
		(course ? hash(typeof course === 'string' ? course : course.id) : 0) % COURSE_PALETTE.length
	];
}

export const laymanTerms: {
	[key: string]: string[];
} = {
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
	'data': ['ds', 'data'],
	'ea lang': ['ealang'],
	'env des': ['ed'],
	'el eng': ['ee', 'electrical engineering'],
	'eecs': ['eecs'],
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
	'psych': ['psychology', 'psych'],
	'rhetor': ['rhetoric'],
	's asian': ['sasian'],
	's,seasn': ['sseasn'],
	'stat': ['stats'],
	'theater': ['tdps'],
	'ugba': ['haas'],
	'vietnms': ['vietnamese'],
	'vis sci': ['vissci'],
	'vis std': ['visstd']
};
