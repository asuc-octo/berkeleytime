import { useGetSemestersQuery } from '../graphql';
import { getLatestSemester, Semester } from 'utils/playlists/semesters';
import { useState } from 'react';
import { ApolloError } from '@apollo/client';

const useLatestSemester = (): {
  semester: Semester | null,
  loading: boolean,
  error: ApolloError | undefined
} => {
  const [latestSemester, setLatestSemester] = useState<Semester | null>(null);

  const {
    loading,
    error,
  } = useGetSemestersQuery({
    onCompleted: (data) => {
      const allPlaylists = data.allPlaylists?.edges.map((edge) => edge!.node!)!;
      setLatestSemester(getLatestSemester(allPlaylists));
    },
  });

  return { semester: latestSemester, loading, error };
};

export default useLatestSemester;
