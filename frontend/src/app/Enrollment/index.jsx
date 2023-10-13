import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import ClassCardList from '../../components/ClassCards/ClassCardList';
import EnrollmentGraphCard from '../../components/GraphCard/EnrollmentGraphCard';
import EnrollmentSearchBar from '../../components/ClassSearchBar/EnrollmentSearchBar';

import info from '../../assets/img/images/graphs/info.svg';

import {
	fetchEnrollContext,
	fetchEnrollClass,
	enrollRemoveCourse,
	enrollReset,
	fetchEnrollFromUrl
} from '../../redux/actions';
import { useCallback, useEffect, useState } from 'react';

const toUrlForm = (s) => {
	return s.toLowerCase().split(' ').join('-');
};

export function Component() {
	const [additionalInfo, setAdditionalInfo] = useState([]);

	const { context, selectedCourses, usedColorIds } = useSelector((state) => state.enrollment);
	const { mobile: isMobile } = useSelector((state) => state.common);

	const dispatch = useDispatch();
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		const fillFromUrl = () => {
			try {
				let url = location.pathname;

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
	}, []);

	const addToUrl = useCallback(
		(course) => {
			let instructor = course.instructor === 'all' ? 'all' : course.sections[0];

			let courseUrl = `${course.colorId}-${course.courseID}-${toUrlForm(
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
			dispatch(fetchEnrollClass(course));
		},
		[dispatch, addToUrl, selectedCourses, usedColorIds]
	);

	const refillUrl = useCallback(
		(id) => {
			let updatedCourses = selectedCourses.filter((classInfo) => classInfo.id !== id);

			let url = '/enrollment/';

			for (let i = 0; i < updatedCourses.length; i++) {
				let c = updatedCourses[i];
				if (i !== 0) url += '&';
				let instructor = c.instructor === 'all' ? 'all' : c.sections[0];
				url += `${c.colorId}-${c.courseID}-${toUrlForm(c.semester)}-${instructor}`;
			}

			navigate(url, { replace: true });
		},
		[navigate, selectedCourses]
	);

	const removeCourse = useCallback(
		(id, color) => {
			refillUrl(id);
			dispatch(enrollRemoveCourse(id, color));
		},
		[refillUrl, dispatch]
	);

	const updateClassCardEnrollment = useCallback(
		(latest_point, telebears, enrolled_info, waitlisted_info) => {
			var info = [];

			for (var i = 0; i < latest_point.length; i++) {
				info.push([latest_point[i], telebears[i], enrolled_info[i], waitlisted_info[i]]);
			}

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
