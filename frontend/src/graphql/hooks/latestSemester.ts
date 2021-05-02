import { useGetSemestersQuery } from '../graphql';
import {
  getLatestSemester,
  SemesterWithPlaylist,
} from 'utils/playlists/semesters';
import { useState } from 'react';
import { ApolloError } from '@apollo/client';

const useLatestSemester = (): {
  semester: SemesterWithPlaylist | null;
  loading: boolean;
  error: ApolloError | undefined;
} => {
  const [
    latestSemester,
    setLatestSemester,
  ] = useState<SemesterWithPlaylist | null>(null);

  const { loading, error } = useGetSemestersQuery({
    onCompleted: (data) => {
      const allPlaylists = data.allPlaylists?.edges.map((edge) => edge!.node!)!;
      setLatestSemester(getLatestSemester(allPlaylists));
    },
  });

  return { semester: latestSemester, loading, error };
};

export default useLatestSemester;
