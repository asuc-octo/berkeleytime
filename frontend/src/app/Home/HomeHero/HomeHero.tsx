import { Link } from 'react-router-dom';
import Navigation from '../../../components/Common/Navigation';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Clock } from 'iconoir-react';

import styles from './HomeHero.module.scss';

import wave from './wave.svg';


interface Step {
	text: string;
	colors: [string, string];
	reverse?: boolean;
	image: string;
}

const HomeHero = ({step, date} : {step: Step, date: Date}) => {
	const root = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		root.current?.style.setProperty('--start', step.colors[0]);
		root.current?.style.setProperty('--stop', step.colors[1]);

		if (step.reverse) root.current?.style.setProperty('--angle', 'to bottom right');
		else root.current?.style.removeProperty('--angle');
	}, [step]);

	return (
		<div className={styles.root} ref={root}>
			<Navigation landing={true} />
			<div className={styles.container}>
				<div className={styles.content}>
					<p className={styles.header}>Welcome to Berkeleytime!</p>

					<p className={styles.description}>
						Berkeleytime is a platform built, maintained, and run by students, just like you!
					</p>

					<Link to="/catalog" className={styles.button}>
						Explore courses
					</Link>
				</div>
				<div className={styles.clock}>
					<Clock height={24} width={24} />

					<p className={styles.time}>
						{date.toLocaleTimeString(undefined, {
							hour: 'numeric',
							minute: 'numeric',
							second: 'numeric'
						})}
					</p>

					<p className={styles.period}>{step.text}</p>
				</div>

				<img className={styles.campanile} src={step.image} />
			</div>

			<img className={styles.wave} src={wave} />
		</div>
	);
};

export default HomeHero;
