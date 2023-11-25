/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Tabs from '@radix-ui/react-tabs';
import useCatalog from '../../useCatalog';
import CatalogViewSections from './SectionTable';
import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { sortSections } from 'utils/sections/sort';
import styles from '../CatalogView.module.scss';
import GradesGraph from 'components/Graphs/GradesGraph';
import {
	fetchCatalogGrades,
	fetchLegacyGradeObjects,
	fetchLegacyEnrollmentObjects,
	fetchCatalogEnrollment
} from 'redux/actions';
import { useSelector } from 'react-redux';
import EnrollmentGraph from 'components/Graphs/EnrollmentGraph';
import { useParams } from 'react-router-dom';
import { CatalogSlug } from '../../types';

type TabKey = 'times' | 'grades' | 'enrollment';

const CourseTabs = () => {
	const [value, setValue] = useState<TabKey>('times');
	const [{ course }] = useCatalog();
	const [gradeData, setGradeData] = useState<any[] | null>([]);
	const [enrollmentData, setEnrollmentData] = useState<any[] | null>(null);
	const { abbreviation, courseNumber, semester } = useParams<CatalogSlug>();

	const sections = useMemo(
		() => (course?.sectionSet ? sortSections(course.sectionSet.edges.map((e) => e.node)) : []),
		[course]
	);

	const legacyGradeId = useSelector(
		(state: any) =>
			state.grade?.context?.courses?.find((c: any) => {
				return c.course_number === course?.courseNumber;
			})?.id || null
	);

	const legacyEnrollmentId = useSelector(
		(state: any) =>
			state.enrollment?.context?.courses?.find(
				(c: any) => c.abbreviation === abbreviation && c.course_number === courseNumber
			)?.id ?? null
	);

	useEffect(() => {
		if (!course) return;
		setGradeData(null);
		setEnrollmentData(null);

		const fetchGrades = async () => {
			if (!legacyGradeId) return;
			const objects = await fetchLegacyGradeObjects(legacyGradeId);

			const res = await fetchCatalogGrades([
				{ ...course, sections: objects.map((s: any) => s.grade_id) }
			]);

			setGradeData(res);
		};

		const fetchEnrollment = async () => {
			if (!semester || !legacyEnrollmentId) return setEnrollmentData(null);

			const objects = await fetchLegacyEnrollmentObjects(legacyEnrollmentId);
			const [sem, year] = semester.split(' ') ?? [null, null];

			const currentSection = objects.find(
				(o: any) => o.semester === sem?.toLowerCase() && o.year === year
			);

			if (currentSection === undefined) return setEnrollmentData([]);

			const res = await fetchCatalogEnrollment([
				{ ...course, sections: [currentSection.sections[0].section_id] }
			]);

			setEnrollmentData(res);
		};

		fetchGrades();
		fetchEnrollment();
	}, [course, legacyEnrollmentId, legacyGradeId, semester]);

	return (
		<Tabs.Root onValueChange={(key) => setValue(key as TabKey)} value={value}>
			<Tabs.List className={styles.tabList}>
				<Tabs.Trigger
					value="times"
					className={clsx(styles.tab, value === 'times' && styles.active)}
				>
					Sections
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
					<GradesGraph gradesData={gradeData} course={course} color="#4EA6FB" />
				</div>
			</Tabs.Content>
			<Tabs.Content value="enrollment" className={styles.tabContent}>
				<div className={styles.tabGraph}>
					<EnrollmentGraph
						color="#4EA6FB"
						selectedCourses={[course]}
						enrollmentData={enrollmentData}
					/>
				</div>
			</Tabs.Content>
		</Tabs.Root>
	);
};

export default CourseTabs;
