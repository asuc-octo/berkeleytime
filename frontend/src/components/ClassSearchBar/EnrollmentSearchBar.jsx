import { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import hash from 'object-hash';

import { fetchEnrollSelected } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import BTSelect from '../../components/Custom/Select';

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

const buildPrimaryOptions = (sections) => {
	const ret = [];
	const map = new Map();

	for (const section of sections) {
		let semester = getSectionSemester(section);
		if (!map.has(semester)) {
			map.set(semester, true);
			ret.push({
				value: semester,
				label: semester
			});
		}
	}

	return ret;
};

const buildSecondaryOptions = (semesters, selectPrimary) => {
	if (semesters.length === 0 || selectPrimary === undefined || selectPrimary === '') {
		return [];
	}

	const ret = [];

	let sections = semesters.filter((semester) => getSectionSemester(semester) === selectPrimary)[0]
		.sections;
	if (sections.length > 1) {
		ret.push({ value: 'all', label: 'All Instructors' });
	}

	for (var section of sections) {
		let instructor = `${
			section.instructor === null || section.instructor === '' ? 'None' : section.instructor
		} / ${section.section_number}`;
		ret.push({
			value: instructor,
			label: instructor,
			sectionNumber: instructor.split(' / ')[1],
			sectionId: section.section_id
		});
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

export default function EnrollmentSearchBar({
	classes,
	isFull,
	isMobile,
	addCourse,
	sectionNumber,
	fromCatalog
}) {
	const [selectedClass, setSelectedClass] = useState(0);
	const { sections, selectPrimary, selectSecondary, selectedCourses } = useSelector(
		(state) => state.enrollment
	);
	const [localSelectPrimary, setLocalSelectPrimary] = useState(selectPrimary);
	const [localSelectSecondary, setLocalSelectSecondary] = useState(selectSecondary);
	const [selectedClassVal, setSelectedClassVal] = useState(undefined);
	const dispatch = useDispatch();

	const handleClassSelect = useCallback(
		(updatedClass) => {
			if (updatedClass === null) {
				reset();
				setSelectedClass(0);
				return;
			}

			setSelectedClass(updatedClass.value);
			setSelectedClassVal(updatedClass);
			setLocalSelectPrimary('');
			setLocalSelectSecondary('');
			dispatch(fetchEnrollSelected(updatedClass));
		},
		[dispatch]
	);

	useEffect(() => {
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

	const handlePrimarySelect = (primary) => {
		setLocalSelectPrimary(primary ? primary.value : '');
		setLocalSelectSecondary(primary ? { value: 'all', label: 'All Instructors' } : '');
	};

	const handleSecondarySelect = (secondary) => {
		setLocalSelectSecondary(secondary ? secondary : { value: 'all', label: 'All Instructors' });
	};

	const getFilteredSections = () => {
		let ret;
		ret = sections
			.filter((section) => {
				return getSectionSemester(section) === localSelectPrimary;
			})[0]
			.sections.filter((section) => {
				return localSelectSecondary.value === 'all'
					? true
					: section.instructor === localSelectSecondary.value.split(' / ')[0];
			})
			.filter((section) => {
				return sectionNumber ? section.section_number === sectionNumber : true;
			})
			.map((s) => s.section_id);
		return ret;
	};

	const addSelected = () => {
		let secondaryOptions = buildSecondaryOptions(sections, localSelectPrimary);
		let instructor = '';
		let sectionId = [];
		if (secondaryOptions.length === 1) {
			instructor = secondaryOptions[0].value;
			sectionId = [secondaryOptions[0].sectionId];
		} else {
			if (localSelectSecondary.value === 'all') {
				instructor = 'all';
			} else {
				instructor = localSelectSecondary.value;
			}
			if (localSelectSecondary.sectionId) {
				sectionId = [localSelectSecondary.sectionId];
			} else {
				sectionId = getFilteredSections();
			}
		}
		let playlist = {
			courseID: selectedClass,
			instructor: instructor,
			semester: localSelectPrimary,
			sections: sectionId
		};

		playlist.id = hash(playlist);
		addCourse(playlist);
		reset();
	};

	const reset = () => {
		setLocalSelectPrimary('');
		setLocalSelectSecondary('');
	};

	const primaryOptions = useMemo(() => buildPrimaryOptions(sections), [sections]);

	const secondaryOptions = useMemo(
		() => buildSecondaryOptions(sections, localSelectPrimary),
		[sections, localSelectPrimary]
	);

	const onePrimaryOption = useMemo(
		() => primaryOptions && primaryOptions.length === 1 && localSelectPrimary,
		[primaryOptions, localSelectPrimary]
	);

	const oneSecondaryOption = useMemo(
		() => secondaryOptions && secondaryOptions.length === 1 && localSelectSecondary.value,
		[secondaryOptions, localSelectSecondary]
	);

	const primaryOption = useMemo(
		() =>
			localSelectPrimary === '' ? '' : { value: localSelectPrimary, label: localSelectPrimary },
		[localSelectPrimary]
	);

	const secondaryOption = useMemo(
		() =>
			localSelectSecondary === ''
				? ''
				: localSelectSecondary === ''
				? { value: 'all', label: 'All Instructors' }
				: localSelectSecondary,
		[localSelectSecondary]
	);

	return (
		<Container fluid className="enrollment-search-bar">
			<Row style={{ marginBottom: 10 }}>
				<Col lg={4}>
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
				<Col xs={6} sm={6} lg={3}>
					<BTSelect
						name="instrSems"
						placeholder={!isMobile ? 'Select an option...' : 'Select...'}
						value={onePrimaryOption ? primaryOptions[0] : primaryOption}
						options={primaryOptions}
						onChange={handlePrimarySelect}
						isDisabled={!selectedClass}
						isClearable={false}
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
						components={{
							IndicatorSeparator: () => null
						}}
						styles={customStyles}
					/>
				</Col>
				<Col lg={2}>
					<Button
						className="btn-bt-green"
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
