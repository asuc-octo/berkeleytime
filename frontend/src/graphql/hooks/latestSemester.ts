import { useState } from "react";
import {
  getLatestSemester,
  SemesterWithPlaylist,
} from "utils/playlists/semesters";

import { ApolloError } from "@apollo/client";

import { useGetSemestersQuery } from "../graphql";

const useLatestSemester = (): {
  semester: SemesterWithPlaylist | null;
  loading: boolean;
  error: ApolloError | undefined;
} => {
  const [latestSemester, setLatestSemester] =
    useState<SemesterWithPlaylist | null>(null);

  const { loading, error } = useGetSemestersQuery({
    onCompleted: (data) => {
      const allPlaylists = data.allPlaylists?.edges.map((edge) => edge!.node!)!;
      setLatestSemester(getLatestSemester(allPlaylists));
    },
  });

  return { semester: latestSemester, loading, error };
};

export default useLatestSemester;
