import BTLoader from 'components/Common/BTLoader';
import { useLogout, useUser } from '../graphql/hooks/user';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Component() {
	const navigate = useNavigate();
	const [logout, { error }] = useLogout();
	const { isLoggedIn } = useUser();

	// Log the user out when they visit this page
	useEffect(() => {
		logout();
	}, [logout]);

	// If the logout was successful go to the previous page.
	useEffect(() => {
		if (!isLoggedIn) {
			navigate(-1);
		}
	}, [isLoggedIn, navigate]);

	return (
		<div className="logout viewport-app">
			<div className="logout-status">
				{error ? (
					<span>There was an error logging you out. Try refreshing</span>
				) : (
					<>
						<BTLoader message="Logging you out..." fill />
					</>
				)}
			</div>
		</div>
	);
}
