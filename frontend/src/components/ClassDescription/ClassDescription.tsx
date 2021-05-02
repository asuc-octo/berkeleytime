import React, { useEffect, useState } from 'react';

import people from '../../assets/svg/catalog/people.svg';
import chart from '../../assets/svg/catalog/chart.svg';
import book from '../../assets/svg/catalog/book.svg';
import launch from '../../assets/svg/catalog/launch.svg';

import {
  applyIndicatorPercent,
  applyIndicatorGrade,
  formatUnits,
} from '../../utils/utils';
import { useGetCourseForNameQuery } from '../../graphql/graphql';
import { stableSortPlaylists } from 'utils/playlists/playlist';
import { getLatestSemester, Semester } from 'utils/playlists/semesters';
import SectionTable from './SectionTable';
import BTLoader from 'components/Common/BTLoader';
import { CourseReference, courseToName } from 'utils/courses/course';
import { fetchEnrollContext } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';

type Props = {
  course: CourseReference;
  semester?: Semester;
  modifyFilters: (add: Set<string>, remove: Set<string>) => void;
};

const ClassDescription = ({
  course: courseRef,
  semester,
  modifyFilters,
}: Props) => {
  // Hack to work with REST-style enrollment/grades
  const dispatch = useDispatch();

  type RESTCourseInfo = {
    id: number;
    abbreviation: string;
    course_number: string;
  };

  const enrollmentContext: RESTCourseInfo[] | undefined = useSelector(
    (state) => (state as any).enrollment.context.courses
  );

  const oldCourseId = enrollmentContext?.find(
    (c) =>
      c.course_number === courseRef.courseNumber &&
      c.abbreviation === courseRef.abbreviation
  )?.id;

  useEffect(() => {
    dispatch(fetchEnrollContext());
  }, [dispatch]);

  // End hack

  const [readMore, setReadMore] = useState<boolean | null>(false);

  const { data, loading, error } = useGetCourseForNameQuery({
    variables: {
      abbreviation: courseRef.abbreviation,
      courseNumber: courseRef.courseNumber,
      year: semester?.year,
      semester: semester?.semester,
    },
  });

  if (!data) {
    return (
      <div className="catalog-description-container">
        {error ? (
          <div className="loading">
            A critical error occured loading the data.
          </div>
        ) : (
          loading && <BTLoader fill />
        )}
      </div>
    );
  }

  const course = data.allCourses?.edges[0]?.node;

  if (!course) {
    return (
      <div className="catalog-description-container">
        <div className="loading">
          <div className="catalog-results-empty">
            Unknown course {courseToName(courseRef)}
          </div>
        </div>
      </div>
    );
  }

  const playlists = course.playlistSet.edges.map((e) => e?.node!);
  const sections = course.sectionSet.edges.map((e) => e?.node!);

  const latestSemester = getLatestSemester(playlists);
  const semesterUrl =
    latestSemester && `${latestSemester.semester}-${latestSemester.year}`;

  const pills = stableSortPlaylists(playlists, 4);

  const toGrades = {
    pathname:
      course !== null && oldCourseId
        ? `/grades/0-${oldCourseId}-all-all`
        : `/grades`,
    state: { course: course },
  };

  // TODO: remove
  const toEnrollment = {
    pathname:
      course !== null && semesterUrl !== null && oldCourseId
        ? `/enrollment/0-${oldCourseId}-${semesterUrl}-all`
        : `/enrollment`,
    state: { course: course },
  };

  const checkOverridePrereqs = (prereqs: string) => {
    // The instructor for this class wanted to override this.
    if (courseToName(course) === 'PB HLTH 126') {
      prereqs =
        'No prerequisites. This field was modified as requested by the instructor.';
    }
    return prereqs;
  };

  // This is all 'Read more' logic.
  const charsPerRow = 80;
  const moreOffset = 15;
  let description = course.description;
  let prereqs = '';
  let moreDesc: boolean | null = null;
  let morePrereq: boolean | null = null;

  // No idea how this works, but this is what
  // handles the 'Read More' functionality.
  if (readMore) {
    // expand
    if (course.prerequisites) {
      prereqs = checkOverridePrereqs(course.prerequisites);
      morePrereq = false;
    } else {
      moreDesc = false;
    }
  } else {
    // collapse
    let descRows = Math.round(course.description.length / charsPerRow);
    if (descRows > 3 || (descRows === 3 && course.prerequisites)) {
      description = description.slice(0, 3 * charsPerRow - moreOffset) + '...';
      moreDesc = true;
    }
    if (descRows < 3 && course.prerequisites) {
      prereqs = checkOverridePrereqs(course.prerequisites);
      if (descRows >= 1 && prereqs.length > charsPerRow) {
        prereqs = prereqs.slice(0, charsPerRow - moreOffset) + '...';
        morePrereq = true;
      } else if (descRows === 0 && prereqs.length > 2 * charsPerRow) {
        prereqs = prereqs.slice(0, 2 * charsPerRow - moreOffset) + '...';
        morePrereq = true;
      }
    }
  }

  // Render the contents of the catalog
  return (
    <div className="catalog-description-container">
      <div className="catalog-description">
        <section>
          <h3>
            {course.abbreviation} {course.courseNumber}
          </h3>
          <h6>{course.title}</h6>
          <div className="stats">
            <div className="statline">
              <img src={people} alt="" />
              Enrolled: &nbsp;
              {course.enrolled !== -1 ? (
                <div className="statline-div">
                  {applyIndicatorPercent(
                    `${course.enrolled}/${course.enrolledMax}`,
                    course.enrolledPercentage
                  )}
                  &nbsp;
                  <a
                    href={toEnrollment.pathname}
                    // eslint-disable-next-line react/jsx-no-target-blank
                    target="_blank"
                    rel="noreferrer"
                    className="statlink"
                  >
                    <img src={launch} alt="" />
                  </a>
                </div>
              ) : (
                ' N/A '
              )}
            </div>
            <div className="statline">
              <img src={chart} alt="" />
              Average Grade: &nbsp;
              {course.gradeAverage !== -1 ? (
                <div
                  className="statline-div"
                  title={
                    course.gradeAverage
                      ? `Avg Grade: ${(course.gradeAverage * 25).toFixed(1)}%`
                      : undefined
                  }
                >
                  {applyIndicatorGrade(
                    course.letterAverage,
                    course.letterAverage
                  )}{' '}
                  &nbsp;
                  <a
                    href={toGrades.pathname}
                    // eslint-disable-next-line react/jsx-no-target-blank
                    target="_blank"
                    rel="noreferrer"
                    className="statlink"
                  >
                    <img src={launch} alt="" />
                  </a>
                </div>
              ) : (
                ' N/A '
              )}
            </div>
            <div className="statline">
              <img src={book} alt="" />
              {formatUnits(course.units)}
            </div>
          </div>
        </section>
        <section className="pill-container description-section">
          <div>
            {pills.map((req) => (
              <div
                className="pill"
                key={req.id}
                onClick={() => modifyFilters(new Set([req.id]), new Set())}
              >
                {req.name}
              </div>
            ))}
          </div>
        </section>
        {description.length > 0 && (
          <section>
            <p className="description">
              {description}
              {moreDesc != null && (
                <span onClick={() => setReadMore(moreDesc)}>
                  {' '}
                  {moreDesc ? ' See more' : ' See less'}
                </span>
              )}
            </p>
          </section>
        )}
        {prereqs.length > 0 && (
          <section className="prereqs">
            <h6>Prerequisites</h6>
            <p>
              {prereqs}
              {morePrereq != null && (
                <span onClick={() => setReadMore(morePrereq)}>
                  {' '}
                  {morePrereq ? ' See more' : ' See less'}
                </span>
              )}
            </p>
          </section>
        )}
        <section>
          <h5>Class Times</h5>
        </section>
        <section className="table-container description-section">
          <div>
            {sections.length === 0 ? (
              <div className="table-empty">
                This class has no sections for the selected semester.
              </div>
            ) : (
              <SectionTable sections={sections} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ClassDescription;
