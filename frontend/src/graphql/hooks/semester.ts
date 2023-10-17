import { ApolloError } from '@apollo/client';
import { useGetSemestersQuery } from 'graphql';
import { getNodes } from 'utils/graphql';
import {
	getLatestSemester,
	playlistToSemester,
	Semester,
	semesterToString,
	SemesterWithPlaylist
} from 'utils/playlists/semesters';

/**
 * Gets the latest semester or a populated semester. Does not run a query if the
 * semester is already populated.
 * @param semester - If passed a semester, get's this semester with the added playlistId.
 */
export const useSemester = (
	semester?: Semester
): {
	semester: SemesterWithPlaylist | null;
	loading: boolean;
	error: ApolloError | undefined;
} => {
	const { data, loading, error } = useGetSemestersQuery({
		skip: !!semester?.playlistId
	});

	let latestSemester: SemesterWithPlaylist | null = null;

	if (semester?.playlistId) {
		latestSemester = semester as SemesterWithPlaylist;
	} else if (data?.allPlaylists && data.allPlaylists.edges.length >= 1) {
        console.log('entered second block')
		if (semester) {
			latestSemester = getNodes(data.allPlaylists)
				.map((node) => playlistToSemester(node))
				.filter((s) => {
					return semesterToString(s) === semesterToString(semester);
				})[0];
		} else {
			latestSemester = getLatestSemester(getNodes(data.allPlaylists));
		}
	} else {
        console.log('entered else')
    }

	return { semester: latestSemester, loading, error };
};
