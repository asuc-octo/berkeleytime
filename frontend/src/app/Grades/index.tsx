import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import ClassCardList from '../../components/ClassCards/ClassCardList';
import GradesSearchBar from '../../components/ClassSearchBar/GradesSearchBar';
import GradesGraphCard from '../../components/GraphCard/GradesGraphCard';

import info from '../../assets/img/images/graphs/info.svg';

import {
	fetchGradeClass,
	fetchGradeContext,
	fetchGradeFromUrl,
	gradeRemoveCourse,
	gradeReset
} from 'redux/grades/actions';
import { useReduxSelector } from 'redux/store';
import { UnformattedCourseType } from 'redux/types';

const toUrlForm = (string: string) => {
	return string.replace('/', '_').toLowerCase().split(' ').join('-');
};

export function Component() {
	const [additionalInfo, setAdditionalInfo] = useState<[string, number, string, number][]>([]);

	const location = useLocation();
	const navigate = useNavigate();

	const { context, selectedCourses, usedColorIds } = useReduxSelector((state) => state.grade);
	const { mobile: isMobile } = useReduxSelector((state) => state.common);

	const dispatch = useDispatch();

	const addToUrl = useCallback(
		(course: UnformattedCourseType) => {
			const instructor = toUrlForm(course.instructor);

			const courseUrl = `${course.colorId}-${course.courseID}-${toUrlForm(
				course.semester
			)}-${instructor}`;

			let url = location.pathname;

			if (url && !url.includes(courseUrl)) {
				url += url === '/grades' ? '/' : '';
				url += url === '/grades/' ? '' : '&';
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
			dispatch(fetchGradeClass(course));
		},
		[dispatch, addToUrl, selectedCourses, usedColorIds]
	);

	const refillUrl = useCallback(
		(id: string) => {
			const updatedCourses = selectedCourses.filter((classInfo) => classInfo.id !== id);
			const url =
				'/grades/' +
				[
					updatedCourses.map((course) => {
						return `${course.colorId}-${course.courseID}-${toUrlForm(course.semester)}-${toUrlForm(
							course.instructor
						)}`;
					})
				].join('&');
			navigate(url, { replace: true });
		},
		[navigate, selectedCourses]
	);

	const removeCourse = useCallback(
		(id: string, color: string) => {
			refillUrl(id);
			dispatch(gradeRemoveCourse(id, color));
		},
		[dispatch, refillUrl]
	);

	const updateClassCardGrade = useCallback(
		(
			course_letter: string[],
			course_gpa: number[],
			section_letter: string[],
			section_gpa: number[]
		) => {
			const info = course_letter.map(
				(_, i) =>
					[course_letter[i], course_gpa[i], section_letter[i], section_gpa[i]] as [
						string,
						number,
						string,
						number
					]
			);

			setAdditionalInfo(info);
		},
		[]
	);

	useEffect(() => {
		const fillFromUrl = () => {
			try {
				const url = location.pathname;

				if (url && (url === '/grades/' || url === '/grades')) {
					dispatch(gradeReset());
				} else if (url) {
					dispatch(fetchGradeFromUrl(url, navigate));
				}
			} catch (err) {
				navigate('/error');
			}
		};

		dispatch(fetchGradeContext());
		dispatch(gradeReset());
		fillFromUrl();
	}, [dispatch, location.pathname, navigate]);

	return (
		<div className="viewport-app">
			<div className="grades">
				<GradesSearchBar
					classes={context.courses}
					addCourse={addCourse}
					fromCatalog={location.state ? location.state.course : false}
					isFull={selectedCourses.length === 4}
					isMobile={isMobile}
				/>

				<ClassCardList
					selectedCourses={selectedCourses}
					removeCourse={removeCourse}
					additionalInfo={additionalInfo}
					type="grades"
					isMobile={isMobile}
				/>

				<GradesGraphCard
					id="gradesGraph"
					title="Grades"
					updateClassCardGrade={updateClassCardGrade}
					isMobile={isMobile}
				/>

				<div className="disclaimer">
					<img src={info} className="info" alt="" />
					<p>
						We source our course grade data from Berkeley&apos;s official{' '}
						<a href="https://calanswers.berkeley.edu/">CalAnswers</a> database.
					</p>
				</div>
			</div>
		</div>
	);
}
