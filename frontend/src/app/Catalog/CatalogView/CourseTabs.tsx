import * as Tabs from '@radix-ui/react-tabs';
import useCatalog from '../useCatalog';
import CatalogViewSections from './__new_SectionTable';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { sortSections } from 'utils/sections/sort';

import styles from './CatalogView.module.scss';
// import GradesGraph from 'components/Graphs/GradesGraph';

type TabKey = 'times' | 'grades' | 'enrollment';

const CourseTabs = () => {
	const [value, setValue] = useState<TabKey>('times');
	const [{ course }] = useCatalog();

	const sections = useMemo(
		() => (course?.sectionSet ? sortSections(course.sectionSet.edges.map((e) => e.node)) : []),
		[course]
	);

	return (
		<Tabs.Root onValueChange={(key) => setValue(key as TabKey)} value={value}>
			<Tabs.List className={styles.tabList}>
				<Tabs.Trigger
					value="times"
					className={clsx(styles.tab, value === 'times' && styles.active)}
				>
					Class Times
				</Tabs.Trigger>
				<Tabs.Trigger
					value="grades"
					className={clsx(styles.tab, value === 'grades' && styles.active)}
				>
					Grades
				</Tabs.Trigger>
				<Tabs.Trigger
					value="enrollment"
					className={clsx(styles.tab, value === 'enrollment' && styles.active)}
				>
					Enrollment
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="times" className={styles.tabContent}>
				<CatalogViewSections sections={sections} />
			</Tabs.Content>
			<Tabs.Content value="grades" className={styles.tabContent}>
				hi
			</Tabs.Content>
		</Tabs.Root>
	);
};

export default CourseTabs;
