import { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import hash from 'object-hash';

import { useDispatch, useSelector } from 'react-redux';

import { fetchGradeSelected } from '../../redux/actions';
import BTSelect from '../../components/Custom/Select';

const sortOptions = [
	{ value: 'instructor', label: 'By Instructor' },
	{ value: 'semester', label: 'By Semester' }
];

const buildCoursesOptions = (courses) => {
	if (!courses) {
		return [];
	}

	const options = courses.map((course) => ({
		value: course.id,
		label: `${course.abbreviation} ${course.course_number}`,
		course
	}));

	return options;
};

const capitalize = (str) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

const getSectionSemester = (section) => {
	return `${capitalize(section.semester)} ${section.year}`;
};

const buildPrimaryOptions = (sections, selectType) => {
	const ret = [];
	const map = new Map();

	if (selectType === 'instructor') {
		if (sections.length > 1) {
			ret.push({ value: 'all', label: 'All Instructors' });
		}
		for (const section of sections) {
			if (!map.has(section.instructor)) {
				map.set(section.instructor, true);
				ret.push({
					value: section.instructor,
					label: section.instructor
				});
			}
		}
	} else {
		if (sections.length > 1) {
			ret.push({ value: 'all', label: 'All Semesters' });
		}
		for (const section of sections) {
			const semester = getSectionSemester(section);
			if (!map.has(semester)) {
				map.set(semester, true);
				ret.push({
					value: semester,
					label: semester
				});
			}
		}
	}

	return ret;
};

const buildSecondaryOptions = (sections, selectType, selectPrimary) => {
	const ret = [];

	if (selectPrimary === 'all') {
		let options;
		if (selectType === 'instructor') {
			options = [
				...new Set(sections.map((s) => `${getSectionSemester(s)} / ${s.section_number}`))
			].map((semester) => ({
				value: semester.split(' / ')[0],
				label: semester,
				sectionNumber: semester.split(' / ')[1]
			}));
		} else {
			options = [...new Set(sections.map((s) => `${s.instructor} / ${s.section_number}`))].map(
				(instructor) => ({
					value: instructor.split(' / ')[0],
					label: instructor,
					sectionNumber: instructor.split(' / ')[1]
				})
			);
		}

		if (options.length > 1) {
			const label = selectType === 'instructor' ? 'All Semesters' : 'All Instructors';
			ret.push({ value: 'all', label });
		}

		for (const o of options) {
			ret.push(o);
		}
	} else {
		let options;
		if (selectType === 'instructor') {
			options = sections
				.filter((section) => section.instructor === selectPrimary)
				.map((section) => {
					const semester = `${getSectionSemester(section)} / ${section.section_number}`;

					return {
						value: semester,
						label: semester,
						sectionNumber: semester.split(' / ')[1]
					};
				});
		} else {
			options = sections
				.filter((section) => getSectionSemester(section) === selectPrimary)
				.map((section) => {
					const instructor = `${section.instructor} / ${section.section_number}`;
					return {
						value: instructor,
						label: instructor,
						sectionNumber: instructor.split(' / ')[1]
					};
				});
		}

		if (options.length > 1) {
			const label = selectType === 'instructor' ? 'All Semesters' : 'All Instructors';
			ret.push({ value: 'all', label });
		}

		for (const o of options) {
			ret.push(o);
		}
	}

	return ret;
};

const customStyles = {
	clearIndicator: (provided) => ({
		...provided,
		marginRight: 0,
		paddingRight: 0
	})
};

export default function GradesSearchBar({ fromCatalog, addCourse, isFull, isMobile, classes }) {
	const { sections, selectPrimary, selectSecondary, selectedCourses } = useSelector(
		(state) => state.grade
	);
	const [localSelectPrimary, setLocalSelectPrimary] = useState(selectPrimary);
	const [localSelectSecondary, setLocalSelectSecondary] = useState(selectSecondary);
	const [selectedClassVal, setSelectedClassVal] = useState(undefined);
	const [selectedClass, setSelectedClass] = useState(0);
	const [selectType, setSelectType] = useState('instructor');
	const dispatch = useDispatch();

	const handleClassSelect = useCallback(
		(updatedClass) => {
			if (updatedClass === null) {
				reset();
				setSelectedClass(0);
				setLocalSelectPrimary('');
				setLocalSelectSecondary('');
				return;
			}

			setSelectedClass(updatedClass.value);
			setSelectedClassVal(updatedClass);
			dispatch(fetchGradeSelected(updatedClass));
		},
		[dispatch]
	);

	useEffect(() => {
		setSelectType('instructor');

		if (!fromCatalog) return;

		handleClassSelect({ value: fromCatalog.id, addSelected: true });
	}, [fromCatalog, handleClassSelect]);

	useEffect(() => setLocalSelectPrimary(selectPrimary), [selectPrimary]);
	useEffect(() => setLocalSelectSecondary(selectSecondary), [selectSecondary]);
	useEffect(() => {
		if (selectedCourses && selectedCourses.length > 0) {
			const course = selectedCourses[selectedCourses.length - 1];
			const payload = { value: course.courseID, label: course.course, course };
			handleClassSelect(payload);
		}
	}, [selectedCourses]);

	const handleSortSelect = (sortBy) => {
		setSelectType(sortBy.value);
		setLocalSelectPrimary('');
		setLocalSelectSecondary('');
	};

	const handlePrimarySelect = (primary) => {
		const secondaryOptions = buildSecondaryOptions(sections, selectType, primary.value);
		setLocalSelectPrimary(primary ? primary.value : '');
		setLocalSelectSecondary(secondaryOptions.length === 1 ? secondaryOptions[0].value : 'all');
	};

	const handleSecondarySelect = (secondary) => {
		setLocalSelectSecondary(secondary ? secondary.value : '');
	};

	const getFilteredSections = () => {
		let semester = localSelectSecondary;
		let number = -1;
		if (localSelectSecondary.split(' ').length > 2) {
			semester = localSelectSecondary.split(' ').slice(0, 2).join(' ');
			number = localSelectSecondary.split(' ')[3];
		}
		let ret;

		if (selectType === 'instructor') {
			ret = sections
				.filter((section) =>
					localSelectPrimary === 'all' ? true : section.instructor === localSelectPrimary
				)
				.filter((section) => (semester === 'all' ? true : getSectionSemester(section) === semester))
				.filter((section) => (number !== -1 ? section.section_number === number : true));
		} else {
			ret = sections
				.filter((section) =>
					localSelectPrimary === 'all' ? true : getSectionSemester(section) === localSelectPrimary
				)
				.filter((section) => (semester === 'all' ? true : section.instructor === semester))
				.filter((section) => (number !== -1 ? section.section_number === number : true));
		}

		ret = ret.map((s) => s.grade_id);
		return ret;
	};

	const addSelected = () => {
		const playlist = {
			courseID: selectedClass,
			instructor: selectType === 'instructor' ? localSelectPrimary : localSelectSecondary,
			semester: selectType === 'semester' ? localSelectPrimary : localSelectSecondary,
			sections: getFilteredSections()
		};

		playlist.id = hash(playlist);
		addCourse(playlist);
		reset();
	};

	const reset = () => {
		setLocalSelectPrimary('');
		setLocalSelectSecondary('');
	};

	const primaryOptions = useMemo(
		() => buildPrimaryOptions(sections, selectType),
		[sections, selectType]
	);

	const secondaryOptions = useMemo(
		() => buildSecondaryOptions(sections, selectType, localSelectPrimary),
		[sections, selectType, localSelectPrimary]
	);

	const onePrimaryOption = useMemo(
		() => primaryOptions && primaryOptions.length === 1 && localSelectPrimary,
		[localSelectPrimary, primaryOptions]
	);

	const oneSecondaryOption = useMemo(
		() => secondaryOptions && secondaryOptions.length === 1 && localSelectSecondary,
		[secondaryOptions, localSelectSecondary]
	);

	let primaryOption = useMemo(() => {
		if (localSelectPrimary === '') return '';

		if (localSelectPrimary === 'all') {
			return {
				value: 'all',
				label: selectType === 'instructor' ? 'All Instructors' : 'All Semesters'
			};
		}

		return { value: localSelectPrimary, label: localSelectPrimary };
	}, [localSelectPrimary, selectType]);

	let secondaryOption = useMemo(() => {
		if (localSelectSecondary === '') return '';

		if (localSelectSecondary === 'all') {
			return {
				value: 'all',
				label: selectType === 'instructor' ? 'All Semesters' : 'All Instructors'
			};
		}

		return { value: localSelectSecondary, label: localSelectSecondary };
	}, [localSelectSecondary, selectType]);

	return (
		<Container fluid className="grades-search-bar">
			<Row style={{ marginBottom: 10 }}>
				<Col lg={3}>
					<BTSelect
						courseSearch
						name="selectClass"
						placeholder="Choose a class..."
						value={selectedClassVal}
						options={buildCoursesOptions(classes)}
						onChange={handleClassSelect}
						components={{
							IndicatorSeparator: () => null
						}}
						styles={customStyles}
					/>
				</Col>
				<Col lg={2}>
					<BTSelect
						name="sortBy"
						value={selectType === 'instructor' ? sortOptions[0] : sortOptions[1]}
						placeholder="Sort by"
						options={sortOptions}
						isClearable={false}
						onChange={handleSortSelect}
						isDisabled={!selectedClass}
						components={{
							IndicatorSeparator: () => null
						}}
						styles={customStyles}
					/>
				</Col>
				<Col xs={6} sm={6} lg={3}>
					<BTSelect
						name="instrSems"
						placeholder={!isMobile ? 'Select an option...' : 'Select...'}
						value={onePrimaryOption ? primaryOptions[0] : primaryOption}
						options={primaryOptions}
						onChange={handlePrimarySelect}
						isDisabled={!selectedClass}
						isClearable={false}
						searchable={false}
						components={{
							IndicatorSeparator: () => null
						}}
						styles={customStyles}
					/>
				</Col>
				<Col xs={6} sm={6} lg={3}>
					<BTSelect
						name="section"
						placeholder={!isMobile ? 'Select an option...' : 'Select...'}
						value={oneSecondaryOption ? secondaryOptions[0] : secondaryOption}
						options={secondaryOptions}
						onChange={handleSecondarySelect}
						isDisabled={!selectedClass}
						isClearable={false}
						searchable={false}
						components={{
							IndicatorSeparator: () => null
						}}
						styles={customStyles}
					/>
				</Col>
				<Col xs={12} sm={12} lg={1}>
					<Button
						onClick={addSelected}
						disabled={!selectedClass || !(localSelectPrimary && localSelectSecondary) || isFull}
					>
						Add Class
					</Button>
				</Col>
			</Row>
		</Container>
	);
}
