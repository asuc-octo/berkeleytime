import styles from './HomeFooter.module.scss';
import { useRef, useLayoutEffect, useState } from 'react';
import wave from './wave.svg';


interface Step {
	text: string;
	colors: [string, string];
	reverse?: boolean;
	image: string;
}

const HomeFooter = ({ step }: { step: Step }) => {
	const [accordian, setAccordian] = useState([0])
	const root = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		root.current?.style.setProperty('--start', step.colors[0]);
		root.current?.style.setProperty('--stop', step.colors[1]);

		if (step.reverse) root.current?.style.setProperty('--angle', 'to bottom right');
		else root.current?.style.removeProperty('--angle');
	}, [step]);

	return (
		<>
			<img className={styles.wave} src={wave} />
			<div className={styles.root} ref={root}>
				<div className={styles.container}>
					<div className={styles.accordian}>
						<h1 className={styles.title}>Get Involved</h1>
						<div className={styles.section} id="accordian#0">
							<div className={styles.header}>
								<p>Join Our Team</p>
								<span>+</span>
							</div>
							<div className={styles.content}></div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default HomeFooter;
