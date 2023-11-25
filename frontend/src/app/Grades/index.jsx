import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import ClassCardList from '../../components/ClassCards/ClassCardList';
import GradesGraphCard from '../../components/GraphCard/GradesGraphCard';
import GradesSearchBar from '../../components/ClassSearchBar/GradesSearchBar';

import info from '../../assets/img/images/graphs/info.svg';

import {
	fetchGradeContext,
	fetchGradeClass,
	gradeRemoveCourse,
	gradeReset,
	fetchGradeFromUrl
} from '../../redux/actions';

const toUrlForm = (s) => {
	s = s.replace('/', '_');
	return s.toLowerCase().split(' ').join('-');
};

export function Component() {
	const [additionalInfo, setAdditionalInfo] = useState([]);

	const location = useLocation();
	const navigate = useNavigate();

	const { context, selectedCourses, usedColorIds } = useSelector((state) => state.grade);
	const { mobile: isMobile } = useSelector((state) => state.common);

	const dispatch = useDispatch();

	const addToUrl = useCallback(
		(course) => {
			let instructor = toUrlForm(course.instructor);

			let courseUrl = `${course.colorId}-${course.courseID}-${toUrlForm(
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
		(course) => {
			for (let selected of selectedCourses) {
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
		(id) => {
			let updatedCourses = selectedCourses.filter((classInfo) => classInfo.id !== id);
			let url = '/grades/';
			for (let i = 0; i < updatedCourses.length; i++) {
				let c = updatedCourses[i];
				if (i !== 0) url += '&';
				url += `${c.colorId}-${c.courseID}-${toUrlForm(c.semester)}-${toUrlForm(c.instructor)}`;
			}
			navigate(url, { replace: true });
		},
		[navigate, selectedCourses]
	);

	const removeCourse = useCallback(
		(id, color) => {
			refillUrl(id);
			dispatch(gradeRemoveCourse(id, color));
		},
		[dispatch, refillUrl]
	);

	const updateClassCardGrade = useCallback(
		(course_letter, course_gpa, section_letter, section_gpa) => {
			var info = [];
			for (var i = 0; i < course_letter.length; i++) {
				info.push([course_letter[i], course_gpa[i], section_letter[i], section_gpa[i]]);
			}
			setAdditionalInfo(info);
		},
		[]
	);

	useEffect(() => {
		const fillFromUrl = () => {
			try {
				let url = location.pathname;

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
	}, []);

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

				{!isMobile && (
					<div className="xlabel">
						% of Students <span style={{ fontWeight: 'normal' }}>vs</span> Grade Received
					</div>
				)}
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
