import { useLocation, useNavigate } from 'react-router-dom';
import { useLogin } from '../graphql/hooks/user';
import BTLoader from 'components/Common/BTLoader';

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

export function Component() {
	const [login, { loading }] = useLogin();
	const navigate = useNavigate();
	const query = useQuery();

	const id_token = query.get('id_token');
	if (!id_token) {
		navigate('/error');
		return null;
	}

	if (loading) {
		return <BTLoader fill />;
	}

	login({
		variables: {
			token: id_token
		}
	}).then((result) => {
		// If the login was successful.
		if (result.data?.login?.user) {
			navigate('/profile');
		}
	});

	return null;
}
