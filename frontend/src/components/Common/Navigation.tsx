import { useState, useEffect, PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Navbar, Nav, NavProps } from 'react-bootstrap';
import { Button } from '../../bt/custom';
import { ReactComponent as GoogleIcon } from '../../assets/svg/profile/google.svg';

import { useUser } from '../../graphql/hooks/user';

function NavigationLink({
	to,
	children,
	isNew = false,
	...props
}: PropsWithChildren<
	{
		to?: string;
		onClick?: () => void;
		isNew?: boolean;
	} & NavProps
>) {
	return (
		<Nav.Link
			as={to ? Link : undefined}
			to={to}
			className={'bt-bold ' + (isNew ? 'is-new' : '')}
			// eventKey required for collapseOnselect
			// https://stackoverflow.com/questions/54859515/react-bootstrap-navbar-collapse-not-working/56485081#56485081
			eventKey={to}
			{...props}
		>
			{children}
		</Nav.Link>
	);
}

export default function Navigation() {
	const [, setShowLogin] = useState(false);

	const location = useLocation();
	const { isLoggedIn } = useUser();

	useEffect(() => {
		// Hide modal when path changes
		setShowLogin(false);
	}, [location.pathname]);

	return (
		<Navbar collapseOnSelect={true} expand="lg" bg="white">
			<Navbar.Brand as={Link} to="/" className="bt-bold">
				Berkeleytime
			</Navbar.Brand>
			<Navbar.Toggle aria-controls="responsive-navbar-nav" />
			<Navbar.Collapse id="responsive-navbar-nav">
				<Nav className="mr-auto" />
				<Nav>
					<NavigationLink to="/catalog">Catalog</NavigationLink>
					<NavigationLink to="/scheduler">Scheduler</NavigationLink>
					{/* {isLoggedIn && (
            <NavigationLink to="/scheduler">Scheduler</NavigationLink>
          )} */}
					<NavigationLink to="/grades">Grades</NavigationLink>
					<NavigationLink to="/enrollment">Enrollment</NavigationLink>
					<NavigationLink to="/about">About</NavigationLink>
					<NavigationLink to="/faq">FAQ</NavigationLink>

					{isLoggedIn ? (
						<>
							<NavigationLink to="/profile">Profile</NavigationLink>
							<Button href="/logout">Log out</Button>
						</>
					) : (
						<Button
							onClick={() => {
								window.location.href = '/api/login/';
							}}
						>
							<GoogleIcon className="mr-2" /> Log in
						</Button>
					)}
				</Nav>
			</Navbar.Collapse>
		</Navbar>
	);
}
