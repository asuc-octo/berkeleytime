import {
  FilterablePlaylist,
  playlistToTimeComparable,
} from './playlist';

export type Semester = {
  year: string;
  semester: string;
};

/**
 * Takes a list of playlist IDs and tries to convert it to a semester
 */
export function extractSemesters(
  playlists: string[],
  allPlaylists: FilterablePlaylist[]
): (Semester & FilterablePlaylist)[] {
  return allPlaylists.filter(
    (p) => p.category === 'semester' && playlists.includes(p.id)
  );
}

/**
 * Gets the latest semester from a list of playlists.
 */
export function getLatestSemester(
  playlists: FilterablePlaylist[]
): (Semester & FilterablePlaylist) | null {
  const semesterPlaylists = playlists
    .filter((p) => p.category === 'semester')
    .sort((a, b) => playlistToTimeComparable(b) - playlistToTimeComparable(a));

  return semesterPlaylists[0] || null;
}
