import { getNodes } from "utils/graphql";
import {
  getLatestSemester,
  Semester,
  semesterToString,
  SemesterWithPlaylist,
} from "utils/playlists/semesters";

import { ApolloError } from "@apollo/client";

import { useGetSemestersQuery } from "../graphql";

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
    variables: {
      name: semester && semesterToString(semester),
    },
    skip: !!semester?.playlistId,
  });

  let latestSemester: SemesterWithPlaylist | null = null;

  if (semester?.playlistId) {
    latestSemester = semester as SemesterWithPlaylist;
  } else if (data?.allPlaylists && data.allPlaylists.edges.length >= 1) {
    latestSemester = getLatestSemester(getNodes(data.allPlaylists));
  }

  return { semester: latestSemester, loading, error };
};
