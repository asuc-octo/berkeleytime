import { capitalize } from "bt/utils";

import { FilterablePlaylist, playlistToTimeComparable } from "./playlist";

export type Semester = {
  playlistId?: string;
  year: string;
  semester: string;
};

export type SemesterWithPlaylist = Semester & { playlistId: string };

/**
 * Takes a list of playlist IDs and tries to convert it to a semester
 */
export function extractSemesters(
  playlists: string[],
  allPlaylists: FilterablePlaylist[]
): SemesterWithPlaylist[] {
  return allPlaylists
    .filter((p) => p.category === "semester" && playlists.includes(p.id))
    .map(playlistToSemester);
}

/**
 * Gets the latest semester from a list of playlists.
 */
export function getLatestSemester(
  playlists: FilterablePlaylist[]
): SemesterWithPlaylist | null {
  const semesterPlaylists = playlists
    .filter((p) => p.category === "semester")
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
export function playlistToSemester(
  playlist: FilterablePlaylist
): SemesterWithPlaylist {
  return stringToSemester(playlist.name, playlist.id);
}

/**
 * Convert a string to a semester.
 */
export function stringToSemester(
  string: string,
  playlistId: string
): SemesterWithPlaylist;
export function stringToSemester(
  string: string,
  playlistId?: string
): Semester {
  const [semester, year] = string.trim().toLowerCase().split(" ");
  return {
    semester,
    year,
    playlistId,
  };
}

/**
 * Converts a semester to human-readable string
 */
export function semesterToString(semester?: Semester | null): string {
  if (!semester) return "";
  return `${capitalize(semester.semester)} ${semester.year}`;
}
