import { Link } from "react-router-dom";
import Navigation from "../../../components/Common/Navigation";
import styles from "./Hero.module.scss";

const Hero = () => {
	return (
		<div className={styles.root}>
			<Navigation standalone />

			<div className={styles.container}>
				<p className={styles.header}>Welcome to Berkeleytime!</p>

				<p className={styles.description}>Berkeleytime is a platform built, maintained, and run by students, just like you!</p>

				<Link to="/catalog" className={styles.button}>Explore courses</Link>
			</div>
		</div>
	);
};

export default Hero;