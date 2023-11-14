import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import ClassCardList from '../../components/ClassCards/ClassCardList';
import EnrollmentSearchBar from '../../components/ClassSearchBar/EnrollmentSearchBar.jsx';
import EnrollmentGraphCard from '../../components/GraphCard/EnrollmentGraphCard';

import info from '../../assets/img/images/graphs/info.svg';

import { useCallback, useEffect, useState } from 'react';
import type { UnformattedCourseType } from 'redux/types';
import { useReduxSelector } from 'redux/store';
import {
	enrollRemoveCourse,
	enrollReset,
	fetchEnrollClass,
	fetchEnrollContext,
	fetchEnrollFromUrl
} from '../../redux/enrollment/actions';
import { EnrollmentStatusType, TelebearsType } from 'redux/enrollment/types';

const toUrlForm = (string: string) => {
	return string.toLowerCase().split(' ').join('-');
};

export function Component() {
	const [additionalInfo, setAdditionalInfo] = useState<
		[EnrollmentStatusType, TelebearsType, number[], number[]][]
	>([]);

	const { context, selectedCourses, usedColorIds } = useReduxSelector((state) => state.enrollment);
	const { mobile: isMobile } = useReduxSelector((state) => state.common);

	const dispatch = useDispatch();
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		const fillFromUrl = () => {
			try {
				const url = location.pathname;

				if (url && (url === '/enrollment/' || url === '/enrollment')) {
					dispatch(enrollReset());
				} else if (url) {
					dispatch(fetchEnrollFromUrl(url, navigate));
				}
			} catch (err) {
				navigate('/error');
			}
		};

		dispatch(fetchEnrollContext());
		dispatch(enrollReset());
		fillFromUrl();
	}, [dispatch, location.pathname, navigate]);

	const addToUrl = useCallback(
		(course: UnformattedCourseType) => {
			const instructor = course.instructor === 'all' ? 'all' : course.sections[0];

			const courseUrl = `${course.colorId}-${course.courseID}-${toUrlForm(
				course.semester
			)}-${instructor}`;

			let url = location.pathname;

			if (url && !url.includes(courseUrl)) {
				url += url === '/enrollment' ? '/' : '';
				url += url === '/enrollment/' ? '' : '&';
				url += courseUrl;

				navigate(url, { replace: true });
			}
		},
		[navigate, location.pathname]
	);

	const addCourse = useCallback(
		(course: UnformattedCourseType) => {
			for (const selected of selectedCourses) {
				if (selected.id === course.id) {
					return;
				}
			}

			let newColorId = '';

			for (let i = 0; i < 4; i++) {
				if (!usedColorIds.includes(i.toString())) {
					newColorId = i.toString();
					break;
				}
			}

			course.colorId = newColorId;

			addToUrl(course);
			dispatch(fetchEnrollClass(course));
		},
		[dispatch, addToUrl, selectedCourses, usedColorIds]
	);

	const refillUrl = useCallback(
		(id: string) => {
			const updatedCourses = selectedCourses.filter((classInfo) => classInfo.id !== id);

			let url = '/enrollment/';

			for (let i = 0; i < updatedCourses.length; i++) {
				const course = updatedCourses[i];
				if (i !== 0) url += '&';
				const instructor = course.instructor === 'all' ? 'all' : course.sections[0];
				url += `${course.colorId}-${course.courseID}-${toUrlForm(course.semester)}-${instructor}`;
			}

			navigate(url, { replace: true });
		},
		[navigate, selectedCourses]
	);

	const removeCourse = useCallback(
		(id: string, color: string) => {
			refillUrl(id);
			dispatch(enrollRemoveCourse(id, color));
		},
		[refillUrl, dispatch]
	);

	const updateClassCardEnrollment = useCallback(
		(
			latest_point: EnrollmentStatusType[],
			telebears: TelebearsType[],
			enrolled_info: number[][],
			waitlisted_info: number[][]
		) => {
			const info = latest_point.map(
				(_, i) =>
					[latest_point[i], telebears[i], enrolled_info[i], waitlisted_info[i]] as [
						EnrollmentStatusType,
						TelebearsType,
						number[],
						number[]
					]
			);

			setAdditionalInfo(info);
		},
		[]
	);

	return (
		<div className="viewport-app">
			<div className="enrollment">
				<EnrollmentSearchBar
					classes={context.courses}
					addCourse={addCourse}
					fromCatalog={location.state ? location.state.course : false}
					isFull={selectedCourses.length === 4}
					isMobile={isMobile}
					sectionNumber={'qwq'}
				/>

				<ClassCardList
					selectedCourses={selectedCourses}
					removeCourse={removeCourse}
					additionalInfo={additionalInfo}
					type="enrollment"
					isMobile={isMobile}
				/>

				<EnrollmentGraphCard
					id="gradesGraph"
					title="Enrollment"
					updateClassCardEnrollment={updateClassCardEnrollment}
					isMobile={isMobile}
				/>

				{!isMobile && <div className="xlabel">Days After Phase 1</div>}
				<div className="disclaimer">
					<img src={info} className="info" alt="" />
					<p>
						We source our historic course and enrollment data directly from Berkeley{' '}
						<a href="https://sis.berkeley.edu/">Student Information System&apos;s</a> Course and
						Class APIs.
					</p>
				</div>
			</div>
		</div>
	);
}
