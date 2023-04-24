import { Link } from "react-router-dom";
import Navigation from "../../../components/Common/Navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import styles from "./Hero.module.scss";

import wave from "./wave.svg";

import dawn from "./campanile/dawn.svg";
import sunrise from "./campanile/sunrise.svg";
import morning from "./campanile/morning.svg";
import afternoon from "./campanile/afternoon.svg";
import sunset from "./campanile/sunset.svg";
import dusk from "./campanile/dusk.svg";

interface Step {
	text: string,
	colors: [ string, string ],
	reverse?: boolean,
	image: string
}

const steps: Step[] = [
	{ text: "Dawn", colors: [ "#CFADD4", "#B5B2D9" ], image: dawn },
	{ text: "Sunrise", colors: [ "#D3A4BF", "#EEC9C1" ], image: sunrise },
	{ text: "Morning", colors: [ "#DCD6C4", "#C8DCD9" ], image: morning },
	{ text: "Afternoon", colors: [ "#2377B5", "#B7D4FF" ], image: afternoon },
	{ text: "Sunset", colors: [ "#D25950", "#EE8A1F" ], image: sunset },
	{ text: "Dusk", colors: [ "#10101B", "#202036" ], reverse: true, image: dusk }
];

const Hero = () => {
	const root = useRef<HTMLDivElement>(null);
	const [ date, setDate ] = useState(new Date());

	const step = useMemo(() => {
		return steps[Math.floor((date.getHours() + 6) / 24 * 5)];
	}, [ date ]);

	useEffect(() => {
		const interval = setInterval(() => setDate(new Date()), 1000);

		return () => clearInterval(interval);
	}, []);

	useLayoutEffect(() => {
		root.current?.style.setProperty("--start", step.colors[0]);
		root.current?.style.setProperty("--stop", step.colors[1]);

		if (step.reverse) root.current?.style.setProperty("--angle", "to bottom right")
		else root.current?.style.removeProperty("--angle");
	}, [ step ]);

	return (
		<div className={styles.root} ref={root}>
			<Navigation standalone={true} />

			<div className={styles.container}>
				<img className={styles.campanile} src={step.image} />

				<div className={styles.clock}>
					<p className={styles.time}>{ date.toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric", second: "numeric" }) }</p>

					<p className={styles.period}>{ step.text }</p>
				</div>

				<p className={styles.header}>Welcome to Berkeleytime!</p>

				<p className={styles.description}>Berkeleytime is a platform built, maintained, and run by students, just like you!</p>

				<Link to="/catalog" className={styles.button}>Explore courses</Link>
			</div>

			<img className={styles.wave} src={wave} />
		</div>
	);
};

export default Hero;