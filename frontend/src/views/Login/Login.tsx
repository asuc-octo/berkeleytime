import React from 'react';
import { useHistory } from 'react-router';
import { useLocation } from "react-router-dom";
import { useLogin } from '../../graphql/hooks/user';
import BTLoader from 'components/Common/BTLoader';


function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Login = () => {
  const [login, { loading }] = useLogin();
  const history = useHistory();
  const query = useQuery();

  const id_token = query.get("id_token");
  if (!id_token) {
    history.push('/error');
    return (null);
  }

  if (loading) {
    return <BTLoader />;
  }

  login({
    variables: {
      token: id_token,
    },
  }).then((result) => {
    // If the login was successful.
    if (result.data?.login?.user) {
      history.push('/profile');
    }
  });

  return (null);
};

export default Login;