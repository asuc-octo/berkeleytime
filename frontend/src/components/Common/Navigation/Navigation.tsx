import { FC } from 'react';
import { Link } from 'react-router-dom';
import { connect, ConnectedProps } from 'react-redux';
import { ReduxState } from '../../../redux/store';
import { ReactComponent as GoogleIcon } from '../../../assets/svg/profile/google.svg';

import { useUser } from '../../../graphql/hooks/user';

import styles from "./Navigation.module.scss";
//import { Menu } from "iconoir-react";

interface Props extends PropsFromRedux {
	standalone?: boolean
}

const Navigation: FC<Props> = ({ standalone }) => {
	const { isLoggedIn } = useUser();

	return (
		<div className={standalone ? `${styles.root} ${styles.standalone}` : styles.root}>
			<Link className={styles.brand} to="/">Berkeleytime</Link>

			{/*<div className={styles.icon}>
				<Menu />
			</div>*/}

			<div className={styles.menu}>
				<Link to="/catalog" className={styles.item}>Catalog</Link>
				<Link to="/scheduler" className={styles.item}>Scheduler</Link>
				<Link to="/grades" className={styles.item}>Grades</Link>
				<Link to="/enrollment" className={styles.item}>Enrollment</Link>
				<Link to="/about" className={styles.item}>About</Link>
				<Link to="/faq" className={styles.item}>FAQ</Link>

				{isLoggedIn ? (
					<>
						<Link to="/profile" className={styles.item}>Profile</Link>

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

const mapState = (state: ReduxState) => ({
	banner: state.common.banner
});

const connector = connect(mapState);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Navigation);
