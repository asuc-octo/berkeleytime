import HomeHero from './HomeHero';
import Scheduler from './HomeFeature/Scheduler';
import Catalog from './HomeFeature/Catalog';
import Grades from './HomeFeature/Grades';
import HomeFooter from './HomeFooter/HomeFooter';
import styles from './home.module.scss';
import Navigation from '../../components/Common/Navigation';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import dawn from './campanile/dawn.svg';
import sunrise from './campanile/sunrise.svg';
import morning from './campanile/morning.svg';
import afternoon from './campanile/afternoon.svg';
import sunset from './campanile/sunset.svg';
import dusk from './campanile/dusk.svg';

interface Step {
	text: string;
	colors: [string, string];
	reverse?: boolean;
	image: string;
}

const steps: Step[] = [
	{ text: 'Dawn', colors: ['#CFADD4', '#B5B2D9'], image: dawn },
	{ text: 'Sunrise', colors: ['#D3A4BF', '#EEC9C1'], image: sunrise },
	{ text: 'Morning', colors: ['#DCD6C4', '#C8DCD9'], image: morning },
	{ text: 'Afternoon', colors: ['#3b82f6', '#0ea5e9'], image: afternoon },
	{ text: 'Sunset', colors: ['#D25950', '#EE8A1F'], image: sunset },
	{ text: 'Dusk', colors: ['#10101B', '#202036'], reverse: true, image: dusk }
];

const Home = () => {
	const [date, setDate] = useState(new Date());

	const step = useMemo(() => {
		return steps[Math.floor(((date.getHours() - 0) / 24) * 6)];
	}, [date]);

	useEffect(() => {
		const interval = setInterval(() => setDate(new Date()), 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<>
			<div className={styles.root}>
				<HomeHero step={step} date={date} />
				<Scheduler />
				<Catalog />
				<Grades />
				<HomeFooter step={step} />
			</div>
		</>
	);
};

export default Home;
