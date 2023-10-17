import { capitalize } from 'bt/utils';
import { FilterFragment } from 'graphql';

type FilterablePlaylist = FilterFragment;

const SEMESTER_TYPE_TO_OFFSET: { [key: string]: number } = {
	spring: 0.0,
	summer: 0.1,
	fall: 0.2
};

/**
 * Converts a playlist to a quantifiable year value. Greater = newer
 */
function playlistToTimeComparable(playlist: FilterablePlaylist): number {
	if (playlist.category === 'semester') {
		const [semester, year] = playlist.name.toLowerCase().split(' ');
		return +year + SEMESTER_TYPE_TO_OFFSET[semester];
	} else {
		return 0;
	}
}

export type Semester = {
	playlistId?: string;
	year: string;
	semester: string;
};

export type SemesterWithPlaylist = Semester & { playlistId: string };

/**
 * Gets the latest semester from a list of playlists.
 */
export function getLatestSemester(playlists: FilterablePlaylist[]): SemesterWithPlaylist | null {
	const semesterPlaylists = playlists
		.filter(
			(p) =>
				p.category === 'semester' &&
				(process.env.NODE_ENV !== 'development' || p.name === 'Fall 2020')
		)
		.sort((a, b) => playlistToTimeComparable(b) - playlistToTimeComparable(a));

	const semester = semesterPlaylists[0];
	if (semester) {
		return playlistToSemester(semester);
	} else {
		return null;
	}
}

/**
 * Converts playlist to semester
 */
export function playlistToSemester(playlist: FilterablePlaylist): SemesterWithPlaylist {
	return stringToSemester(playlist.name, playlist.id);
}

/**
 * Convert a string to a semester.
 */
function stringToSemester(string: string, playlistId: string): SemesterWithPlaylist;
function stringToSemester(string: string, playlistId?: string): Semester {
	const [semester, year] = string.trim().toLowerCase().split(' ');
	return {
		semester,
		year,
		playlistId
	};
}

/**
 * Converts a semester to human-readable string
 */
export function semesterToString(semester?: Semester | null): string {
	if (!semester) return '';
	return `${capitalize(semester.semester)} ${semester.year}`;
}
