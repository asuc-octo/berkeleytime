/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Tabs from '@radix-ui/react-tabs';
import useCatalog from '../useCatalog';
import CatalogViewSections from './__new_SectionTable';
import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { sortSections } from 'utils/sections/sort';
import styles from './CatalogView.module.scss';
import GradesGraph from 'components/Graphs/GradesGraph';
import { fetchCatalogGrades, fetchLegacyGradeObjects } from 'redux/actions';
import { useSelector } from 'react-redux';

type TabKey = 'times' | 'grades' | 'enrollment';

const CourseTabs = () => {
	const [value, setValue] = useState<TabKey>('times');
	const [{ course }] = useCatalog();
	const [graphData, setGraphData] = useState<any[]>([]);

	const sections = useMemo(
		() => (course?.sectionSet ? sortSections(course.sectionSet.edges.map((e) => e.node)) : []),
		[course]
	);

	const legacyId = useSelector(
		(state: any) =>
			state.grade?.context?.courses?.find((c: any) => {
				return c.course_number === course?.courseNumber;
			})?.id || null
	);

	useEffect(() => {
		if (!course || !legacyId) return;

		const fetchGraph = async () => {
			const gradeObjects = await fetchLegacyGradeObjects(legacyId);

			const res = await fetchCatalogGrades([
				{ ...course, sections: gradeObjects.map((s: any) => s.grade_id) }
			]);

			return setGraphData(res);
		};

		fetchGraph();
	}, [course, legacyId]);

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
				<div className={styles.tabGraph}>
					<GradesGraph
						gradesData={graphData}
						course={course}
						color="#4EA6FB"
					/>
				</div>
			</Tabs.Content>
		</Tabs.Root>
	);
};

export default CourseTabs;
