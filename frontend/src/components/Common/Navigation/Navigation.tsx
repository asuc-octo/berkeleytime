import { FC, useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../redux/store';
import { ReactComponent as GoogleIcon } from '../../../assets/svg/profile/google.svg';

import { useUser } from '../../../graphql/hooks/user';

import styles from "./Navigation.module.scss";
import { Menu, Cancel } from "iconoir-react";

interface Props {
	standalone?: boolean
}

const Navigation: FC<Props> = ({ standalone }) => {
	const { isLoggedIn } = useUser();
	const isMobile = useSelector((state: ReduxState) => state.common.mobile);

	const [ open, setOpen ] = useState(false);

	useEffect(() => {
		setOpen(open && isMobile)
	}, [ isMobile, open ]);

	return (
		<div className={`${styles.root} ${standalone && !open ? styles.standalone : ""} ${open ? styles.open : ""}`}>
			<div className={styles.wrapper}>
				<Link className={styles.brand} to="/">Berkeleytime</Link>

				<div className={styles.icon} onClick={() => setOpen(!open)}>
					{open ? <Cancel /> : <Menu />}
				</div>
			</div>

			<div className={styles.menu}>
				<NavLink to="/catalog" className={styles.item}>Catalog</NavLink>
				<NavLink to="/scheduler" className={styles.item}>Scheduler</NavLink>
				<NavLink to="/grades" className={styles.item}>Grades</NavLink>
				<NavLink to="/enrollment" className={styles.item}>Enrollment</NavLink>

				{isLoggedIn ? (
					<>
						<NavLink to="/profile" className={styles.item}>Profile</NavLink>

						<Link to="/logout" className={styles.button}>Log out</Link>
					</>
				) : (
					<a href="/api/login" className={styles.button}>
						<GoogleIcon className="mr-2" />
						Log in
					</a>
				)}
			</div>
		</div>
	);
};

export default Navigation;
