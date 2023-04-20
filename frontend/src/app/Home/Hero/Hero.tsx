import { Link } from "react-router-dom";
import Navigation from "../../../components/Common/Navigation";
import styles from "./Hero.module.scss";
import wave from "./wave.svg"

const Hero = () => {
	return (
		<div className={styles.root}>
			<Navigation standalone={true} />

			<div className={styles.container}>
				<p className={styles.header}>Welcome to Berkeleytime!</p>

				<p className={styles.description}>Berkeleytime is a platform built, maintained, and run by students, just like you!</p>

				<Link to="/catalog" className={styles.button}>Explore courses</Link>
			</div>

			<img className={styles.wave} src={wave} />
		</div>
	);
};

export default Hero;